# Test Suite

This project uses Vitest as the testing framework along with React Testing Library for component testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `lib/__tests__/` - Tests for utility functions and business logic
- `lib/query/__tests__/` - Tests for database query functions
- `components/__tests__/` - Tests for React components
- `hooks/__tests__/` - Tests for custom React hooks

## Writing Tests

Tests are written using:
- **Vitest** - Fast test runner with great TypeScript support
- **React Testing Library** - For testing React components
- **@testing-library/jest-dom** - Additional matchers for DOM assertions

Example test:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Mocking

Supabase client and Next.js router are automatically mocked in `vitest.setup.ts`.
You can add additional mocks in individual test files as needed.

## Coverage

Coverage reports are generated in the `coverage/` directory when running:

```bash
npm run test:coverage
```

## Best Practices

1. Test behavior, not implementation
2. Use semantic queries (getByRole, getByLabelText, etc.)
3. Avoid testing internal state when possible
4. Mock external dependencies (Supabase, APIs, etc.)
5. Write descriptive test names that explain what is being tested
6. Group related tests using `describe` blocks
7. Use `beforeEach` for common setup code
8. Clean up after tests when necessary