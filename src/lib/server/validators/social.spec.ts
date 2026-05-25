import { describe, expect, it } from 'vitest';
import {
	followStatusSchema,
	postVisibilitySchema,
	profileSchema
} from '$lib/server/validators/social';

describe('social validators', () => {
	it('accepts supported post visibility values', () => {
		expect(postVisibilitySchema.safeParse('private').success).toBe(true);
		expect(postVisibilitySchema.safeParse('public').success).toBe(true);
		expect(postVisibilitySchema.safeParse('followers').success).toBe(true);
	});

	it('rejects unsupported post visibility values', () => {
		expect(postVisibilitySchema.safeParse('friends').success).toBe(false);
		expect(postVisibilitySchema.safeParse('').success).toBe(false);
	});

	it('accepts supported follow status values', () => {
		expect(followStatusSchema.safeParse('pending').success).toBe(true);
		expect(followStatusSchema.safeParse('approved').success).toBe(true);
	});

	it('rejects unsupported follow status values', () => {
		expect(followStatusSchema.safeParse('blocked').success).toBe(false);
		expect(followStatusSchema.safeParse('rejected').success).toBe(false);
	});

	it('validates profile fields', () => {
		expect(
			profileSchema.safeParse({
				username: 'valid_user',
				display_name: 'Valid User',
				bio: 'A short bio.'
			}).success
		).toBe(true);

		expect(profileSchema.safeParse({ username: 'ab' }).success).toBe(false);
		expect(profileSchema.safeParse({ username: 'invalid-user' }).success).toBe(false);
		expect(
			profileSchema.safeParse({
				username: 'valid_user',
				display_name: 'x'.repeat(61)
			}).success
		).toBe(false);
		expect(
			profileSchema.safeParse({
				username: 'valid_user',
				bio: 'x'.repeat(241)
			}).success
		).toBe(false);
	});
});
