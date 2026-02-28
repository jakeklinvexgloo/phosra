"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { SubNav } from "./SubNav"
import type {
  SafetyScorecard,
  AgeVerificationDetail,
  ParentalControlsDetail,
  ConversationControlsData,
  EmotionalSafetyData,
  AcademicIntegrityData,
  PrivacyDataDetail,
} from "@/lib/platform-research/research-data-types"

interface PlatformComparison {
  platformId: string
  platformName: string
  scorecard: SafetyScorecard | null
  ageVerification: AgeVerificationDetail | null
  parentalControls: ParentalControlsDetail | null
  conversationControls: ConversationControlsData | null
  emotionalSafety: EmotionalSafetyData | null
  academicIntegrity: AcademicIntegrityData | null
  privacyData: PrivacyDataDetail | null
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-600 dark:text-emerald-400"
  if (grade.startsWith("B")) return "text-blue-600 dark:text-blue-400"
  if (grade.startsWith("C")) return "text-amber-600 dark:text-amber-400"
  if (grade.startsWith("D")) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

export function CompareClient({ platforms }: { platforms: PlatformComparison[] }) {
  const [selected, setSelected] = useState<string[]>(
    platforms.slice(0, 3).map((p) => p.platformId)
  )

  const togglePlatform = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 2) setSelected(selected.filter((s) => s !== id))
    } else if (selected.length < 4) {
      setSelected([...selected, id])
    }
  }

  const compared = platforms.filter((p) => selected.includes(p.platformId))

  return (
    <div>
      <SubNav />

      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-display font-bold">Compare Platforms</h1>
          <p className="text-white/50 mt-2 text-sm">Select 2–4 platforms for side-by-side comparison</p>
        </div>
      </section>

      {/* Platform Selector */}
      <div className="sticky top-[calc(3.5rem+37px)] z-30 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p.platformId}
                onClick={() => togglePlatform(p.platformId)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selected.includes(p.platformId)
                    ? "bg-brand-green/10 text-brand-green border border-brand-green/30"
                    : "text-muted-foreground hover:text-foreground border border-border hover:bg-muted/50"
                }`}
              >
                {p.platformName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="relative overflow-x-auto -webkit-overflow-scrolling-touch rounded-lg border border-border">
          {/* Scroll hint shadow on the right */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent z-20 sm:hidden" />
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="sticky left-0 z-10 bg-muted/30 px-4 py-3 text-left font-medium text-foreground min-w-[140px] sm:min-w-[180px] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border">Dimension</th>
                {compared.map((p) => (
                  <th key={p.platformId} className="px-4 py-3 text-center font-medium text-foreground min-w-[120px]">
                    <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                      {p.platformName}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Safety Grade */}
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Safety Grade</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center">
                    {p.scorecard ? (
                      <span className={`text-lg font-bold ${gradeColor(p.scorecard.overallGrade)}`}>
                        {p.scorecard.overallGrade}
                      </span>
                    ) : "—"}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Numerical Score</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center text-muted-foreground">
                    {p.scorecard?.numericalScore ?? "—"}/100
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Full Blocks</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center text-emerald-600 font-medium">
                    {p.scorecard?.scoreDistribution.fullBlock ?? "—"}
                  </td>
                ))}
              </tr>
              {/* Age Verification */}
              <tr className="bg-muted/10">
                <td colSpan={compared.length + 1} className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Age Verification
                </td>
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Minimum Age</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center font-bold text-foreground">
                    {p.ageVerification ? `${p.ageVerification.minimumAge}+` : "—"}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Circumvention Ease</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {p.ageVerification?.circumventionEase ?? "—"}
                  </td>
                ))}
              </tr>
              {/* Parental Controls */}
              <tr className="bg-muted/10">
                <td colSpan={compared.length + 1} className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Parental Controls
                </td>
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Parent Linking</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {p.parentalControls?.linkingMechanism?.method ?? "—"}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Controls Available</td>
                {compared.map((p) => {
                  const cc = p.parentalControls?.configurableControls ?? []
                  return (
                    <td key={p.platformId} className="px-4 py-3 text-center text-muted-foreground">
                      {p.parentalControls ? `${cc.filter((c) => c.available).length}/${cc.length}` : "—"}
                    </td>
                  )
                })}
              </tr>
              {/* Conversation Controls */}
              <tr className="bg-muted/10">
                <td colSpan={compared.length + 1} className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Conversation Controls
                </td>
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Time Limits</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center">
                    <BoolIcon value={(p.conversationControls?.timeLimits ?? []).some((t) => t.available)} />
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Quiet Hours</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center">
                    <BoolIcon value={p.conversationControls?.quietHours?.available ?? false} />
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Break Reminders</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center">
                    <BoolIcon value={p.conversationControls?.breakReminders?.available ?? false} />
                  </td>
                ))}
              </tr>
              {/* Privacy */}
              <tr className="bg-muted/10">
                <td colSpan={compared.length + 1} className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Privacy &amp; Data
                </td>
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Regulatory Actions</td>
                {compared.map((p) => {
                  const raLen = (p.privacyData?.regulatoryActions ?? []).length
                  return (
                    <td key={p.platformId} className="px-4 py-3 text-center">
                      <span className={`font-medium ${raLen > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {p.privacyData ? raLen : "—"}
                      </span>
                    </td>
                  )
                })}
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-foreground">Study Mode</td>
                {compared.map((p) => (
                  <td key={p.platformId} className="px-4 py-3 text-center">
                    <BoolIcon value={p.academicIntegrity?.studyMode?.available ?? false} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BoolIcon({ value }: { value: boolean }) {
  return value
    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
    : <XCircle className="w-4 h-4 text-red-400 mx-auto" />
}
