# ADR 0004: Testing and Delivery Pipeline

## Status

Accepted

## Context

The project is intended to look and behave like a real portfolio SaaS. That requires more than local manual testing. The core flows include authentication, protected routes, board CRUD, Kanban CRUD, collaboration, realtime updates, time tracking, reports, and exports.

The delivery process should catch regressions before changes reach `main` and production deployment.

## Decision

Use layered quality gates:

- ESLint for TypeScript, React, Next.js, hooks, and repository rules.
- Prettier for formatting.
- Stylelint for CSS.
- TypeScript for static type safety.
- Vitest for pure business logic, date/time helpers, cache updaters, export formatting, and Kanban movement logic.
- Playwright for browser-level auth, board, card, member, and collaboration flows.
- GitHub Actions as the required CI gate for pull requests and pushes to `main`.
- Vercel deployment from `main` after CI succeeds.

Branch protection requires the GitHub Actions quality gate before merging into `main`.

## Consequences

- Business logic can be tested quickly without a browser.
- Browser flows verify real user workflows that unit tests cannot cover.
- Authenticated E2E tests require stable Supabase test users and repository secrets.
- CI is slower than a minimal setup, but the trade-off is acceptable for a portfolio-grade fullstack app.

## Interview Defense

The test strategy follows the risk profile of the app. Pure logic is covered with Vitest because it is fast and deterministic. Authenticated collaboration flows are covered with Playwright because they depend on routing, cookies, dialogs, server actions, Supabase, and realtime behavior.

The delivery pipeline makes the project defensible: code is not considered ready just because it works locally. It must pass linting, formatting, type checks, unit tests, production build, and E2E flows before it can reach `main`.
