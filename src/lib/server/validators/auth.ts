// Auth validation using ZOD

import z from 'zod';

// Validation schema for user registration
export const registerSchema = z.object({
	email: z.email('Enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters.'),
	age_confirmed: z
		.string()
		.optional()
		.refine((value) => value === 'on', 'You must confirm that you are 16 or older')
});

// Validation schema for user login
export const loginSchema = z.object({
	email: z.email('Enter a valid email address.'),
	password: z.string().min(1, 'Password is required.')
});

// Validation schema for updating user profile
export const profileSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3, 'Username must be at least 3 characters.')
		.max(30, 'Username must be at most 30 characters.')
		.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
	display_name: z.string().trim().max(60, 'Display name must be at most 60 characters.').optional()
});
