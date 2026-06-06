<script lang="ts">
	import type { NotificationItem, NotificationPanelData } from '$lib/types/notifications';
	import NotificationCard from './NotificationCard.svelte';

	type Props = {
		notifications: NotificationItem[];
		unreadCount: number;
		onUpdate: (panelData: NotificationPanelData) => void;
	};

	let { notifications, unreadCount, onUpdate }: Props = $props();
	let pendingId = $state<string | null>(null);
	let isMarkingAll = $state(false);
	let error = $state<string | null>(null);

	async function sendPanelMutation(endpoint: string, options?: RequestInit) {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: '{}',
			...options
		});

		if (!response.ok) {
			error = 'Could not update notifications.';
			return;
		}

		onUpdate((await response.json()) as NotificationPanelData);
	}

	async function markRead(notification: NotificationItem) {
		pendingId = notification.id;
		error = null;
		await sendPanelMutation(`/api/notifications/${notification.id}/read`);
		pendingId = null;
	}

	async function dismiss(notification: NotificationItem) {
		pendingId = notification.id;
		error = null;
		await sendPanelMutation(`/api/notifications/${notification.id}/dismiss`);
		pendingId = null;
	}

	async function markAllRead() {
		isMarkingAll = true;
		error = null;
		await sendPanelMutation('/api/notifications/read-all');
		isMarkingAll = false;
	}
</script>

<section
	class="fixed top-18 right-4 z-[110] flex max-h-[min(32rem,calc(100dvh-5.5rem))] w-[min(calc(100dvw-2rem),24rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.06)]"
	aria-label="Notifications"
>
	<header class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
		<div>
			<h2 class="text-sm font-semibold text-slate-950">Notifications</h2>
			<p class="text-xs text-slate-500">{unreadCount} unread</p>
		</div>

		{#if unreadCount > 0}
			<button
				type="button"
				disabled={isMarkingAll}
				class="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
				onclick={markAllRead}
			>
				{isMarkingAll ? 'Updating' : 'Mark all as read'}
			</button>
		{/if}
	</header>

	<div class="flex-1 overflow-y-auto p-3">
		{#if error}
			<p class="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
		{/if}

		{#if notifications.length === 0}
			<div
				class="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"
			>
				<p class="text-sm font-medium text-slate-950">No notifications.</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each notifications as notification (notification.id)}
					<NotificationCard
						{notification}
						onMarkRead={markRead}
						onDismiss={dismiss}
						isPending={pendingId === notification.id}
					/>
				{/each}
			</div>
		{/if}
	</div>
</section>
