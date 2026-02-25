"use client"

import { Server, Key, Zap, Code } from "lucide-react"

interface ApiEndpoint {
  endpoint: string
  purpose: string
  auth: "Session Cookie" | "Session Cookie + MFA" | "Session Cookie + Tokens"
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    endpoint: "/nq/website/memberapi/release/pathEvaluator",
    purpose: "Primary data API (Falcor JSON Graph)",
    auth: "Session Cookie",
  },
  {
    endpoint: "/nq/website/memberapi/release/profiles/switch",
    purpose: "Switch active profile",
    auth: "Session Cookie",
  },
  {
    endpoint: "/api/shakti/*/profiles",
    purpose: "Profile management (list, create, edit)",
    auth: "Session Cookie + Tokens",
  },
  {
    endpoint: "/api/shakti/*/parentalControls",
    purpose: "Read parental control settings",
    auth: "Session Cookie",
  },
  {
    endpoint: "/api/shakti/*/parentalControls/pin",
    purpose: "PIN management (set, remove, verify)",
    auth: "Session Cookie + MFA",
  },
  {
    endpoint: "/api/shakti/*/viewingactivity",
    purpose: "Viewing history data per profile",
    auth: "Session Cookie",
  },
  {
    endpoint: "/api/shakti/*/maturityRestrictions",
    purpose: "Maturity level settings (read/write)",
    auth: "Session Cookie + MFA",
  },
  {
    endpoint: "/api/shakti/*/titleRestrictions",
    purpose: "Title block list management",
    auth: "Session Cookie + MFA",
  },
]

const AUTH_DETAILS = [
  {
    label: "Primary Auth",
    value: "NetflixId + SecureNetflixId",
    description: "Session cookies set at login. ~2-week TTL before re-auth required.",
  },
  {
    label: "MSL Tokens",
    value: "Message Security Layer",
    description: "Netflix's proprietary protocol for DRM and secure API calls.",
  },
  {
    label: "CSRF Protection",
    value: "x-netflix-request-client-atag",
    description: "Required header on all mutating requests.",
  },
  {
    label: "Profile Context",
    value: "x-netflix-profileguid",
    description: "Header that scopes requests to a specific profile.",
  },
]

export function TechnicalRecon() {
  return (
    <section id="technical-recon" className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
          <Server className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">API Architecture</h2>
          <p className="text-sm text-muted-foreground">Falcor JSON Graph protocol, endpoints, and authentication</p>
        </div>
      </div>

      {/* Falcor architecture callout */}
      <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Falcor JSON Graph Protocol</h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Netflix uses a custom data-fetching protocol called{" "}
          <span className="text-zinc-200 font-medium">Falcor</span>. All data flows through a single
          endpoint with path-based queries. Requests are POSTs with{" "}
          <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono">path</code>{" "}
          parameter arrays; responses are nested JSON graphs with{" "}
          <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono">$type</code>{" "}
          references for deduplication.
        </p>
        <div className="rounded-md bg-zinc-950 border border-zinc-800 p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
          <div className="text-zinc-500">// Single entry point for all data</div>
          <div>
            <span className="text-amber-400">POST</span>{" "}
            <span className="text-emerald-400">/nq/website/memberapi/release/pathEvaluator</span>
          </div>
          <div className="mt-2 text-zinc-500">// Example path query for profiles</div>
          <div>
            {`{ "paths": [["profiles", "current", ["name", "maturityLevel", "isKids"]]] }`}
          </div>
        </div>
      </div>

      {/* Endpoint table */}
      <div className="plaid-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Key API Endpoints
            <span className="text-xs text-muted-foreground font-normal ml-1">
              51 unique paths captured via HAR
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Endpoint</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Purpose</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Auth Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {ENDPOINTS.map((ep) => (
                <tr key={ep.endpoint} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded break-all">
                      {ep.endpoint}
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{ep.purpose}</td>
                  <td className="px-4 py-2.5">
                    <AuthBadge auth={ep.auth} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authentication details */}
      <div className="plaid-card space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Key className="w-4 h-4" />
          Authentication Details
        </h3>
        <dl className="space-y-3">
          {AUTH_DETAILS.map((item) => (
            <div key={item.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <dt className="text-sm font-medium text-foreground whitespace-nowrap min-w-[140px]">
                {item.label}
              </dt>
              <dd className="text-sm text-muted-foreground">
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                  {item.value}
                </code>
                <span className="text-xs text-muted-foreground ml-2">
                  &mdash; {item.description}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Rate limiting / detection */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Rate Limiting &amp; Detection Notes
        </h3>
        <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            No explicit rate limiting observed during research sessions
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            Netflix uses device fingerprinting and behavioral analysis
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            Headless browser detection present &mdash; Playwright stealth mode recommended
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            Session cookies last ~2 weeks before re-authentication required
          </li>
        </ul>
      </div>
    </section>
  )
}

function AuthBadge({ auth }: { auth: string }) {
  const isMfa = auth.includes("MFA")
  const isTokens = auth.includes("Tokens")

  if (isMfa) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        MFA Required
      </span>
    )
  }

  if (isTokens) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Session + Tokens
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Session Cookie
    </span>
  )
}
