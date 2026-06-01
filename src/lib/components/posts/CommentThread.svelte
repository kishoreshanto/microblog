<script lang="ts">
	import type { NotificationPanelData } from '$lib/types/notifications';
	import { dispatchNotificationPanelUpdate } from '$lib/utils/notifications';
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
			notificationPanel?: NotificationPanelData;
		};

		comments = result.comments;
		count = result.comments.length;
		content = '';
		replyParent = null;
		isLoaded = true;
		dispatchNotificationPanelUpdate(result.notificationPanel);
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
			<div class="space-y-3" aria-label="Loading comments" role="status">
				<span class="sr-only">Loading comments</span>
				{#each Array(2) as _, index (index)}
					<div class="animate-pulse rounded-3xl border border-slate-200 bg-white p-3">
						<div class="flex items-center gap-2">
							<div class="h-10 w-10 rounded-full bg-slate-200"></div>
							<div class="space-y-2">
								<div class="h-3 w-28 rounded-full bg-slate-200"></div>
								<div class="h-3 w-20 rounded-full bg-slate-100"></div>
							</div>
						</div>
						<div class="mt-4 space-y-2">
							<div class="h-3 w-full rounded-full bg-slate-200"></div>
							<div class="h-3 w-2/3 rounded-full bg-slate-100"></div>
						</div>
					</div>
				{/each}
			</div>
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
						class="inline-flex min-w-24 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
					>
						{#if isSubmitting}
							<svg
								class="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
								></path>
							</svg>
							<span class="sr-only">Posting comment</span>
						{:else if replyParent}
							Reply
						{:else}
							Comment
						{/if}
					</button>
				</div>
			</form>
		{/if}
	</section>
{/if}
