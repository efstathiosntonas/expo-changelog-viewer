# Contributing to Expo Changelog Viewer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn 4.x (specified in `package.json`)
- Git

### Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/expo-changelog-viewer.git
   cd expo-changelog-viewer
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

## Development Workflow

### Code Quality Tools

This project uses several tools to maintain code quality:

- **ESLint 9** - Linting with flat config
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Lefthook** - Git hooks

### Available Scripts

```bash
# Development
yarn dev              # Start dev server
yarn build            # Build for production
yarn preview          # Preview production build

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Fix ESLint issues
yarn format           # Format with Prettier
yarn format:check     # Check formatting
yarn type-check       # Run TypeScript type checking
```

### Git Hooks

Lefthook runs automatically on:

**Pre-commit:**

- Prettier formatting check
- ESLint on staged files
- TypeScript type checking

**Pre-push:**

- Full production build

If hooks fail, fix the issues before committing.

## Making Changes

### Branching Strategy

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Commit with clear, descriptive messages:
   ```bash
   git commit -m "Add feature: describe what you did"
   ```

### Code Style

- Follow existing code patterns
- Use TypeScript for all new code
- Keep functions small and focused
- Add comments for complex logic
- Use meaningful variable names

### Component Guidelines

- Use functional components with hooks
- Prefer composition over prop drilling
- Extract reusable logic into custom hooks
- Keep components under 200 lines when possible

## Testing Your Changes

Before submitting:

1. **Run all checks:**

   ```bash
   yarn lint
   yarn type-check
   yarn build
   ```

2. **Test in browser:**
   - Test all features you modified
   - Check console for errors
   - Test in both light and dark themes
   - Clear localStorage and test fresh state

3. **Test cache behavior:**
   - Clear browser cache and verify fallback works
   - Test with and without localStorage data

## Submitting Changes

### Pull Request Process

1. **Update documentation** if needed (README.md, comments)

2. **Create a pull request:**
   - Clear, descriptive title
   - Explain what changed and why
   - Reference any related issues
   - Include screenshots for UI changes

3. **PR Template:**

   ```markdown
   ## Summary

   Brief description of changes

   ## Changes

   - List of specific changes made

   ## Testing

   - How you tested the changes
   - Edge cases considered

   ## Screenshots (if applicable)
   ```

### PR Guidelines

- Keep PRs focused on a single feature/fix
- Keep changes small when possible
- Ensure all checks pass
- Respond to review feedback promptly

## Project-Specific Notes

### Adding New Expo Modules

Edit `src/utils/moduleList.ts`:

```typescript
{ name: 'expo-new-module', category: 'Appropriate Category' }
```

### Modifying SDK Version Logic

See `src/hooks/useSDKBranches.ts` for:

- Cache version management (`CACHE_VERSION`)
- Cache TTL settings (`CACHE_TTL_HOURS`)
- Branch name processing logic

### Rate Limiting

- GitHub API: 60 requests/hour (unauthenticated)
- SDK branches cached for 24 hours
- Graceful fallback to static list
- See README for details

## Questions?

- Check existing issues on GitHub
- Review the code documentation
- Open a new issue for questions

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on technical merit

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
