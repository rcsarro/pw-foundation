import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { FileUtils } from '../../src/utils/FileUtils';

test.describe('FileUtils', () => {
  test.afterEach(() => {
    FileUtils.cleanupTempFiles();
  });

  test('ensureFileExists throws for non-existent file', () => {
    expect(() => FileUtils.ensureFileExists('/non/existent/file.txt')).toThrow('File does not exist');
  });

  test('ensureFileExists does not throw for existing file', () => {
    const tempFile = FileUtils.createTempFile('test content', 'txt');
    expect(() => FileUtils.ensureFileExists(tempFile)).not.toThrow();
  });

  test('createTempFile creates file with content', () => {
    const content = 'Hello, World!';
    const filePath = FileUtils.createTempFile(content, 'txt');

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
    expect(filePath).toMatch(/\.txt$/);
  });

  test('cleanupTempFiles removes created files', () => {
    const file1 = FileUtils.createTempFile('content1', 'txt');
    const file2 = FileUtils.createTempFile('content2', 'json');

    expect(fs.existsSync(file1)).toBe(true);
    expect(fs.existsSync(file2)).toBe(true);

    FileUtils.cleanupTempFiles();

    expect(fs.existsSync(file1)).toBe(false);
    expect(fs.existsSync(file2)).toBe(false);
  });

  test('downloadAndVerify downloads a file', async ({ page }) => {
    // Set up a simple download page
    await page.setContent(`
      <html>
        <body>
          <a href="data:text/plain;base64,SGVsbG8gV29ybGQ=" download="test.txt">Download</a>
        </body>
      </html>
    `);

    const filePath = await FileUtils.downloadAndVerify(page, async () => {
      await page.click('a');
    });

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('Hello World');

    // Clean up
    fs.unlinkSync(filePath);
  });

  test('downloadAndVerify throws on failed download', async ({ page }) => {
    await page.setContent('<html><body><button>Click me</button></body></html>');

    await expect(FileUtils.downloadAndVerify(page, async () => {
      await page.click('button');
    }, 1000)).rejects.toThrow('Download failed or file not found');
  });
});