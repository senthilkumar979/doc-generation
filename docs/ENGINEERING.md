# Engineering standards (DocRail)

## Commits and versioning

- Ship in **small, reviewable steps**; commit after each coherent slice.
- **`package.json` version** follows SemVer from **`0.0.0`** until public beta; bump **patch** per user-visible merge unless the change is docs-only or non-shipping internals (document exceptions in the commit body).
- Bump **minor** when completing a named milestone (auth, render API, billing, etc.).
- First public beta target: **`1.0.0-beta.1`** (or an agreed `0.x.0` beta label).

## Release notes (`notes/releases/`)

- One file per version: `notes/releases/vX.Y.Z.md` (Markdown).
- **User-safe content only**—no secrets, internal URLs, customer names, or undisclosed vulnerability detail beyond “security fixes”.
- Rendered publicly at **`/releases`** without authentication.

## Tests and coverage

- **Vitest**; run `npm run test:coverage` before merge.
- Coverage thresholds apply to **`src/lib/**/*.ts`** and **`src/components/**/*.tsx`** (see `vitest.config.ts`). Excludes `*.test.*` and `**/types.ts`.
- Target: **≥95%** lines/statements/functions and **≥90%** branches (current global gate).

## File size

- **≤180 lines** per production `src/**/*.ts(x)` file (excluding tests), enforced by ESLint `max-lines`.

## Security checks (each change)

- No secrets in repo or release notes.
- Validate untrusted input with **Zod** at boundaries.
- Prefer defense in depth: RLS (when DB exists) **and** server-side authorization checks.

## CI

GitHub Actions runs install, lint, typecheck, tests with coverage, production build, and `npm audit` (moderate+ fails the job).
