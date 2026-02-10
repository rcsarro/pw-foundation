# pw-foundation

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

## Prerequisites

- Node.js 18+
- npm or yarn
- Basic knowledge of Playwright and TypeScript

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
npm install @your-org/pw-foundation --registry=https://your-registry.com
```

**Pros:** Clean separation, easy updates, reusable across projects
**Cons:** Requires private registry setup

**Note:** If you don't have a private registry, you can use `npm link` for local development: Run `npm link` in the pw-foundation directory, then `npm link @your-org/pw-foundation` in your project.

### 3. Direct Import (Clean Start)

**Best for:** New projects or teams starting fresh with pw-foundation.

```bash
# Create new test repository (or use an existing one)
mkdir my-app-e2e-tests
cd my-app-e2e-tests
npm init -y

# Install Playwright and pw-foundation
npm install playwright @your-org/pw-foundation

# Install Playwright browsers
npx playwright install
```

**Pros:** Clean architecture, easy setup, follows standard npm workflow
**Cons:** Limited customization without forking

**Note:** Replace `@your-org/pw-foundation` with the actual published package name. If not published, see the Fork and Import approach above.

## Quick Start

Get up and running in under 5 minutes:

### 1. Install Dependencies

```bash
npm install playwright @your-org/pw-foundation
npx playwright install
```

### 2. Configure Playwright

Create `playwright.config.ts` in your project root:

```typescript
import { createConfig } from '@your-org/pw-foundation';

export default createConfig({
  baseURL: 'https://your-app.com',
  environments: {
    staging: { baseURL: 'https://staging.your-app.com' },
    production: { baseURL: 'https://your-app.com' },
  },
});
```

### 3. Write Your First Test

Create `tests/example.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { BasePage } from '@your-org/pw-foundation';

class HomePage extends BasePage {
  async navigate() {
    await this.page.goto('/');
  }

  async getTitle() {
    return this.page.title();
  }
}

test('homepage loads', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await expect(page).toHaveTitle(/Your App/);
});
```

### 4. Run Tests

```bash
npx playwright test
```

For UI mode (interactive debugging):
```bash
npx playwright test --ui
```

## Setting Up CI/CD

pw-foundation includes a GitHub Actions workflow for CI. To use it in your project:

1. Copy `.github/workflows/ci.yml` from this repo to your project.
2. Ensure your `package.json` has a `"test"` script: `"test": "playwright test"`.
3. Push to your repository—CI will run on pushes and PRs.

For other CI tools (e.g., GitLab, Jenkins), adapt the steps: install Node, run `npm ci`, `npx playwright install`, and `npm run test`.

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