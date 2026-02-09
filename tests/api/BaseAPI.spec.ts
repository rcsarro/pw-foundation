import { test, expect, request } from '@playwright/test';
import { BaseAPI } from '../../src/core/BaseAPI';

test.describe('BaseAPI', () => {
  let api: BaseAPI;

  test.beforeEach(async ({ }) => {
    const requestContext = await request.newContext();
    api = new BaseAPI(requestContext, 'https://jsonplaceholder.typicode.com');
  });

  test('get method works', async () => {
    const response = await api.get<{ id: number; title: string }>('posts/1');
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
    expect(response.body.id).toBe(1);
    expect(response.body.title).toBeDefined();
  });

  test('post method works', async () => {
    const newPost = { title: 'foo', body: 'bar', userId: 1 };
    const response = await api.post<{ id: number }>('posts', newPost);
    expect(response.status).toBe(201);
    expect(response.ok).toBe(true);
    expect(response.body.id).toBeDefined();
  });

  test('put method works', async () => {
    const updatedPost = { id: 1, title: 'foo', body: 'bar', userId: 1 };
    const response = await api.put<{ id: number }>('posts/1', updatedPost);
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
    expect(response.body.id).toBe(1);
  });

  test('patch method works', async () => {
    const patchData = { title: 'foo' };
    const response = await api.patch<{ id: number; title: string }>('posts/1', patchData);
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
    expect(response.body.title).toBe('foo');
  });

  test('delete method works', async () => {
    const response = await api.delete('posts/1');
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  });

  test('assertStatus works', async () => {
    const response = await api.get('posts/1');
    expect(() => api.assertStatus(response, 200)).not.toThrow();
    expect(() => api.assertStatus(response, [200, 201])).not.toThrow();
    expect(() => api.assertStatus(response, 404)).toThrow(/Expected status 404, but got 200/);
  });

  test('extractBody works', () => {
    const validJson = '{"key": "value"}';
    const result = api.extractBody<{ key: string }>(validJson);
    expect(result.key).toBe('value');

    const invalidJson = 'not json';
    expect(() => api.extractBody(invalidJson)).toThrow(/Failed to parse response body as JSON/);
  });

  test('auth headers work', async () => {
    const requestContext = await request.newContext();
    const apiWithAuth = new BaseAPI(requestContext, 'https://httpbin.org', {
      type: 'bearer',
      token: 'test-token'
    });

    // Note: httpbin.org echoes back headers
    const response = await apiWithAuth.get<{ headers: { Authorization: string } }>('get');
    expect(response.status).toBe(200);
    expect(response.body.headers.Authorization).toBe('Bearer test-token');
  });
});