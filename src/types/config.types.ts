/**
 * Full configuration shape for the Playwright framework.
 * This includes base settings, timeouts, retries, browser options, and environment-specific overrides.
 * @example
 * ```typescript
 * const config: FrameworkConfig = {
 *   baseURL: 'https://example.com',
 *   timeout: 30000,
 *   retries: 2,
 *   browser: { headless: true, viewport: { width: 1280, height: 720 } },
 *   environments: {
 *     staging: { baseURL: 'https://staging.example.com' }
 *   }
 * };
 * ```
 */
export interface FrameworkConfig {
  /** The base URL for all tests and API calls */
  baseURL: string;
  /** Global timeout in milliseconds for test execution */
  timeout: number;
  /** Number of retries for failed tests */
  retries: number;
  /** Browser-specific options */
  browser: BrowserOptions;
  /** Map of environment-specific configurations */
  environments: Record<string, EnvironmentConfig>;
}

/**
 * Per-environment configuration overrides.
 * Allows customizing settings like baseURL, headers, and feature flags for different environments.
 * @example
 * ```typescript
 * const envConfig: EnvironmentConfig = {
 *   baseURL: 'https://prod.example.com',
 *   headers: { 'Authorization': 'Bearer token' },
 *   credentials: 'prod-creds',
 *   featureFlags: { newFeature: true }
 * };
 * ```
 */
export interface EnvironmentConfig {
  /** Override for baseURL in this environment */
  baseURL?: string;
  /** Additional headers to include in requests */
  headers?: Record<string, string>;
  /** Reference to credentials for authentication */
  credentials?: string;
  /** Feature flags specific to this environment */
  featureFlags?: Record<string, unknown>;
}

/**
 * Browser-specific settings for test execution.
 * Controls headless mode, viewport, and device emulation.
 * @example
 * ```typescript
 * const browserOpts: BrowserOptions = {
 *   headless: false,
 *   viewport: { width: 1920, height: 1080 },
 *   device: 'iPhone 12'
 * };
 * ```
 */
export interface BrowserOptions {
  /** Whether to run browser in headless mode */
  headless: boolean;
  /** Viewport dimensions for the browser */
  viewport?: { width: number; height: number };
  /** Device name for emulation (e.g., 'iPhone 12') */
  device?: string;
}
