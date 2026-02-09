import { PlaywrightTestConfig } from '@playwright/test';

/**
 * Framework configuration that extends Playwright's config with environment support.
 * Consumers can provide overrides that are deep-merged with defaults.
 */
export interface FrameworkConfig extends Partial<PlaywrightTestConfig> {
  /** Map of environment-specific configurations */
  environments?: Record<string, EnvironmentConfig>;
}

/**
 * Per-environment configuration overrides.
 * Allows customizing settings for different environments.
 */
export interface EnvironmentConfig extends Partial<PlaywrightTestConfig> {
  /** Feature flags specific to this environment */
  featureFlags?: Record<string, unknown>;
}
