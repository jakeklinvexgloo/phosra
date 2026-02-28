"use client"

import {
  Database,
  Brain,
  Gavel,
  HardDrive,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { PrivacyDataDetail } from "@/lib/platform-research/research-data-types"

interface PrivacyDataSectionProps {
  data: PrivacyDataDetail
}

export function PrivacyDataSection({ data }: PrivacyDataSectionProps) {
  return (
    <div className="space-y-6">
      {/* Data Collection */}
      <div className="plaid-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Collection
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Data Type</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Retention</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(data.dataCollection ?? []).map((item) => (
                <tr key={item.dataType} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{item.dataType}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {item.retention}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{item.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Training */}
      <div className="plaid-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Model Training Policies
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2.5 text-left font-medium text-foreground">User Type</th>
                <th className="px-4 py-2.5 text-center font-medium text-foreground">Default Opt-In</th>
                <th className="px-4 py-2.5 text-center font-medium text-foreground">Opt-Out Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(data.modelTraining ?? []).map((item) => (
                <tr key={item.userType} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{item.userType}</td>
                  <td className="px-4 py-2.5 text-center">
                    {item.defaultOptIn ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Opted In
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Opted Out
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {item.optOutAvailable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory Actions */}
      {(data.regulatoryActions ?? []).length > 0 && (
        <div className="plaid-card !p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              Regulatory Actions &amp; Fines
            </h3>
          </div>
          <div className="divide-y divide-border/50">
            {(data.regulatoryActions ?? []).map((action, i) => (
              <div key={i} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {action.jurisdiction}
                  </span>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    action.status.toLowerCase().includes("settled") || action.status.toLowerCase().includes("resolved")
                      ? "bg-muted text-muted-foreground"
                      : action.status.toLowerCase().includes("pending") || action.status.toLowerCase().includes("ongoing")
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}>
                    {action.status}
                  </span>
                  {action.fineAmount && (
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {action.fineAmount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{action.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Features */}
      {(data.memoryFeatures ?? []).length > 0 && (
        <div className="plaid-card !p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Memory &amp; Persistence Features
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Feature</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Scope</th>
                  <th className="px-4 py-2.5 text-center font-medium text-foreground">User Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(data.memoryFeatures ?? []).map((feat) => (
                  <tr key={feat.feature} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{feat.feature}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{feat.scope}</td>
                    <td className="px-4 py-2.5 text-center">
                      {feat.userControl ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                      )}
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
