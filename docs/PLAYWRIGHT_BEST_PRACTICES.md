# Playwright Best Practices

This guide covers proven patterns for writing reliable, maintainable Playwright tests.

## Locator Strategy Priority

Choose locators in this order of preference:

### 1. Role-Based Locators (Most Reliable)

```typescript
// ✅ Preferred - semantic and accessible
await page.getByRole('button', { name: 'Sign In' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
```

### 2. Text Content

```typescript
// ✅ Good for visible text
await page.getByText('Welcome back').waitFor();
await page.getByText('Sign In', { exact: true }).click();
```

### 3. Test IDs

```typescript
// ✅ Good for dynamic content
await page.getByTestId('submit-button').click();
await page.getByTestId('user-profile').waitFor();
```

### 4. CSS Selectors (Last Resort)

```typescript
// ⚠️ Only when semantic locators aren't available
await page.locator('.btn-primary').click();
await page.locator('#user-email').fill('user@example.com');
```

### ❌ Never Use XPath

```typescript
// ❌ Avoid - brittle and hard to read
await page.locator('//button[text()="Sign In"]').click();
```

## Test Isolation

Each test must be completely independent:

### ✅ Good: Clean State Between Tests

```typescript
test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Fresh login for each test
    await loginUser(page, 'admin@example.com');
    await page.goto('/admin/users');
  });

  test('can create new user', async ({ page }) => {
    // Test starts with clean admin page
    await createUser(page, 'john@example.com');
    await expect(page.getByText('User created')).toBeVisible();
  });

  test('can delete existing user', async ({ page }) => {
    // Test starts with clean admin page
    await deleteUser(page, 'existing@example.com');
    await expect(page.getByText('User deleted')).toBeVisible();
  });
});
```

### ❌ Bad: Shared State

```typescript
let userId: string;

test('create user', async ({ page }) => {
  userId = await createUser(page);
});

test('delete user', async ({ page }) => {
  // Depends on previous test - will fail if run alone
  await deleteUser(page, userId);
});
```

## Parallelization

Structure tests to maximize parallel execution:

### ✅ Parallel-Friendly Organization

```typescript
// tests/auth/
// ├── login.spec.ts
// ├── logout.spec.ts
// └── password-reset.spec.ts

// tests/user/
// ├── profile.spec.ts
// ├── settings.spec.ts
// └── preferences.spec.ts
```

### Enable Parallel Execution

```typescript
// playwright.config.ts
export default createConfig({
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined
});

// Or per test suite
test.describe.configure({ mode: 'parallel' });
```

## Flaky Test Mitigation

### Use Auto-Retrying Assertions

```typescript
// ✅ Auto-waits and retries
await expect(page.getByText('Welcome')).toBeVisible();

// ❌ Manual waits are brittle
await page.waitForSelector('.welcome-message');
expect(await page.textContent('.welcome-message')).toBe('Welcome');
```

### Avoid Race Conditions

```typescript
// ✅ Wait for navigation to complete
await Promise.all([
  page.waitForURL('/dashboard'),
  page.click('Sign In')
]);

// ❌ Click then immediately check URL
await page.click('Sign In');
await expect(page).toHaveURL('/dashboard'); // May fail before navigation
```

### Use Appropriate Timeouts

```typescript
// ✅ Reasonable timeouts
await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

// ❌ Overly long timeouts hide real issues
await page.waitForTimeout(5000);
```

## Network Mocking

### When to Mock

- External APIs you don't control
- Slow or unreliable services
- Services not available in test environments
- To test error scenarios

### How to Mock

```typescript
test('handles API errors gracefully', async ({ page }) => {
  // Mock API failure
  await page.route('/api/user/profile', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' })
    });
  });

  await page.goto('/profile');
  await expect(page.getByText('Something went wrong')).toBeVisible();
});
```

## Assertion Patterns

### Prefer Web-First Assertions

```typescript
// ✅ Tests what users actually see
await expect(page.getByText('Welcome, John')).toBeVisible();

// ❌ Tests implementation details
expect(await page.locator('.user-name').textContent()).toBe('John');
```

### Avoid Manual Waits

```typescript
// ✅ Let Playwright handle timing
await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();

// ❌ Manual waits are flaky
await page.click('Save');
await page.waitForTimeout(1000);
await expect(page.getByText('Saved')).toBeVisible();
```

## Trace and Video Usage

### When to Enable

- **Locally**: For debugging failing tests
- **CI**: Only on failure to save storage

```typescript
// playwright.config.ts
export default createConfig({
  use: {
    trace: 'retain-on-failure',  // ✅ Saves traces only when tests fail
    video: 'retain-on-failure'   // ✅ Saves videos only when tests fail
  }
});
```

### Analyzing Traces

```bash
# View trace in browser
npx playwright show-trace trace.zip

# Or use Playwright UI mode
npx playwright test --ui
```

## Test Tagging and Filtering

### Tag Tests for Selective Execution

```typescript
test('user login @smoke', async ({ page }) => {
  // Critical path test
});

test('password reset @slow', async ({ page }) => {
  // Takes longer to run
});

test('admin features @admin-only', async ({ page }) => {
  // Requires admin permissions
});
```

### Run Tagged Tests

```bash
# Run only smoke tests
npx playwright test --grep "@smoke"

# Run everything except slow tests
npx playwright test --grep-invert "@slow"

# Run multiple tags
npx playwright test --grep "@smoke|@admin-only"
```

## Common Anti-Patterns

### ❌ Don't Use Thread.Sleep

```typescript
// Bad - arbitrary delays
await new Promise(resolve => setTimeout(resolve, 1000));

// Good - wait for specific conditions
await expect(page.getByText('Loading...')).toBeHidden();
```

### ❌ Don't Test Implementation Details

```typescript
// Bad - tests internal CSS classes
await expect(page.locator('.btn-loading')).toBeVisible();

// Good - tests user-visible behavior
await expect(page.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
```

### ❌ Don't Chain Too Many Actions

```typescript
// Bad - hard to debug
await page.goto('/').getByRole('button').click().waitForURL('/dashboard');

// Good - separate steps for clarity
await page.goto('/');
await page.getByRole('button').click();
await expect(page).toHaveURL('/dashboard');
```

## Performance Tips

- Use `test.describe.configure({ mode: 'parallel' })` for independent test suites
- Prefer `page.getByRole()` over complex selectors
- Enable `fullyParallel: true` in CI with multiple workers
- Use `test.skip()` for temporarily disabled tests instead of commenting out
- Keep test files focused on a single feature area