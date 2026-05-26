import { error as kitError, fail, redirect, type Actions } from '@sveltejs/kit';
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

const paramsSchema = z.object({
	id: z.string().uuid('Invalid post.')
});

const postIDSchema = z.object({
	postID: z.string().uuid('Invalid post.')
});

type PostRow = Database['public']['Tables']['posts']['Row'];
type ProfileRow = Pick<
	Database['public']['Tables']['profiles']['Row'],
	'id' | 'username' | 'display_name'
>;

type PostWithProfile = PostRow & {
	profiles: ProfileRow | ProfileRow[] | null;
};

type SinglePost = ReturnType<typeof normalizePost>;

const postSelect =
	'id, author_id, content, word_count, visibility, created_at, updated_at, profiles:author_id(id, username, display_name)';

function normalizePost(post: PostWithProfile) {
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

async function attachInteractionData(
	supabase: App.Locals['supabase'],
	post: SinglePost,
	userID: string
) {
	if (post.visibility === 'private') {
		return post;
	}

	const [{ data: votes, error: votesError }, { data: comments, error: commentsError }] =
		await Promise.all([
			supabase
				.from('post_votes')
				.select('user_id, vote_type')
				.eq('post_id', post.id),
			supabase.from('comments').select('id').eq('post_id', post.id)
		]);

	if (votesError || commentsError) {
		return post;
	}

	let likes = 0;
	let dislikes = 0;
	let userVote: 'like' | 'dislike' | null = null;

	for (const vote of votes ?? []) {
		if (vote.vote_type === 1) likes += 1;
		if (vote.vote_type === -1) dislikes += 1;
		if (vote.user_id === userID) userVote = voteValueToType(vote.vote_type);
	}

	return {
		...post,
		likes,
		dislikes,
		userVote,
		commentCount: comments?.length ?? 0
	};
}

async function getPostByID(
	supabase: App.Locals['supabase'],
	postID: string,
	userID: string
) {
	const { data: post, error } = await supabase
		.from('posts')
		.select(postSelect)
		.eq('id', postID)
		.maybeSingle();

	if (error) {
		kitError(500, 'Could not load post.');
	}

	if (!post) {
		kitError(404, 'Post not found.');
	}

	return attachInteractionData(supabase, normalizePost(post as PostWithProfile), userID);
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const parsedParams = paramsSchema.safeParse(params);

	if (!parsedParams.success) {
		kitError(404, parsedParams.error.issues[0]?.message ?? 'Post not found.');
	}

	const post = await getPostByID(locals.supabase, parsedParams.data.id, user.id);

	return {
		post,
		currentUserId: user.id,
		isOwner: post.author_id === user.id
	};
};

export const actions: Actions = {
	update: async ({ locals, request, params }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const routePostID = params.id;
		const postID = String(formData.get('postID') ?? '');
		const content = String(formData.get('content') ?? '');
		const visibility = String(formData.get('visibility') ?? 'private');
		const parsedRouteID = paramsSchema.safeParse({ id: routePostID });
		const parsedID = postIDSchema.safeParse({ postID });
		const parsedContent = postFormSchema.safeParse({ content, visibility });

		if (!parsedRouteID.success || !parsedID.success || parsedRouteID.data.id !== postID) {
			return fail(400, {
				action: 'update',
				postID,
				content,
				visibility,
				error: 'Invalid post.'
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

	delete: async ({ locals, request, params }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const routePostID = params.id;
		const postID = String(formData.get('postID') ?? '');
		const parsedRouteID = paramsSchema.safeParse({ id: routePostID });
		const parsedID = postIDSchema.safeParse({ postID });

		if (!parsedRouteID.success || !parsedID.success || parsedRouteID.data.id !== postID) {
			return fail(400, {
				action: 'delete',
				error: 'Invalid post.'
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
				error: 'Post not found.'
			});
		}

		throw redirect(303, '/app');
	}
};
