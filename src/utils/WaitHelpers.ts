import { Page } from '@playwright/test';

/**
 * Retries an async function with configurable attempts and delay between retries.
 * @param fn The async function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param delayMs Delay in milliseconds between retries
 * @returns Promise resolving to the function result
 * @throws The last error if all retries fail
 */
export async function retryAction<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayMs: number
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError!;
}

/**
 * Polls a condition function until it returns true or timeout expires.
 * @param fn The condition function to poll
 * @param timeoutMs Total timeout in milliseconds
 * @param intervalMs Polling interval in milliseconds
 * @throws Error if timeout expires before condition becomes true
 */
export async function pollUntil(
  fn: () => Promise<boolean>,
  timeoutMs: number,
  intervalMs: number
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await fn()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Polling condition not met within ${timeoutMs}ms`);
}

/**
 * Waits for no network activity for the specified duration.
 * @param page Playwright Page instance
 * @param idleTimeMs Time in milliseconds with no network activity (default: 500)
 */
export async function waitForNetworkIdle(
  page: Page,
  idleTimeMs: number = 500
): Promise<void> {
  return new Promise((resolve) => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        page.off('request', resetTimer);
        page.off('response', resetTimer);
        resolve();
      }, idleTimeMs);
    };

    page.on('request', resetTimer);
    page.on('response', resetTimer);

    // Start the timer initially
    resetTimer();
  });
}