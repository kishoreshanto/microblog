import { error as kitError, fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { profileSchema } from '$lib/server/validators/social';
import type { Database } from '$lib/types/database';
import type { PageServerLoad } from './$types';

const followIDSchema = z.object({
	followID: z.string().uuid('Invalid follow request.')
});

type ProfileRow = Pick<
	Database['public']['Tables']['profiles']['Row'],
	'id' | 'username' | 'display_name'
>;

type FollowRequestRow = {
	id: string;
	created_at: string;
	follower: ProfileRow | ProfileRow[] | null;
};

function normalizeFollowRequest(request: FollowRequestRow) {
	const follower = Array.isArray(request.follower) ? request.follower[0] : request.follower;

	return {
		id: request.id,
		created_at: request.created_at,
		follower
	};
}

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { user, profile } = await parent();

	if (!user || !profile) {
		throw redirect(303, '/auth/login');
	}

	const { data: pendingRequests, error } = await locals.supabase
		.from('follows')
		.select(
			'id, created_at, follower:profiles!follows_follower_id_fkey(id, username, display_name)'
		)
		.eq('following_id', user.id)
		.eq('status', 'pending')
		.order('created_at', { ascending: true });

	if (error) {
		kitError(500, 'Could not load follow requests.');
	}

	return {
		profile,
		pendingRequests: ((pendingRequests ?? []) as FollowRequestRow[]).map(normalizeFollowRequest)
	};
};

export const actions: Actions = {
	updateProfile: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const raw = Object.fromEntries(formData);
		const parsed = profileSchema.safeParse(raw);

		if (!parsed.success) {
			return fail(400, {
				action: 'updateProfile',
				message: parsed.error.issues[0]?.message ?? 'Invalid profile details.',
				values: {
					username: String(raw.username ?? ''),
					display_name: String(raw.display_name ?? ''),
					bio: String(raw.bio ?? '')
				}
			});
		}

		const { username, display_name, bio } = parsed.data;
		const { error } = await locals.supabase
			.from('profiles')
			.update({
				username,
				display_name: display_name || null,
				bio: bio || null,
				updated_at: new Date().toISOString()
			})
			.eq('id', user.id);

		if (error) {
			return fail(400, {
				action: 'updateProfile',
				message:
					error.code === '23505'
						? 'That username is already taken.'
						: 'Could not update your profile.',
				values: {
					username,
					display_name,
					bio
				}
			});
		}

		return {
			action: 'updateProfile',
			success: true
		};
	},

	approveFollow: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const followID = String(formData.get('followID') ?? '');
		const parsed = followIDSchema.safeParse({ followID });

		if (!parsed.success) {
			return fail(400, {
				action: 'approveFollow',
				message: parsed.error.issues[0]?.message ?? 'Invalid follow request.'
			});
		}

		const { data, error } = await locals.supabase
			.from('follows')
			.update({
				status: 'approved',
				updated_at: new Date().toISOString()
			})
			.eq('id', parsed.data.followID)
			.eq('following_id', user.id)
			.select('id');

		if (error || !data || data.length === 0) {
			return fail(error ? 500 : 404, {
				action: 'approveFollow',
				message: error ? 'Could not approve follow request.' : 'Follow request not found.'
			});
		}

		return {
			action: 'approveFollow',
			success: true
		};
	},

	rejectFollow: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const followID = String(formData.get('followID') ?? '');
		const parsed = followIDSchema.safeParse({ followID });

		if (!parsed.success) {
			return fail(400, {
				action: 'rejectFollow',
				message: parsed.error.issues[0]?.message ?? 'Invalid follow request.'
			});
		}

		const { data, error } = await locals.supabase
			.from('follows')
			.delete()
			.eq('id', parsed.data.followID)
			.eq('following_id', user.id)
			.select('id');

		if (error || !data || data.length === 0) {
			return fail(error ? 500 : 404, {
				action: 'rejectFollow',
				message: error ? 'Could not reject follow request.' : 'Follow request not found.'
			});
		}

		return {
			action: 'rejectFollow',
			success: true
		};
	}
};
