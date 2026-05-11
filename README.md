# DocRail

API-first document generation: templates, PDFs, org branding, and delivery—built incrementally with strong tests and security gates.

## Requirements

- Node.js 22+
- npm 10+

## Setup

```bash
npm ci
cp .env.example .env.local   # when env template exists
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Public **release notes** live at [/releases](http://localhost:3000/releases) (no login).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint (includes `max-lines` 180 for `src/`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest once |
| `npm run test:coverage` | Vitest with coverage thresholds |

## Docs

- [docs/ENGINEERING.md](docs/ENGINEERING.md) — workflow, versioning, coverage scope, release notes policy.

## License

Private (unlicensed) until explicitly published.
