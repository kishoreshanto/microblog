import { error, json, type RequestHandler } from '@sveltejs/kit';
import { fetchNotificationPanelData } from '$lib/server/notifications';
import { deleteCommentSchema } from '$lib/server/validators/interactions';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Authentication required.');
	}

	const parsed = deleteCommentSchema.safeParse({
		commentID: params.commentId
	});

	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid comment.');
	}

	const { data: deleted, error: deleteError } = await locals.supabase
		.from('comments')
		.delete()
		.eq('id', parsed.data.commentID)
		.eq('author_id', user.id)
		.select('post_id')
		.maybeSingle();

	if (deleteError) {
		error(400, 'Could not delete comment.');
	}

	if (!deleted) {
		error(404, 'Comment not found.');
	}

	return json({
		postID: deleted.post_id,
		deleted: true,
		notificationPanel: await fetchNotificationPanelData(locals.supabase, user.id)
	});
};
