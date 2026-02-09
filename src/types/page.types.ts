import { Page } from '@playwright/test';

/**
 * Interface that page objects should implement.
 * Ensures consistent structure for page object classes used in tests.
 * @example
 * ```typescript
 * class LoginPage implements PageObjectInterface {
 *   constructor(private page: Page) {}
 *
 *   get page(): Page {
 *     return this.page;
 *   }
 *
 *   async navigate(): Promise<void> {
 *     await this.page.goto('/login');
 *   }
 * }
 * ```
 */
export interface PageObjectInterface {
  /** The Playwright Page instance */
  page: Page;
  /** Navigate to the page */
  navigate(): Promise<void>;
}

/**
 * Options for locator resolution.
 * Controls how elements are located on the page, including timeouts and strict mode.
 * @example
 * ```typescript
 * const options: LocatorOptions = {
 *   timeout: 10000,
 *   strict: true
 * };
 * const element = page.locator('button', options);
 * ```
 */
export interface LocatorOptions {
  /** Timeout in milliseconds for locator resolution */
  timeout?: number;
  /** Whether to use strict mode (fail if multiple elements match) */
  strict?: boolean;
}

/**
 * Screenshot configuration options.
 * Defines how screenshots are captured and saved.
 * @example
 * ```typescript
 * const options: ScreenshotOptions = {
 *   path: 'screenshot.png',
 *   fullPage: true,
 *   mask: [page.locator('.sensitive-data')]
 * };
 * await page.screenshot(options);
 * ```
 */
export interface ScreenshotOptions {
  /** File path where the screenshot will be saved */
  path?: string;
  /** Whether to capture the full page or just the viewport */
  fullPage?: boolean;
  /** Locators to mask (hide) in the screenshot */
  mask?: unknown[]; // Using unknown as it's Playwright's Locator type
}
