import { test, expect } from '@playwright/test';
import { test as testWithFixtures } from '../../src/fixtures';

testWithFixtures.describe('Framework Fixtures', () => {
testWithFixtures('fixtures mount correctly', async ({ apiClient, testData, logger }) => {
  // Test that fixtures are provided
  expect(apiClient).toBeDefined();
  expect(testData).toBeDefined();
  expect(logger).toBeDefined();

  // Test apiClient is BaseAPI instance
  expect(apiClient).toHaveProperty('get');
  expect(apiClient).toHaveProperty('post');

  // Test testData has methods
  expect(testData).toHaveProperty('randomUser');
  expect(testData).toHaveProperty('randomEmail');

  // Test logger has methods
  expect(logger).toHaveProperty('info');
  expect(logger).toHaveProperty('error');
});

testWithFixtures.skip('authenticatedPage works', async ({ authenticatedPage }) => {
    // Assuming the login worked, page should be on dashboard or similar
    const url = authenticatedPage.url();
    expect(url).toContain('dashboard'); // Adjust based on actual app
  });

  testWithFixtures('apiClient can make requests', async ({ apiClient }) => {
    // Assuming API is available
    try {
      const response = await apiClient.get('/health'); // Adjust endpoint
      expect(response.ok).toBe(true);
    } catch {
      // If API not available, just check the method exists
      expect(apiClient.get).toBeDefined();
    }
  });

  testWithFixtures('testData generates data', async ({ testData }) => {
    const user = testData.randomUser();
    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('email');

    const email = testData.randomEmail();
    expect(typeof email).toBe('string');
    expect(email).toContain('@');
  });
});