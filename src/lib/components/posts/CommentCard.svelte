<script lang="ts">
	import type { NotificationPanelData } from '$lib/types/notifications';
	import { dispatchNotificationPanelUpdate } from '$lib/utils/notifications';

	export type CommentView = {
		id: string;
		post_id: string;
		author_id: string;
		parent_id: string | null;
		content: string;
		created_at: string;
		updated_at: string;
		author: {
			id: string;
			username: string;
			display_name: string | null;
		} | null;
	};

	type Props = {
		comment: CommentView;
		currentUserId: string;
		onReply?: (comment: CommentView) => void;
		onDeleted: (comment: CommentView) => void;
	};

	let { comment, currentUserId, onReply, onDeleted }: Props = $props();

	let isDeleting = $state(false);
	let error = $state<string | null>(null);
	let isOwner = $derived(comment.author_id === currentUserId);
	let canReply = $derived(comment.parent_id === null);

	function formatCommentDate(value: string) {
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(value));
	}

	function authorName() {
		return comment.author?.display_name || comment.author?.username || 'Unknown user';
	}

	async function deleteComment() {
		isDeleting = true;
		error = null;

		const response = await fetch(`/api/comments/${comment.id}`, {
			method: 'DELETE'
		});

		isDeleting = false;

		if (!response.ok) {
			error = 'Could not delete comment.';
			return;
		}

		const result = (await response.json()) as {
			notificationPanel?: NotificationPanelData;
		};

		dispatchNotificationPanelUpdate(result.notificationPanel);
		onDeleted(comment);
	}
</script>

<article class="rounded-3xl border border-slate-200 bg-white p-3">
	<header class="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
		<div class="flex items-center gap-2">
			<img
				alt="avatar_{authorName()}"
				src="https://api.dicebear.com/9.x/initials/svg?seed={authorName()}"
				class="w-10 rounded-full"
			/>
			<div class="flex flex-col">
				<span class="font-medium text-slate-900">{authorName()}</span>
				{#if comment.author?.username}
					<span>@{comment.author.username}</span>
				{/if}
			</div>
		</div>

		<time datetime={comment.created_at}>{formatCommentDate(comment.created_at)}</time>
	</header>

	<p class="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-800">{comment.content}</p>

	<footer class="mt-3 flex flex-wrap items-center gap-2">
		{#if canReply && onReply}
			<button
				type="button"
				class="text-sm font-medium text-slate-500 hover:text-slate-950"
				onclick={() => onReply?.(comment)}
			>
				Reply
			</button>
		{/if}

		{#if isOwner}
			<button
				type="button"
				disabled={isDeleting}
				class="inline-flex min-w-12 items-center justify-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
				onclick={deleteComment}
			>
				{#if isDeleting}
					<svg
						class="h-3.5 w-3.5 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
						></path>
					</svg>
					<span class="sr-only">Deleting comment</span>
				{:else}
					Delete
				{/if}
			</button>
		{/if}

		{#if error}
			<span class="text-sm text-red-600">{error}</span>
		{/if}
	</footer>
</article>
