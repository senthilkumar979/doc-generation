# DocRail

API-first document generation: templates, PDFs, org branding, and delivery—built incrementally with strong tests and security gates.

## Requirements

- Node.js 22+
- npm 10+

## Setup

```bash
npm ci
cp .env.example .env.local
# Edit .env.local with your Supabase URL + publishable (or legacy anon) key — see docs/SUPABASE.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Public **release notes** live at [/releases](http://localhost:3000/releases) (no login).

**Authentication:** [docs/SUPABASE.md](docs/SUPABASE.md) — migrations (orgs, **API keys**, **templates**, **usage logs**), env vars (including **`SUPABASE_SERVICE_ROLE_KEY`** for `/api/v1`), and email confirmation notes. After onboarding, use **Dashboard → API keys** and **Dashboard → Templates**.

**REST API (v1):** `Authorization: Bearer <api_key_plaintext>`.

```bash
curl -s -H "Authorization: Bearer YOUR_KEY" http://localhost:3000/api/v1/templates | jq .
```

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
