# ADR 0003: Supabase Auth, RLS, and Realtime

## Status

Accepted

## Context

The product needs authentication, protected boards, collaboration, realtime updates, and persisted time tracking. The backend should be realistic enough for a SaaS portfolio project without requiring a separate custom API service for the first milestone.

The application also needs a defensible authorization model. UI-only checks are not enough because browser code can be bypassed.

## Decision

Use Supabase for:

- email/password authentication;
- PostgreSQL persistence;
- Row Level Security policies;
- database triggers and RPC functions where role checks should live close to the data;
- Realtime publications for dashboard, board, card, column, member, and time entry synchronization.

RLS is the primary authorization boundary. Application checks improve UX, but the database decides whether a user can read or mutate protected rows.

Use Next.js server-side Supabase clients for authenticated route reads and server actions. Use browser Supabase clients for realtime subscriptions and client-side cache synchronization.

## Consequences

- The application avoids a custom backend service while still demonstrating production backend concerns.
- Authorization remains enforceable even if client code is bypassed.
- Realtime events can update TanStack Query caches without requiring a full page reload.
- RLS policies, triggers, and RPC functions must be reviewed whenever tables or collaboration rules change.
- Some mutation paths avoid `insert().select()` or `delete().select()` patterns when RLS and trigger timing make `RETURNING` unreliable; those flows use explicit insert/delete plus separate reads.

## Interview Defense

Supabase is not treated as just a hosted database. It is the backend platform for Auth, authorization, realtime collaboration, and database-side role enforcement.

The important architectural point is that authorization is not duplicated in React. React can hide buttons and show errors, but RLS and RPC functions enforce access at the database boundary.
