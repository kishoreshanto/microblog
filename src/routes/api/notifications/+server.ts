import { error, json, type RequestHandler } from '@sveltejs/kit';
import { fetchNotificationPanelData } from '$lib/server/notifications';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Authentication required.');
	}

	return json(await fetchNotificationPanelData(locals.supabase, user.id));
};
