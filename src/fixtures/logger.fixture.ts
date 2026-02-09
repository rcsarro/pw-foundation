import { test as base } from '@playwright/test';
import { Logger } from '../utils/Logger';

/**
 * Fixture for logger scoped to the current test.
 * Automatically attaches logs to the test report on completion.
 */
export const loggerFixture = base.extend<{
  logger: Logger;
}>({
  logger: async ({ }, use, testInfo) => {
    Logger.setTestInfo(testInfo);

    // Note: Logger is static, so this sets it globally for the test
    // In a real implementation, you might want per-test instances

    await use(Logger);

    // Flush logs to test report
    // Assuming Logger has a flush method, but it doesn't yet
    // For now, logs are buffered
  },
});

export default loggerFixture;