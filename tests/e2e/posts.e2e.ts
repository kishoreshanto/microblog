import { expect, test } from '@playwright/test';

test.describe('Posts Flow', () => {
	// Helper function to register and onboarding a new user
	async function registerAndOnboard(page) {
		const timestamp = Date.now() + Math.floor(Math.random() * 1000);
		const email = `post-test-${timestamp}@example.com`;
		const password = 'Password123!';
		const username = `writer_${timestamp}`;

		await page.goto('/auth/register');
		await page.locator('input[name="email"]').fill(email);
		await page.locator('input[name="password"]').fill(password);
		await page.locator('input[name="age_confirmed"]').check();
		await page.getByRole('button', { name: 'Create account' }).click();

		await expect(page).toHaveURL('/app/onboarding');
		await page.locator('input[name="username"]').fill(username);
		await page.getByRole('button', { name: 'Continue' }).click();
		await expect(page).toHaveURL('/app');

		return username;
	}

	test('should validate post content on client side', async ({ page }) => {
		await registerAndOnboard(page);

		const textarea = page.locator('textarea');
		const postButton = page.getByRole('button', { name: 'Post privately' });

		// Initially, textarea is empty, post button should be disabled
		await expect(postButton).toBeDisabled();

		// Type within limit (e.g. 5 words)
		await textarea.fill('This is a short post.');
		await expect(postButton).toBeEnabled();

		// Create a post with more than 100 words to test the limit
		const longPost = Array(101).fill('word').join(' ');
		await textarea.fill(longPost);
		await expect(postButton).toBeDisabled();
		await expect(page.locator('text=/100 words/')).toBeVisible();
	});

	test('should create, display, and delete a private post', async ({ page }) => {
		await registerAndOnboard(page);

		const textarea = page.locator('textarea');
		const postButton = page.getByRole('button', { name: 'Post privately' });
		
		const postContent = 'My first private microblog post! Simple and secure.';
		
		// 1. Create the post
		await textarea.fill(postContent);
		await postButton.click();

		// 2. Post should appear in the feed
		const postCard = page.locator('article').first();
		await expect(postCard).toBeVisible();
		await expect(postCard.locator('p')).toHaveText(postContent);
		await expect(postCard.locator('footer')).toContainText('9 words');
		await expect(postCard.locator('footer')).toContainText('Private');

		// 3. Delete the post (accept the confirmation dialog)
		page.once('dialog', async (dialog) => {
			expect(dialog.message()).toContain('Delete this post?');
			await dialog.accept();
		});

		await postCard.getByRole('button', { name: 'Delete post' }).click();

		// 4. Post should be removed from the feed
		await expect(page.locator('text=No posts yet.')).toBeVisible();
	});
});
