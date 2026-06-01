import { z } from 'zod';

export const markNotificationReadSchema = z.object({
	notificationId: z.string().uuid('Invalid notification.')
});

export const dismissNotificationSchema = z.object({
	notificationId: z.string().uuid('Invalid notification.')
});

export const markAllNotificationsReadSchema = z.object({
	// Empty object – schema exists for forward-compatibility with future filters
});

export const notificationKindSchema = z.enum([
	'post_vote',
	'post_comment',
	'comment_reply',
	'follow_request',
	'follow_accepted'
]);
