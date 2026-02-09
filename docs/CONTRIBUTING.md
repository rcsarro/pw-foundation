# Contributing to pw-foundation

Thank you for your interest in contributing to pw-foundation! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/rcsarro/pw-foundation.git
   cd pw-foundation
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Run tests to ensure everything works:
   ```bash
   npm test
   ```

## Development Workflow

### Code Style

This project uses ESLint and Prettier for code formatting. The configuration is already set up, so you just need to:

- Run `npm run lint` to check for linting errors
- Run `npm run format` to auto-format your code

### Testing

- Write tests for any new functionality
- Run the full test suite: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run specific test files: `npm test -- tests/path/to/test.spec.ts`

### TypeScript

- All code must be written in TypeScript
- Use strict type checking
- Avoid `any` types when possible
- Use interfaces and types appropriately

## Pull Request Process

1. Ensure your code follows the established patterns
2. Update documentation if needed
3. Add tests for new features
4. Ensure all tests pass
5. Update the README if necessary
6. Create a pull request with a clear description

### PR Guidelines

- Use a descriptive title
- Reference any related issues
- Provide a clear description of changes
- Include screenshots for UI changes (if applicable)
- Keep PRs focused on a single feature or fix

## Project Structure

```
src/
├── core/           # Core classes (BasePage, BaseAPI)
├── fixtures/       # Custom Playwright fixtures
├── config/         # Configuration management
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── reporters/      # Custom reporters

tests/              # Test files
├── core/           # Core class tests
├── fixtures/       # Fixture tests
├── utils/          # Utility tests
└── e2e/           # End-to-end tests

docs/               # Documentation
```

## Adding New Features

### Core Classes

When adding to BasePage or BaseAPI:

1. Follow existing patterns
2. Add comprehensive TypeScript types
3. Include JSDoc comments
4. Add corresponding tests
5. Update documentation

### Fixtures

When adding new fixtures:

1. Use Playwright's fixture extension pattern
2. Provide sensible defaults
3. Include proper cleanup
4. Add fixture tests
5. Document usage

### Configuration

When modifying configuration:

1. Maintain backward compatibility
2. Update type definitions
3. Add validation
4. Update environment handling
5. Document new options

## Testing Guidelines

### Unit Tests

- Test individual functions and methods
- Mock external dependencies
- Cover edge cases and error conditions
- Use descriptive test names

### Integration Tests

- Test component interactions
- Use real dependencies when possible
- Test error scenarios
- Validate data flow

### E2E Tests

- Test complete user workflows
- Use realistic test data
- Test across different browsers
- Include accessibility checks

## Documentation

### Code Documentation

- Use JSDoc comments for public APIs
- Include parameter types and descriptions
- Document return values and thrown errors
- Keep comments up to date

### User Documentation

- Update guides when adding features
- Include code examples
- Provide troubleshooting information
- Keep examples runnable

## Commit Guidelines

Use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

Example:
```
feat: add retry mechanism to BaseAPI
fix: handle null responses in BasePage.locator
docs: update API testing guide
```

## Issue Reporting

When reporting bugs:

1. Use the bug report template
2. Include reproduction steps
3. Provide environment information
4. Include error messages and stack traces
5. Mention Playwright and Node versions

## Code Review Process

### Review Checklist

- [ ] Code follows established patterns
- [ ] TypeScript types are correct
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No linting errors
- [ ] Commit messages follow conventions

### Review Comments

- Be constructive and specific
- Suggest improvements, don't just point out problems
- Reference existing code or patterns
- Explain reasoning for suggestions

## Release Process

### Versioning

This project follows semantic versioning:

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is up to date
- [ ] Changelog is updated
- [ ] Version number is bumped
- [ ] Tag is created
- [ ] Package is published to npm

## Community Guidelines

### Communication

- Be respectful and inclusive
- Use clear, concise language
- Provide context for questions
- Help others when possible

### Getting Help

- Check existing issues and documentation first
- Use discussions for questions
- Provide minimal reproduction cases
- Include relevant code snippets

## Recognition

Contributors will be recognized in:

- The contributors list in README.md
- Release notes
- GitHub's contributor insights

Thank you for contributing to pw-foundation! 🎭