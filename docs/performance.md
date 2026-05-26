# Performance Baseline

This document tracks the current performance strategy for the Kanban workspace and the checks used before moving into the next product milestone.

## Goals

- Keep the board page usable with large task lists.
- Keep layout shifts out of the main Kanban workflow.
- Load heavy interaction dialogs only when the user actually needs them.
- Keep production builds green before running browser-level audits.

## Target Metrics

- Largest Contentful Paint: under 2.5 seconds.
- Cumulative Layout Shift: 0.
- Drag-and-drop interactions remain responsive on boards with 50+ cards.
- Realtime updates do not force full page reloads.

## Implemented Optimizations

- Virtualized card lists with `@tanstack/react-virtual`.
- Dynamic imports for board, column, and card action dialogs.
- Realtime snapshot sync after reconnect, visibility changes, and initial subscription.
- Stable Kanban card position normalization for Supabase `numeric` values.
- Server-rendered protected routes remain dynamic while public shell routes stay static.

## Verification Commands

Run these checks before a performance audit:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
pnpm --filter web build
```

Current baseline result:

```txt
lint: passed
typecheck: passed
tests: 23 passed
format: passed
production build: passed
production server smoke check: passed (root route returned HTTP 200)
```

## Lighthouse Workflow

1. Build the production application.
2. Start the production server.
3. Sign in with a test user.
4. Open a board with at least 50 cards.
5. Run Lighthouse against the board page.
6. Record LCP, CLS, Total Blocking Time, and any failed diagnostics.

```bash
pnpm --filter web build
pnpm --filter web start
```

Protected routes require an authenticated browser session, so the Lighthouse run should be done from a logged-in browser profile rather than a cold anonymous request.

## Next Optimization Candidates

- Add a bundle analyzer if the JavaScript payload becomes hard to reason about.
- Split analytics and export modules before adding charts and PDF generation.
- Measure the time tracker dashboard separately once charts are introduced.
- Add Playwright performance smoke checks after the first E2E scenarios exist.
