import { test as base, Page } from '@playwright/test';

/**
 * Fixture for authenticated page using storage state.
 * Automatically logs in and saves storage state for reuse.
 */
export const authFixture = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Configure login - in real usage, this would be parameterized
    const loginUrl = process.env.LOGIN_URL || 'http://localhost:3000/login';
    const username = process.env.TEST_USERNAME || 'testuser';
    const password = process.env.TEST_PASSWORD || 'testpass';

    await page.goto(loginUrl);
    await page.fill('[data-testid="username"]', username);
    await page.fill('[data-testid="password"]', password);
    await page.click('[data-testid="login-button"]');

    // Wait for login to complete - adjust selector as needed
    await page.waitForURL('**/dashboard'); // or some success indicator

    // Save storage state for reuse
    await context.storageState({ path: 'storage-state.json' });

    await use(page);

    await context.close();
  },
});

export default authFixture;