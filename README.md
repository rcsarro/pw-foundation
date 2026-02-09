# playwright-forge

Foundational utilities for Playwright testing frameworks.

[![CI](https://github.com/rcsarro/pw-foundation/actions/workflows/ci.yml/badge.svg)](https://github.com/rcsarro/pw-foundation/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

pw-foundation provides battle-tested utilities and patterns for building maintainable Playwright test suites. It eliminates boilerplate code and establishes conventions for page objects, API testing, fixtures, and configuration management.

### Why Use pw-foundation?

- **Type-Safe**: Full TypeScript support with IntelliSense for all APIs
- **Production-Ready**: Includes CI/CD pipelines, linting, and comprehensive testing
- **Extensible**: Easy to customize fixtures and utilities for your specific needs
- **Well-Documented**: Extensive guides and examples for best practices
- **Framework-Agnostic**: Works with any Playwright setup, from small projects to enterprise suites

## Quick Start

Get up and running in under 5 minutes:

### 1. Install

```bash
npm install @your-org/playwright-forge
```

### 2. Configure

Create `playwright.config.ts`:

```typescript
import { createConfig } from '@your-org/playwright-forge';

export default createConfig({
  baseURL: 'https://your-app.com',
  environments: {
    staging: { baseURL: 'https://staging.your-app.com' }
  }
});
```

### 3. Write Your First Test

```typescript
import { test } from '@your-org/playwright-forge';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### 4. Run Tests

```bash
npx playwright test
```

## Architecture

```
src/
├── core/           # Base classes (BasePage, BaseAPI)
├── fixtures/       # Custom test fixtures
├── utils/          # Helper utilities
├── types/          # TypeScript type definitions
└── config/         # Configuration factory
```

## Documentation

- [Getting Started](docs/GETTING_STARTED.md) - Complete setup guide
- [Page Object Guide](docs/PAGE_OBJECT_GUIDE.md) - Building maintainable page objects
- [API Testing Guide](docs/API_TESTING_GUIDE.md) - REST API testing patterns
- [Playwright Best Practices](docs/PLAYWRIGHT_BEST_PRACTICES.md) - Testing patterns and anti-patterns
- [TypeScript Best Practices](docs/TYPESCRIPT_BEST_PRACTICES.md) - Type safety and code quality
- [Contributing](docs/CONTRIBUTING.md) - Development and contribution guidelines

## License

MIT