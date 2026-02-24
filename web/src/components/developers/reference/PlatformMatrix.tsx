"use client"

import { CATEGORY_REFERENCE, CATEGORY_GROUPS } from "@/lib/docs/categories"
import { PLATFORM_NAMES } from "@/lib/docs/types"
import type { PlatformSupport } from "@/lib/docs/types"

function PlatformSupportIcon({ support }: { support: PlatformSupport }) {
  if (support === "full") return <span className="text-emerald-500" title="Full support">&#10003;</span>
  if (support === "partial") return <span className="text-amber-500" title="Partial support">&#9681;</span>
  return <span className="text-zinc-400" title="No support">&mdash;</span>
}

export function PlatformMatrix() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Platform Support Matrix</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Overview of which category groups are supported by each platform adapter. <span className="text-emerald-500">&#10003;</span> = Full support,{" "}
        <span className="text-amber-500">&#9681;</span> = Partial support, <span className="text-zinc-400">&mdash;</span> = No support.
      </p>
      <div className="bg-card rounded-none sm:rounded border border-border overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 sm:px-4 py-3 text-left text-xs text-muted-foreground sticky left-0 bg-muted/50 z-10">Category Group</th>
              {PLATFORM_NAMES.map(name => (
                <th key={name} className="px-2 sm:px-4 py-3 text-center text-xs text-muted-foreground whitespace-nowrap">{name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CATEGORY_GROUPS.map(group => {
              const groupCats = CATEGORY_REFERENCE.filter(c => c.group === group.key)
              const platformSummary = PLATFORM_NAMES.map(pName => {
                const supports = groupCats.map(c => c.platforms.find(p => p.name === pName)?.support || "none")
                if (supports.every(s => s === "none")) return "none" as PlatformSupport
                if (supports.every(s => s === "full")) return "full" as PlatformSupport
                return "partial" as PlatformSupport
              })
              return (
                <tr key={group.key} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span>{group.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({group.categories.length})</span>
                  </td>
                  {platformSummary.map((support, i) => (
                    <td key={PLATFORM_NAMES[i]} className="px-4 py-3 text-center text-lg">
                      <PlatformSupportIcon support={support} />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
