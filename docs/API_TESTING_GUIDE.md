# API Testing Guide

This guide covers best practices for API testing using BaseAPI.

## How to Extend BaseAPI

### Basic API Client Structure

```typescript
import { BaseAPI } from '@your-org/playwright-forge';

export class UserAPI extends BaseAPI {
  async getUsers(params?: { limit?: number; offset?: number }) {
    return this.get<{ id: number; name: string; email: string }[]>('/users', params);
  }

  async getUser(id: number) {
    return this.get<{ id: number; name: string; email: string }>(`/users/${id}`);
  }

  async createUser(user: { name: string; email: string }) {
    return this.post<{ id: number }>('/users', user);
  }

  async updateUser(id: number, user: Partial<{ name: string; email: string }>) {
    return this.put<{ id: number; name: string; email: string }>(`/users/${id}`, user);
  }

  async deleteUser(id: number) {
    return this.delete(`/users/${id}`);
  }
}
```

### Constructor with Auth

```typescript
// With authentication
const userAPI = new UserAPI(request, 'https://api.example.com', {
  type: 'bearer',
  token: process.env.API_TOKEN
});

// Without auth for public APIs
const publicAPI = new UserAPI(request, 'https://jsonplaceholder.typicode.com');
```

## Request Chaining

### Create → Read → Update → Delete Flows

```typescript
test.describe('User CRUD operations', () => {
  let createdUserId: number;
  let userAPI: UserAPI;

  test.beforeEach(async ({ request }) => {
    userAPI = new UserAPI(request, 'https://api.example.com');
  });

  test('complete user lifecycle', async () => {
    // CREATE
    const createResponse = await userAPI.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });
    userAPI.assertStatus(createResponse, 201);
    createdUserId = createResponse.body.id;

    // READ
    const getResponse = await userAPI.getUser(createdUserId);
    userAPI.assertStatus(getResponse, 200);
    expect(getResponse.body.name).toBe('John Doe');

    // UPDATE
    const updateResponse = await userAPI.updateUser(createdUserId, {
      name: 'John Smith'
    });
    userAPI.assertStatus(updateResponse, 200);
    expect(updateResponse.body.name).toBe('John Smith');

    // DELETE
    const deleteResponse = await userAPI.deleteUser(createdUserId);
    userAPI.assertStatus(deleteResponse, 204);

    // Verify deletion
    const verifyResponse = await userAPI.getUser(createdUserId);
    userAPI.assertStatus(verifyResponse, 404);
  });
});
```

### Chaining with Dependent Data

```typescript
test('order creation with product dependencies', async ({ request }) => {
  const api = new ProductAPI(request, 'https://api.example.com');

  // Create products first
  const product1 = await api.createProduct({ name: 'Laptop', price: 999 });
  const product2 = await api.createProduct({ name: 'Mouse', price: 25 });

  // Create order with product references
  const order = await api.createOrder({
    items: [
      { productId: product1.body.id, quantity: 1 },
      { productId: product2.body.id, quantity: 2 }
    ]
  });

  // Verify order total
  expect(order.body.total).toBe(999 + 25 * 2); // 1049
});
```

## Auth Token Management

### Login Once, Reuse Token

```typescript
class AuthenticatedAPI extends BaseAPI {
  private token: string | null = null;

  async login(credentials: { email: string; password: string }) {
    const response = await this.post<{ token: string }>('/auth/login', credentials);
    this.token = response.body.token;

    // Update auth config for future requests
    // Note: This is a simplified example - in practice you'd update the auth config
    return response;
  }

  async getProfile() {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    // Include token in request
    return this.get('/user/profile', undefined, {
      'Authorization': `Bearer ${this.token}`
    });
  }
}

test.describe('Authenticated API calls', () => {
  let api: AuthenticatedAPI;

  test.beforeAll(async ({ request }) => {
    api = new AuthenticatedAPI(request, 'https://api.example.com');

    // Login once for all tests
    await api.login({
      email: 'test@example.com',
      password: 'password'
    });
  });

  test('can access protected resource', async () => {
    const response = await api.getProfile();
    api.assertStatus(response, 200);
    expect(response.body.email).toBe('test@example.com');
  });
});
```

### Token Refresh Pattern

```typescript
class TokenRefreshingAPI extends BaseAPI {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(credentials: { email: string; password: string }) {
    const response = await this.post<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', credentials);

    this.accessToken = response.body.accessToken;
    this.refreshToken = response.body.refreshToken;

    return response;
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken: this.refreshToken
    });

    this.accessToken = response.body.accessToken;
    return response;
  }

  async makeAuthenticatedRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    body?: unknown
  ): Promise<APIResponse<T>> {
    try {
      const headers = this.accessToken
        ? { 'Authorization': `Bearer ${this.accessToken}` }
        : {};

      switch (method) {
        case 'get':
          return await this.get<T>(endpoint, undefined, headers);
        case 'post':
          return await this.post<T>(endpoint, body, headers);
        case 'put':
          return await this.put<T>(endpoint, body, headers);
        case 'delete':
          return await this.delete<T>(endpoint, headers);
      }
    } catch (error: any) {
      // If unauthorized, try refreshing token
      if (error.message?.includes('401') || error.status === 401) {
        await this.refreshAccessToken();
        // Retry with new token
        return this.makeAuthenticatedRequest(method, endpoint, body);
      }
      throw error;
    }
  }
}
```

## Response Validation

### Status Code Checks

```typescript
test('validates response status codes', async ({ request }) => {
  const api = new UserAPI(request, 'https://api.example.com');

  // Success cases
  const successResponse = await api.getUsers();
  api.assertStatus(successResponse, 200);

  // Multiple acceptable statuses
  const createResponse = await api.createUser({ name: 'Test', email: 'test@example.com' });
  api.assertStatus(createResponse, [200, 201]);

  // Error cases
  try {
    const invalidResponse = await api.getUser(999999);
    api.assertStatus(invalidResponse, 200); // This will throw
  } catch (error) {
    expect(error.message).toContain('Expected status 200, but got 404');
  }
});
```

### Body Content Assertions

```typescript
test('validates response body structure', async ({ request }) => {
  const api = new UserAPI(request, 'https://api.example.com');

  const response = await api.getUser(1);
  api.assertStatus(response, 200);

  const user = response.body;

  // Type-safe assertions
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
  expect(typeof user.id).toBe('number');
  expect(typeof user.name).toBe('string');
  expect(typeof user.email).toBe('string');

  // Email format validation
  expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});
```

## Schema Validation

### Runtime Type Checking

```typescript
import { z } from 'zod'; // Optional: use zod for runtime validation

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.string().datetime()
});

class ValidatedUserAPI extends BaseAPI {
  async getUser(id: number) {
    const response = await this.get('/users/${id}');

    // Validate response at runtime
    const validatedUser = UserSchema.parse(response.body);

    return {
      ...response,
      body: validatedUser
    };
  }
}

test('validates user schema', async ({ request }) => {
  const api = new ValidatedUserAPI(request, 'https://api.example.com');

  const response = await api.getUser(1);
  api.assertStatus(response, 200);

  // TypeScript now knows the exact shape
  const user = response.body;
  expect(user.createdAt).toBeDefined(); // TypeScript error if not in schema
});
```

### Custom Validation Helpers

```typescript
class ValidatedAPI extends BaseAPI {
  validateResponse<T>(response: APIResponse<T>, validator: (data: T) => boolean): APIResponse<T> {
    if (!validator(response.body)) {
      throw new Error('Response validation failed');
    }
    return response;
  }

  async getValidatedUser(id: number) {
    const response = await this.get('/users/${id}');
    return this.validateResponse(response, (user: any) => {
      return typeof user.id === 'number' &&
             typeof user.name === 'string' &&
             typeof user.email === 'string' &&
             user.email.includes('@');
    });
  }
}
```

## Error Handling Patterns

### Expected Errors

```typescript
test('handles validation errors', async ({ request }) => {
  const api = new UserAPI(request, 'https://api.example.com');

  try {
    // Try to create user with invalid data
    await api.createUser({
      name: '',
      email: 'invalid-email'
    });
  } catch (error: any) {
    // API should return 400 Bad Request
    expect(error.status).toBe(400);
    expect(error.message).toContain('validation failed');
  }
});
```

### Network Errors

```typescript
test('handles network failures gracefully', async ({ request }) => {
  // Use invalid URL to simulate network failure
  const api = new UserAPI(request, 'https://invalid-domain-that-does-not-exist.com');

  try {
    await api.getUsers();
    expect.fail('Should have thrown network error');
  } catch (error: any) {
    // Should get network error, not unhandled exception
    expect(error.message).toMatch(/network|connection|resolve/i);
  }
});
```

## Testing Different Environments

### Environment-Specific Base URLs

```typescript
// playwright.config.ts
export default createConfig({
  environments: {
    dev: {
      use: { baseURL: 'https://dev-api.example.com' }
    },
    staging: {
      use: { baseURL: 'https://staging-api.example.com' }
    },
    prod: {
      use: { baseURL: 'https://api.example.com' }
    }
  }
});

// Test with different environments
test.describe('API tests', () => {
  test('works in dev environment', async ({ request }) => {
    // TEST_ENV=dev npm test
    const api = new UserAPI(request, process.env.API_BASE_URL || 'https://dev-api.example.com');
    const response = await api.getUsers();
    api.assertStatus(response, 200);
  });

  test('works in staging environment', async ({ request }) => {
    // TEST_ENV=staging npm test
    const api = new UserAPI(request, process.env.API_BASE_URL || 'https://staging-api.example.com');
    const response = await api.getUsers();
    api.assertStatus(response, 200);
  });
});
```

## Performance Considerations

### Parallel API Calls

```typescript
test('fetches multiple resources in parallel', async ({ request }) => {
  const api = new UserAPI(request, 'https://api.example.com');

  // Fetch multiple resources simultaneously
  const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
    api.getUsers(),
    api.get('/posts'),
    api.get('/comments')
  ]);

  api.assertStatus(usersResponse, 200);
  api.assertStatus(postsResponse, 200);
  api.assertStatus(commentsResponse, 200);

  expect(usersResponse.body.length).toBeGreaterThan(0);
  expect(postsResponse.body.length).toBeGreaterThan(0);
  expect(commentsResponse.body.length).toBeGreaterThan(0);
});
```

### Request Batching

```typescript
class BatchedAPI extends BaseAPI {
  async getMultipleUsers(ids: number[]) {
    // Some APIs support batch requests
    return this.post('/users/batch', { ids });
  }

  async getUsersEfficiently(ids: number[]) {
    if (ids.length === 1) {
      // Single request
      return this.getUser(ids[0]);
    } else if (ids.length <= 10) {
      // Batch request
      return this.getMultipleUsers(ids);
    } else {
      // Parallel individual requests for large batches
      const promises = ids.map(id => this.getUser(id));
      const responses = await Promise.all(promises);
      return responses.map(r => r.body);
    }
  }
}
```

## Mocking for Testing

### Mock API Responses

```typescript
test('mocks API responses for testing', async ({ page }) => {
  // Mock API call that the UI depends on
  await page.route('/api/user/profile', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      })
    });
  });

  await page.goto('/profile');
  await expect(page.getByText('John Doe')).toBeVisible();
});
```

### Partial Mocking

```typescript
test('mocks only specific API calls', async ({ request }) => {
  const api = new UserAPI(request, 'https://api.example.com');

  // Override specific method for testing
  const originalGetUser = api.getUser.bind(api);
  api.getUser = async (id: number) => {
    if (id === 999) {
      // Mock response for non-existent user
      return {
        status: 404,
        headers: {},
        body: { error: 'User not found' },
        text: '{"error": "User not found"}',
        ok: false,
        url: 'https://api.example.com/users/999'
      };
    }
    return originalGetUser(id);
  };

  // Test with mocked response
  const response = await api.getUser(999);
  api.assertStatus(response, 404);
});
```