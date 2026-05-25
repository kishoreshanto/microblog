// Auth validation using ZOD

import z from 'zod';
import { profileSchema } from './social';

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

export { profileSchema };
