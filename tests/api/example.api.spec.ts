/**
 * This test demonstrates API testing using BaseAPI.
 * WHY: BaseAPI provides typed HTTP methods with automatic logging, authentication,
 * and response handling. Extending it allows creating domain-specific API clients
 * with consistent error handling and type safety.
 */
import { test, expect } from '@playwright/test';
import { BaseAPI } from '../../src/core/BaseAPI';

class ExampleAPI extends BaseAPI {
  async getPosts() {
    return this.get<{ id: number; title: string; body: string }[]>('posts');
  }

  async createPost(post: { title: string; body: string; userId: number }) {
    return this.post<{ id: number }>('posts', post);
  }

  async updatePost(id: number, post: { title: string; body: string }) {
    return this.put<{ id: number }>(`posts/${id}`, post);
  }

  async deletePost(id: number) {
    return this.delete(`posts/${id}`);
  }
}

test.describe('API Example - BaseAPI Usage', () => {
  let api: ExampleAPI;

  test.beforeEach(async ({ request }) => {
    // WHY: Use a stable public API for demonstration (jsonplaceholder.typicode.com)
    // In real usage, this would be your application's API
    api = new ExampleAPI(request, 'https://jsonplaceholder.typicode.com');
  });

  test('demonstrates GET operation with typed response', async () => {
    const response = await api.getPosts();

    // WHY: assertStatus ensures the response is successful
    api.assertStatus(response, 200);

    // WHY: extractBody provides type-safe JSON parsing
    const posts = response.body;
    expect(posts).toHaveLength(100);
    expect(posts[0]).toHaveProperty('id');
    expect(posts[0]).toHaveProperty('title');
  });

  test('demonstrates POST operation', async () => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post body',
      userId: 1
    };

    const response = await api.createPost(newPost);
    api.assertStatus(response, 201);

    // WHY: Response includes the created resource with generated ID
    expect(response.body.id).toBeDefined();
  });

  test('demonstrates PUT operation', async () => {
    const updatedPost = {
      title: 'Updated Title',
      body: 'Updated body content'
    };

    const response = await api.updatePost(1, updatedPost);
    api.assertStatus(response, 200);

    expect(response.body.id).toBe(1);
  });

  test('demonstrates DELETE operation', async () => {
    const response = await api.deletePost(1);
    api.assertStatus(response, 200);
  });
});