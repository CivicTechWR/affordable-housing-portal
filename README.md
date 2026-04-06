# Affordable Housing Portal

Affordable Housing Portal is [Civic Tech Waterloo Region](https://github.com/CivicTechWR)'s affordable housing platform. It aims to make it easier for housing seekers to find and access listings from affordable housing providers. Many existing platforms fail to centre the needs of marginalized communities — key information is often missing, and listings can be structured in ways that discourage these communities from applying. This project seeks to address those gaps with a more accessible and equitable experience.

## Overview

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

The platform is a [Next.js](https://nextjs.org) application using the App Router, [shadcn/ui](https://ui.shadcn.com) components, and [Tailwind CSS](https://tailwindcss.com) for styling.

## Repository Structure

```
app/                  → Pages and API routes (Next.js App Router)
├── api/
│   ├── listings/     → Listing CRUD endpoints
│   └── admin/        → Admin account management endpoints
├── listings/         → Listing browse/search page
└── page.tsx          → Landing page

components/           → React components
├── ui/               → shadcn/ui primitives (button, card, input, etc.)
├── listing-filter/   → Search and filter controls
├── listings-sidebar/ → Sidebar listing results
├── map-view/         → Map display
├── search-header/    → Search bar
└── ...               → Other shared components

lib/                  → Utilities
```

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 22.6+
- npm

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database

The app now includes a Drizzle + Postgres schema for users, listings, saved listings, saved searches, and admin-configurable listing fields.

1. Copy `.env.example` to `.env.local` or provide `DATABASE_URL` through Infisical.
2. Generate migrations after schema changes with `npm run db:generate`.
3. Apply migrations with `npm run db:migrate`.
4. Inspect the schema with `npm run db:studio`.

## Contributing

Contributions are welcomed! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to participate. By contributing, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

### Issue Tracking

Development tasks are managed through [GitHub Issues](https://github.com/CivicTechWR/affordable-housing-portal/issues). Please feel free to submit issues even if you don't plan on implementing them yourself. Before creating an issue, check first to see if one already exists. When creating an issue, fill out all provided fields and add as much information as possible, including screenshots where helpful.

### Committing

We use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). You can either:

- Globally install commitizen (`npm install -g commitizen`) and commit with `git cz` for a guided experience, or
- Run `git commit` with your own message — the linter will fail if it doesn't follow the conventional standard.

### Pull Requests

Pull requests are opened to the `main` branch. When opening a PR, fill out the pull request template, including:

- Linking the related issue
- A description of your changes
- Instructions for reviewers on how to test
- The testing checklist

Label your PR `needs review(s)` when ready, or `wip` if it's still in progress.
