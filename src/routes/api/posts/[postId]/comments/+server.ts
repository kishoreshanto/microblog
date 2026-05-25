import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createCommentSchema } from '$lib/server/validators/interactions';
import type { Database } from '$lib/types/database';

type ProfileRow = Pick<
	Database['public']['Tables']['profiles']['Row'],
	'id' | 'username' | 'display_name'
>;

type CommentRow = Database['public']['Tables']['comments']['Row'] & {
	profiles: ProfileRow | ProfileRow[] | null;
};

function normalizeComment(comment: CommentRow) {
	const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;

	return {
		id: comment.id,
		post_id: comment.post_id,
		author_id: comment.author_id,
		parent_id: comment.parent_id,
		content: comment.content,
		created_at: comment.created_at,
		updated_at: comment.updated_at,
		author: profile
			? {
					id: profile.id,
					username: profile.username,
					display_name: profile.display_name
				}
			: null
	};
}

async function loadComments(supabase: App.Locals['supabase'], postID: string) {
	const { data, error: commentsError } = await supabase
		.from('comments')
		.select(
			'id, post_id, author_id, parent_id, content, created_at, updated_at, profiles:author_id(id, username, display_name)'
		)
		.eq('post_id', postID)
		.order('created_at', { ascending: true });

	if (commentsError) {
		error(500, 'Could not load comments.');
	}

	return ((data ?? []) as CommentRow[]).map(normalizeComment);
}

export const GET: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Authentication required.');
	}

	const parsed = createCommentSchema.pick({ postID: true }).safeParse({
		postID: params.postId
	});

	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid post.');
	}

	return json({
		comments: await loadComments(locals.supabase, parsed.data.postID),
		currentUserId: user.id
	});
};

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Authentication required.');
	}

	const body = await request.json().catch(() => ({}));
	const parsed = createCommentSchema.safeParse({
		postID: params.postId,
		parentID: body.parentID || undefined,
		content: body.content
	});

	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid comment.');
	}

	if (parsed.data.parentID) {
		const { data: parent, error: parentError } = await locals.supabase
			.from('comments')
			.select('id, post_id, parent_id')
			.eq('id', parsed.data.parentID)
			.eq('post_id', parsed.data.postID)
			.maybeSingle();

		if (parentError) {
			error(500, 'Could not verify parent comment.');
		}

		if (!parent) {
			error(404, 'Parent comment not found.');
		}

		if (parent.parent_id) {
			error(400, 'Replies to replies are not allowed.');
		}
	}

	const { error: insertError } = await locals.supabase.from('comments').insert({
		post_id: parsed.data.postID,
		author_id: user.id,
		parent_id: parsed.data.parentID ?? null,
		content: parsed.data.content
	});

	if (insertError) {
		error(400, 'Could not save comment.');
	}

	return json({
		comments: await loadComments(locals.supabase, parsed.data.postID),
		currentUserId: user.id
	});
};
