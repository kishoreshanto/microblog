<script lang="ts">
	import CommentCard, { type CommentView } from './CommentCard.svelte';

	type Props = {
		postId: string;
		initialCount: number;
		currentUserId: string;
		expanded?: boolean;
		count?: number;
	};

	let {
		postId,
		initialCount,
		currentUserId,
		expanded = $bindable(false),
		count = $bindable(initialCount)
	}: Props = $props();

	let isLoaded = $state(false);
	let isLoading = $state(false);
	let isSubmitting = $state(false);
	let comments = $state<CommentView[]>([]);
	let content = $state('');
	let replyParent = $state<CommentView | null>(null);
	let error = $state<string | null>(null);
	let topLevelComments = $derived(comments.filter((comment) => comment.parent_id === null));

	function repliesFor(commentID: string) {
		return comments.filter((comment) => comment.parent_id === commentID);
	}

	async function loadComments() {
		isLoading = true;
		error = null;

		const response = await fetch(`/api/posts/${postId}/comments`);

		isLoading = false;

		if (!response.ok) {
			error = 'Could not load comments.';
			return;
		}

		const result = (await response.json()) as {
			comments: CommentView[];
			currentUserId: string;
		};

		comments = result.comments;
		count = result.comments.length;
		isLoaded = true;
	}

	async function submitComment() {
		const trimmed = content.trim();
		if (!trimmed) return;

		isSubmitting = true;
		error = null;

		const response = await fetch(`/api/posts/${postId}/comments`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				content: trimmed,
				parentID: replyParent?.id
			})
		});

		isSubmitting = false;

		if (!response.ok) {
			error = 'Could not save comment.';
			return;
		}

		const result = (await response.json()) as {
			comments: CommentView[];
			currentUserId: string;
		};

		comments = result.comments;
		count = result.comments.length;
		content = '';
		replyParent = null;
		isLoaded = true;
	}

	function removeComment(comment: CommentView) {
		const deletedIds = [comment.id];

		for (const item of comments) {
			if (item.parent_id === comment.id) {
				deletedIds.push(item.id);
			}
		}

		comments = comments.filter((item) => !deletedIds.includes(item.id));
		count = comments.length;
	}

	$effect(() => {
		if (expanded && !isLoaded && !isLoading) {
			void loadComments();
		}
	});
</script>

{#if expanded}
	<section class="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
		{#if isLoading}
			<p class="text-sm text-slate-500">Loading comments...</p>
		{:else}
			<div class="space-y-3">
				{#each topLevelComments as comment (comment.id)}
					<div class="space-y-2">
						<CommentCard
							{comment}
							{currentUserId}
							onReply={(selected) => {
								replyParent = selected;
							}}
							onDeleted={removeComment}
						/>

						{#each repliesFor(comment.id) as reply (reply.id)}
							<div class="ml-5 border-l border-slate-200 pl-3">
								<CommentCard comment={reply} {currentUserId} onDeleted={removeComment} />
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-slate-500">No comments yet.</p>
				{/each}
			</div>

			<form
				class="space-y-2 border-t border-slate-200 pt-3"
				onsubmit={(event) => {
					event.preventDefault();
					void submitComment();
				}}
			>
				{#if replyParent}
					<div
						class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-500"
					>
						<span>
							Replying to {replyParent.author?.display_name ||
								replyParent.author?.username ||
								'comment'}
						</span>
						<button
							type="button"
							class="font-medium text-slate-700 hover:text-slate-950"
							onclick={() => {
								replyParent = null;
							}}
						>
							Cancel
						</button>
					</div>
				{/if}

				<textarea
					bind:value={content}
					maxlength="500"
					rows="3"
					placeholder={replyParent ? 'Write a reply...' : 'Write a comment...'}
					class="w-full rounded-lg border-slate-300 text-sm"
				></textarea>

				<div class="flex flex-wrap items-center justify-between gap-3">
					{#if error}
						<p class="text-sm text-red-600">{error}</p>
					{:else}
						<p class="text-sm text-slate-500">{content.trim().length} / 500 characters</p>
					{/if}

					<button
						type="submit"
						disabled={isSubmitting || content.trim().length === 0 || content.trim().length > 500}
						class="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
					>
						{isSubmitting ? 'Posting...' : replyParent ? 'Reply' : 'Comment'}
					</button>
				</div>
			</form>
		{/if}
	</section>
{/if}
