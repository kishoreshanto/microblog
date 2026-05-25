import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
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

const postIDSchema = z.object({
	postID: z.string().uuid('Invalid post.')
});

export const load: PageServerLoad = async ({ locals, parent }) => {
	// Auth guard and user data are handled by the parent app layout.
	// Using parent() avoids a redundant safeGetSession() call.
	const { user } = await parent();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	// Query for getting all posts
	const { data: posts, error } = await locals.supabase
		.from('posts')
		.select('id, content, word_count, visibility, created_at, updated_at')
		.eq('author_id', user.id)
		.eq('visibility', 'private')
		.order('created_at', { ascending: false });

	// if something goes wrong
	if (error) {
		return {
			posts: [],
			loaderror: 'Could not load your posts.'
		};
	}

	// If everything is ok
	return {
		posts,
		loaderror: null
	};
};

// Form action
export const actions: Actions = {
	create: async ({ locals, request }) => {
		const { session, user } = await locals.safeGetSession();

		// No session or no user? Throw away
		if (!session || !user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const content = String(formData.get('content') ?? '');

		// Pasring the data using Zod
		const parsedContent = postContentSchema.safeParse({ content });

		if (!parsedContent.success) {
			return fail(400, {
				action: 'create',
				content,
				error: parsedContent.error.issues[0]?.message ?? 'Invalid post.'
			});
		}

		const trimmedContent = parsedContent.data.content;
		const wordCount = countWords(trimmedContent);

		// Insert the new post into the database
		const { error } = await locals.supabase.from('posts').insert({
			author_id: user.id,
			content: trimmedContent,
			word_count: wordCount,
			visibility: 'private'
		});

		if (error) {
			return fail(500, {
				action: 'create',
				content: trimmedContent,
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
		const parsedID = postIDSchema.safeParse({ postID });
		const parsedContent = postContentSchema.safeParse({ content });

		if (!parsedID.success) {
			return fail(400, {
				action: 'update',
				postID,
				content,
				error: parsedID.error.issues[0]?.message ?? 'Invalid post.'
			});
		}

		if (!parsedContent.success) {
			return fail(400, {
				action: 'update',
				postID,
				content,
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
				error: 'Could not update your post.'
			});
		}

		if (!updatedPosts || updatedPosts.length === 0) {
			return fail(404, {
				action: 'update',
				postID,
				content: trimmedContent,
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

		// in case of error
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
