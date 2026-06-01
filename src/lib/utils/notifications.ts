import type {
	NotificationItem,
	NotificationKind,
	NotificationPanelData
} from '$lib/types/notifications';

export const notificationPanelUpdateEvent = 'microblog:notifications';

const notificationMessages: Record<NotificationKind, string> = {
	post_vote: 'reacted to your post',
	post_comment: 'commented on your post',
	comment_reply: 'replied to your comment',
	follow_request: 'sent you a follow request',
	follow_accepted: 'accepted your follow request'
};

export function notificationMessage(kind: NotificationKind): string {
	return notificationMessages[kind];
}

export function notificationActorName(notification: NotificationItem): string {
	return (
		notification.actor?.displayName ||
		notification.actor?.username ||
		(notification.actorId ? 'Someone' : 'A deleted user')
	);
}

export function notificationTargetLink(notification: NotificationItem): string {
	if (notification.kind === 'follow_request') {
		return '/app/profile';
	}

	if (notification.kind === 'follow_accepted') {
		return notification.actor?.username ? `/u/${notification.actor.username}` : '/app/profile';
	}

	if (notification.postId) {
		return `/app/posts/${notification.postId}`;
	}

	return '/app';
}

export function notificationTargetLabel(notification: NotificationItem): string {
	if (notification.kind === 'follow_request') return 'Review request';
	if (notification.kind === 'follow_accepted') return 'View profile';
	return 'View post';
}

export function formatNotificationDate(value: string): string {
	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(new Date(value));
}

export function dispatchNotificationPanelUpdate(notificationPanel?: NotificationPanelData): void {
	if (!notificationPanel) return;

	window.dispatchEvent(
		new CustomEvent<NotificationPanelData>(notificationPanelUpdateEvent, {
			detail: notificationPanel
		})
	);
}
