# BayFlow core coverage

Source: docs/reference/BayFlow-Hackathon-Brief.pdf, version 1.1, October 2026.

The active application is Next.js, TypeScript, PostgreSQL, Drizzle and Better Auth. See VERIFICATION.md for recorded checks.

| Requirement | Current implementation |
| --- | --- |
| Authentication and tenant isolation | Better Auth sessions; server-enforced shop membership and customer ownership |
| Owner shops and teams | Multiple shops, switcher, staff provisioning, role edits and deactivation |
| Shop configuration | Services, working hours, slot duration and capacity |
| Customer booking | Shop selection, multiple services, available slots, account/vehicle details and review |
| Customer portal | Own bookings, estimates, approval/rejection, progress, notifications and pickup |
| Advisor | Confirmation, assignments, estimate review/send, pickup notice and completion |
| Technician | Assigned jobs, inspection, estimates, repair and QC returns |
| Parts | Inventory, shortages, purchase orders, partial receiving and allocation |
| QC | Shared queue, atomic claims, mandatory checklist, pass/fail and repeatable issue loops |
| Workflow | Explicit transition map, role/assignment guards, estimate revisions and audit history |
| Concurrency | Transactional capacity checks, stock deductions and QC claims |
| Demo seed | Three shops, staff for each role, services, inventory and example bookings |
| Source organization | Thin routes, page main.tsx composition, sibling sections/forms and shared components |
| Core tests | Five PostgreSQL HTTP acceptance scenarios pass |
| Setup | README, commented .env.example, migrations and seed commands |
| Public repository | Not published for BayFlow |
| Live URL | Not deployed; mandatory submission item still outstanding |
| Calling and AI Front Desk | Optional; not implemented |
| Payments, SMS, email and PDF invoices | Optional; not implemented |

The supplied brief and approved concepts are retained as project references. Docker currently runs only the local PostgreSQL database. Next.js runs directly through npm.
