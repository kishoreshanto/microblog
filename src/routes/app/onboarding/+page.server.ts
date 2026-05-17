import { profileSchema } from '$lib/server/validators/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const raw = Object.fromEntries(formData);
		const parsed = profileSchema.safeParse(raw);

		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Invalid profile details.',
				values: {
					username: String(raw.username ?? ''),
					display_name: String(raw.display_name ?? '')
				}
			});
		}

		const { username, display_name } = parsed.data;

		const { error } = await locals.supabase.from('profiles').insert({
			id: user.id,
			username,
			display_name: display_name || null
		});

		if (error) {
			return fail(400, {
				message:
					error.code === '23505'
						? 'That username is already taken.'
						: 'Could not create your profile.',
				values: {
					username,
					display_name
				}
			});
		}

		redirect(303, '/app');
	}
};
