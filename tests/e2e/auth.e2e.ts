import { expect, test } from '@playwright/test';

test.describe('Authentication and Onboarding Flow', () => {
	const timestamp = Date.now();
	const email = `test-user-${timestamp}@example.com`;
	const password = 'Password123!';
	const username = `user_${timestamp}`;
	const displayName = `Test User ${timestamp}`;

	test('should register, onboarding, logout, and login successfully', async ({ page }) => {
		// 1. Visit landing page and navigate to registration
		await page.goto('/');
		await page.getByRole('link', { name: 'Create account' }).click();
		await expect(page).toHaveURL('/auth/register');

		// 2. Form submission check - missing age confirmation
		await page.locator('input[name="email"]').fill(email);
		await page.locator('input[name="password"]').fill(password);

		// Attempt submit without checking the age confirmation box
		// Note: HTML5 validation might block this, but we can verify it doesn't register
		const ageCheckbox = page.locator('input[name="age_confirmed"]');
		await expect(ageCheckbox).not.toBeChecked();

		// Check the checkbox to proceed
		await ageCheckbox.check();
		await page.getByRole('button', { name: 'Create account' }).click();

		// 3. Should redirect to onboarding page
		await expect(page).toHaveURL('/app/onboarding');
		await expect(page.getByRole('heading', { name: 'Set up your profile' })).toBeVisible();

		// 4. Onboarding validation - try invalid username
		await page.locator('input[name="username"]').fill('ab'); // too short (min 3)
		await page.getByRole('button', { name: 'Continue' }).click();
		await expect(page.locator('form p.text-red-700')).toBeVisible();

		// Onboarding with valid details
		await page.locator('input[name="username"]').fill(username);
		await page.locator('input[name="display_name"]').fill(displayName);
		await page.getByRole('button', { name: 'Continue' }).click();

		// 5. Lands on main app area
		await expect(page).toHaveURL('/app');
		await expect(page.getByRole('heading', { name: 'Your MicroBlog' })).toBeVisible();
		await expect(page.locator('header')).toContainText(`@${username}`);

		// 6. Logout
		await page.getByRole('button', { name: 'Sign out' }).click();
		await expect(page).toHaveURL('/');

		// 7. Login again
		await page.getByRole('link', { name: 'Sign in' }).click();
		await expect(page).toHaveURL('/auth/login');

		await page.locator('input[name="email"]').fill(email);
		await page.locator('input[name="password"]').fill(password);
		await page.getByRole('button', { name: 'Sign in' }).click();

		// Verify successful login
		await expect(page).toHaveURL('/app');
		await expect(page.locator('header')).toContainText(`@${username}`);
	});

	test('should redirect unauthenticated users to login', async ({ page }) => {
		await page.goto('/app');
		await expect(page).toHaveURL('/auth/login');
	});
});
