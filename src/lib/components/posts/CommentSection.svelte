<script lang="ts">
	import CommentThread from './CommentThread.svelte';
	import CommentToggleButton from './CommentToggleButton.svelte';

	type Props = {
		postId: string;
		initialCount: number;
		currentUserId: string;
		inline?: boolean;
	};

	let { postId, initialCount, currentUserId, inline = false }: Props = $props();

	let expanded = $state(false);
	// svelte-ignore state_referenced_locally
	let count = $state(initialCount);
	let rootClass = $derived(inline ? 'contents' : 'space-y-3');
</script>

<section class={rootClass}>
	<CommentToggleButton {count} bind:expanded />
	<CommentThread {postId} {initialCount} {currentUserId} bind:expanded bind:count />
</section>
