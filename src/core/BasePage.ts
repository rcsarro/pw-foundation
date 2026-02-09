import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import { Logger } from '../utils/Logger';

/**
 * BasePage provides a reliable wrapper around Playwright page interactions.
 * All methods include auto-waiting, logging, and screenshot-on-failure capabilities.
 */
export class BasePage {
  public page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Clicks on an element after ensuring it's visible and enabled.
   * @param locator The element locator
   */
  async click(locator: string | Locator): Promise<void> {
    const loc = this.resolveLocator(locator);
    const locatorStr = this.getLocatorString(locator);

    try {
      Logger.info('Clicking element', { locator: locatorStr });
      await loc.waitFor({ state: 'visible' });
      await loc.scrollIntoViewIfNeeded();
      await loc.click();
    } catch (error) {
      await this.takeFailureScreenshot(`click-failed-${locatorStr}`);
      throw new Error(`Failed to click element '${locatorStr}': ${error}`);
    }
  }

  /**
   * Fills an input field with the given value.
   * @param locator The input element locator
   * @param value The value to fill
   */
  async fill(locator: string | Locator, value: string): Promise<void> {
    const loc = this.resolveLocator(locator);
    const locatorStr = this.getLocatorString(locator);

    try {
      Logger.info('Filling element', { locator: locatorStr, value });
      await loc.waitFor({ state: 'visible' });
      await loc.clear();
      await loc.fill(value);
    } catch (error) {
      await this.takeFailureScreenshot(`fill-failed-${locatorStr}`);
      throw new Error(`Failed to fill element '${locatorStr}' with value '${value}': ${error}`);
    }
  }

  /**
   * Gets the trimmed text content of an element.
   * @param locator The element locator
   * @returns The trimmed text content
   */
  async getText(locator: string | Locator): Promise<string> {
    const loc = this.resolveLocator(locator);
    const locatorStr = this.getLocatorString(locator);

    try {
      Logger.info('Getting text from element', { locator: locatorStr });
      await loc.waitFor({ state: 'visible' });
      const text = await loc.textContent();
      return text?.trim() || '';
    } catch (error) {
      await this.takeFailureScreenshot(`getText-failed-${locatorStr}`);
      throw new Error(`Failed to get text from element '${locatorStr}': ${error}`);
    }
  }

  /**
   * Selects an option in a select element.
   * @param locator The select element locator
   * @param value The value or label to select
   */
  async selectOption(locator: string | Locator, value: string): Promise<void> {
    const loc = this.resolveLocator(locator);
    const locatorStr = this.getLocatorString(locator);

    try {
      Logger.info('Selecting option', { locator: locatorStr, value });
      await loc.waitFor({ state: 'visible' });
      await loc.selectOption(value);
    } catch (error) {
      await this.takeFailureScreenshot(`selectOption-failed-${locatorStr}`);
      throw new Error(`Failed to select option '${value}' in element '${locatorStr}': ${error}`);
    }
  }

  /**
   * Checks if an element is visible.
   * @param locator The element locator
   * @param timeout Timeout in milliseconds (default: 5000)
   * @returns True if visible, false otherwise
   */
  async isVisible(locator: string | Locator, timeout: number = 5000): Promise<boolean> {
    const loc = this.resolveLocator(locator);
    const locatorStr = this.getLocatorString(locator);

    try {
      Logger.info('Checking visibility', { locator: locatorStr, timeout });
      return await loc.isVisible({ timeout });
    } catch {
      return false;
    }
  }

  /**
   * Waits for navigation after performing an action.
   * @param action The action that triggers navigation
   * @param urlPattern Optional URL pattern to wait for
   */
  async waitForNav(action: () => Promise<void>, urlPattern?: string | RegExp): Promise<void> {
    try {
      Logger.info('Waiting for navigation', { urlPattern });
      await Promise.all([
        urlPattern ? this.page.waitForURL(urlPattern) : this.page.waitForLoadState('domcontentloaded'),
        action()
      ]);
      Logger.info('Navigation completed', { url: this.page.url() });
    } catch (error) {
      await this.takeFailureScreenshot('navigation-failed');
      throw new Error(`Navigation failed: ${error}`);
    }
  }

  /**
   * Takes a screenshot of the current page.
   * @param name Optional screenshot name (auto-generated if not provided)
   */
  async screenshot(name?: string): Promise<void> {
    const screenshotName = name || `screenshot-${Date.now()}`;
    try {
      Logger.info('Taking screenshot', { name: screenshotName });
      await this.page.screenshot({ path: `test-results/${screenshotName}.png` });
    } catch (error) {
      Logger.error('Failed to take screenshot', { error });
    }
  }

  /**
   * Uploads a file to a file input element.
   * @param locator The file input element locator
   * @param filePath Path to the file to upload
   */
  async uploadFile(locator: string | Locator, filePath: string): Promise<void> {
    const loc = this.resolveLocator(locator);
    const locatorStr = this.getLocatorString(locator);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    try {
      Logger.info('Uploading file', { locator: locatorStr, filePath });
      await loc.waitFor({ state: 'visible' });
      await loc.setInputFiles(filePath);
    } catch (error) {
      await this.takeFailureScreenshot(`upload-failed-${locatorStr}`);
      throw new Error(`Failed to upload file '${filePath}' to element '${locatorStr}': ${error}`);
    }
  }

  /**
   * Hovers over an element.
   * @param locator The element locator
   */
  async hover(locator: string | Locator): Promise<void> {
    const loc = this.resolveLocator(locator);
    const locatorStr = this.getLocatorString(locator);

    try {
      Logger.info('Hovering over element', { locator: locatorStr });
      await loc.waitFor({ state: 'visible' });
      await loc.hover();
    } catch (error) {
      await this.takeFailureScreenshot(`hover-failed-${locatorStr}`);
      throw new Error(`Failed to hover over element '${locatorStr}': ${error}`);
    }
  }

  /**
   * Checks or unchecks a checkbox element.
   * @param locator The checkbox element locator
   * @param checked Whether to check (true) or uncheck (false)
   */
  async checkBox(locator: string | Locator, checked: boolean): Promise<void> {
    const loc = this.resolveLocator(locator);
    const locatorStr = this.getLocatorString(locator);

    try {
      Logger.info('Setting checkbox state', { locator: locatorStr, checked });
      await loc.waitFor({ state: 'visible' });
      if (checked) {
        await loc.check();
      } else {
        await loc.uncheck();
      }
    } catch (error) {
      await this.takeFailureScreenshot(`checkbox-failed-${locatorStr}`);
      throw new Error(`Failed to set checkbox '${locatorStr}' to ${checked}: ${error}`);
    }
  }

  private resolveLocator(locator: string | Locator): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  private getLocatorString(locator: string | Locator): string {
    return typeof locator === 'string' ? locator : 'Locator';
  }

  private async takeFailureScreenshot(name: string): Promise<void> {
    try {
      await this.page.screenshot({ path: `test-results/${name}.png` });
      Logger.info('Failure screenshot taken', { path: `test-results/${name}.png` });
    } catch (error) {
      Logger.error('Failed to take failure screenshot', { error });
    }
  }
}