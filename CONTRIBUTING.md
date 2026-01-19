# Contributing to EpiPredict Kenya AI

Thank you for your interest in contributing to EpiPredict Kenya AI! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

Please be respectful and constructive in all interactions. We're building software to help Kenya's healthcare system - let's work together positively.

---

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/epi-predict-kenya-ai.git
   cd epi-predict-kenya-ai
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview  # Preview the production build
```

### Linting

```bash
npm run lint
```

---

## Code Style

### TypeScript

- Use TypeScript for all new files
- Define types for component props
- Avoid `any` type - use proper typing

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use the shadcn/ui component library when possible

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DashboardHeader.tsx` |
| Hooks | camelCase with `use` prefix | `use-mobile.tsx` |
| Utilities | camelCase | `utils.ts` |
| Pages | PascalCase | `Dashboard.tsx` |

### Styling

- Use Tailwind CSS utility classes
- Define custom tokens in `src/index.css`
- Follow the existing design system (Kenya-themed colors)

---

## Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```
feat(dashboard): add county filter dropdown
fix(signup): correct validation for phone numbers
docs(readme): update installation instructions
```

---

## Pull Request Process

1. **Ensure your code passes lint checks**:
   ```bash
   npm run lint
   ```

2. **Update documentation** if needed

3. **Write a clear PR description**:
   - What does this PR do?
   - How was it tested?
   - Any breaking changes?

4. **Request review** from maintainers

5. **Address feedback** promptly

---

## Need Help?

If you have questions, feel free to open an issue with the `question` label.

---

Thank you for contributing! 🇰🇪
