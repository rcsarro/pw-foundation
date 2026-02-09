import { test, expect } from '@playwright/test';
import { retryAction, pollUntil, waitForNetworkIdle } from '../../src/utils/WaitHelpers';

test.describe('WaitHelpers', () => {
  test('retryAction succeeds on first attempt', async () => {
    let attempts = 0;
    const result = await retryAction(async () => {
      attempts++;
      return 'success';
    }, 3, 100);

    expect(result).toBe('success');
    expect(attempts).toBe(1);
  });

  test('retryAction retries on failure and succeeds', async () => {
    let attempts = 0;
    const result = await retryAction(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    }, 3, 10);

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  test('retryAction throws after max retries', async () => {
    let attempts = 0;
    await expect(retryAction(async () => {
      attempts++;
      throw new Error('Persistent failure');
    }, 2, 10)).rejects.toThrow('Persistent failure');

    expect(attempts).toBe(3); // initial + 2 retries
  });

  test('pollUntil succeeds immediately', async () => {
    let checks = 0;
    await pollUntil(async () => {
      checks++;
      return true;
    }, 1000, 100);

    expect(checks).toBe(1);
  });

  test('pollUntil succeeds after some checks', async () => {
    let checks = 0;
    await pollUntil(async () => {
      checks++;
      return checks >= 3;
    }, 1000, 50);

    expect(checks).toBe(3);
  });

  test('pollUntil times out', async () => {
    await expect(pollUntil(async () => false, 100, 20)).rejects.toThrow('Polling condition not met within 100ms');
  });

  test('waitForNetworkIdle waits for network inactivity', async ({ page }) => {
    // Navigate to a page that loads resources
    await page.goto('https://httpbin.org/html');

    // Wait for network idle
    await waitForNetworkIdle(page, 200);

    // Should complete without error
    expect(true).toBe(true);
  });
});