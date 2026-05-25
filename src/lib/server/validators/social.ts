import { z } from 'zod';

export const postVisibilityValues = ['private', 'public', 'followers'] as const;
export const followStatusValues = ['pending', 'approved'] as const;

export const postVisibilitySchema = z.enum(postVisibilityValues);
export const followStatusSchema = z.enum(followStatusValues);

export const profileSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3, 'Username must be at least 3 characters.')
		.max(30, 'Username must be at most 30 characters.')
		.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
	display_name: z.string().trim().max(60, 'Display name must be at most 60 characters.').optional(),
	bio: z.string().trim().max(240, 'Bio must be at most 240 characters.').optional()
});
