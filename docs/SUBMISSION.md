# BayFlow Studio — submission handoff

## Project links

- **Public GitHub repository:** [Eesar1/bayflow-studio](https://github.com/Eesar1/bayflow-studio)
- **Live application:** [https://bayflow-studio.vercel.app/](https://bayflow-studio.vercel.app/)
- **Application health check:** [https://bayflow-studio.vercel.app/api/health](https://bayflow-studio.vercel.app/api/health)
- **Project brief:** [BayFlow Hackathon Brief](reference/BayFlow-Hackathon-Brief.pdf)
- **Setup, demo accounts and test commands:** [README](../README.md)
- **Role-by-role demo steps:** [Demo walkthrough](DEMO-WALKTHROUGH.md)
- **Requirements coverage:** [Requirements](REQUIREMENTS.md)
- **Verification notes:** [Verification](VERIFICATION.md)

The production database is hosted on Neon PostgreSQL. The live health endpoint, public site, workshop slot lookup, owner sign-in and authenticated owner dashboard have been checked. The six PostgreSQL acceptance scenarios pass locally, including workflow transitions, tenant isolation and concurrency checks. The entire multi-role lifecycle has not been manually replayed on the production site.

## Architecture

```mermaid
flowchart TB
  subgraph People["People"]
    Customer["Customer"]
    Owner["Shop owner"]
    Advisor["Service advisor"]
    Technician["Technician"]
    Parts["Parts person"]
    QC["QC inspector"]
  end

  subgraph Hosting["Vercel"]
    Web["BayFlow web app<br/>Next.js App Router<br/>React and TypeScript"]
    Pages["Customer portal and booking wizard<br/>Role-specific workshop POS"]
    API["Route handlers<br/>Business API and health check"]
    Auth["Better Auth<br/>Email/password sessions"]
    Logic["Application services<br/>Validation, authorization and workflow rules"]
    ORM["Drizzle ORM"]
  end

  subgraph Data["Neon PostgreSQL"]
    DB[("Application database")]
    ShopData["Shops, memberships and services"]
    BookingData["Bookings, vehicles and workflow history"]
    EstimateData["Estimate revisions and approval"]
    StockData["Inventory and purchase orders"]
    QualityData["QC checks, rework and notifications"]
    AuthData["Users, accounts and sessions"]
  end

  Customer --> Pages
  Owner --> Pages
  Advisor --> Pages
  Technician --> Pages
  Parts --> Pages
  QC --> Pages
  Web --> Pages
  Pages --> API
  API --> Auth
  API --> Logic
  Auth --> ORM
  Logic --> ORM
  ORM --> DB
  DB --- ShopData
  DB --- BookingData
  DB --- EstimateData
  DB --- StockData
  DB --- QualityData
  DB --- AuthData
```

## Booking-to-completion workflow

```mermaid
flowchart TD
  Start["Customer selects shop and services"] --> Slot["Choose an available slot"]
  Slot --> Details["Enter account, vehicle and issue details"]
  Details --> Booked["Booking created"]
  Booked --> Advisor["Advisor confirms or declines<br/>and assigns a technician"]
  Advisor --> Inspect["Assigned technician inspects vehicle"]
  Inspect --> Estimate["Technician prepares and submits estimate"]
  Estimate --> AdvisorReview["Advisor reviews and sends estimate"]
  AdvisorReview --> CustomerDecision{"Customer decision"}
  CustomerDecision -->|Reject| Revise["Advisor returns job for revision"]
  Revise --> Inspect
  CustomerDecision -->|Approve| PartsCheck["Advisor assigns parts person"]
  PartsCheck --> Availability{"All required parts available?"}
  Availability -->|No| Purchase["Create purchase order<br/>receive stock, possibly in partial deliveries"]
  Purchase --> Availability
  Availability -->|Yes| Allocate["Verify and allocate parts"]
  Allocate --> Repair["Technician completes repair"]
  Repair --> QC["QC inspector claims job<br/>and completes required checklist"]
  QC --> QCDecision{"QC result"}
  QCDecision -->|Fail with issue| Rework["Record rework issue"]
  Rework --> Repair
  QCDecision -->|Pass| PickupNotice["Advisor sends ready-for-pickup notice"]
  PickupNotice --> Pickup["Customer or advisor confirms pickup"]
  Pickup --> Complete["Booking completed"]
```

The application enforces role, assignment, shop-membership and workflow rules on the server. Database transactions protect slot capacity, stock allocation and QC job claims. See [Architecture](ARCHITECTURE.md) for additional implementation details.

## Submission checklist

- [x] Public GitHub repository
- [x] Live deployed URL with seeded demo accounts and records
- [x] Root README with setup, tests, demo accounts and architecture notes
- [x] Root `.env.example` with placeholders; real environment secrets are not included
- [x] Architecture and booking workflow diagrams
- [ ] Record and attach the short demo video (you will create this)

Calling, AI Front Desk, payments, email/SMS and PDF invoices are optional in the brief and are not part of this submission.
