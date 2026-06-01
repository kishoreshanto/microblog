<script lang="ts">
	import type { NotificationItem } from '$lib/types/notifications';
	import {
		formatNotificationDate,
		notificationActorName,
		notificationMessage,
		notificationTargetLabel,
		notificationTargetLink
	} from '$lib/utils/notifications';

	type Props = {
		notification: NotificationItem;
		onMarkRead: (notification: NotificationItem) => void;
		onDismiss: (notification: NotificationItem) => void;
		isPending?: boolean;
	};

	let { notification, onMarkRead, onDismiss, isPending = false }: Props = $props();
	let isUnread = $derived(notification.readAt === null);
</script>

<article
	class={`rounded-lg border p-3 transition-colors ${
		isUnread ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white'
	}`}
>
	<div class="flex items-start gap-3">
		<img
			alt="avatar_{notificationActorName(notification)}"
			src="https://api.dicebear.com/9.x/initials/svg?seed={notificationActorName(notification)}"
			class="h-9 w-9 shrink-0 rounded-full"
		/>

		<div class="min-w-0 flex-1 space-y-2">
			<div class="space-y-1">
				<p class="text-sm leading-5 text-slate-700">
					<span class="font-semibold text-slate-950">{notificationActorName(notification)}</span>
					{notificationMessage(notification.kind)}
				</p>
				<time class="block text-xs text-slate-500" datetime={notification.createdAt}>
					{formatNotificationDate(notification.createdAt)}
				</time>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<a
					href={notificationTargetLink(notification)}
					class="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 no-underline hover:bg-white hover:text-slate-950"
				>
					{notificationTargetLabel(notification)}
				</a>

				{#if isUnread}
					<button
						type="button"
						disabled={isPending}
						class="rounded-full border border-transparent px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
						onclick={() => onMarkRead(notification)}
					>
						Mark as Read
					</button>
				{/if}

				<button
					type="button"
					disabled={isPending}
					class="rounded-full border border-transparent px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
					onclick={() => onDismiss(notification)}
				>
					Dismiss
				</button>
			</div>
		</div>
	</div>
</article>
