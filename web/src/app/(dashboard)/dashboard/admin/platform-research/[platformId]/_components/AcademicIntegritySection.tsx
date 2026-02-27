"use client"

import {
  GraduationCap,
  BookOpen,
  Search,
  Eye,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { AcademicIntegrityData } from "@/lib/platform-research/research-data-types"

interface AcademicIntegritySectionProps {
  data: AcademicIntegrityData
}

export function AcademicIntegritySection({ data }: AcademicIntegritySectionProps) {
  return (
    <div className="space-y-6">
      {/* Adoption Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data.adoptionStats.map((stat) => (
          <div
            key={stat.metric}
            className="rounded-lg border border-border bg-muted/30 p-4"
          >
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.metric}</div>
          </div>
        ))}
      </div>

      {/* Homework Generation Capabilities */}
      <div className="plaid-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Homework Generation Capabilities
        </h3>
        <div className="space-y-2">
          {data.capabilities.map((cap) => (
            <div
              key={cap.feature}
              className="flex items-start gap-2.5 text-sm"
            >
              {cap.available ? (
                <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </span>
              ) : (
                <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                </span>
              )}
              <div>
                <span className="font-medium text-foreground">{cap.feature}</span>
                <span className="text-muted-foreground ml-1.5">&mdash; {cap.details}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Mode */}
      <div
        className={`plaid-card space-y-3 ${
          data.studyMode.available
            ? "border-emerald-200 dark:border-emerald-800"
            : "border-border"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Study Mode
          </h3>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
              data.studyMode.available
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                data.studyMode.available ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {data.studyMode.available ? "Available" : "Not Available"}
          </span>
        </div>
        {data.studyMode.launchDate && (
          <div className="text-xs text-muted-foreground">
            Launched: {data.studyMode.launchDate}
          </div>
        )}
        {data.studyMode.features.length > 0 && (
          <ul className="space-y-1.5">
            {data.studyMode.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detection Methods */}
      <div className="plaid-card space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Search className="w-4 h-4" />
          Detection Methods
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.detectionMethods.map((method) => (
            <div
              key={method.method}
              className="rounded-lg border border-border bg-muted/20 p-3 space-y-2"
            >
              <div className="text-sm font-medium text-foreground">{method.method}</div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Accuracy:</div>
                <AccuracyBadge accuracy={method.accuracy} />
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {method.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher/Parent Visibility Matrix */}
      <div className="plaid-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Teacher / Parent Visibility
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.teacherParentVisibility.map((row) => (
            <div
              key={row.dataPoint}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors"
            >
              <span className="text-sm text-foreground">{row.dataPoint}</span>
              {row.visible ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Visible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-500 dark:text-red-400">
                  <XCircle className="w-3.5 h-3.5" />
                  Not Visible
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Institution Policies */}
      <div className="plaid-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Institution Policies
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.institutionPolicies.map((item) => (
            <div
              key={item.metric}
              className="rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="text-lg font-bold text-foreground">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.metric}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AccuracyBadge({ accuracy }: { accuracy: string }) {
  if (!accuracy) return null
  const lower = accuracy.toLowerCase()
  let colorClasses: string

  if (lower.includes("high") || lower.includes("90") || lower.includes("95") || lower.includes("99")) {
    colorClasses =
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
  } else if (lower.includes("low") || lower.includes("unreliable") || lower.includes("poor")) {
    colorClasses =
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  } else {
    colorClasses =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  }

  return (
    <span
      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClasses}`}
    >
      {accuracy}
    </span>
  )
}
