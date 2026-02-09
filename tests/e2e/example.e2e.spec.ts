/**
 * This test demonstrates E2E testing combining API and UI.
 * WHY: Real-world E2E tests often need to set up data via API before verifying
 * UI behavior. This pattern ensures tests are fast, reliable, and don't depend
 * on external state. Using both apiClient and page fixtures shows fixture composition.
 */
import { test, expect } from '@playwright/test';
import { BaseAPI } from '../../src/core/BaseAPI';

class ExampleAPI extends BaseAPI {
  async getPost(id: number) {
    return this.get<{ id: number; title: string; body: string }>(`posts/${id}`);
  }
}

test.describe('E2E Example - API + UI Integration', () => {
  test('creates resource via API, verifies in UI', async ({ request, page }) => {
    // WHY: Use API client to set up test data reliably
    const api = new ExampleAPI(request, 'https://jsonplaceholder.typicode.com');
    const postResponse = await api.getPost(1);
    api.assertStatus(postResponse, 200);
    const post = postResponse.body;

    // WHY: Simulate UI that displays the API data
    // In real apps, this would be your actual application
    await page.setContent(`
      <html>
        <body>
          <h1 id="post-title">${post.title}</h1>
          <p id="post-body">${post.body}</p>
          <div id="post-id">Post ID: ${post.id}</div>
        </body>
      </html>
    `);

    // WHY: Verify that API data is correctly displayed in the UI
    await expect(page.locator('#post-title')).toHaveText(post.title);
    await expect(page.locator('#post-body')).toHaveText(post.body);
    await expect(page.locator('#post-id')).toContainText(post.id.toString());
  });
});