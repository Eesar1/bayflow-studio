# BayFlow Next.js architecture

## Page composition

App Router pages load data, enforce access, export route-local metadata and render their `src/views/<page>/main.tsx`. Each main composes named sections in order, matching the Dr Jarmima reference. Shared components live in `src/components`, public chrome in `src/layout`, shared constants in `src/constant` and interfaces in `src/types`.

## Authentication and tenancy

Better Auth uses a Drizzle PostgreSQL adapter for users, accounts and sessions. Public account signup always creates a customer; owner registration is an explicit endpoint. Owners provision staff and per-shop memberships. Client-supplied roles cannot elevate privileges. Server queries check the selected shop and active memberships. Customers see their own bookings; technicians see assigned jobs; parts staff see assigned parts jobs; QC sees the shared workshop queue. Owners can inspect role queues within their shops.

JSON business mutations require the configured same origin and a session where appropriate. Better Auth protects its own endpoints and rate-limits authentication. Production requires HTTPS and a private signing secret.

## Workflow and concurrency

`src/constant/workflow.ts` defines statuses, role labels and valid transitions. `src/lib/workflow.ts` enforces role/assignment guards, mandatory estimates, customer consent, stock readiness, QC checks, rework issues, pickup notice and completion. It creates notification and audit records in the same transaction.

Booking and schedule mutations lock the shop row before checking capacity. Workflow changes, estimate edits and procurement lock the booking row; QC claims therefore have one winner. Stock deductions use conditional updates and allocations in the same transaction. Receiving purchase orders locks the booking and order, prevents over-receipt, and records partial or complete receipt.

Money is integer PKR, quantities are whole units, and timestamps are stored with timezone. Booking slots are validated in Asia/Karachi (UTC+5). All persisted writes are parameterized and validated with Zod.

## Database

`src/db/schema.ts` is the typed schema; `drizzle/` contains migrations. `scripts/seed.ts` creates three shops, staff for every role and sample bookings. It does not reset an existing workspace.

The temporary databases used by acceptance tests are isolated from the development workspace.

## API

- Better Auth: `/api/auth/*` (email/password signup/signin, session, signout).
- Public: `GET /api/shops/:id/slots?date=YYYY-MM-DD`, `POST /api/bookings`, `POST /api/register-owner`.
- Authenticated reads: `GET /api/dashboard?shop=:id`, `GET /api/customer`.
- Bookings: `POST /api/bookings/:id/transition`, `/estimate`, `/purchase-orders`, `/ready-notice`.
- Procurement: `POST /api/purchase-orders/:id/receive`.
- Owner/parts management: `POST /api/shops`, `/api/shops/:id/members`, `/services`, `/inventory`, `/schedule`.
- Team controls: `/api/shops/:id/members/:user/role` and `/toggle`.
- Service edit: `/api/shops/:id/services/:service/update`.
- Notifications: `POST /api/notifications/read`.
- Health: `GET /api/health` verifies PostgreSQL connectivity.

Optional voice, AI, payments and outbound messaging are not present. Dashboards use visible-page refresh every 15 seconds, not WebSockets.
