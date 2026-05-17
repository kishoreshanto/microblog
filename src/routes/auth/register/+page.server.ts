import { registerSchema } from '$lib/server/validators/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	if (user) {
		redirect(303, '/app');
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const raw = Object.fromEntries(formData);
		const parsed = registerSchema.safeParse(raw);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid registration details.',
				values: {
					email: String(raw.email ?? '')
				}
			});
		}

		const { email, password } = parsed.data;

		const { error } = await locals.supabase.auth.signUp({
			email,
			password
		});

		if (error) {
			return fail(400, {
				message: error.message,
				values: {
					email
				}
			});
		}

		redirect(303, '/app/onboarding');
	}
};
