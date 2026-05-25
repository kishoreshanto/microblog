import { expect, test, type Page } from '@playwright/test';

async function registerAndOnboard(page: Page, prefix: string) {
	const timestamp = Date.now() + Math.floor(Math.random() * 1000);
	const email = `${prefix}-${timestamp}@example.com`;
	const password = 'Password123!';
	const username = `${prefix}_${timestamp}`;

	await page.goto('/auth/register');
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').fill(password);
	await page.locator('input[name="age_confirmed"]').check();
	await page.getByRole('button', { name: 'Create account' }).click();

	await expect(page).toHaveURL('/app/onboarding');
	await page.locator('input[name="username"]').fill(username);
	await page.locator('input[name="display_name"]').fill(prefix);
	await page.getByRole('button', { name: 'Continue' }).click();
	await expect(page).toHaveURL('/app');

	return { username };
}

async function createPost(page: Page, content: string, visibility: string) {
	await page.locator('textarea').fill(content);
	await page.locator('select[name="visibility"]').first().selectOption(visibility);
	await page.getByRole('button', { name: 'Post privately' }).click();
	await expect(page.getByText('Post saved.')).toBeVisible();
}

test('public profiles and approved followers-only posts are visible to the right audience', async ({
	browser
}) => {
	const authorContext = await browser.newContext();
	const authorPage = await authorContext.newPage();
	const author = await registerAndOnboard(authorPage, 'author');

	await createPost(authorPage, 'A public profile post', 'public');
	await createPost(authorPage, 'A followers only post', 'followers');
	await createPost(authorPage, 'A private journal post', 'private');

	const anonymousContext = await browser.newContext();
	const anonymousPage = await anonymousContext.newPage();
	await anonymousPage.goto(`/u/${author.username}`);
	await expect(anonymousPage.getByText('A public profile post')).toBeVisible();
	await expect(anonymousPage.getByText('A followers only post')).not.toBeVisible();
	await expect(anonymousPage.getByText('A private journal post')).not.toBeVisible();
	await anonymousContext.close();

	const viewerContext = await browser.newContext();
	const viewerPage = await viewerContext.newPage();
	await registerAndOnboard(viewerPage, 'viewer');
	await viewerPage.goto(`/u/${author.username}`);
	await viewerPage.getByRole('button', { name: 'Request follow' }).click();
	await expect(viewerPage.getByRole('button', { name: 'Cancel request' })).toBeVisible();
	await expect(viewerPage.getByText('A followers only post')).not.toBeVisible();

	await authorPage.goto('/app/profile');
	await expect(authorPage.getByRole('heading', { name: 'Follow requests' })).toBeVisible();
	await authorPage.getByRole('button', { name: 'Approve' }).click();
	await expect(authorPage.getByText('Request approved.')).toBeVisible();

	await viewerPage.goto(`/u/${author.username}`);
	await expect(viewerPage.getByText('A public profile post')).toBeVisible();
	await expect(viewerPage.getByText('A followers only post')).toBeVisible();
	await expect(viewerPage.getByText('A private journal post')).not.toBeVisible();

	await viewerPage.goto('/app');
	await expect(viewerPage.getByText('A public profile post')).toBeVisible();
	await expect(viewerPage.getByText('A followers only post')).toBeVisible();
	await expect(viewerPage.getByText('A private journal post')).not.toBeVisible();

	await viewerContext.close();
	await authorContext.close();
});
