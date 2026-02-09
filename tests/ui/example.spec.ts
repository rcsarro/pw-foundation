/**
 * This test demonstrates the Page Object pattern using BasePage.
 * WHY: Page Objects encapsulate UI interactions, making tests more maintainable
 * and reducing code duplication. BasePage provides common methods like click(),
 * fill(), and getText() that work across different pages.
 */
import { test, expect } from '@playwright/test';
import { BasePage } from '../../src/core/BasePage';

class ExamplePage extends BasePage {
  async fillName(name: string) {
    await this.fill('#name-input', name);
  }

  async getNameValue() {
    return this.getText('#name-display');
  }

  async submitForm() {
    await this.click('#submit-btn');
  }

  async isSuccessVisible() {
    return this.isVisible('#success-message');
  }
}

test.describe('UI Example - Page Object Pattern', () => {
  test('demonstrates BasePage usage', async ({ page }) => {
    // WHY: Set up a local HTML fixture instead of relying on external sites
    await page.setContent(`
      <html>
        <body>
          <input id="name-input" type="text" placeholder="Enter name" />
          <button id="submit-btn">Submit</button>
          <div id="name-display"></div>
          <div id="success-message" style="display: none;">Success!</div>
          <script>
            document.getElementById('submit-btn').addEventListener('click', () => {
              const name = document.getElementById('name-input').value;
              document.getElementById('name-display').textContent = name;
              document.getElementById('success-message').style.display = 'block';
            });
          </script>
        </body>
      </html>
    `);

    const examplePage = new ExamplePage(page);

    // WHY: Use BasePage methods for consistent, reliable interactions
    await examplePage.fillName('John Doe');
    await examplePage.submitForm();

    // WHY: Verify UI state using Playwright's expect assertions
    expect(await examplePage.getNameValue()).toBe('John Doe');
    expect(await examplePage.isSuccessVisible()).toBe(true);
  });
});