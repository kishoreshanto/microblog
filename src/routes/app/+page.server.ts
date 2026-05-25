import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { voteValueToType } from '$lib/server/validators/interactions';
import { postVisibilitySchema } from '$lib/server/validators/social';
import type { Database } from '$lib/types/database';
import { countWords, isWithinWordLimit } from '$lib/utils/words';
import type { PageServerLoad } from './$types';

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

type PostRow = Database['public']['Tables']['posts']['Row'];
type ProfileRow = Pick<
	Database['public']['Tables']['profiles']['Row'],
	'id' | 'username' | 'display_name'
>;

type FeedPostRow = PostRow & {
	profiles: ProfileRow | ProfileRow[] | null;
};

type NormalizedFeedPost = ReturnType<typeof normalizeFeedPost>;

function normalizeFeedPost(post: FeedPostRow) {
	const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;

	return {
		id: post.id,
		author_id: post.author_id,
		content: post.content,
		word_count: post.word_count,
		visibility: post.visibility,
		created_at: post.created_at,
		updated_at: post.updated_at,
		likes: 0,
		dislikes: 0,
		userVote: null as 'like' | 'dislike' | null,
		commentCount: 0,
		author: profile
			? {
					id: profile.id,
					username: profile.username,
					display_name: profile.display_name
				}
			: null
	};
}

function mergeFeedPosts(groups: FeedPostRow[][]) {
	const posts = new Map<string, NormalizedFeedPost>();

	for (const group of groups) {
		for (const post of group) {
			posts.set(post.id, normalizeFeedPost(post));
		}
	}

	return Array.from(posts.values()).sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);
}

async function attachInteractionData(
	supabase: App.Locals['supabase'],
	posts: NormalizedFeedPost[],
	userID: string
) {
	const interactivePostIds = posts
		.filter((post) => post.visibility !== 'private')
		.map((post) => post.id);

	if (interactivePostIds.length === 0) {
		return posts;
	}

	const { data: votes, error: votesError } = await supabase
		.from('post_votes')
		.select('post_id, user_id, vote_type')
		.in('post_id', interactivePostIds);

	const { data: comments, error: commentsError } = await supabase
		.from('comments')
		.select('id, post_id')
		.in('post_id', interactivePostIds);

	if (votesError || commentsError) {
		return posts;
	}

	const stats = new Map<
		string,
		{ likes: number; dislikes: number; userVote: 'like' | 'dislike' | null; commentCount: number }
	>();

	for (const postID of interactivePostIds) {
		stats.set(postID, { likes: 0, dislikes: 0, userVote: null, commentCount: 0 });
	}

	for (const vote of votes ?? []) {
		const postStats = stats.get(vote.post_id);
		if (!postStats) continue;

		if (vote.vote_type === 1) postStats.likes += 1;
		if (vote.vote_type === -1) postStats.dislikes += 1;
		if (vote.user_id === userID) postStats.userVote = voteValueToType(vote.vote_type);
	}

	for (const comment of comments ?? []) {
		const postStats = stats.get(comment.post_id);
		if (postStats) postStats.commentCount += 1;
	}

	return posts.map((post) => ({
		...post,
		...(stats.get(post.id) ?? {})
	}));
}

const feedSelect =
	'id, author_id, content, word_count, visibility, created_at, updated_at, profiles:author_id(id, username, display_name)';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { user } = await parent();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const { data: follows, error: followsError } = await locals.supabase
		.from('follows')
		.select('following_id')
		.eq('follower_id', user.id)
		.eq('status', 'approved');

	if (followsError) {
		return {
			posts: [],
			currentUserId: user.id,
			loaderror: 'Could not load your feed.'
		};
	}

	const followingIds = follows?.map((follow) => follow.following_id) ?? [];

	const { data: ownPosts, error: ownError } = await locals.supabase
		.from('posts')
		.select(feedSelect)
		.eq('author_id', user.id)
		.order('created_at', { ascending: false });

	const { data: publicPosts, error: publicError } = await locals.supabase
		.from('posts')
		.select(feedSelect)
		.eq('visibility', 'public')
		.neq('author_id', user.id)
		.order('created_at', { ascending: false });

	const followersQuery =
		followingIds.length > 0
			? await locals.supabase
					.from('posts')
					.select(feedSelect)
					.eq('visibility', 'followers')
					.in('author_id', followingIds)
					.order('created_at', { ascending: false })
			: { data: [], error: null };

	if (ownError || publicError || followersQuery.error) {
		return {
			posts: [],
			currentUserId: user.id,
			loaderror: 'Could not load your feed.'
		};
	}

	const posts = mergeFeedPosts([
		(ownPosts ?? []) as FeedPostRow[],
		(publicPosts ?? []) as FeedPostRow[],
		(followersQuery.data ?? []) as FeedPostRow[]
	]);

	return {
		posts: await attachInteractionData(locals.supabase, posts, user.id),
		currentUserId: user.id,
		loaderror: null
	};
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const { session, user } = await locals.safeGetSession();

		if (!session || !user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const content = String(formData.get('content') ?? '');
		const visibility = String(formData.get('visibility') ?? 'private');
		const parsedContent = postFormSchema.safeParse({ content, visibility });

		if (!parsedContent.success) {
			return fail(400, {
				action: 'create',
				content,
				visibility,
				error: parsedContent.error.issues[0]?.message ?? 'Invalid post.'
			});
		}

		const trimmedContent = parsedContent.data.content;
		const wordCount = countWords(trimmedContent);

		const { error } = await locals.supabase.from('posts').insert({
			author_id: user.id,
			content: trimmedContent,
			word_count: wordCount,
			visibility: parsedContent.data.visibility
		});

		if (error) {
			return fail(500, {
				action: 'create',
				content: trimmedContent,
				visibility: parsedContent.data.visibility,
				error: 'Could not save your post'
			});
		}

		return {
			action: 'create',
			success: true
		};
	},

	update: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const postID = String(formData.get('postID') ?? '');
		const content = String(formData.get('content') ?? '');
		const visibility = String(formData.get('visibility') ?? 'private');
		const parsedID = postIDSchema.safeParse({ postID });
		const parsedContent = postFormSchema.safeParse({ content, visibility });

		if (!parsedID.success) {
			return fail(400, {
				action: 'update',
				postID,
				content,
				visibility,
				error: parsedID.error.issues[0]?.message ?? 'Invalid post.'
			});
		}

		if (!parsedContent.success) {
			return fail(400, {
				action: 'update',
				postID,
				content,
				visibility,
				error: parsedContent.error.issues[0]?.message ?? 'Invalid post.'
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
				action: 'update',
				postID,
				content: trimmedContent,
				visibility: parsedContent.data.visibility,
				error: 'Could not update your post.'
			});
		}

		if (!updatedPosts || updatedPosts.length === 0) {
			return fail(404, {
				action: 'update',
				postID,
				content: trimmedContent,
				visibility: parsedContent.data.visibility,
				error: 'Post not found.'
			});
		}

		return {
			action: 'update',
			success: true
		};
	},

	delete: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const postID = String(formData.get('postID') ?? '');
		const parsedID = postIDSchema.safeParse({ postID });

		if (!parsedID.success) {
			return fail(400, {
				action: 'delete',
				error: parsedID.error.issues[0]?.message ?? 'Invalid post.'
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
				action: 'delete',
				error: 'Could not delete your post.'
			});
		}

		if (!deletedPosts || deletedPosts.length === 0) {
			return fail(404, {
				action: 'delete',
				error: 'Post Not Found'
			});
		}

		return {
			action: 'delete',
			success: true
		};
	}
};
