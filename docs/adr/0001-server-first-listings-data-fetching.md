# ADR 0001: Server-First Listings Data Fetching

## Status

Accepted

## Context

The listings page needs to support:

- initial page rendering with data
- URL-driven filters and search state
- an HTTP API surface for listings
- client-side interactivity after the page loads

We want a pattern that works well with the Next.js App Router, avoids unnecessary internal HTTP hops, and keeps domain logic reusable across UI and API layers.

## Decision

For the listings page, we will use a server-first data-fetching approach:

- initial listings data is loaded on the server during page rendering
- shared server-side listings logic is the source of truth
- Route Handlers remain available as HTTP interfaces
- client-side query hooks are used only for browser-driven refinements after the initial render

In practice, this means:

- the page may call shared listings logic directly on the server
- the `/api/listings` Route Handler should stay thin and reuse the same shared logic
- client hooks should call the API only when the browser needs to refetch interactively

## Consequences

### Benefits

- improves the initial user experience by rendering useful content on first load
- reduces unnecessary page-to-API internal round trips for server-rendered content
- keeps business and filtering logic reusable across page and API layers
- fits the App Router model of server-first rendering with client-side interactivity layered on where needed

### Tradeoffs

- the team must be deliberate about what belongs in server modules versus client hooks
- shared server logic becomes an important architectural boundary that should stay clean and well-typed
- not every feature should automatically follow the exact same pattern if its UX needs are different

## Notes

This decision is currently scoped to the listings page and should be treated as the preferred pattern for similar pages unless a feature has a clear reason to be more client-driven or requires a stronger HTTP boundary.
