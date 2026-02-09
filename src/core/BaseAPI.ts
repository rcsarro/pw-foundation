import { APIRequestContext, APIResponse as PlaywrightAPIResponse } from '@playwright/test';
import { APIResponse, AuthConfig } from '../types/api.types';
import { Logger } from '../utils/Logger';

/**
 * Base class for API clients. Provides typed HTTP methods with automatic logging,
 * authentication, and response handling.
 */
export class BaseAPI {
  protected request: APIRequestContext;
  protected baseURL: string;
  protected defaultHeaders: Record<string, string> = {};

  constructor(request: APIRequestContext, baseURL: string, authConfig?: AuthConfig) {
    this.request = request;
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash

    if (authConfig) {
      this.setAuthHeaders(authConfig);
    }
  }

  private setAuthHeaders(authConfig: AuthConfig): void {
    switch (authConfig.type) {
      case 'bearer':
        if (authConfig.token) {
          this.defaultHeaders['Authorization'] = `Bearer ${authConfig.token}`;
        }
        break;
      case 'basic':
        if (authConfig.username && authConfig.password) {
          const credentials = btoa(`${authConfig.username}:${authConfig.password}`);
          this.defaultHeaders['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'custom':
        if (authConfig.customHeaders) {
          Object.assign(this.defaultHeaders, authConfig.customHeaders);
        }
        break;
    }
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      return `${url}?${searchParams.toString()}`;
    }
    return url;
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {}
  ): Promise<APIResponse<T>> {
    const url = this.buildURL(endpoint, options.params);
    const headers = { ...this.defaultHeaders, ...options.headers };

    const startTime = Date.now();

    try {
      let response: PlaywrightAPIResponse;

      if (method === 'GET') {
        response = await this.request.get(url, { headers });
      } else if (method === 'POST') {
        const body = options.body ? JSON.stringify(options.body) : undefined;
        response = await this.request.post(url, {
          headers: { 'Content-Type': 'application/json', ...headers },
          data: body
        });
      } else if (method === 'PUT') {
        const body = options.body ? JSON.stringify(options.body) : undefined;
        response = await this.request.put(url, {
          headers: { 'Content-Type': 'application/json', ...headers },
          data: body
        });
      } else if (method === 'PATCH') {
        const body = options.body ? JSON.stringify(options.body) : undefined;
        response = await this.request.patch(url, {
          headers: { 'Content-Type': 'application/json', ...headers },
          data: body
        });
      } else if (method === 'DELETE') {
        response = await this.request.delete(url, { headers });
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }

      const responseTime = Date.now() - startTime;
      const status = response.status();
      const responseHeaders = Object.fromEntries(response.headersArray().map(h => [h.name, h.value]));
      const text = await response.text();

      Logger.info(`${method} ${url}`, {
        status,
        responseTime: `${responseTime}ms`,
        headers: responseHeaders
      });

      return {
        status,
        headers: responseHeaders,
        body: this.extractBody<T>(text),
        text,
        ok: status >= 200 && status < 300,
        url
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      Logger.error(`${method} ${url} failed`, {
        error: error instanceof Error ? error.message : String(error),
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<APIResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, { params });
  }

  async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, { body, headers });
  }

  async put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, { body, headers });
  }

  async patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, { body, headers });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, { headers });
  }

  assertStatus(response: APIResponse, expected: number | number[]): void {
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    if (!expectedArray.includes(response.status)) {
      const expectedStr = expectedArray.join(' or ');
      throw new Error(
        `Expected status ${expectedStr}, but got ${response.status}. ` +
        `URL: ${response.url}. Response body: ${response.text}`
      );
    }
  }

  extractBody<T>(text: string): T {
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse response body as JSON: ${error instanceof Error ? error.message : String(error)}. ` +
        `Response text: ${text}`
      );
    }
  }
}