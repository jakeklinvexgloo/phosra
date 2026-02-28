"use client"

import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react"
import type { AgeVerificationDetail } from "@/lib/platform-research/research-data-types"

interface AgeVerificationSectionProps {
  data: AgeVerificationDetail
}

const EASE_COLORS: Record<string, string> = {
  "trivial": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "easy": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "moderate": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "difficult": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "very difficult": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
}

function easeColor(ease: string | undefined | null): string {
  if (!ease) return "bg-muted text-muted-foreground"
  const lower = ease.toLowerCase()
  for (const [key, cls] of Object.entries(EASE_COLORS)) {
    if (lower.includes(key)) return cls
  }
  return "bg-muted text-muted-foreground"
}

export function AgeVerificationSection({ data }: AgeVerificationSectionProps) {
  return (
    <div className="space-y-6">
      {/* Minimum Age + Circumvention Ease */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Minimum Age</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{data.minimumAge ?? "?"}+</p>
          <p className="text-xs text-muted-foreground">years old to create an account</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Circumvention Ease</span>
          </div>
          <div className="mt-1">
            <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${easeColor(data.circumventionEase)}`}>
              {data.circumventionEase ?? "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Methods */}
      <div className="plaid-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Verification Methods
        </h3>
        <div className="space-y-2">
          {(data.verificationMethods ?? []).map((method) => (
            <div key={method.method} className="flex items-start gap-2.5 text-sm">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 whitespace-nowrap flex-shrink-0 mt-0.5">
                {method.type}
              </span>
              <div>
                <span className="font-medium text-foreground">{method.method}</span>
                <span className="text-muted-foreground ml-1.5">&mdash; {method.details}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Age Tiers */}
      {(data.ageTiers ?? []).length > 0 && (
        <div className="plaid-card !p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground">Age Tiers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Tier</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Age Range</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Capabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(data.ageTiers ?? []).map((tier) => (
                  <tr key={tier.tier} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{tier.tier}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{tier.ageRange}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(tier.capabilities ?? []).map((cap) => (
                          <span key={cap} className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Circumvention Methods */}
      {(data.circumventionMethods ?? []).length > 0 && (
        <div className="plaid-card !p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Known Circumvention Methods
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Method</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Time to Bypass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(data.circumventionMethods ?? []).map((method) => (
                  <tr key={method.method} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 text-foreground">{method.method}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {method.timeToBypass}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
