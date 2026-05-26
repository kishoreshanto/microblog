<script lang="ts">
	type Props = {
		postId: string;
	};

	let { postId }: Props = $props();

	let isCopying = $state(false);
	let copied = $state(false);
	let error = $state<string | null>(null);

	function postUrl() {
		return `${window.location.origin}/app/posts/${postId}`;
	}

	async function copyPostLink() {
		isCopying = true;
		copied = false;
		error = null;

		try {
			await navigator.clipboard.writeText(postUrl());
			copied = true;

			window.setTimeout(() => {
				copied = false;
			}, 1600);
		} catch {
			error = 'Could not copy link.';
		} finally {
			isCopying = false;
		}
	}
</script>

<div class="inline-flex items-center gap-2">
	<button
		type="button"
		disabled={isCopying}
		class="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
		onclick={copyPostLink}
	>
		<span aria-hidden="true">↗</span>
		<span>{copied ? 'Copied' : 'Share'}</span>
	</button>

	{#if error}
		<span class="text-sm text-red-600">{error}</span>
	{/if}
</div>
