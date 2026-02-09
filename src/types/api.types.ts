/**
 * Typed wrapper around Playwright's APIResponse with a generic body type.
 * Provides type safety for API response bodies while maintaining compatibility with Playwright's response object.
 * @template T The expected type of the response body
 * @example
 * ```typescript
 * const response: APIResponse<User> = await apiClient.get('/user/123');
 * const user: User = response.body; // Type-safe access
 * ```
 */
export interface APIResponse<T = unknown> {
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Typed response body */
  body: T;
  /** Raw response text */
  text: string;
  /** Whether the response was successful (2xx status) */
  ok: boolean;
  /** URL of the response */
  url: string;
}

/**
 * Options for individual API requests.
 * Allows customization of headers, query parameters, and timeouts per request.
 * @example
 * ```typescript
 * const options: RequestOptions = {
 *   headers: { 'Content-Type': 'application/json' },
 *   params: { page: 1, limit: 10 },
 *   timeout: 5000
 * };
 * const response = await apiClient.get('/users', options);
 * ```
 */
export interface RequestOptions {
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** Query parameters to append to the URL */
  params?: Record<string, string | number>;
  /** Timeout in milliseconds for this specific request */
  timeout?: number;
}

/**
 * Authentication configuration for API requests.
 * Supports various authentication methods including tokens, basic auth, and custom headers.
 * @example
 * ```typescript
 * const auth: AuthConfig = {
 *   type: 'bearer',
 *   token: 'your-jwt-token'
 * };
 * // Or for basic auth
 * const basicAuth: AuthConfig = {
 *   type: 'basic',
 *   username: 'user',
 *   password: 'pass'
 * };
 * ```
 */
export interface AuthConfig {
  /** Type of authentication */
  type: 'bearer' | 'basic' | 'custom';
  /** Bearer token for token-based auth */
  token?: string;
  /** Username for basic authentication */
  username?: string;
  /** Password for basic authentication */
  password?: string;
  /** Custom headers for authentication */
  customHeaders?: Record<string, string>;
}
