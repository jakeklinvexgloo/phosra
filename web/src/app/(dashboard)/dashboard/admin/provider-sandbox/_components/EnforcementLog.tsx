"use client"

import type { EnforcementEvent } from "@/lib/sandbox/types"

interface EnforcementLogProps {
  events: EnforcementEvent[]
}

export function EnforcementLog({ events }: EnforcementLogProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-[12px] text-muted-foreground italic">
        No enforcement events yet. Toggle rules and click &quot;Enforce Policy&quot; to see changes.
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
      {events.map((event) => {
        const time = event.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        return (
          <div key={event.id} className="border-l-2 border-border pl-3 py-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-muted-foreground">{time}</span>
              <span className="text-[12px] font-medium text-foreground">
                {event.rulesApplied} applied
              </span>
              {event.rulesSkipped > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  ({event.rulesSkipped} skipped)
                </span>
              )}
            </div>
            {event.changes.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {event.changes.map((change, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground leading-tight">
                    <span className="font-medium text-foreground">{change.profileName}</span>
                    {" — "}{change.description}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
