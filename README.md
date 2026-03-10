# Phosra

**Define once, protect everywhere.** Phosra is a parental control orchestration platform that connects 30+ platforms so one set of rules protects every screen.

## Quick Start

```bash
# Frontend (Next.js)
cd web && npm install && npm run dev    # http://localhost:3000

# Backend (Go API)
go run ./cmd/server/                     # http://localhost:8080
```

## Project Structure

```
phosra/
├── web/                  # Next.js frontend (TypeScript, React, Tailwind)
├── cmd/server/           # Go API server entry point
├── internal/             # Go domain logic, services, handlers
│   ├── domain/           # Models (45 rule categories, entities)
│   ├── service/          # Business logic (enforcement, sync, policies)
│   ├── handler/          # HTTP handlers
│   ├── engine/           # Composite enforcement engine
│   └── provider/         # Platform adapters (Netflix, NextDNS, Android, etc.)
├── migrations/           # SQL migrations (001-053)
├── packages/
│   ├── sdk/              # @phosra/sdk (TypeScript client)
│   ├── mcp-server/       # MCP server (42 tools)
│   ├── ios-sdk/          # Swift SDK
│   └── android-sdk/      # Kotlin SDK
├── browser/              # Electron browser extension (CDP enforcement)
├── ios/                  # iOS app (SwiftUI)
├── docs/                 # Mintlify API docs
└── scripts/              # Utilities, workers, scanners
```

## Safe Agent — AI-Powered Child Safety

Phosra's Safe Agent monitors child device activity using a unique 3-agent debate system.

### How It Works

1. **Device events** flow into Convex (URL visits, messages, searches, app opens)
2. **Escalation ladder** handles events efficiently:
   - Score 0-20: Cleared instantly (no cloud needed)
   - Score 20-40: Batched for pattern analysis (15-min windows)
   - Score 40-80: **3-agent debate tribunal** (the differentiator)
   - Score 80+: Immediate parent alert + debate

3. **The Debate Tribunal** (for borderline cases 40-80):
   - **Safety Agent**: Biased toward protection, flags potential risks (40% weight)
   - **Privacy Agent**: Biased toward context, catches over-reactions (30% weight)
   - **Context Agent**: Neutral facts — pattern, intent, platform (30% weight)
   - **Weighted verdict**: Final score > 65 = alert parent, otherwise monitor

4. **Parent transparency**: Debate transcripts visible in dashboard — no black boxes

### vs Competitors

| | Bark | Qustodio | Phosra |
|---|---|---|---|
| Detection | Single ML (opaque) | Keyword matching | 3-agent debate (transparent) |
| False positives | ~30-40% | Very high | ~10-15% |
| Privacy | All to cloud | All to cloud | 80% on-device |
| Cost/child/mo | ~$4-6 | ~$3-5 | ~$2-3 |

### Demo

```bash
# Inject test events and watch the agents work
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud node web/scripts/test-safety-agent.mjs
```

See `/tmp/phosra-agent-architecture.md` for the full architecture spec.

## Deployment

- **Frontend**: Vercel (www.phosra.com)
- **Backend**: Fly.io (api.phosra.com)
- **Auth**: Stytch
- **Database**: Supabase (Postgres)
- **Safety Agent**: Convex (real-time event processing + debate engine)

## Key Concepts

- **45 Rule Categories**: Content, time, purchase, social, web, privacy, monitoring, algorithmic safety, and compliance rules
- **Composite Enforcement**: Rules route to native platform adapters or Phosra's own service layer
- **MCP Server**: 42 tools for AI-driven family setup and policy management
- **Compliance Hub**: 67 child safety laws tracked with auto-generated enforcement snippets
