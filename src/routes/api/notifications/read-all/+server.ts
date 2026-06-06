import { error, json, type RequestHandler } from '@sveltejs/kit';
import { fetchNotificationPanelData, markAllNotificationsRead } from '$lib/server/notifications';
import { markAllNotificationsReadSchema } from '$lib/server/validators/notifications';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Authentication required.');
	}

	const body = await request.json().catch(() => ({}));
	const parsed = markAllNotificationsReadSchema.safeParse(body);

	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid notification request.');
	}

	const updated = await markAllNotificationsRead(locals.supabase, user.id);

	if (!updated) {
		error(500, 'Could not update notifications.');
	}

	return json(await fetchNotificationPanelData(locals.supabase, user.id));
};
