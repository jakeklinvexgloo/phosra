"use client"

import { Plus, Minus, RefreshCw } from "lucide-react"
import type { RegistryDiff } from "@/lib/platform-research/types"

interface CapabilityComparisonTableProps {
  diff: RegistryDiff | null
}

export function CapabilityComparisonTable({
  diff,
}: CapabilityComparisonTableProps) {
  if (!diff) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No comparison data available. Run research to generate a diff.
      </div>
    )
  }

  const hasChanges =
    diff.newCapabilities.length > 0 ||
    diff.removedCapabilities.length > 0 ||
    diff.changedCapabilities.length > 0

  if (!hasChanges && diff.unchanged.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No capabilities found in research results.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Summary badges */}
      <div className="flex items-center gap-2 text-xs">
        {diff.newCapabilities.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium">
            <Plus className="w-3 h-3" />
            {diff.newCapabilities.length} new
          </span>
        )}
        {diff.removedCapabilities.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-medium">
            <Minus className="w-3 h-3" />
            {diff.removedCapabilities.length} removed
          </span>
        )}
        {diff.changedCapabilities.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
            <RefreshCw className="w-3 h-3" />
            {diff.changedCapabilities.length} changed
          </span>
        )}
        {diff.unchanged.length > 0 && (
          <span className="text-muted-foreground">
            {diff.unchanged.length} unchanged
          </span>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Capability
              </th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Research Finding
              </th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Registry Status
              </th>
              <th className="text-right px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {/* New capabilities */}
            {diff.newCapabilities.map((cap) => (
              <tr
                key={cap.ruleCategory}
                className="bg-emerald-50/50 dark:bg-emerald-900/10"
              >
                <td className="px-3 py-2 font-medium text-foreground">
                  <div className="flex items-center gap-1.5">
                    <Plus className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="font-mono text-xs">
                      {cap.ruleCategory}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {cap.description}
                  {cap.confidence < 1 && (
                    <span className="ml-1 text-[10px] text-amber-600">
                      ({Math.round(cap.confidence * 100)}%)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground italic">
                  Not in registry
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                    Add
                  </button>
                </td>
              </tr>
            ))}

            {/* Changed capabilities */}
            {diff.changedCapabilities.map((change) => (
              <tr
                key={change.ruleCategory}
                className="bg-amber-50/50 dark:bg-amber-900/10"
              >
                <td className="px-3 py-2 font-medium text-foreground">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span className="font-mono text-xs">
                      {change.ruleCategory}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {change.researchDescription}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {change.currentDescription}
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                    Update
                  </button>
                </td>
              </tr>
            ))}

            {/* Removed capabilities */}
            {diff.removedCapabilities.map((cat) => (
              <tr
                key={cat}
                className="bg-red-50/50 dark:bg-red-900/10"
              >
                <td className="px-3 py-2 font-medium text-foreground">
                  <div className="flex items-center gap-1.5">
                    <Minus className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="font-mono text-xs">{cat}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground italic">
                  Not found
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  In registry
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-[10px] font-medium px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    Remove
                  </button>
                </td>
              </tr>
            ))}

            {/* Unchanged (collapsed) */}
            {diff.unchanged.length > 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-2 text-xs text-muted-foreground text-center"
                >
                  {diff.unchanged.length} capabilities unchanged
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
