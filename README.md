# Affordable Housing Portal

Affordable Housing Portal is [Civic Tech Waterloo Region](https://github.com/CivicTechWR)'s affordable housing platform. The goal is to be a single entry point for affordable housing seekers and to streamline application management for housing providers.

## About This Fork

This project is derived from [Bloom Housing](https://github.com/bloom-housing/bloom) by [Exygy](https://www.exygy.com/), licensed under Apache-2.0. See [LICENSE.txt](./LICENSE.txt) for full license details.

## Overview

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![cypress](https://img.shields.io/badge/-cypress-%23E5E5E5?style=for-the-badge&logo=cypress&logoColor=058a5e) ![Testing-Library](https://img.shields.io/badge/-TestingLibrary-%23E33332?style=for-the-badge&logo=testing-library&logoColor=white)

The platform uses a client/server architecture with [Next.js](https://nextjs.org) for the frontend applications and [NestJS](https://nestjs.com), [Prisma](https://www.prisma.io/), and [Postgres](https://www.postgresql.org/) on the backend.

## Repository Structure

This monorepo contains multiple user-facing applications and backend services. The main packages are `api`, `sites`, and `shared-helpers`. The UI also leverages the packages `@bloom-housing/ui-seeds` and `@bloom-housing/ui-components`.

- **`sites/public`** — The applicant-facing site available to the general public. It provides the ability to browse and apply for available listings either using the Common Application or an external link to a third-party online or paper application.
  - See [sites/public/README](./sites/public/README.md) for more details.

- **`sites/partners`** — The site designed for housing developers, property managers, and jurisdiction employees. For application management, it offers the ability to view, edit, and export applications. For listing management, it offers the ability to create, edit, and publish listings. A login is required.
  - See [sites/partners/README](./sites/partners/README.md) for more details.

- **`api`** — The backend service (e.g. listings, applications, users). Information is stored in a Postgres database and served over HTTPS to the frontend. Services expose a REST API.
  - See [api/README](./api/README.md) for more details.

- **`shared-helpers`** — Types, functions, and components shared between the public and partners sites.
  - See [shared-helpers/README](./shared-helpers/README.md) for more details.

- **`@bloom-housing/ui-seeds`** — Component library based on the upstream design system, comprised of React components and design system tokens.

- **`@bloom-housing/ui-components`** — Legacy component library being gradually replaced by `ui-seeds`.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (see `.node-version` for local version; CI uses Node 22)
- [Yarn](https://yarnpkg.com/) — install via Homebrew: `brew install yarn`
- [PostgreSQL](https://www.postgresql.org/) (or use Docker; see [docker.md](./docker.md))

### Install Dependencies

```bash
# Root workspaces (sites + shared-helpers)
yarn install

# API (not a workspace package — install separately)
cd api && yarn install
```

### Configure Environment Variables

Copy `.env.template` to `.env` in each of these directories:

- `sites/public`
- `sites/partners`
- `api`

Some keys are secret and available internally — ask the team for access. The template files include default values and descriptions.

### Run Locally

```bash
# Run everything (public, partners, and API)
yarn dev:all
```

This starts three processes:

| Service  | Port |
|----------|------|
| Public   | 3000 |
| Partners | 3001 |
| API      | 3100 |

You can also run each process individually from separate terminals with `yarn dev` in each directory.

#### Default Users

A number of default users are seeded for local development. The most basic is:

- **Email:** `admin@example.com`
- **Password:** `abcdef`

This account works on both the public and partners sites. See the [seed file](./api/prisma/seed-staging.ts) for other default users and their permissions.

### Running Locally in Docker

See [docker.md](./docker.md) for Docker-based setup instructions.

### Recommended VSCode Extensions

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) — enable "Format on Save" for automatic formatting
- [Postgres Explorer](https://marketplace.visualstudio.com/items?itemName=ckolkman.vscode-postgres) — inspect your local database
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) — flag spelling errors
- [CSS Variable Autocomplete](https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables&ssr=false#overview) — autocomplete for design system tokens
- [CSS Module Autocomplete](https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules) — autocomplete for CSS module files
- [axe Accessibility Linter](https://marketplace.visualstudio.com/items?itemName=deque-systems.vscode-axe-linter) — check for common accessibility issues

## Contributing

Contributions are welcomed! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to participate. By contributing, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

### Issue Tracking

Development tasks are managed through [GitHub Issues](https://github.com/CivicTechWR/affordable-housing-portal/issues). Please feel free to submit issues even if you don't plan on implementing them yourself. Before creating an issue, check first to see if one already exists. When creating an issue, fill out all provided fields and add as much information as possible, including screenshots where helpful.

### Committing

We use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). You can either:

- Globally install commitizen (`npm install -g commitizen`) and commit with `git cz` for a guided experience, or
- Run `git commit` with your own message — the linter will fail if it doesn't follow the conventional standard.

#### Pre-commit Hook

To prevent committing secrets, enable the pre-commit hook:

1. Install gitleaks: `brew install gitleaks` (see [gitleaks docs](https://github.com/gitleaks/gitleaks) for other options)
2. From the repo root: `git config core.hooksPath .githooks/`

### Pull Requests

Pull requests are opened to the `main` branch. When opening a PR, fill out the [pull request template](./docs/pull_request_template.md), including:

- Linking the related issue
- A description of your changes
- Instructions for reviewers on how to test
- The testing checklist

Label your PR `needs review(s)` when ready, or `wip` if it's still in progress.

## CI/CD

### GitHub Actions

On pull requests to `main`, the following workflows run (some have path filters):

1. Backend Unit Tests
2. Backend Integration
3. Public Unit
4. Partners Unit
5. Shared Helpers Unit
6. Missing Translations
7. Public Cypress
8. Partners Cypress
9. Partners Cypress (LA)
10. Lint
11. CodeQL
12. Docker Compose CI
13. gitleaks

`Docker Image Build` runs on pushes to `main` and can also be triggered manually.

Configuration for all workflows can be found in the [`.github/workflows`](./.github/workflows) directory.

### GitLeaks

[Gitleaks](https://gitleaks.io/) is enabled for this repo. It scans for potentially leaked secrets on pull requests to `main` and pushes to `main`.

If this job fails on your pull request, notify the team so the flagged secret can be triaged and rotated if needed.

### Dependabot

Dependabot is enabled to raise security and version upgrade PRs. Configuration is in [`.github/dependabot.yml`](./.github/dependabot.yml).

- Scans occur weekly
- `major` upgrades get their own PRs; `minor` and `patch` are grouped
- Only scans the default branch
- PRs are labeled `dependencies`

For more information, see the [Dependabot documentation](https://docs.github.com/en/code-security/dependabot).

## License

This project is licensed under Apache-2.0. See [LICENSE.txt](./LICENSE.txt) for details.

Original work copyright 2021 [Exygy, Inc.](https://www.exygy.com/) Modifications copyright [Civic Tech Waterloo Region](https://github.com/CivicTechWR).
