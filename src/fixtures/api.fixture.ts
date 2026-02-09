import { test as base, APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../core/BaseAPI';
import { AuthConfig } from '../types/api.types';

/**
 * Fixture for API client with pre-configured BaseAPI instance.
 */
export const apiFixture = base.extend<{
  apiClient: BaseAPI;
}>({
  apiClient: async ({ request }, use) => {
    // Get baseURL from config or env
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000/api';

    // Optional auth config
    let authConfig: AuthConfig | undefined;
    if (process.env.API_TOKEN) {
      authConfig = { type: 'bearer', token: process.env.API_TOKEN };
    }

    const apiClient = new BaseAPI(request, baseURL, authConfig);
    await use(apiClient);
  },
});

export default apiFixture;