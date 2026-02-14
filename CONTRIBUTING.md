# Contributing to Affordable Housing Portal

Thank you for your interest in contributing! This project is maintained by [Civic Tech Waterloo Region](https://github.com/CivicTechWR) and we welcome contributions from the community. To help us meet the project's goals around quality and maintainability, we ask that all contributors read, understand, and agree to these guidelines.

## Getting Started

1. Fork and clone the repository.
2. Follow the [Quick Start](./README.md#quick-start) instructions in the README to set up your environment.
3. Create a feature branch from `main` for your work.

## Reporting an Issue

We use [GitHub Issues](https://github.com/CivicTechWR/affordable-housing-portal/issues) to track bugs and feature ideas. Before creating a new issue, please check if one already exists. When filing an issue, provide as much detail as possible, including screenshots where helpful.

## Pull Requests

Pull requests (PRs) are the most effective way to contribute, ranging from small one-line fixes to major feature additions. Here are some suggestions for having your pull requests quickly accepted:

- Open PRs to the `main` branch Clearly document the issue your PR addresses in the initial comment. If your PR addresses an issue in the tracker, make sure to link it.

- Fill out the [pull request template](./docs/pull_request_template.md), including a description, test instructions, and the testing checklist.

- Make sure all files touched by your PR still pass lint and style rules (see [Code Style](#code-style) below). If you're adding meaningful functionality, please add matching tests.

- Label your PR `needs review(s)` when it's ready for review, or `wip` if it's still in progress.

## Commits

We use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). You can either:

- Install [commitizen](https://github.com/commitizen/cz-cli) globally (`npm install -g commitizen`) and commit with `git cz` for a guided experience, or
- Run `git commit` with your own message — the commit-msg hook will reject non-conforming messages.

### Pre-commit Hook

A pre-commit hook using [gitleaks](https://github.com/gitleaks/gitleaks) checks for accidentally committed secrets. To enable it:

1. Install gitleaks: `brew install gitleaks` (see the [gitleaks docs](https://github.com/gitleaks/gitleaks) for other install methods)
2. From the repo root: `git config core.hooksPath .githooks/`

## Continuous Integration

This project uses **GitHub Actions** to automatically run tests, linting, and security checks on all pull requests to `main`. No contributions that introduce failures in existing checks will be accepted. Please verify that all checks pass (you'll see the green checkmark next to your commits) before marking your PR ready for review.

The full list of CI workflows is documented in the [README](./README.md#github-actions).

## Code Style

We use ESLint for linting and Prettier for automatic code formatting. **All** pull requests must pass linting to be accepted.

- **Frontend + shared-helpers:** Prettier config is in root `package.json` — `printWidth 100`, `semi false`, double quotes.
- **API:** Prettier config is in `api/.prettierrc` — `singleQuote true`, `trailingComma all`, semicolons on.

Run linting with:

```bash
# Lint everything
yarn lint

# Format files
yarn prettier
```

If you're using VSCode, we recommend the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) with "Format on Save" enabled.

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).
