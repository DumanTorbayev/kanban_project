# Security Notes

This project treats Supabase Row Level Security as the primary authorization boundary. Application checks improve UX, but database policies decide whether a user can read or mutate protected data.

## Current Controls

- Protected routes are guarded through the Next.js proxy and Supabase SSR session refresh.
- Board, column, card, member, and time entry access is restricted by RLS policies.
- Board member management uses database RPC functions so role checks happen close to the data.
- Supabase service-role keys are not used in the browser or application runtime.
- Production responses include security headers from `apps/web/next.config.mjs`:
  - `Content-Security-Policy`
  - `Referrer-Policy`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Permissions-Policy`

## CSP Trade-off

The current CSP intentionally allows inline scripts/styles because Next.js can emit framework-managed inline runtime and style code. A stricter nonce-based CSP would be a separate hardening step and should be verified against auth, realtime, charts, and exports before production rollout.

## Deployment Checklist

- Keep only publishable Supabase keys in Vercel public environment variables.
- Never add Supabase service-role keys to client-side code or `NEXT_PUBLIC_*` variables.
- Configure Supabase Auth redirect URLs for production and preview domains.
- Keep RLS enabled on every table that stores user or workspace data.
- Run `pnpm audit --audit-level moderate` before release reviews.
