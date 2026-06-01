import { error, json, type RequestHandler } from '@sveltejs/kit';
import {
	fetchNotificationPanelData,
	markNotificationRead
} from '$lib/server/notifications';
import { markNotificationReadSchema } from '$lib/server/validators/notifications';

export const POST: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Authentication required.');
	}

	const parsed = markNotificationReadSchema.safeParse({
		notificationId: params.notificationId
	});

	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid notification.');
	}

	const updated = await markNotificationRead(locals.supabase, user.id, parsed.data.notificationId);

	if (!updated) {
		error(404, 'Notification not found.');
	}

	return json(await fetchNotificationPanelData(locals.supabase, user.id));
};
