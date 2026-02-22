"use client"

import { Globe, ExternalLink } from "lucide-react"
import type { SuperConnector, WarmIntroTarget } from "@/lib/investors/warm-intro-network"

export default function SuperConnectorsSection({
  connectors,
  targets,
}: {
  connectors: SuperConnector[]
  targets: WarmIntroTarget[]
}) {
  const targetMap = new Map(targets.map((t) => [t.id, t]))

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Super Connectors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {connectors.map((c) => {
          const reachable = c.reachableTargets
            .map((id) => targetMap.get(id))
            .filter(Boolean) as WarmIntroTarget[]

          return (
            <div key={c.id} className="plaid-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-medium text-foreground">{c.name}</div>
                  <span className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 mt-1">
                    {c.type}
                  </span>
                </div>
                <span className="text-lg font-semibold text-brand-green tabular-nums flex-shrink-0">
                  ~{c.estimatedIntros}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{c.description}</p>
              {(c.website || c.contactNote) && (
                <div className="flex flex-col gap-1 mb-2">
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline w-fit"
                    >
                      <Globe className="w-3 h-3" />
                      {new URL(c.website).hostname.replace("www.", "")}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {c.contactNote && (
                    <p className="text-[11px] text-muted-foreground italic">
                      {c.contactNote}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {reachable.map((t) => (
                  <span
                    key={t.id}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {t.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
