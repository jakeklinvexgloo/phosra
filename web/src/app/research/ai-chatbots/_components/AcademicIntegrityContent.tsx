"use client"

import {
  BookOpen,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react"
import type { AcademicIntegrityData } from "@/lib/platform-research/research-data-types"

export function AcademicIntegrityContent({ data }: { data: AcademicIntegrityData }) {
  return (
    <div className="space-y-6">
      {/* Adoption Stats */}
      {(data.adoptionStats ?? []).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(data.adoptionStats ?? []).map((stat) => (
            <div key={stat.metric} className="rounded-lg border border-border bg-card p-3 space-y-1">
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.metric}</div>
            </div>
          ))}
        </div>
      )}

      {/* Capabilities */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Homework & Assignment Capabilities
        </h3>
        <div className="space-y-2">
          {(data.capabilities ?? []).map((cap) => (
            <div key={cap.feature} className="flex items-start gap-2.5 text-sm">
              {cap.available ? (
                <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </span>
              ) : (
                <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Study Mode
          </h3>
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
            data.studyMode?.available
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}>
            {data.studyMode?.available ? "Available" : "Not Available"}
          </span>
        </div>
        {data.studyMode?.launchDate && (
          <p className="text-[10px] text-muted-foreground">Launched: {data.studyMode.launchDate}</p>
        )}
        {(data.studyMode?.features ?? []).length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1">
            {(data.studyMode?.features ?? []).map((f, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-brand-green mt-0.5">&#x2022;</span>
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detection Methods */}
      {(data.detectionMethods ?? []).length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Search className="w-4 h-4" />
              Detection Methods
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Method</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Accuracy</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(data.detectionMethods ?? []).map((m) => {
                  const accLower = m.accuracy.toLowerCase()
                  const accColor = accLower.includes("high")
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : accLower.includes("medium") || accLower.includes("moderate")
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  return (
                    <tr key={m.method} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-foreground">{m.method}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${accColor}`}>
                          {m.accuracy}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{m.details}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher/Parent Visibility */}
      {(data.teacherParentVisibility ?? []).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Teacher/Parent Visibility</h3>
          <div className="space-y-1.5">
            {(data.teacherParentVisibility ?? []).map((item) => (
              <div key={item.dataPoint} className="flex items-center gap-2.5 text-sm">
                {item.visible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span className="text-foreground">{item.dataPoint}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Institution Policies */}
      {(data.institutionPolicies ?? []).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(data.institutionPolicies ?? []).map((pol) => (
            <div key={pol.metric} className="rounded-lg border border-border bg-card p-3 space-y-1">
              <div className="text-lg font-bold text-foreground">{pol.value}</div>
              <div className="text-[10px] text-muted-foreground">{pol.metric}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
