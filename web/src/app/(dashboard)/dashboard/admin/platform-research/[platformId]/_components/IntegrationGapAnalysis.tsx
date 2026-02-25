"use client"

import {
  Clock,
  Bell,
  Moon,
  Shield,
  ArrowRight,
  Lock,
  KeyRound,
  Database,
  AlertTriangle,
  Eye,
  type LucideIcon,
} from "lucide-react"
import { SectionCard } from "./SectionCard"
import type { IntegrationGapData } from "@/lib/platform-research/research-data-types"

const ICON_MAP: Record<string, LucideIcon> = {
  Clock, Bell, Moon, Shield, ArrowRight, Lock, KeyRound, Database, AlertTriangle, Eye,
}

interface IntegrationGapAnalysisProps {
  data: IntegrationGapData
}

function sensitivityBadge(level: string) {
  switch (level) {
    case "Critical":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    case "High":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    case "Medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function IntegrationGapAnalysis({ data }: IntegrationGapAnalysisProps) {
  const gapCount = data.stats.find((s) => s.label === "Phosra-Added")?.value ?? 0

  return (
    <SectionCard
      id="integration-gap-analysis"
      title={`What Phosra Adds to ${data.platformName}`}
      icon={Shield}
      badge={`${gapCount} gaps filled`}
    >
      <div className="space-y-8">
        {/* Report card stats */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
            Rule Category Coverage (of 45 total)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.stats.map((s) => (
              <div
                key={s.label}
                className={`rounded-lg px-4 py-3 text-center ${s.color}`}
              >
                <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-xs font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gap opportunity cards */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
            Key Gap Opportunities
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.gapOpportunities.map((gap) => {
              const Icon = ICON_MAP[gap.icon] ?? Clock
              return (
                <div
                  key={gap.title}
                  className="plaid-card border border-border/50 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {gap.title}
                    </h4>
                  </div>
                  <div>
                    <div className="text-[10px] text-red-500 dark:text-red-400 uppercase tracking-wide font-medium mb-1">
                      {gap.gapLabel}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {gap.gap}
                    </p>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide font-medium mb-1">
                      {gap.solutionLabel}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {gap.solution}
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {gap.ruleCategory}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Integration architecture diagram */}
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
            Integration Architecture
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-0 rounded-lg border border-border overflow-hidden">
            {/* Phosra Platform box */}
            <div className="flex-1 p-4 bg-accent/5 border-b md:border-b-0 md:border-r border-border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">Phosra Platform</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Orchestrates rules, schedules, and parent notifications
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center px-1 text-muted-foreground">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="flex md:hidden items-center justify-center py-1 text-muted-foreground">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            {/* Adapter box */}
            <div className="flex-[1.5] p-4 bg-muted/30 border-b md:border-b-0 md:border-r border-border">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{data.adapterName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.adapterLayers.map((layer) => (
                  <div
                    key={layer.label}
                    className={`text-[10px] font-medium px-2.5 py-1.5 rounded border text-center ${layer.color}`}
                  >
                    {layer.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center px-1 text-muted-foreground">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="flex md:hidden items-center justify-center py-1 text-muted-foreground">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            {/* Platform box */}
            <div className="flex-1 p-4" style={{ backgroundColor: `${data.platformBgColor}` }}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center"
                  style={{ backgroundColor: data.platformIconBg }}
                >
                  <span className="text-white text-[8px] font-bold">{data.platformIconLetter}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{data.platformName}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.apiDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Credential requirements table */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4 text-muted-foreground" />
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Credential Requirements
            </div>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Credential
                  </th>
                  <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Purpose
                  </th>
                  <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Sensitivity
                  </th>
                  <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                    Encryption
                  </th>
                  <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Retention
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.credentials.map((cred) => (
                  <tr key={cred.name}>
                    <td className="px-3 py-2 text-xs font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        {cred.name}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {cred.purpose}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${sensitivityBadge(cred.sensitivity)}`}
                      >
                        {cred.sensitivity}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground hidden sm:table-cell">
                      {cred.encryption}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">
                      {cred.retention}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
