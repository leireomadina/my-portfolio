import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('page loads', async ({ page }) => {
	await expect(page).toBeDefined();
});

test('has title', async ({ page }) => {
	await expect(page).toHaveTitle(/Leire Ordeñana Madina | Full-stack developer/);
});

test('get started link', async ({ page, browser }) => {
	const context = await browser.newContext();

	context.on('page', async page => {
		await page.waitForLoadState();
		console.log('uwu')
		process.stdout.write('uwuuuu')
		console.log(await page.title());
	});


	/*const pagePromise = context.waitForEvent('page');
  await page.getByRole('link', { name: 'Zorraquino' }).click();
	const newPage = await pagePromise;
	console.log('newPage ', newPage)
	await newPage.waitForLoadState();
	console.log(await newPage.title());*/



	// TODO: https://playwright.dev/docs/pages#handling-new-pages

	// await expect(page).toHaveURL(/zorraquino.com/);
  // Expects page to have a heading with the name of Installation.
  // await expect(page.getByRole('heading', { name: 'Zorraquino' })).toBeVisible();
  // await expect(page.getByText('Zorraquino')).toBeVisible();
	// await page.waitForSelector('header :text("Zorraquino")');

});
