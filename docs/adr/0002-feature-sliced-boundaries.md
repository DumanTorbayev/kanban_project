# ADR 0002: Feature-Sliced Boundaries

## Status

Accepted

## Context

The application has several product areas: authentication, dashboard boards, Kanban columns and cards, board members, time tracking, analytics, exports, realtime synchronization, and route states.

Without clear boundaries, App Router pages would become large JSX files with mixed data fetching, mutations, domain rules, and UI composition. That would make the project harder to explain, test, and extend.

## Decision

Use pragmatic Feature-Sliced Design boundaries inside `apps/web`.

The layers are:

- `app`: route files, layouts, loading states, error states, not-found states, and server route boundaries.
- `shared`: cross-feature primitives and utilities without product ownership.
- `entities`: domain types, read APIs, pure domain helpers, normalization, cache helpers, and small entity UI.
- `features`: user actions and flows such as create board, rename column, delete card, move card, track time, invite member, and export report.
- `widgets`: composed product blocks such as dashboard header, board header, boards list, and Kanban board.

Route files should stay thin. When JSX or logic grows, it should move into a widget, feature, or entity depending on ownership.

## Consequences

- Product behavior is easier to navigate because feature code lives near its action, model hook, and UI.
- Server actions stay close to the feature that owns the mutation.
- Shared code is kept small and must not become a dumping ground for business logic.
- The project avoids FSD ceremony when a feature is small, but still keeps clear ownership for larger flows.

## Interview Defense

The goal is not to create folders for their own sake. The goal is to make ownership obvious: routes compose, widgets assemble, features mutate, entities model domain data, and shared code provides stable primitives.

This is why large components are split only when the split improves readability, testability, or ownership. Hooks are used for non-trivial state and mutation logic so UI files can stay focused on rendering and interaction states.
