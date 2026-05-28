# ADR 0001: Next.js App Router and State Strategy

## Status

Accepted

## Context

Kanban + Time Tracker is a portfolio-grade SaaS project. The product could be implemented as a pure SPA because most user flows live behind authentication and do not require public SEO pages.

However, the project is intentionally designed to demonstrate production React architecture, authenticated server boundaries, Supabase auth cookies, deployment constraints, and App Router trade-offs.

## Decision

Use Next.js App Router for the web application.

Use Supabase as the backend platform for authentication, PostgreSQL, Row Level Security, and realtime database events.

Use TanStack Query for server state:

- initial data hydration from server-rendered routes;
- client cache ownership;
- optimistic mutations;
- invalidation after writes;
- realtime-driven cache updates.

Use Zustand only for client-owned UI state:

- board view preferences;
- selected filters;
- open panels or dialogs when state must survive component boundaries;
- local settings that should not be persisted as backend data.

Do not use Zustand for Supabase records, authenticated user data, or remote resources that already belong to TanStack Query.

## Consequences

- The project shows full-stack React boundaries instead of being a UI-only SPA.
- Auth and protected routes can be handled through cookies and server-aware routing.
- Data ownership stays clear: Supabase persists data, TanStack Query caches remote data, Zustand stores local UI state.
- The architecture has more moving parts than a Vite SPA, so each layer must have a clear reason to exist.

## Interview Defense

Kanban could have been built as an SPA, but Next.js was chosen to demonstrate full-stack React architecture, protected server boundaries, auth cookies, deployment model, and App Router trade-offs.

The state strategy is intentionally split: TanStack Query handles server state because it is asynchronous, shared, cacheable, and invalidated by mutations or realtime events. Zustand is used only where local product state needs a small global store without turning backend data into duplicated client state.
