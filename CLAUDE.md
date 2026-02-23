# Phosra (GuardianGate) — Developer Guide

## Deployment

- **Credentials & tokens:** See `CLAUDE.local.md` (gitignored)
- **Vercel:** Frontend deployed from `web/`
- **Railway:** Backend API (`railway.toml`) + Worker (`railway-worker.toml`)
- **Auth:** Stytch
- **Database:** Supabase (Postgres)

## Project Structure

- **Frontend:** Next.js app in `web/` (TypeScript, React, Tailwind CSS)
- **Backend:** Go API server in `cmd/server/`, domain logic in `internal/`
- **Migrations:** SQL files in `migrations/` (001-014)

## Compliance Data Architecture

### Single Source of Truth

All child safety legislation data lives in `web/src/lib/compliance/`:

```
web/src/lib/compliance/
├── types.ts                    # LawEntry, Jurisdiction, LawStatus types
├── law-registry.ts             # THE registry: ~67 laws with full metadata
├── index.ts                    # Barrel exports + helper functions
├── snippet-generator.ts        # Auto-generates MCP enforcement snippets
└── adapters/
    ├── to-compliance-data.ts   # → ComplianceLaw[] for marketing section
    ├── to-legislation.ts       # → LegislationEntry[] for docs section
    └── to-compliance-page.ts   # → CompliancePageData for detail pages
```

### How to Add a New Law

1. **Add to `law-registry.ts`** — Insert a new entry in the appropriate jurisdiction section. Use `autoSnippet({...})` for laws that don't need a custom MCP snippet. Required fields:
   - `id` (URL slug), `shortName`, `fullName`, `jurisdiction`, `jurisdictionGroup`, `country`
   - `status`, `statusLabel`, `introduced`, `summary`, `keyProvisions`
   - `ruleCategories` (from Go `models.go` constants), `platforms`
   - `relatedLawIds`, `tags`

2. **Optional: Add `detailedPage`** — For priority laws, add a `detailedPage` object with:
   - `provisions`: Detailed provision descriptions
   - `phosraFeatures`: How Phosra maps to each regulation
   - `checklist`: Compliance readiness checklist

3. **No other files need modification** — Adapters auto-generate marketing, docs, and page data from the registry.

### How to Verify Changes

```bash
cd web && npx next build --no-lint    # Frontend build
cd .. && go build ./...               # Backend build
```

### Key Routes

- `/compliance` — Hub page (filterable index of all laws)
- `/compliance/[slug]` — Dynamic detail page per law
- `/api/compliance/laws` — JSON API for all laws
- `/api/compliance/laws/[lawId]` — Single law JSON
- `/api/compliance/map` — Rule category → law mapping

### Rule Categories

45 total rule categories defined in `internal/domain/models.go`. The 5 newest:
- `parental_consent_gate` — Verifiable parental consent before account/data collection
- `parental_event_notification` — Notify parents of account creation/flagged content
- `screen_time_report` — Platform-generated usage reports for parents
- `commercial_data_ban` — Ban commercial sale/sharing of minor data
- `algorithmic_audit` — Algorithmic transparency and audit requirements

## Testing

### Browser Testing
- Use **Playwright MCP** or **Chrome MCP** to visually test UI changes in a real browser
- Always verify frontend changes by navigating to the relevant page after making edits

### Local Testing
- Start the dev server: `cd web && npm run dev`
- **Base URL:** `http://localhost:3000`
- Use Playwright MCP / Chrome MCP to navigate to `localhost:3000` and verify changes
- Test API endpoints at `http://localhost:8080` (Go server: `go run ./cmd/server/`)

```bash
cd web && npx playwright test              # Run Playwright test suite
cd web && npx playwright test --ui         # Interactive Playwright UI
```

### Production Testing
- **Frontend:** Use Chrome MCP to navigate to `www.phosra.com` and verify deployed changes
- **Backend API:** Test endpoints at the Railway production URL (see `CLAUDE.local.md`)
- Always test production **after deploying** to confirm changes are live and working

### What to Test
- After UI changes: open the page in the browser via MCP and verify it renders correctly
- After API changes: test endpoints locally first, then verify in production after deploy
- After compliance data changes: check `/compliance` hub and individual law detail pages
- After deploy: smoke test production with Chrome MCP to confirm no regressions

### Automated Monitoring

- **GitHub Action:** `.github/workflows/legislation-monitor.yml` — Runs weekly (Monday 8am UTC) + manual trigger
- **Scanner Script:** `scripts/legislation-scanner.mjs` — Queries Claude API for legislation updates
- **Reports:** Generated at `scripts/legislation-report.md`
