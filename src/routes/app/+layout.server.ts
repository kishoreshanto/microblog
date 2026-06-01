import { error as kitError, redirect } from '@sveltejs/kit';
import { fetchNotificationPanelData } from '$lib/server/notifications';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();
	const isOnboarding = url.pathname.replace(/\/$/, '') === '/app/onboarding';

	// if user is lot logged it, throw 'em to login page
	if (!user) {
		redirect(303, '/auth/login');
	}

	// Get profile data from supabase
	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('id, username, display_name, bio, created_at, updated_at')
		.eq('id', user.id)
		.maybeSingle();

	// if anything goes wrong
	if (error) {
		console.error(error);
		kitError(500, 'Could not load profile.');
	}

	// if the user is new, take 'em to onboading
	if (!profile && !isOnboarding) {
		redirect(303, '/app/onboarding');
	}

	// existing users get directed to main app
	if (profile && isOnboarding) {
		redirect(303, '/app');
	}

	return {
		user,
		profile,
		notificationPanel: profile
			? await fetchNotificationPanelData(locals.supabase, user.id)
			: { notifications: [], unreadCount: 0 }
	};
};
