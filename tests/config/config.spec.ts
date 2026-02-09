import { test, expect } from '@playwright/test';
import { createConfig } from '../../src/config/default.config';
import { getEnvironment } from '../../src/config/environments';

test.describe('Config Factory', () => {
  test('applies default values', () => {
    const config = createConfig();

    expect(config.retries).toBe(2);
    expect(config.timeout).toBe(30 * 1000);
    expect(config.use?.actionTimeout).toBe(30 * 1000);
    expect(config.use?.baseURL).toBe('http://localhost:3000');
    expect(config.use?.trace).toBe('on-first-retry');
    expect(config.use?.screenshot).toBe('only-on-failure');
    expect(config.use?.video).toBe('off');
    expect(config.reporter).toBe('html');
    expect(config.projects).toHaveLength(2);
    expect(config.projects?.[0].name).toBe('chromium');
    expect(config.projects?.[1].name).toBe('firefox');
  });

  test('overrides merge correctly', () => {
    const config = createConfig({
      retries: 3,
      use: {
        baseURL: 'https://example.com',
      },
    });

    expect(config.retries).toBe(3);
    expect(config.use?.baseURL).toBe('https://example.com');
    // Other defaults remain
    expect(config.timeout).toBe(30 * 1000);
  });

  test('arrays are replaced entirely', () => {
    const config = createConfig({
      projects: [
        {
          name: 'webkit',
          use: { browserName: 'webkit' },
        },
      ],
    });

    expect(config.projects).toHaveLength(1);
    expect(config.projects?.[0].name).toBe('webkit');
  });

  test('environment overrides apply', () => {
    process.env.TEST_ENV = 'staging';

    const config = createConfig({
      environments: {
        staging: {
          use: {
            baseURL: 'https://staging.example.com',
          },
        },
      },
    });

    expect(config.use?.baseURL).toBe('https://staging.example.com');

    delete process.env.TEST_ENV;
  });

  test('missing env var falls back to defaults', () => {
    delete process.env.TEST_ENV;

    const config = createConfig({
      environments: {
        prod: {
          use: {
            baseURL: 'https://prod.example.com',
          },
        },
      },
    });

    expect(config.use?.baseURL).toBe('http://localhost:3000');
  });

  test('getEnvironment returns empty by default', () => {
    const envConfig = getEnvironment();
    expect(envConfig).toEqual({});
  });
});