import { error as kitError, fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { postVisibilitySchema } from '$lib/server/validators/social';
import type { Database } from '$lib/types/database';
import { countWords, isWithinWordLimit } from '$lib/utils/words';
import type { PageServerLoad } from './$types';

type FollowRelation = Database['public']['Tables']['follows']['Row'];

const postSelect = 'id, author_id, content, word_count, visibility, created_at, updated_at';

const postContentSchema = z.object({
	content: z
		.string()
		.trim()
		.min(1, 'Posts cannot be empty')
		.refine((value) => isWithinWordLimit(value), {
			message: 'Post must be 100 words or fewer'
		})
});

const postFormSchema = postContentSchema.extend({
	visibility: postVisibilitySchema.default('private')
});

const postIDSchema = z.object({
	postID: z.string().uuid('Invalid post.')
});

type VisiblePost = Database['public']['Tables']['posts']['Row'] & {
	likes: number;
	dislikes: number;
};

async function getProfileByUsername(
	supabase: App.Locals['supabase'],
	username: string | undefined
) {
	if (!username) {
		kitError(404, 'Profile not found.');
	}

	const { data: profile, error } = await supabase
		.from('profiles')
		.select('id, username, display_name, bio, created_at, updated_at')
		.eq('username', username)
		.maybeSingle();

	if (error) {
		kitError(500, 'Could not load profile.');
	}

	if (!profile) {
		kitError(404, 'Profile not found.');
	}

	return profile;
}

async function attachVoteCounts(supabase: App.Locals['supabase'], posts: VisiblePost[]) {
	const interactivePostIds = posts
		.filter((post) => post.visibility !== 'private')
		.map((post) => post.id);

	if (interactivePostIds.length === 0) {
		return posts;
	}

	const { data: votes, error } = await supabase
		.from('post_votes')
		.select('post_id, vote_type')
		.in('post_id', interactivePostIds);

	if (error) {
		return posts;
	}

	const counts = new Map<string, { likes: number; dislikes: number }>();

	for (const postID of interactivePostIds) {
		counts.set(postID, { likes: 0, dislikes: 0 });
	}

	for (const vote of votes ?? []) {
		const postCounts = counts.get(vote.post_id);
		if (!postCounts) continue;

		if (vote.vote_type === 1) postCounts.likes += 1;
		if (vote.vote_type === -1) postCounts.dislikes += 1;
	}

	return posts.map((post) => ({
		...post,
		...(counts.get(post.id) ?? {})
	}));
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	const profile = await getProfileByUsername(locals.supabase, params.username);
	const isOwner = user?.id === profile.id;
	let relation: Pick<FollowRelation, 'id' | 'status'> | null = null;

	if (user && !isOwner) {
		const { data, error } = await locals.supabase
			.from('follows')
			.select('id, status')
			.eq('follower_id', user.id)
			.eq('following_id', profile.id)
			.maybeSingle();

		if (error) {
			kitError(500, 'Could not load follow status.');
		}

		relation = data;
	}

	const postsQuery = locals.supabase
		.from('posts')
		.select(postSelect)
		.eq('author_id', profile.id)
		.order('created_at', { ascending: false });

	if (isOwner) {
		// Owner can see all own posts.
	} else if (relation?.status === 'approved') {
		postsQuery.in('visibility', ['public', 'followers']);
	} else {
		postsQuery.eq('visibility', 'public');
	}

	const { data: posts, error } = await postsQuery;

	if (error) {
		kitError(500, 'Could not load posts.');
	}

	const postsWithCounts: VisiblePost[] = (posts ?? []).map((post) => ({
		...post,
		likes: 0,
		dislikes: 0
	}));

	return {
		profile,
		posts: await attachVoteCounts(locals.supabase, postsWithCounts),
		isOwner,
		isSignedIn: Boolean(user),
		relation
	};
};

export const actions: Actions = {
	requestFollow: async ({ locals, params }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const profile = await getProfileByUsername(locals.supabase, params.username);

		if (profile.id === user.id) {
			return fail(400, {
				action: 'requestFollow',
				message: 'You cannot follow yourself.'
			});
		}

		const { error } = await locals.supabase.from('follows').insert({
			follower_id: user.id,
			following_id: profile.id,
			status: 'pending'
		});

		if (error) {
			return fail(400, {
				action: 'requestFollow',
				message:
					error.code === '23505'
						? 'You already have a follow request for this profile.'
						: 'Could not request follow access.'
			});
		}

		return {
			action: 'requestFollow',
			success: true
		};
	},

	cancelFollow: async ({ locals, params }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const profile = await getProfileByUsername(locals.supabase, params.username);
		const { error } = await locals.supabase
			.from('follows')
			.delete()
			.eq('follower_id', user.id)
			.eq('following_id', profile.id);

		if (error) {
			return fail(500, {
				action: 'cancelFollow',
				message: 'Could not update follow access.'
			});
		}

		return {
			action: 'cancelFollow',
			success: true
		};
	},

	unfollow: async ({ locals, params }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const profile = await getProfileByUsername(locals.supabase, params.username);
		const { error } = await locals.supabase
			.from('follows')
			.delete()
			.eq('follower_id', user.id)
			.eq('following_id', profile.id);

		if (error) {
			return fail(500, {
				action: 'unfollow',
				message: 'Could not unfollow this profile.'
			});
		}

		return {
			action: 'unfollow',
			success: true
		};
	},

	updatePost: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const profile = await getProfileByUsername(locals.supabase, params.username);

		if (profile.id !== user.id) {
			return fail(403, {
				action: 'updatePost',
				message: 'You can only edit your own posts.'
			});
		}

		const formData = await request.formData();
		const postID = String(formData.get('postID') ?? '');
		const content = String(formData.get('content') ?? '');
		const visibility = String(formData.get('visibility') ?? 'private');
		const parsedID = postIDSchema.safeParse({ postID });
		const parsedContent = postFormSchema.safeParse({ content, visibility });

		if (!parsedID.success) {
			return fail(400, {
				action: 'updatePost',
				postID,
				content,
				visibility,
				message: parsedID.error.issues[0]?.message ?? 'Invalid post.'
			});
		}

		if (!parsedContent.success) {
			return fail(400, {
				action: 'updatePost',
				postID,
				content,
				visibility,
				message: parsedContent.error.issues[0]?.message ?? 'Invalid post.'
			});
		}

		const trimmedContent = parsedContent.data.content;
		const wordCount = countWords(trimmedContent);

		const { data: updatedPosts, error } = await locals.supabase
			.from('posts')
			.update({
				content: trimmedContent,
				word_count: wordCount,
				visibility: parsedContent.data.visibility,
				updated_at: new Date().toISOString()
			})
			.eq('author_id', user.id)
			.eq('id', parsedID.data.postID)
			.select('id');

		if (error) {
			return fail(500, {
				action: 'updatePost',
				postID,
				content: trimmedContent,
				visibility: parsedContent.data.visibility,
				message: 'Could not update your post.'
			});
		}

		if (!updatedPosts || updatedPosts.length === 0) {
			return fail(404, {
				action: 'updatePost',
				postID,
				content: trimmedContent,
				visibility: parsedContent.data.visibility,
				message: 'Post not found.'
			});
		}

		return {
			action: 'updatePost',
			success: true
		};
	},

	deletePost: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const profile = await getProfileByUsername(locals.supabase, params.username);

		if (profile.id !== user.id) {
			return fail(403, {
				action: 'deletePost',
				message: 'You can only delete your own posts.'
			});
		}

		const formData = await request.formData();
		const postID = String(formData.get('postID') ?? '');
		const parsedID = postIDSchema.safeParse({ postID });

		if (!parsedID.success) {
			return fail(400, {
				action: 'deletePost',
				message: parsedID.error.issues[0]?.message ?? 'Invalid post.'
			});
		}

		const { data: deletedPosts, error } = await locals.supabase
			.from('posts')
			.delete()
			.eq('author_id', user.id)
			.eq('id', parsedID.data.postID)
			.select('id');

		if (error) {
			return fail(500, {
				action: 'deletePost',
				message: 'Could not delete your post.'
			});
		}

		if (!deletedPosts || deletedPosts.length === 0) {
			return fail(404, {
				action: 'deletePost',
				message: 'Post not found.'
			});
		}

		return {
			action: 'deletePost',
			success: true
		};
	}
};
