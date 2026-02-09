# Page Object Guide

This guide covers best practices for creating maintainable page objects using BasePage.

## How to Extend BasePage

### Basic Structure

```typescript
import { BasePage } from '@your-org/playwright-forge';

export class LoginPage extends BasePage {
  // Private locators at the top
  private readonly emailInput = this.page.getByTestId('email');
  private readonly passwordInput = this.page.getByTestId('password');
  private readonly loginButton = this.page.getByRole('button', { name: 'Sign In' });

  // Public methods for test usage
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isLoginFormVisible() {
    return this.emailInput.isVisible();
  }
}
```

### Constructor Patterns

```typescript
// ✅ Simple extension
export class DashboardPage extends BasePage {
  // Inherits constructor from BasePage
}

// ✅ Custom initialization
export class AdminPage extends BasePage {
  constructor(page: Page) {
    super(page);
    // Custom setup if needed
  }
}
```

## Locator Organization

### Private Properties First

```typescript
export class ProductPage extends BasePage {
  // ✅ Locators grouped at top
  private readonly searchInput = this.page.getByPlaceholder('Search products...');
  private readonly searchButton = this.page.getByRole('button', { name: 'Search' });
  private readonly productGrid = this.page.locator('.product-grid');
  private readonly addToCartButtons = this.page.getByRole('button', { name: 'Add to Cart' });

  // Public methods below
  async searchProduct(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }
}
```

### Locator Naming Conventions

```typescript
// ✅ Descriptive names
private readonly userProfileMenu = this.page.getByTestId('user-menu');
private readonly notificationBadge = this.page.getByTestId('notification-count');
private readonly saveButton = this.page.getByRole('button', { name: 'Save Changes' });

// ❌ Generic names
private readonly input1 = this.page.locator('#input1');
private readonly btn = this.page.locator('.btn');
```

## Composition Over Deep Inheritance

### ❌ Avoid Deep Inheritance Chains

```typescript
// Bad - hard to maintain and test
class BasePage extends PageObject { /* ... */ }
class AppPage extends BasePage { /* ... */ }
class DashboardPage extends AppPage { /* ... */ }
class UserSettingsPage extends DashboardPage { /* ... */ }
class NotificationSettingsPage extends UserSettingsPage { /* ... */ }
```

### ✅ Prefer Composition

```typescript
// Good - flat hierarchy, focused responsibilities
class LoginPage extends BasePage {
  async login(credentials: LoginCredentials) { /* ... */ }
}

class DashboardPage extends BasePage {
  readonly userMenu = new UserMenuComponent(this.page);
  readonly notifications = new NotificationComponent(this.page);

  async navigateToSettings() { /* ... */ }
}

class SettingsPage extends BasePage {
  readonly profile = new ProfileSettingsComponent(this.page);
  readonly notifications = new NotificationSettingsComponent(this.page);
}
```

### Component Composition

```typescript
// Reusable components
class UserMenuComponent {
  constructor(private page: Page) {}

  async open() {
    await this.page.getByTestId('user-menu').click();
  }

  async logout() {
    await this.open();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }
}

// Page uses component
class DashboardPage extends BasePage {
  private readonly userMenu = new UserMenuComponent(this.page);

  async logout() {
    await this.userMenu.logout();
  }
}
```

## When to Split Page Objects

### Single Responsibility Principle

```typescript
// ✅ One page object per logical page/feature
class LoginPage extends BasePage {
  // Only login-related functionality
}

class PasswordResetPage extends BasePage {
  // Only password reset functionality
}

// ❌ Don't mix concerns
class AuthPage extends BasePage {
  // Login AND password reset - confusing
  async login() { /* ... */ }
  async requestPasswordReset() { /* ... */ }
  async resetPassword() { /* ... */ }
}
```

### Size Guidelines

- **Small pages** (< 5 methods): Keep as one class
- **Medium pages** (5-15 methods): Consider splitting into components
- **Large pages** (> 15 methods): Definitely split into multiple classes

### Modal and Dialog Patterns

```typescript
// Modal as separate class
class ConfirmDeleteModal {
  constructor(private page: Page) {}

  async confirm() {
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async isVisible() {
    return this.page.getByRole('dialog', { name: 'Confirm Delete' }).isVisible();
  }
}

// Page uses modal
class UserManagementPage extends BasePage {
  private readonly confirmModal = new ConfirmDeleteModal(this.page);

  async deleteUser(userId: string) {
    await this.page.getByTestId(`delete-user-${userId}`).click();
    await this.confirmModal.confirm();
  }
}
```

## Complete Example

### Real-World Page Object

```typescript
import { BasePage } from '@your-org/playwright-forge';

interface Product {
  id: string;
  name: string;
  price: number;
}

export class ProductCatalogPage extends BasePage {
  // Locators
  private readonly searchInput = this.page.getByPlaceholder('Search products...');
  private readonly searchButton = this.page.getByRole('button', { name: 'Search' });
  private readonly productCards = this.page.locator('.product-card');
  private readonly addToCartButtons = this.page.locator('.add-to-cart-btn');
  private readonly cartIcon = this.page.getByTestId('cart-icon');
  private readonly loadingSpinner = this.page.getByTestId('loading-spinner');

  // Components
  private readonly filters = new ProductFiltersComponent(this.page);
  private readonly pagination = new PaginationComponent(this.page);

  // Actions
  async searchProducts(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.loadingSpinner.waitFor({ state: 'hidden' });
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async getProducts(): Promise<Product[]> {
    const products: Product[] = [];
    const count = await this.productCards.count();

    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const product: Product = {
        id: await card.getAttribute('data-product-id') || '',
        name: await card.locator('.product-name').textContent() || '',
        price: parseFloat(await card.locator('.product-price').textContent() || '0')
      };
      products.push(product);
    }

    return products;
  }

  async addProductToCart(productId: string) {
    await this.page.locator(`[data-product-id="${productId}"] .add-to-cart-btn`).click();
    await expect(this.cartIcon).toHaveAttribute('data-count', /.+/);
  }

  async goToPage(pageNumber: number) {
    await this.pagination.goToPage(pageNumber);
  }

  async filterByCategory(category: string) {
    await this.filters.selectCategory(category);
  }

  // Assertions
  async expectProductsVisible() {
    await expect(this.productCards.first()).toBeVisible();
  }

  async expectNoProductsFound() {
    await expect(this.page.getByText('No products found')).toBeVisible();
  }

  async expectSearchResults(query: string) {
    const products = await this.getProducts();
    for (const product of products) {
      expect(product.name.toLowerCase()).toContain(query.toLowerCase());
    }
  }
}

// Supporting components
class ProductFiltersComponent {
  constructor(private page: Page) {}

  async selectCategory(category: string) {
    await this.page.getByRole('combobox', { name: 'Category' }).selectOption(category);
  }
}

class PaginationComponent {
  constructor(private page: Page) {}

  async goToPage(pageNumber: number) {
    await this.page.getByRole('button', { name: `${pageNumber}` }).click();
  }
}
```

### Usage in Tests

```typescript
import { test, expect } from '@your-org/playwright-forge';
import { ProductCatalogPage } from '../pages/ProductCatalogPage';

test.describe('Product Catalog', () => {
  let catalogPage: ProductCatalogPage;

  test.beforeEach(async ({ page }) => {
    catalogPage = new ProductCatalogPage(page);
    await page.goto('/products');
  });

  test('user can search for products', async () => {
    await catalogPage.searchProducts('laptop');
    await catalogPage.expectSearchResults('laptop');
    expect(await catalogPage.getProductCount()).toBeGreaterThan(0);
  });

  test('user can add product to cart', async () => {
    const products = await catalogPage.getProducts();
    const firstProduct = products[0];

    await catalogPage.addProductToCart(firstProduct.id);
    // Cart icon should show count
  });
});
```

## Common Patterns

### Loading States

```typescript
export class DataTablePage extends BasePage {
  private readonly loadingSpinner = this.page.getByTestId('loading');
  private readonly dataTable = this.page.locator('.data-table');

  async waitForDataLoad() {
    await this.loadingSpinner.waitFor({ state: 'hidden' });
    await expect(this.dataTable).toBeVisible();
  }

  async getRowCount(): Promise<number> {
    await this.waitForDataLoad();
    return this.page.locator('.data-row').count();
  }
}
```

### Form Validation

```typescript
export class ContactFormPage extends BasePage {
  private readonly nameInput = this.page.getByLabel('Name');
  private readonly emailInput = this.page.getByLabel('Email');
  private readonly submitButton = this.page.getByRole('button', { name: 'Send' });
  private readonly errorMessages = this.page.locator('.error-message');

  async fillForm(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async getValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    const count = await this.errorMessages.count();

    for (let i = 0; i < count; i++) {
      errors.push(await this.errorMessages.nth(i).textContent() || '');
    }

    return errors;
  }

  async expectFormValid() {
    await expect(this.errorMessages).toHaveCount(0);
    await expect(this.page.getByText('Message sent successfully')).toBeVisible();
  }
}
```

### Navigation Guards

```typescript
export class ProtectedPage extends BasePage {
  async ensureAuthenticated() {
    if (this.page.url().includes('/login')) {
      throw new Error('User not authenticated - redirected to login');
    }
  }

  async navigateToSection(section: string) {
    await this.ensureAuthenticated();
    await this.page.getByRole('link', { name: section }).click();
  }
}
```