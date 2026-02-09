import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * FileUtils provides utilities for file operations, temporary files, and downloads.
 */
export class FileUtils {
  private static tempFiles: string[] = [];

  /**
   * Ensures a file exists at the given path.
   * @param filePath Path to the file
   * @throws Error if file does not exist
   */
  static ensureFileExists(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
  }

  /**
   * Creates a temporary file with the given content and extension.
   * @param content File content
   * @param extension File extension (without dot)
   * @returns Path to the created temporary file
   */
  static createTempFile(content: string, extension: string): string {
    const tempDir = os.tmpdir();
    const fileName = `pw-foundation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, content, 'utf8');
    FileUtils.tempFiles.push(filePath);

    return filePath;
  }

  /**
   * Cleans up all temporary files created during the test.
   */
  static cleanupTempFiles(): void {
    for (const filePath of FileUtils.tempFiles) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn(`Failed to delete temp file: ${filePath}`, error);
      }
    }
    FileUtils.tempFiles = [];
  }

  /**
   * Triggers a download action and waits for the download to complete.
   * @param page Playwright Page instance
   * @param triggerAction Function that triggers the download
   * @param timeout Timeout in milliseconds for waiting for download (default: 30000)
   * @returns Promise resolving to the downloaded file path
   */
  static async downloadAndVerify(
    page: Page,
    triggerAction: () => Promise<void>,
    timeout: number = 30000
  ): Promise<string> {
    const downloadPromise = page.waitForEvent('download', { timeout });
    await triggerAction();
    let download;
    try {
      download = await downloadPromise;
    } catch {
      throw new Error('Download failed or file not found');
    }

    const filePath = await download.path();
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('Download failed or file not found');
    }

    return filePath;
  }
}