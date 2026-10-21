# BayFlow Studio

A Next.js workshop booking platform built from the supplied 13-page BayFlow brief and the approved Precision Workshop concepts. It includes the customer booking portal, role-specific workshop POS, estimates, purchasing, inventory, mandatory QC/rework and pickup.

## Stack

Node.js 24 LTS, Next.js 16.4.1 App Router, React 19, TypeScript, Tailwind CSS 4 with the supplied custom styles, PostgreSQL 17, Drizzle ORM and Better Auth.

## Local setup

Requires Node.js 24, npm 11 and Docker Desktop (or a PostgreSQL server).

```powershell
npm.cmd ci
Copy-Item .env.example .env
# Replace BETTER_AUTH_SECRET with a random value; never commit .env.
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
docker compose up -d db
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Open **http://localhost:3010**. Port 3010 keeps this project separate from other local projects using 3000.

For a production build:

```powershell
npm.cmd run build
npm.cmd start
```

`DATABASE_URL` points to the PostgreSQL database used by application queries. For Neon, use its pooled connection string here. `DATABASE_URL_UNPOOLED` is optional and should hold Neon's direct (non-pooled) connection string for schema migrations; when set, `npm run db:migrate` uses it. If it is unset, migrations fall back to `DATABASE_URL`. The included local container uses port 5434 and a development-only password. Set `BETTER_AUTH_URL` to `http://localhost:3010` locally and your exact HTTPS site origin in production. On Vercel, BayFlow uses `VERCEL_PROJECT_PRODUCTION_URL` for production and `VERCEL_URL` for previews when Vercel system environment variables are enabled; `BETTER_AUTH_URL` is the fallback. `BETTER_AUTH_SECRET` signs authentication cookies. The seed is explicit and idempotent: rerunning it preserves existing data.

## Demo accounts

Password for every seeded account: **BayflowDemo2026!**

| Role | Login |
| --- | --- |
| Owner, Lahore and Islamabad | owner@bayflow.demo |
| Service Advisor, Lahore | advisor@bayflow.demo |
| Technician, Lahore | technician@bayflow.demo |
| Parts Person, Lahore | parts@bayflow.demo |
| QC Inspector, Lahore | qc@bayflow.demo |
| Customer, BF-1001 | customer@bayflow.demo |
| Independent Karachi owner | owner2@bayflow.demo |

Islamabad staff use advisor2, technician2, parts2 and qc2 at `bayflow.demo`. Karachi staff use advisor3, technician3, parts3 and qc3. Login-page role buttons fill demo credentials; they do not bypass authentication. Shops, customers and contact details are fictional demo records, and the workshop photos are representative.

## Code structure — Dr Jarmima convention

```text
src/
  app/                 thin routes, metadata, data loading and access checks
  views/
    home/main.tsx      composes Hero, Workshops, HowItWorks, RepairTracking, ForWorkshops
    booking/main.tsx   composes booking heading, workshop, steps and summary
    customer/main.tsx  composes booking cards and updates
    auth/main.tsx      composes auth introduction and login/signup forms
    pos/main.tsx       composes sidebar, topbar, heading and queue/management screens
  components/          shared forms, status, estimates, timeline and actions
  layout/              public header and footer
  constant/            shared workflow stages and labels
  types/               domain and component interfaces
  lib/                 auth, validation, data access, mutations and workflow guards
  db/                  Drizzle schema and PostgreSQL connection
scripts/               migration runner and idempotent seed
drizzle/               versioned SQL migrations
public/images/         locally bundled workshop photos
tests-next/            isolated PostgreSQL HTTP acceptance tests
docs/reference/        supplied PDF
docs/concepts/         three supplied design concepts
```

Keep source readable: two-space indentation, multiline JSX, one declaration per statement and blank lines around imports and returns. ESLint checks the code conventions. `main.tsx` is the composition file; page sections and forms live beside it rather than inside a single monolithic `index.tsx`.

## Verification

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
```

Tests start the production build on port 3101 against a randomly named temporary database. The database role must have CREATE DATABASE permission. The tests delete only that temporary database; the development seed stays untouched. Build before running the acceptance tests.

The six acceptance scenarios cover authentication and tenant isolation, the complete lifecycle with estimate rejection and repeated QC failures, partial purchase receipts and single allocation, simultaneous slot requests, customer reuse, owner/team/service management, and customer-only booking access. Auth rate limits remain enabled; tests wait when the login limit is reached.

Browser checks cover public local images, booking services/slots/details/review, owner POS navigation and mobile layout/menu behavior. See `docs/VERIFICATION.md` for the current evidence and limits.

## Workflow

Customers sign in or create a customer account before entering the booking wizard. Passwords belong on the authentication screen. After confirmation, the customer sees a booking receipt in My bookings and the workshop sees the new request in its POS. Each booking shows the next responsible role; an owner viewing a technician's job cannot perform that technician's work or approve an estimate for a customer.

See [the role-by-role demo guide](docs/DEMO-WALKTHROUGH.md) for accounts and handoffs, including the separate customer who owns the seeded awaiting-approval job.

Start with customer booking BF-1001. The advisor confirms and assigns the technician; the technician inspects and saves/submits an estimate. The advisor reviews/sends it; the customer accepts or rejects it. After approval, the advisor assigns parts, the parts person orders/receives/allocates stock, and the technician completes repair. A QC inspector claims the job and records every checklist result. Failure creates a rework issue and returns to the technician; the loop can repeat. After passing QC, the advisor notifies the customer, then the customer or advisor confirms pickup.

All protected mutations enforce roles, shop access and valid workflow states on the server. Stock, slot capacity and QC claims use PostgreSQL transactions and row locks. Estimates keep revisions, and transitions produce audit history and notifications. Dashboards refresh every 15 seconds while visible.

## Deployment and scope

The public repository is [Eesar1/bayflow-studio](https://github.com/Eesar1/bayflow-studio), and the live application is [bayflow-studio.vercel.app](https://bayflow-studio.vercel.app/). The production Neon database has the application migrations and fictional demo records applied. Health, public workshop content, available slots, owner sign-in and the authenticated dashboard have been checked on the deployed site. The complete workflow and role-isolation scenarios pass in the local PostgreSQL acceptance suite; the full multi-role lifecycle has not been manually replayed on production.

For another deployment, use a managed PostgreSQL database and a Node-capable host such as Vercel or a container host. Apply migrations and seed the chosen demo database explicitly before opening the app to judges. Set a strong auth secret and production database credentials. On Vercel, the app derives its public origin from Vercel system environment variables when available. The included Dockerfile builds a standalone Next.js image; Docker Compose currently starts the local database only.

Calling, AI Front Desk, payments, email/SMS and PDF invoicing are optional and are not implemented. The supplied brief and concepts remain unchanged under `docs/`.

The dependency audit still flags transitive tooling dependencies; review and patch them before expanding production use. This project has a live deployment, but that does not represent a production security certification or load-test result.
