<script lang="ts">
	type Vote = 'like' | 'dislike' | null;

	type Props = {
		postId: string;
		initialLikes: number;
		initialDislikes: number;
		initialUserVote: Vote;
	};

	let { postId, initialLikes, initialDislikes, initialUserVote }: Props = $props();

	// svelte-ignore state_referenced_locally
	let likes = $state(initialLikes);
	// svelte-ignore state_referenced_locally
	let dislikes = $state(initialDislikes);
	// svelte-ignore state_referenced_locally
	let userVote = $state<Vote>(initialUserVote);
	let isPending = $state(false);
	let error = $state<string | null>(null);

	async function vote(voteType: Exclude<Vote, null>) {
		isPending = true;
		error = null;

		const response =
			userVote === voteType
				? await fetch(`/api/posts/${postId}/vote`, { method: 'DELETE' })
				: await fetch(`/api/posts/${postId}/vote`, {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ voteType })
					});

		isPending = false;

		if (!response.ok) {
			error = 'Could not update vote.';
			return;
		}

		const result = (await response.json()) as {
			likes: number;
			dislikes: number;
			userVote: Vote;
		};

		likes = result.likes;
		dislikes = result.dislikes;
		userVote = result.userVote;
	}
</script>

<div class="flex flex-wrap items-center gap-2" aria-label="Post votes">
	<button
		type="button"
		disabled={isPending}
		aria-pressed={userVote === 'like'}
		class="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-emerald-200 aria-pressed:bg-emerald-50 aria-pressed:text-emerald-700"
		onclick={() => vote('like')}
	>
		<span aria-hidden="true">↑</span>
		<span>{likes}</span>
	</button>

	<button
		type="button"
		disabled={isPending}
		aria-pressed={userVote === 'dislike'}
		class="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-red-200 aria-pressed:bg-red-50 aria-pressed:text-red-700"
		onclick={() => vote('dislike')}
	>
		<span aria-hidden="true">↓</span>
		<span>{dislikes}</span>
	</button>

	{#if error}
		<span class="text-sm text-red-600">{error}</span>
	{/if}
</div>
