### Rationale

We want to serve different versions of the API under different paths e.g. `/v2`, `/v3` but not necessarily reflect that convention in the code.
To achieve that an NGINX proxy has been created and set up as an entrypoint to the entire API. It provides path-level routing so `/v2` can be routed differently from `/`.

## Current Status

This fork does not ship Docker packaging for the proxy.

The files in this directory are the NGINX configuration fragments only:

- `default.conf`
- `shared-location.conf`

If you deploy the proxy outside Docker, provide these environment variables to NGINX:

- `PORT`
- `BACKEND_HOSTNAME`
- `PROTOCOL`
- `ALLOW_LIST`

### Setup

> **Note:** This directory originates from the upstream [Bloom Housing](https://github.com/bloom-housing/bloom) project. The original Docker and Heroku container deployment instructions were removed from this fork.

Any deployment-specific setup should document how it renders these NGINX templates and supplies the required environment variables.
