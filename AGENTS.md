# BayFlow project conventions

- Follow the supplied brief in `docs/reference/` and approved visuals in `docs/concepts/`.
- Match the Dr Jarmima composition pattern: routes in `src/app` handle routing,
  metadata, data loading and access checks; each page's `src/views/<page>/main.tsx`
  imports and renders its section components in order.
- Keep page sections and forms beside their page main. Use `src/components` for
  shared UI, `src/layout` for site chrome, `src/constant` for shared data and
  constants, `src/types` for interfaces, and `src/lib` for application logic.
- Never compress authored code. Use multiline JSX, one variable declaration per
  statement, two-space indentation, and blank lines separating imports, setup,
  handlers and rendering. Keep this spacing manually; no formatter is required.
- Run `npm run lint`, `npm run typecheck` and
  `npm run build` after structural changes. Run `npm test` for workflow changes.
- Keep role checks and workflow validation on the server. Never commit `.env`
  or reset user data during verification.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
