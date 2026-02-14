# Deploying Backend Services to Heroku

> **Note:** This document originates from the upstream [Bloom Housing](https://github.com/bloom-housing/bloom) project. Instructions may need adaptation for this fork's deployment setup.

The application is designed to use a set of independently run services that provide the data and business logic processing needed by the front-end apps. While the architecture accommodates services built and operated in a variety of environments, the reference implementation includes services that can be easily run within the [Heroku PaaS environment](https://www.heroku.com/).

## Resources

- [Heroku Postgres](https://www.heroku.com/postgres)

## Heroku Buildpacks

### Monorepo Buildpack

Since the repository uses a monorepo layout, all Heroku services must use the [monorepo buildpack](https://elements.heroku.com/buildpacks/lstoll/heroku-buildpack-monorepo).

### Node.js Buildpack

The backend runs on Node.js and Heroku must be set up with [Heroku Buildpack for Node.js](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-nodejs).

## Procfile

release: yarn herokusetup

web: yarn start

## Environment Variables

APP_BASE=backend/core

APP_SECRET='YOUR-LONG-SECRET-KEY'

CLOUDINARY_SECRET=

CLOUDINARY_KEY=

DATABASE_URL=

EMAIL_API_KEY='SENDGRID-API-KEY'
