# Testing Guide

Victor uses a comprehensive testing strategy that includes both unit/integration tests and end-to-end (E2E) tests.

## Testing Stack

- **Unit & Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: Vitest Coverage (v8)

## Quick Start

```bash
# Run all unit tests in watch mode
npm run test

# Run unit tests once (CI mode)
npm run test:run

# Run unit tests with UI
npm run test:ui

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run all tests (unit + E2E)
npm run test:all
```

## Unit & Integration Testing with Vitest

### What to Test with Vitest

- **Client Components**: Interactive UI components that use state, effects, or event handlers
- **Synchronous Server Components**: Server components without async data fetching
- **Utility Functions**: Helper functions, formatters, validators
- **Business Logic**: Pure functions and domain logic

### What NOT to Test with Vitest

- **Async Server Components**: Since async Server Components are new to React, Vitest doesn't support them yet. Use E2E tests instead.
- **Complex Integration Flows**: Use Playwright for full user journeys

### Writing Unit Tests

Unit tests live in the `__tests__` directory, mirroring the `src` structure:

```
__tests__/
├── components/
│   └── ui/
│       └── button.test.tsx
└── lib/
    └── utils.test.ts
```

Example test:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    let clicked = false
    const handleClick = () => { clicked = true }

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(clicked).toBe(true)
  })
})
```

### Best Practices for Unit Tests

1. **Test user behavior, not implementation**
   - Use `screen.getByRole()` instead of `getByTestId()`
   - Test what users see and do

2. **Keep tests simple and focused**
   - One assertion per test (when possible)
   - Clear test names that describe behavior

3. **Use Testing Library queries in order of priority**:
   1. `getByRole()` - best for accessibility
   2. `getByLabelText()` - for form fields
   3. `getByPlaceholderText()` - for inputs
   4. `getByText()` - for non-interactive elements
   5. `getByTestId()` - last resort

4. **Clean up properly**
   - The setup file handles cleanup automatically with `afterEach(cleanup)`

## E2E Testing with Playwright

### What to Test with Playwright

- **Critical User Journeys**: Signup, login, booking flow
- **Async Server Components**: Components that fetch data
- **Full Integration**: Test the entire stack (frontend + backend + database)
- **Cross-browser Compatibility**: Test on Chromium, Firefox, Webkit

### Writing E2E Tests

E2E tests live in the `e2e` directory:

```
e2e/
├── home.spec.ts
└── auth.spec.ts
```

Example test:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/')

    const heading = page.getByRole('heading', {
      name: /professional home services/i
    })
    await expect(heading).toBeVisible()
  })
})
```

### Best Practices for E2E Tests

1. **Test real user flows**
   - Start from the homepage
   - Navigate like a real user would
   - Complete full workflows

2. **Use meaningful selectors**
   - Prefer `getByRole()`, `getByLabel()`, `getByText()`
   - Avoid CSS selectors when possible

3. **Keep tests independent**
   - Each test should work in isolation
   - Don't rely on test execution order

4. **Use Page Object Model for complex flows**
   - Extract common actions into reusable functions
   - Keep test code DRY

5. **Run against production build**
   - Playwright config uses `npm run build && npm run start`
   - Tests real production behavior

## CI/CD Integration

### Running Tests in CI

The test configuration automatically adjusts for CI environments:

```bash
# In CI, this will run with appropriate settings
npm run test:run      # Vitest with no watch mode
npm run test:e2e      # Playwright in headless, with retries
```

### Playwright CI Setup

```bash
# Install Playwright browsers in CI
npx playwright install --with-deps chromium
```

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run unit tests
  run: npm run test:run

- name: Run E2E tests
  run: npm run test:e2e
```

## Coverage Reports

Generate coverage reports to see test coverage:

```bash
npm run test:coverage
```

Coverage reports are generated in:
- `coverage/` - HTML report (open `coverage/index.html`)
- Console output with text summary

### Coverage Goals

- **Critical Business Logic**: 90%+ coverage
- **UI Components**: 70%+ coverage
- **Utility Functions**: 90%+ coverage

Don't chase 100% coverage. Focus on testing critical paths and business logic.

## Testing Philosophy

### The Testing Pyramid

```
       /\
      /  \     E2E Tests (Few)
     /____\    - Critical user journeys
    /      \   - Full stack integration
   /        \
  /__________\ Unit Tests (Many)
               - Components
               - Utilities
               - Business logic
```

1. **Many unit tests**: Fast, focused, cheap to maintain
2. **Some integration tests**: Test how pieces work together
3. **Few E2E tests**: Test critical paths only

### When to Write Tests

- **Always**: Business logic, booking flow, payment handling
- **Usually**: Reusable components, utility functions
- **Sometimes**: Simple UI components (buttons, inputs)
- **Never**: Simple CRUD operations without logic

### TDD (When It Makes Sense)

For complex business logic or critical flows:
1. Write the test first
2. Watch it fail
3. Write minimal code to pass
4. Refactor

For simple UI work:
- Build first, test after (or skip tests for trivial components)

## Debugging Tests

### Vitest

```bash
# Run tests with UI for debugging
npm run test:ui

# Run specific test file
npx vitest run __tests__/components/ui/button.test.tsx

# Run tests matching pattern
npx vitest run -t "Button renders"
```

### Playwright

```bash
# Run with UI mode (best for debugging)
npm run test:e2e:ui

# Run in headed mode (see the browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/home.spec.ts

# Debug specific test
npx playwright test --debug e2e/home.spec.ts
```

### Common Issues

**Vitest: "Cannot find module '@/...'"**
- Check `vite-tsconfig-paths` is installed
- Verify `tsconfig.json` has correct path mappings

**Playwright: "Target closed" or "Navigation timeout"**
- Increase timeout in test
- Check if dev server is running
- Verify `baseURL` in `playwright.config.ts`

**Tests are flaky**
- Use `waitFor()` for async operations
- Avoid `sleep()` - use proper waiting strategies
- Check for race conditions

## Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
