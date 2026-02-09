# TypeScript Best Practices

This guide covers TypeScript patterns used in pw-foundation for type safety and maintainability.

## Strict Mode

### Why Required

TypeScript's strict mode catches common bugs at compile time:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true  // ✅ Required
  }
}
```

### What It Catches

- Implicit `any` types
- Uninitialized variables
- Unsafe property access
- Missing return types on functions

### Common Issues Fixed

```typescript
// ❌ Without strict mode - runtime error
function getUser(id: string) {
  return users[id]; // id could be undefined
}

// ✅ With strict mode - compile error
function getUser(id: string | undefined): User | undefined {
  if (!id) return undefined;
  return users[id];
}
```

## Generics

### Effective Generic Usage

```typescript
// ✅ Generic page object methods
class BasePage {
  async getText<T = string>(selector: string): Promise<T> {
    const text = await this.page.locator(selector).textContent();
    return text as T;
  }
}

// ✅ Generic API responses
class BaseAPI {
  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    const response = await this.request.get(endpoint);
    return {
      status: response.status(),
      body: await response.json() as T,
      ok: response.ok()
    };
  }
}

// ✅ Consumer usage gets full type safety
const user = await api.get<User>('/user/123');
// user is typed as User, not any
```

### Generic Constraints

```typescript
// ✅ Constrain generics for better type safety
interface HasId {
  id: string | number;
}

function findById<T extends HasId>(items: T[], id: string | number): T | undefined {
  return items.find(item => item.id === id);
}

// Usage
const users = [{ id: 1, name: 'John' }];
const user = findById(users, 1); // Type: { id: number, name: string } | undefined
```

## No `any` - Use `unknown` + Type Guards

### ❌ Avoid `any`

```typescript
// Bad - loses all type safety
function processData(data: any) {
  return data.name; // No IntelliSense, runtime errors possible
}
```

### ✅ Use `unknown` with Type Guards

```typescript
interface User {
  id: number;
  name: string;
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as User).id === 'number' &&
    typeof (obj as User).name === 'string'
  );
}

function processUser(data: unknown) {
  if (isUser(data)) {
    // data is now typed as User
    return data.name; // Full IntelliSense
  }
  throw new Error('Invalid user data');
}
```

## Interface vs Type

### When to Use Interfaces

```typescript
// ✅ Use interfaces for object shapes that will be extended
interface BasePage {
  page: Page;
  click(selector: string): Promise<void>;
}

// Extending interfaces
interface LoginPage extends BasePage {
  login(email: string, password: string): Promise<void>;
}
```

### When to Use Types

```typescript
// ✅ Use types for unions, primitives, and complex types
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type APIResponse<T> = {
  data: T;
  status: number;
  error?: string;
};

// Complex computed types
type OptionalKeys<T> = {
  [K in keyof T]?: T[K];
};
```

## Discriminated Unions

### For Test Data Variants

```typescript
interface BaseTestData {
  type: string;
}

interface UserTestData extends BaseTestData {
  type: 'user';
  email: string;
  role: 'admin' | 'user';
}

interface ProductTestData extends BaseTestData {
  type: 'product';
  name: string;
  price: number;
}

type TestData = UserTestData | ProductTestData;

// ✅ Type-safe data factories
function createTestData(type: 'user'): UserTestData;
function createTestData(type: 'product'): ProductTestData;
function createTestData(type: string): TestData {
  switch (type) {
    case 'user':
      return { type: 'user', email: 'test@example.com', role: 'user' };
    case 'product':
      return { type: 'product', name: 'Test Product', price: 99.99 };
    default:
      throw new Error(`Unknown test data type: ${type}`);
  }
}

// Usage
const userData = createTestData('user'); // Typed as UserTestData
const productData = createTestData('product'); // Typed as ProductTestData
```

## Barrel Exports

### Pattern Used in Framework

```typescript
// src/utils/index.ts
export { DataFactory } from './DataFactory';
export { Logger } from './Logger';
export { WaitHelpers } from './WaitHelpers';

// src/core/index.ts
export { BasePage } from './BasePage';
export { BaseAPI } from './BaseAPI';

// src/index.ts
export * from './core';
export * from './utils';
export * from './fixtures';
```

### Benefits

- Clean imports: `import { BasePage, BaseAPI } from '@your-org/playwright-forge'`
- Tree-shaking friendly
- Easier refactoring

## Path Aliases

### Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/core/*": ["src/core/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

### Usage

```typescript
// ✅ Clear imports
import { BasePage } from '@/core/BasePage';
import { Logger } from '@/utils/Logger';

// ❌ Relative imports get messy
import { BasePage } from '../../../core/BasePage';
```

### Adding New Aliases

1. Update `tsconfig.json` paths
2. Update your IDE's TypeScript settings if needed
3. Use in imports

## Async/Await Error Handling

### Proper Error Patterns

```typescript
// ✅ Explicit error handling
test('handles login failure', async ({ page }) => {
  try {
    await loginUser(page, 'invalid@example.com', 'wrongpassword');
    expect.fail('Should have thrown an error');
  } catch (error) {
    expect(error.message).toContain('Invalid credentials');
  }
});

// ✅ Async assertions
await expect(page.getByText('Error')).toBeVisible();

// ✅ Custom error types
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiCall(): Promise<void> {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new APIError(response.status, 'API call failed');
  }
}

// Type-safe error handling
try {
  await apiCall();
} catch (error) {
  if (error instanceof APIError) {
    // Handle API errors specifically
    console.log(`API Error ${error.status}: ${error.message}`);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Utility Types

### Built-in TypeScript Utilities

```typescript
// Partial - makes all properties optional
type PartialConfig = Partial<PlaywrightConfig>;

// Required - makes all properties required
type RequiredConfig = Required<PartialConfig>;

// Pick - select specific properties
type PageConfig = Pick<PlaywrightConfig, 'baseURL' | 'viewport'>;

// Omit - exclude specific properties
type TestConfig = Omit<PlaywrightConfig, 'projects'>;

// Record - object with known keys
type EnvironmentConfig = Record<string, { baseURL: string }>;

// Extract - get union member types
type ButtonProps = Extract<ComponentProps, { type: 'button' }>;
```

### Custom Utility Types

```typescript
// Nullable - allows null or undefined
type Nullable<T> = T | null | undefined;

// DeepPartial - recursively makes all properties optional
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Function parameter types
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

## Type Assertions vs Type Guards

### When to Use Type Assertions

```typescript
// ✅ Safe when you know the type
const element = document.getElementById('my-element') as HTMLInputElement;
element.value = 'hello'; // TypeScript knows this is an input

// ✅ After validation
if (element.tagName === 'INPUT') {
  (element as HTMLInputElement).value = 'hello';
}
```

### Prefer Type Guards

```typescript
// ✅ Better - runtime type checking
function isInputElement(element: Element): element is HTMLInputElement {
  return element.tagName === 'INPUT';
}

if (isInputElement(element)) {
  element.value = 'hello'; // TypeScript knows this is safe
}
```

## Declaration Files

### Writing .d.ts Files

```typescript
// types/custom.d.ts
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeVisibleInViewport(): R;
    }
  }
}

export {};
```

### Ambient Declarations

```typescript
// For libraries without types
declare module 'some-library' {
  export function doSomething(): void;
}
```