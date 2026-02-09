# Getting Started

This guide will walk you through setting up pw-foundation in your project from scratch.

## Prerequisites

- Node.js 18+
- npm or yarn
- Basic familiarity with Playwright

## Installation

### Option 1: Install from npm (Recommended)

```bash
npm install @your-org/playwright-forge
```

### Option 2: Local Development

If you're contributing to the framework:

```bash
git clone https://github.com/rcsarro/pw-foundation.git
cd pw-foundation
npm install
npm run build
npm pack
```

Then in your test project:

```bash
npm install ../pw-foundation/playwright-forge-0.1.0.tgz
```

## Project Setup

### 1. Initialize Playwright

```bash
npm init playwright@latest
```

### 2. Configure pw-foundation

Replace the contents of `playwright.config.ts`:

```typescript
import { createConfig } from '@your-org/playwright-forge';

export default createConfig({
  // Your app's base URL
  baseURL: 'http://localhost:3000',

  // Environment-specific overrides
  environments: {
    staging: {
      baseURL: 'https://staging.your-app.com'
    },
    production: {
      baseURL: 'https://your-app.com'
    }
  }
});
```

### 3. Set Environment Variables (Optional)

Create a `.env` file for environment-specific settings:

```bash
# Test environment (dev/staging/prod)
TEST_ENV=staging

# API credentials
API_TOKEN=your-jwt-token

# Auth credentials
TEST_USERNAME=test@example.com
TEST_PASSWORD=testpass
```

## Writing Your First Page Object

Create `src/pages/LoginPage.ts`:

```typescript
import { BasePage } from '@your-org/playwright-forge';

export class LoginPage extends BasePage {
  private readonly emailInput = this.page.locator('[data-testid="email"]');
  private readonly passwordInput = this.page.locator('[data-testid="password"]');
  private readonly loginButton = this.page.locator('[data-testid="login-button"]');

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isLoggedIn() {
    return this.page.url().includes('/dashboard');
  }
}
```

## Writing Your First API Client

Create `src/api/UserAPI.ts`:

```typescript
import { BaseAPI } from '@your-org/playwright-forge';

export class UserAPI extends BaseAPI {
  async getUsers() {
    return this.get<{ id: number; name: string }[]>('/users');
  }

  async createUser(user: { name: string; email: string }) {
    return this.post<{ id: number }>('/users', user);
  }
}
```

## Writing Tests

Create `tests/auth/login.spec.ts`:

```typescript
import { test } from '@your-org/playwright-forge';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('Authentication', () => {
  test('user can log in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/login');
    await loginPage.login('user@example.com', 'password');

    // Verify login success
    await expect(page).toHaveURL('/dashboard');
    expect(await loginPage.isLoggedIn()).toBe(true);
  });
});
```

## Running Tests Locally

### Run all tests

```bash
npm test
```

### Run specific test file

```bash
npx playwright test tests/auth/login.spec.ts
```

### Run with UI mode

```bash
npx playwright test --ui
```

### Run in specific browser

```bash
npx playwright test --project=chromium
```

## Setting Up CI

Create `.github/workflows/ci.yml` in your repository:

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run lint
    - run: npx tsc --noEmit
    - run: npx playwright test
```

## Next Steps

- Read the [Page Object Guide](PAGE_OBJECT_GUIDE.md) for advanced patterns
- Learn about [API Testing](API_TESTING_GUIDE.md) for backend integration
- Review [Best Practices](PLAYWRIGHT_BEST_PRACTICES.md) for production-ready tests
- Check out the [example tests](../tests/) for more patterns

## Troubleshooting

### Tests are slow
- Enable parallel execution in your config
- Use `test.describe.configure({ mode: 'parallel' })` for test suites

### TypeScript errors
- Ensure you're using TypeScript 5.0+
- Check that your `tsconfig.json` extends the framework's config

### Import errors
- Verify the package is installed: `npm ls @your-org/playwright-forge`
- Check your import paths match the framework's exports