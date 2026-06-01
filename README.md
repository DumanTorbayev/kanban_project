# Kanban + Time Tracker SaaS

A portfolio-grade task management SaaS focused on Kanban workflows, time tracking, realtime collaboration, and analytics. The project is intentionally built as a realistic production-style application rather than a UI-only demo.

## Product Scope

The goal is to build a collaborative workspace where users can manage boards, organize tasks across columns, track time on tasks, and analyze team productivity.

Current milestone:

- Monorepo foundation
- Supabase authentication with SSR cookies
- Protected application routes and RLS-backed authorization
- Boards, columns, and cards CRUD
- Drag-and-drop Kanban card movement with optimistic cache updates
- Supabase Realtime for board, card, member, and dashboard synchronization
- Time tracking with persisted entries, summaries, analytics, CSV export, and PDF export
- Virtualized card lists for large columns
- Quality tooling: ESLint, Prettier, Stylelint, Vitest, Playwright, Husky, lint-staged, Commitlint

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Backend:** Supabase Auth, PostgreSQL, Row Level Security, Realtime
- **Data fetching:** TanStack Query
- **Client state:** Zustand
- **UI:** Tailwind CSS, shadcn/ui, Radix primitives
- **Drag and drop:** dnd-kit
- **Testing:** Vitest, Playwright
- **Charts:** Recharts or Chart.js
- **Monorepo:** Turborepo, pnpm workspaces
- **Deployment target:** Vercel

## Repository Structure

```txt
apps/
  web/                    # Next.js application

packages/
  ui/                     # Shared shadcn/ui components and global styles
  eslint-config/          # Shared ESLint flat configs
  typescript-config/      # Shared TypeScript configs
```

The application will evolve toward Feature-Sliced Design boundaries inside `apps/web` as product features become stable:

```txt
shared/                   # Infrastructure, low-level UI, config, helpers
entities/                 # Board, column, card, profile models
features/                 # User actions such as create board or move card
widgets/                  # Composed UI blocks such as Kanban board or sidebar
views/                    # Route-level page compositions
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create the local environment file for the web app:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Optional variables for authenticated Playwright tests:

```env
PLAYWRIGHT_TEST_EMAIL=e2e-user@example.com
PLAYWRIGHT_TEST_PASSWORD=change-me
PLAYWRIGHT_SECONDARY_EMAIL=e2e-secondary@example.com
PLAYWRIGHT_SECONDARY_PASSWORD=change-me
```

Create these accounts in Supabase Auth before running authenticated and collaboration E2E scenarios. Without these variables, authenticated tests are skipped and anonymous routing tests still run.

Run the development server:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Supabase Setup

Apply SQL migrations in timestamp order from:

```txt
apps/web/lib/supabase/migrations
```

The migrations create and configure:

- `profiles`
- `boards`
- `board_members`
- `board_columns`
- `cards`
- `time_entries`
- profile creation trigger for new auth users
- board owner membership trigger
- Row Level Security policies
- Supabase Realtime publications
- board member management RPC functions
- atomic time tracking RPC functions

For local auth redirects, configure Supabase Auth URL settings:

```txt
Site URL: http://localhost:3000
Redirect URLs:
http://localhost:3000/dashboard
```

If Next.js starts on another port, add that port as an additional redirect URL.

## Available Scripts

```bash
pnpm dev           # Start all development tasks through Turbo
pnpm build         # Build all packages/apps
pnpm lint          # Run ESLint
pnpm lint:fix      # Run ESLint with autofix
pnpm typecheck     # Run TypeScript checks
pnpm format        # Format the repository with Prettier
pnpm format:check  # Check Prettier formatting
pnpm stylelint     # Lint CSS files
pnpm test:e2e      # Run Playwright end-to-end tests
pnpm test:coverage # Run Vitest with coverage thresholds
```

## Quality Gates

Before pushing a feature, run:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm stylelint
pnpm test:coverage
pnpm test:e2e
pnpm --filter web build
```

Git hooks run `lint-staged` before commits and Commitlint for commit messages.

## CI and Deployment

GitHub Actions runs the same quality gates on pull requests and pushes to `main`:

```txt
install -> lint -> typecheck -> format:check -> stylelint -> test:coverage -> build -> e2e
```

Authenticated Playwright scenarios require repository secrets:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
PLAYWRIGHT_TEST_EMAIL
PLAYWRIGHT_TEST_PASSWORD
PLAYWRIGHT_SECONDARY_EMAIL
PLAYWRIGHT_SECONDARY_PASSWORD
```

Without Playwright credentials, authenticated E2E scenarios are skipped while anonymous routing smoke tests still run.

Recommended Vercel settings for this monorepo:

```txt
Install command: pnpm install --frozen-lockfile
Build command: pnpm --filter web build
Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Roadmap

### Foundation

- Monorepo setup
- Shared UI package
- Supabase Auth
- Protected routes
- Initial database schema and RLS

### Boards and Kanban

- Dashboard board list
- Board creation flow
- Board detail route
- Columns and cards CRUD
- Drag-and-drop card movement
- Optimistic updates with TanStack Query

### Realtime and Performance

- Supabase Realtime subscriptions
- Virtualized task lists
- Dynamic imports for heavy modules
- Lighthouse performance checks

Performance goals and verification steps are tracked in [`docs/performance.md`](docs/performance.md).

### Time Tracking and Analytics

- Task timer start, pause, stop
- Time entry persistence
- Analytics dashboard
- CSV and PDF exports

### Delivery

- Vitest business logic coverage
- Playwright end-to-end scenarios
- GitHub Actions pipeline
- Vercel deployment

## Architecture Notes

- Supabase is used as the backend platform for Auth, PostgreSQL, RLS, and Realtime.
- Route protection is handled through the Next.js proxy and Supabase server-side session refresh.
- RLS is the primary authorization boundary for user-owned and member-accessible data.
- Kanban could have been built as an SPA, but Next.js was chosen to demonstrate full-stack React architecture, protected server boundaries, auth cookies, deployment model, and App Router trade-offs.
- TanStack Query owns server/cache state, optimistic mutations, invalidation, and realtime-driven cache updates.
- Zustand is reserved for client-only product state that does not belong to the backend, such as board UI preferences, open panels, filters, and local view settings.
- Architecture Decision Records are kept in [`docs/adr`](docs/adr) to document why major technical choices were made.
- UI text is written in English to keep the product consistent for portfolio and deployment use.
