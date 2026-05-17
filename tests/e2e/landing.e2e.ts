import { expect, test } from '@playwright/test';

// e2e Landing page test
test('landing page loads', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: 'MicroBlog' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
});
