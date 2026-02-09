import { defineConfig, devices } from '@playwright/test';
import { FrameworkConfig } from '../types/config.types';
import { getEnvironment } from './environments';

/**
 * Creates a Playwright configuration with framework defaults and consumer overrides.
 * Deep merges overrides with defaults, with arrays being replaced entirely.
 * @param overrides Partial configuration to merge with defaults
 * @returns Playwright configuration object
 */
export function createConfig(overrides: Partial<FrameworkConfig> = {}): ReturnType<typeof defineConfig> {
  // Get environment-specific config
  const envConfig = getEnvironment();

  // Get consumer-provided environment overrides
  const consumerEnvConfig = overrides.environments?.[process.env.TEST_ENV || ''] || {};

  // Framework defaults
  const defaults: FrameworkConfig = {
    testDir: './tests',
    timeout: 30 * 1000,
    expect: {
      timeout: 5000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 2,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
      actionTimeout: 30 * 1000,
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'off',
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
    ],
  };

  // Deep merge defaults with overrides
  const merged = deepMerge(defaults, overrides);

  // Apply environment-specific overrides
  const final = deepMerge(merged, envConfig);
  const finalWithConsumerEnv = deepMerge(final, consumerEnvConfig);

  // Remove environments from final config as it's not part of Playwright config
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { environments, ...playwrightConfig } = finalWithConsumerEnv;

  return defineConfig(playwrightConfig);
}

/**
 * Deep merges objects, replacing arrays entirely.
 * @param target Target object
 * @param source Source object
 * @returns Merged object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (Array.isArray(sourceValue)) {
        // Replace arrays entirely
        result[key] = sourceValue;
      } else if (sourceValue && typeof sourceValue === 'object' && targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        // Deep merge objects
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Replace primitives and null/undefined
        result[key] = sourceValue;
      }
    }
  }

  return result;
}