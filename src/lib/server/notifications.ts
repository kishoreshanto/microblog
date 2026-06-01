import type {
	NotificationItem,
	NotificationKind,
	NotificationPanelData
} from '$lib/types/notifications';
import type { Database, Json } from '$lib/types/database';

type SupabaseClient = App.Locals['supabase'];

type ProfileRow = Pick<
	Database['public']['Tables']['profiles']['Row'],
	'id' | 'username' | 'display_name'
>;

type NotificationRow = Database['public']['Tables']['notifications']['Row'] & {
	profiles: ProfileRow | ProfileRow[] | null;
};

/**
 * Normalize a raw notification row (with joined profile) into a UI-ready NotificationItem.
 */
function normalizeNotification(row: NotificationRow): NotificationItem {
	const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

	return {
		id: row.id,
		recipientId: row.recipient_id,
		actorId: row.actor_id,
		kind: row.kind as NotificationKind,
		postId: row.post_id,
		commentId: row.comment_id,
		followId: row.follow_id,
		metadata: (row.metadata ?? {}) as Record<string, unknown>,
		readAt: row.read_at,
		dismissedAt: row.dismissed_at,
		createdAt: row.created_at,
		actor: profile
			? {
					id: profile.id,
					username: profile.username,
					displayName: profile.display_name
				}
			: null
	};
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Insert a new notification row. Silently skips if the actor is the same as
 * the recipient (no self-notifications). Duplicate active notifications are
 * ignored via the database dedupe index.
 */
export async function createNotification(
	supabase: SupabaseClient,
	params: {
		recipientId: string;
		actorId: string;
		kind: NotificationKind;
		postId?: string | null;
		commentId?: string | null;
		followId?: string | null;
		metadata?: Record<string, unknown>;
	}
): Promise<void> {
	// Prevent self-notifications
	if (params.recipientId === params.actorId) {
		return;
	}

	const { error } = await supabase.from('notifications').insert({
		recipient_id: params.recipientId,
		actor_id: params.actorId,
		kind: params.kind,
		post_id: params.postId ?? null,
		comment_id: params.commentId ?? null,
		follow_id: params.followId ?? null,
		metadata: (params.metadata ?? {}) as Json
	});

	if (error && error.code !== '23505') {
		console.error('Could not create notification.', error);
	}
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Fetch the latest non-dismissed notifications for a user,
 * joining actor profile data. Returns at most 50 notifications.
 */
export async function fetchNotificationsForUser(
	supabase: SupabaseClient,
	userId: string
): Promise<NotificationItem[]> {
	const { data, error } = await supabase
		.from('notifications')
		.select(
			'id, recipient_id, actor_id, kind, post_id, comment_id, follow_id, metadata, read_at, dismissed_at, created_at, profiles!notifications_actor_id_fkey(id, username, display_name)'
		)
		.eq('recipient_id', userId)
		.is('dismissed_at', null)
		.order('created_at', { ascending: false })
		.limit(50);

	if (error || !data) {
		return [];
	}

	return (data as NotificationRow[]).map(normalizeNotification);
}

/**
 * Fetch the count of unread, non-dismissed notifications for a user.
 */
export async function fetchUnreadNotificationCount(
	supabase: SupabaseClient,
	userId: string
): Promise<number> {
	const { count, error } = await supabase
		.from('notifications')
		.select('id', { count: 'exact', head: true })
		.eq('recipient_id', userId)
		.is('read_at', null)
		.is('dismissed_at', null);

	if (error) {
		return 0;
	}

	return count ?? 0;
}

/**
 * Convenience wrapper that returns both the list and unread count.
 */
export async function fetchNotificationPanelData(
	supabase: SupabaseClient,
	userId: string
): Promise<NotificationPanelData> {
	const [notifications, unreadCount] = await Promise.all([
		fetchNotificationsForUser(supabase, userId),
		fetchUnreadNotificationCount(supabase, userId)
	]);

	return { notifications, unreadCount };
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Mark a single notification as read. Only updates if the notification
 * belongs to the given user and is not already read.
 */
export async function markNotificationRead(
	supabase: SupabaseClient,
	userId: string,
	notificationId: string
): Promise<boolean> {
	const { data, error } = await supabase
		.from('notifications')
		.update({ read_at: new Date().toISOString() })
		.eq('id', notificationId)
		.eq('recipient_id', userId)
		.is('read_at', null)
		.select('id');

	return !error && !!data && data.length > 0;
}

/**
 * Dismiss a notification (soft-delete). Sets `dismissed_at` so the
 * notification stops appearing in queries.
 */
export async function dismissNotification(
	supabase: SupabaseClient,
	userId: string,
	notificationId: string
): Promise<boolean> {
	const { data, error } = await supabase
		.from('notifications')
		.update({ dismissed_at: new Date().toISOString() })
		.eq('id', notificationId)
		.eq('recipient_id', userId)
		.is('dismissed_at', null)
		.select('id');

	return !error && !!data && data.length > 0;
}

/**
 * Mark all visible (non-dismissed) notifications as read for a user.
 */
export async function markAllNotificationsRead(
	supabase: SupabaseClient,
	userId: string
): Promise<boolean> {
	const { error } = await supabase
		.from('notifications')
		.update({ read_at: new Date().toISOString() })
		.eq('recipient_id', userId)
		.is('read_at', null)
		.is('dismissed_at', null);

	return !error;
}
