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

## Usage Patterns

pw-foundation supports multiple adoption strategies based on your team's needs and existing setup:

### 1. Fork and Extend (Framework Customization)

**Best for:** Teams that want to customize the framework itself or contribute back improvements.

```bash
# Fork the repository
git clone https://github.com/YOUR_USERNAME/pw-foundation.git
cd pw-foundation

# Add your custom utilities, fixtures, or base classes
# Modify existing patterns to fit your organization's needs
# Your tests can live directly in this forked repository
```

**Pros:** Full control, easy customization, single repository
**Cons:** Tightly coupled, harder to update from upstream

### 2. Fork and Import (Library Approach)

**Best for:** Teams with existing test repositories who want to use pw-foundation as a dependency.

```bash
# Fork pw-foundation for potential customizations
git clone https://github.com/YOUR_USERNAME/pw-foundation.git
cd pw-foundation

# Build and publish to your private registry
npm run build
npm publish --registry=https://your-registry.com

# Then in your test project:
npm install @your-org/pw-foundation
```

**Pros:** Clean separation, easy updates, reusable across projects
**Cons:** Requires private registry setup

### 3. Direct Import (Clean Start)

**Best for:** New projects or teams starting fresh with pw-foundation.

```bash
# Create new test repository
mkdir my-app-e2e-tests
cd my-app-e2e-tests
npm init -y

# Install pw-foundation
npm install @your-org/playwright-forge

# Start building your page objects and tests
```

**Pros:** Clean architecture, easy setup, follows standard npm workflow
**Cons:** Limited customization without forking

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