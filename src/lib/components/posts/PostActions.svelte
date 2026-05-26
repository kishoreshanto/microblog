<script lang="ts">
	import CommentThread from './CommentThread.svelte';
	import CommentToggleButton from './CommentToggleButton.svelte';
	import ShareButton from './ShareButton.svelte';
	import VoteButtons from './VoteButtons.svelte';

	type Vote = 'like' | 'dislike' | null;

	type Props = {
		postId: string;
		initialLikes: number;
		initialDislikes: number;
		initialUserVote: Vote;
		initialCommentCount: number;
		currentUserId: string;
	};

	let {
		postId,
		initialLikes,
		initialDislikes,
		initialUserVote,
		initialCommentCount,
		currentUserId
	}: Props = $props();

	let commentsExpanded = $state(false);
	// svelte-ignore state_referenced_locally
	let commentCount = $state(initialCommentCount);
</script>

<section class="space-y-3">
	<div class="flex flex-wrap items-center gap-2" aria-label="Post actions">
		<VoteButtons
			{postId}
			{initialLikes}
			{initialDislikes}
			{initialUserVote}
		/>

		<CommentToggleButton count={commentCount} bind:expanded={commentsExpanded} />
		<ShareButton {postId} />
	</div>

	<CommentThread
		{postId}
		initialCount={initialCommentCount}
		{currentUserId}
		bind:expanded={commentsExpanded}
		bind:count={commentCount}
	/>
</section>
