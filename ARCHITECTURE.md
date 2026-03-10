# Phosra — Unified System Architecture

**Last updated: 2026-03-10**

---

## Layer Ownership

### Go API (`cmd/server/`, `internal/`)

**Owns:** All persistent state, enforcement logic, policy evaluation, authentication (Stytch JWT, device keys, developer keys, worker auth).

**Core domains:**
- Families / Members / Children
- Policy Engine (policies, rules, age-ratings, standards)
- Enforcement (single unified architecture — consolidating legacy paths)
- Compliance (links, verify, enforce)
- Sources (parental app integrations)
- Platforms (registry, OAuth)
- Ratings (systems, age conversion)
- Webhooks

**Extension domains (to be fully documented in OpenAPI spec):**
- Viewing history + CSM cache
- Config-agent state (wizard resume)
- Browser enforcement (must resolve child/policy before submitting)
- Developer portal (org/keys/usage)
- Devices (Apple/Android)

**Internal-only (separate auth surface, no customer exposure):**
- Admin panel (CRM, Gmail, pitch coach)
- Worker API

**Does NOT own:** UI, scraping, browser automation.

### Next.js Web (`web/`)

**Owns:** All customer-facing UI, developer portal, marketing, setup wizard, policy rule UI.

**Does NOT own:** API logic (delegates entirely to SDK + API), admin ops (should be separated to internal deploy).

### Electron Browser (`browser/`)

**Owns:** Streaming tab management + stealth, Netflix config wizard (config-agent), viewing history scrape + sync, CSM enrichment, credential manager (OS keychain), MCP server (CDP bridge on port 9222).

**Does NOT own:** Policy definition (→ API/web), raw rule submission (must resolve child and policy before calling /enforce).

### Shared Packages (`packages/`)

| Package | Purpose |
|---|---|
| `@phosra/sdk` | Single canonical TypeScript API client — all JS layers should import this |
| `@phosra/mcp` | MCP tool definitions (single source, not duplicated) |
| `@phosra/ios` | iOS policy sync and enforcement |
| `@phosra/android` | Android policy sync and enforcement |

---

## Unified Data Flows

```
Setup:     Web wizard → POST /setup/quick → API creates family + child + policy
Enforce:   Web or Electron → resolve childID + policyID → POST /enforce (with IDs, not strings)
Browser:   Electron scrapes Netflix → POST /viewing-history/sync + /config-agent/state
Mobile:    APNs/FCM push on policy update → device GETs /device/policy → SDK applies rules
MCP:       Agent → @phosra/mcp (tools from shared package) → SDK → API
Developer: Web dev portal → /developer/* API tier (scoped keys)
```

### Auth Tiers

| Tier | Mechanism | Used By |
|---|---|---|
| Customer | Stytch JWT (cookie-proxied for web) | Next.js web app |
| Device | Bearer JWT | Electron browser, mobile SDKs |
| Developer | API key (scoped) | Third-party integrations |
| Worker | Internal token | Background jobs |

---

## Compliance Data Architecture

Single source of truth: `web/src/lib/compliance/`

```
law-registry.ts     → ~67 laws with full metadata
types.ts            → LawEntry, Jurisdiction, LawStatus
snippet-generator.ts → Auto-generates MCP enforcement snippets
adapters/           → Transform registry → marketing, docs, detail pages
```

All compliance UI surfaces derive from `law-registry.ts`. To add a new law, add one entry to the registry; adapters auto-generate everything else.

---

## Fix Plan Status

### 🔴 Critical — Broken or Actively Misleading

| ID | Issue | Status | Owner |
|---|---|---|---|
| C1 | "320+ platforms" claim overstates reality (4 live, 213 planned) | 🔧 In progress | Web |
| C2 | OpenAPI spec has phantom auth endpoints (`/auth/register`, etc.) | ⬜ Not started | API |
| C3 | Python SDK shown in marketing but doesn't exist | 🔧 In progress | Web |
| C4 | Sandbox mode grants admin to all users in production | ⬜ Not started | API |
| C5 | Browser enforcement bypasses policy engine | ⬜ Not started | API + Browser |
| C6 | API base URL inconsistent across layers | ⬜ Not started | All |

### 🟡 Important — Incoherent but Not Immediately Broken

| ID | Issue | Status | Owner |
|---|---|---|---|
| I1 | Web uses hand-rolled `api.ts` instead of `@phosra/sdk` | ⬜ Not started | Web + Packages |
| I2 | `tools.ts` duplicated in web playground and MCP server | 🔧 In progress | Web + Packages |
| I3 | ~40% of API routes undocumented in OpenAPI spec | ⬜ Not started | API |
| I4 | Three parallel enforcement architectures, all live | ⬜ Not started | API |
| I5 | Admin ops co-deployed with customer product | ⬜ Not started | Web |
| I6 | No monorepo workspace linking | ⬜ Not started | Root |

### 🟢 Nice to Have — Polish

| ID | Issue | Status | Owner |
|---|---|---|---|
| N1 | Provider Sandbox hidden behind admin | ✅ Done | Web |
| N2 | Netflix selector versioning and fallback | ⬜ Not started | Browser |
| N3 | CDP port unauthenticated | ⬜ Not started | Browser |
| N4 | Community Standards adoption counts hardcoded | ⬜ Not started | Web |
| N5 | No real-time backend push to Electron | ⬜ Not started | API + Browser |
| N6 | `family-preload.ts` bridge undocumented | ⬜ Not started | Browser |
| N7 | URL path param casing inconsistent | ⬜ Not started | API |

---

## Cross-Layer Issue Matrix

| Issue | API | Browser | Web | Packages |
|---|---|---|---|---|
| Platform count dishonesty | — | — | ❌ | — |
| Auth spec wrong | ❌ | — | — | — |
| Python SDK ghost | — | — | ❌ | ❌ missing |
| Sandbox admin escalation | ❌ | — | ❌ | — |
| Enforcement disconnected from policy | ❌ | ❌ | — | — |
| Three enforcement architectures | ❌ | — | — | — |
| api.ts vs @phosra/sdk fork | — | — | ❌ | ❌ unused |
| tools.ts duplication | — | — | ❌ | ❌ dupe |
| API URL inconsistency | ❌ | ❌ | ❌ | ❌ |
| 40% routes undocumented | ❌ | — | — | — |
| Admin co-deployed with product | — | — | ❌ | — |
| No monorepo workspace linking | — | — | ❌ | ❌ |
