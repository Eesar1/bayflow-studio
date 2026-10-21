# BayFlow migration verification

- Production build: Next.js 16.4.1 App Router routes compile.
- ESLint and TypeScript: passed after the `main.tsx` reorganization. Optional formatter tooling was subsequently removed at the user's request.
- PostgreSQL HTTP acceptance suite: 6/6 scenarios pass on an isolated temporary database. Includes full lifecycle, rejection/revisions, partial receipts, allocation race, two QC failures followed by success, QC claim race, capacity contention, tenant isolation, staff management and booking access controls.
- Chromium: home/photos, booking services/date/details/review and owner dashboard navigation work. Booking was reviewed without creating a record in the user's development workspace.
- Owner inventory, team, services, notifications and bookings screens render with one main heading each.
- POS widths 1440, 1024, 768 and 390: no document overflow; mobile menu opens and navigates. Home checked on desktop and mobile. Screenshots were generated during verification and are not required to run the app.
- PostgreSQL container runs locally on port 5434; app runs at http://localhost:3010.
- The user requested readable source and Dr Jarmima's page pattern. All page views use `main.tsx` composition files with sibling sections/forms. Preserve the existing spacing; ESLint retains the code convention checks.

Not verified: public deployment, a container build of the Next.js image, real-device use, production load or a complete manual browser journey switching through every staff role. The full workflow is covered by HTTP acceptance tests. Optional calling/AI are not implemented. The dependency audit still reports transitive tooling advisories; do not describe the app as security-certified.
