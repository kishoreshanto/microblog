import { countWords, isWithinWordLimit } from '$lib/utils/words';
import z from 'zod';
import type { PageServerLoad } from './$types';
import { fail, redirect, type Actions } from '@sveltejs/kit';

const postSchema = z.object({
	content: z
		.string()
		.trim()
		.min(1, 'Posts cannot be empty')
		.refine((value) => isWithinWordLimit(value), {
			message: 'Post must be 100 words or fewer'
		})
});

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	// No session or no user? Throw away
	if (!session || !user) {
		throw redirect(303, 'app/login');
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
			throw redirect(303, '/app/login');
		}

		const formData = await request.formData();
		const content = String(formData.get('content') ?? '');

		// Pasring the data using Zod
		const parsedContent = postSchema.safeParse({ content });

		if (!parsedContent.success) {
			return fail(400, {
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
				content: trimmedContent,
				error: 'Could not save your post'
			});
		}

		return {
			success: true
		};
	}
};
