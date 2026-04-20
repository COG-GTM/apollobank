---
trigger: model_decision
description: When writing or modifying tests in this codebase
---

# Test creation guidelines

## Testing Framework
- Use **Jest** as the primary testing framework for all tests
- For React components, use **@testing-library/react** alongside Jest

## Test File Conventions
- Place test files adjacent to the code they test with `.test.ts` or `.test.tsx` extension
- For server-side code: `*.test.ts`
- For client-side React components: `*.test.tsx`

## Test Structure
- Follow the Arrange-Act-Assert (AAA) pattern
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks