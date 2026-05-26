# Kanban + Time Tracker SaaS

A portfolio-grade task management SaaS focused on Kanban workflows, time tracking, realtime collaboration, and analytics. The project is intentionally built as a realistic production-style application rather than a UI-only demo.

## Product Scope

The goal is to build a collaborative workspace where users can manage boards, organize tasks across columns, track time on tasks, and analyze team productivity.

Current milestone:

- Monorepo foundation
- Supabase authentication
- Protected application routes
- Initial database schema for profiles, boards, and board membership
- Base quality tooling: ESLint, Prettier, Stylelint, Husky, lint-staged, Commitlint

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

Run the development server:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Supabase Setup

Apply the initial SQL migration in the Supabase SQL Editor:

```txt
apps/web/lib/supabase/migrations/202605190001_init_auth_boards.sql
```

The migration creates:

- `profiles`
- `boards`
- `board_members`
- profile creation trigger for new auth users
- board owner membership trigger
- Row Level Security policies

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
```

## Quality Gates

Before pushing a feature, run:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm stylelint
pnpm --filter web build
```

Git hooks run `lint-staged` before commits and Commitlint for commit messages.

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
- Storybook for shared UI
- GitHub Actions pipeline
- Vercel deployment

## Architecture Notes

- Supabase is used as the backend platform for Auth, PostgreSQL, RLS, and Realtime.
- Route protection is handled through the Next.js proxy and Supabase server-side session refresh.
- RLS is the primary authorization boundary for user-owned and member-accessible data.
- UI text is written in English to keep the product consistent for portfolio and deployment use.
