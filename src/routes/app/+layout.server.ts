import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();

	// if user is lot logged it, throw 'em to login page
	if (!user) {
		redirect(303, '/auth/login');
	}

	//
	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('id, username, display_name, bio, created_at, updated_at')
		.eq('id', user.id)
		.maybeSingle();

	// if anything goes wrong
	if (error) {
		console.log(error);
		redirect(303, '/auth/login');
	}

	// if the user is new, take 'em to onboading
	if (!profile && url.pathname !== '/app/onboarding') {
		redirect(303, '/app/onboarding');
	}

	// existing users get directed to main app
	if (profile && url.pathname === '/app/onboarding') {
		redirect(303, '/app');
	}

	return {
		user,
		profile
	};
};
