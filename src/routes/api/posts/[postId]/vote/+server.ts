import { error, json, type RequestHandler } from '@sveltejs/kit';
import {
	removeVoteSchema,
	voteSchema,
	voteTypeToValue,
	voteValueToType
} from '$lib/server/validators/interactions';

async function getVoteSummary(supabase: App.Locals['supabase'], postID: string, userID: string) {
	const { data: votes, error: votesError } = await supabase
		.from('post_votes')
		.select('user_id, vote_type')
		.eq('post_id', postID);

	if (votesError) {
		error(500, 'Could not load votes.');
	}

	let likes = 0;
	let dislikes = 0;
	let userVote: 'like' | 'dislike' | null = null;

	for (const vote of votes ?? []) {
		if (vote.vote_type === 1) likes += 1;
		if (vote.vote_type === -1) dislikes += 1;
		if (vote.user_id === userID) userVote = voteValueToType(vote.vote_type);
	}

	return { likes, dislikes, userVote };
}

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Authentication required.');
	}

	const body = await request.json().catch(() => ({}));
	const postID = params.postId;
	const parsed = voteSchema.safeParse({
		postID,
		voteType: body.voteType
	});

	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid vote.');
	}

	const { error: upsertError } = await locals.supabase.from('post_votes').upsert(
		{
			post_id: parsed.data.postID,
			user_id: user.id,
			vote_type: voteTypeToValue(parsed.data.voteType)
		},
		{
			onConflict: 'user_id,post_id'
		}
	);

	if (upsertError) {
		error(400, 'Could not save vote.');
	}

	return json(await getVoteSummary(locals.supabase, parsed.data.postID, user.id));
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Authentication required.');
	}

	const parsed = removeVoteSchema.safeParse({
		postID: params.postId
	});

	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid vote.');
	}

	const { error: deleteError } = await locals.supabase
		.from('post_votes')
		.delete()
		.eq('post_id', parsed.data.postID)
		.eq('user_id', user.id);

	if (deleteError) {
		error(400, 'Could not remove vote.');
	}

	return json(await getVoteSummary(locals.supabase, parsed.data.postID, user.id));
};
