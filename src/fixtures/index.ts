// Test fixtures
import { test as base, Page, APIRequestContext, TestInfo } from '@playwright/test';
import { BaseAPI } from '../core/BaseAPI';
import { DataFactory } from '../utils/DataFactory';
import { Logger } from '../utils/Logger';
import { AuthConfig } from '../types/api.types';

// Define the fixture types
interface FrameworkFixtures {
  authenticatedPage: Page;
  apiClient: BaseAPI;
  testData: DataFactory;
  logger: typeof Logger;
}

// Merge all fixtures
const authFixture = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const loginUrl = process.env.LOGIN_URL || 'http://localhost:3000/login';
    const username = process.env.TEST_USERNAME || 'testuser';
    const password = process.env.TEST_PASSWORD || 'testpass';

    await page.goto(loginUrl);
    await page.fill('[data-testid="username"]', username);
    await page.fill('[data-testid="password"]', password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');

    await context.storageState({ path: 'storage-state.json' });
    await use(page);
    await context.close();
  },
});

const apiFixture = authFixture.extend<{ apiClient: BaseAPI }>({
  apiClient: async ({ request }, use) => {
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000/api';
    let authConfig: AuthConfig | undefined;
    if (process.env.API_TOKEN) {
      authConfig = { type: 'bearer' as const, token: process.env.API_TOKEN };
    }
    const apiClient = new BaseAPI(request, baseURL, authConfig);
    await use(apiClient);
  },
});

const dataFixture = apiFixture.extend<{ testData: DataFactory }>({
  testData: async ({ }, use: (dataFactory: DataFactory) => Promise<void>) => {
    const dataFactory = new DataFactory();
    await use(dataFactory);
  },
});

const loggerFixture = dataFixture.extend<{ logger: typeof Logger }>({
  logger: async ({ }, use, testInfo) => {
    Logger.setTestInfo(testInfo);
    await use(Logger);
  },
});

// Export the final extended test
export const test = loggerFixture;

// Export individual fixtures for independent import
export { authFixture, apiFixture, dataFixture, loggerFixture };

// For merging into consumer projects
export const frameworkFixtures: FrameworkFixtures = {} as any; // Placeholder
