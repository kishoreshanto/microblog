import { error as kitError, fail, redirect, type Actions } from '@sveltejs/kit';
import type { Database } from '$lib/types/database';
import type { PageServerLoad } from './$types';

type FollowRelation = Database['public']['Tables']['follows']['Row'];

const postSelect = 'id, author_id, content, word_count, visibility, created_at, updated_at';

async function getProfileByUsername(
	supabase: App.Locals['supabase'],
	username: string | undefined
) {
	if (!username) {
		kitError(404, 'Profile not found.');
	}

	const { data: profile, error } = await supabase
		.from('profiles')
		.select('id, username, display_name, bio, created_at, updated_at')
		.eq('username', username)
		.maybeSingle();

	if (error) {
		kitError(500, 'Could not load profile.');
	}

	if (!profile) {
		kitError(404, 'Profile not found.');
	}

	return profile;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	const profile = await getProfileByUsername(locals.supabase, params.username);
	const isOwner = user?.id === profile.id;
	let relation: Pick<FollowRelation, 'id' | 'status'> | null = null;

	if (user && !isOwner) {
		const { data, error } = await locals.supabase
			.from('follows')
			.select('id, status')
			.eq('follower_id', user.id)
			.eq('following_id', profile.id)
			.maybeSingle();

		if (error) {
			kitError(500, 'Could not load follow status.');
		}

		relation = data;
	}

	const postsQuery = locals.supabase
		.from('posts')
		.select(postSelect)
		.eq('author_id', profile.id)
		.order('created_at', { ascending: false });

	if (isOwner) {
		// Owner can see all own posts.
	} else if (relation?.status === 'approved') {
		postsQuery.in('visibility', ['public', 'followers']);
	} else {
		postsQuery.eq('visibility', 'public');
	}

	const { data: posts, error } = await postsQuery;

	if (error) {
		kitError(500, 'Could not load posts.');
	}

	return {
		profile,
		posts: posts ?? [],
		isOwner,
		isSignedIn: Boolean(user),
		relation
	};
};

export const actions: Actions = {
	requestFollow: async ({ locals, params }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const profile = await getProfileByUsername(locals.supabase, params.username);

		if (profile.id === user.id) {
			return fail(400, {
				action: 'requestFollow',
				message: 'You cannot follow yourself.'
			});
		}

		const { error } = await locals.supabase.from('follows').insert({
			follower_id: user.id,
			following_id: profile.id,
			status: 'pending'
		});

		if (error) {
			return fail(400, {
				action: 'requestFollow',
				message:
					error.code === '23505'
						? 'You already have a follow request for this profile.'
						: 'Could not request follow access.'
			});
		}

		return {
			action: 'requestFollow',
			success: true
		};
	},

	cancelFollow: async ({ locals, params }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const profile = await getProfileByUsername(locals.supabase, params.username);
		const { error } = await locals.supabase
			.from('follows')
			.delete()
			.eq('follower_id', user.id)
			.eq('following_id', profile.id);

		if (error) {
			return fail(500, {
				action: 'cancelFollow',
				message: 'Could not update follow access.'
			});
		}

		return {
			action: 'cancelFollow',
			success: true
		};
	},

	unfollow: async ({ locals, params }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const profile = await getProfileByUsername(locals.supabase, params.username);
		const { error } = await locals.supabase
			.from('follows')
			.delete()
			.eq('follower_id', user.id)
			.eq('following_id', profile.id);

		if (error) {
			return fail(500, {
				action: 'unfollow',
				message: 'Could not unfollow this profile.'
			});
		}

		return {
			action: 'unfollow',
			success: true
		};
	}
};
