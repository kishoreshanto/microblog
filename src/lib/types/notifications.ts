export type NotificationKind =
	| 'post_vote'
	| 'post_comment'
	| 'comment_reply'
	| 'follow_request'
	| 'follow_accepted';

/**
 * A single notification item in a UI-ready shape.
 * Includes actor profile data and target link context.
 */
export type NotificationItem = {
	id: string;
	recipientId: string;
	actorId: string | null;
	kind: NotificationKind;
	postId: string | null;
	commentId: string | null;
	followId: string | null;
	metadata: Record<string, unknown>;
	readAt: string | null;
	dismissedAt: string | null;
	createdAt: string;
	actor: {
		id: string;
		username: string;
		displayName: string | null;
	} | null;
};

/**
 * Data shape returned to the notification panel / page.
 */
export type NotificationPanelData = {
	notifications: NotificationItem[];
	unreadCount: number;
};
