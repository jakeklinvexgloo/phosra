"use client"

import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { PlatformResearchData } from "@/lib/platform-research/research-data-types"

interface DimensionCrosscutProps {
  dimensionId: string
  title: string
  description: string
  platforms: PlatformResearchData[]
}

function scoreBg(score: number): string {
  if (score < 0.5) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
  if (score < 1.5) return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
  if (score < 2.5) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
  if (score < 3.5) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200"
  return "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100"
}

export function DimensionCrosscut({ dimensionId, title, description, platforms }: DimensionCrosscutProps) {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <Link
            href="/ai-safety"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to AI Safety Portal
          </Link>
          <h1 className="text-3xl font-display font-bold">{title}</h1>
          <p className="text-white/50 mt-2 text-sm">{description}</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {dimensionId === "safety-testing" && <SafetyTestingCrosscut platforms={platforms} />}
        {dimensionId === "age-verification" && <AgeVerificationCrosscut platforms={platforms} />}
        {dimensionId === "parental-controls" && <ParentalControlsCrosscut platforms={platforms} />}
        {dimensionId === "conversation-controls" && <ConversationControlsCrosscut platforms={platforms} />}
        {dimensionId === "emotional-safety" && <EmotionalSafetyCrosscut platforms={platforms} />}
        {dimensionId === "academic-integrity" && <AcademicIntegrityCrosscut platforms={platforms} />}
        {dimensionId === "privacy-data" && <PrivacyDataCrosscut platforms={platforms} />}
      </div>
    </div>
  )
}

// ── Per-dimension comparison tables ─────────────────────────────────

function SafetyTestingCrosscut({ platforms }: { platforms: PlatformResearchData[] }) {
  const withScores = platforms.filter((p) => p.chatbotData?.safetyTesting?.scorecard)
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-foreground">Platform</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Grade</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Score</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Full Blocks</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Failures (2+)</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Grade Cap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {withScores.sort((a, b) =>
            (b.chatbotData!.safetyTesting!.scorecard.numericalScore ?? 0) -
            (a.chatbotData!.safetyTesting!.scorecard.numericalScore ?? 0)
          ).map((p) => {
            const sc = p.chatbotData!.safetyTesting!.scorecard
            const failures = sc.scoreDistribution.softWarning + sc.scoreDistribution.compliant + sc.scoreDistribution.enthusiastic
            return (
              <tr key={p.platformId} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                    {p.platformName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${scoreBg(sc.weightedAvgScore)}`}>
                    {sc.overallGrade}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{sc.numericalScore}/100</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-medium">{sc.scoreDistribution.fullBlock}</td>
                <td className="px-4 py-3 text-center text-red-600 font-medium">{failures}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">{sc.gradeCap ?? "—"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AgeVerificationCrosscut({ platforms }: { platforms: PlatformResearchData[] }) {
  const withData = platforms.filter((p) => p.chatbotData?.ageVerificationDetail)
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-foreground">Platform</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Min Age</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Methods</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Circumvention</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Age Tiers</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {withData.map((p) => {
            const av = p.chatbotData!.ageVerificationDetail!
            return (
              <tr key={p.platformId} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                    {p.platformName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center font-bold text-foreground">{av.minimumAge ?? "?"}+</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(av.verificationMethods ?? []).map((m) => (
                      <span key={m.method} className="inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {m.type}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <EaseBadge ease={av.circumventionEase} />
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{(av.ageTiers ?? []).length}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ParentalControlsCrosscut({ platforms }: { platforms: PlatformResearchData[] }) {
  const withData = platforms.filter((p) => p.chatbotData?.parentalControlsDetail)
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-foreground">Platform</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Linking</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Visible Data Points</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Controls Available</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Bypass Methods</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {withData.map((p) => {
            const pc = p.chatbotData!.parentalControlsDetail!
            const vm = pc.visibilityMatrix ?? []
            const cc = pc.configurableControls ?? []
            const bv = pc.bypassVulnerabilities ?? []
            const visibleCount = vm.filter((v) => v.visible).length
            const controlsAvailable = cc.filter((c) => c.available).length
            return (
              <tr key={p.platformId} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                    {p.platformName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{pc.linkingMechanism?.method ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-foreground">{visibleCount}</span>
                  <span className="text-muted-foreground">/{vm.length}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-foreground">{controlsAvailable}</span>
                  <span className="text-muted-foreground">/{cc.length}</span>
                </td>
                <td className="px-4 py-3 text-center text-red-600 font-medium">{bv.length}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ConversationControlsCrosscut({ platforms }: { platforms: PlatformResearchData[] }) {
  const withData = platforms.filter((p) => p.chatbotData?.conversationControls)
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-foreground">Platform</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Time Limits</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Quiet Hours</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Break Reminders</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Rate Limits</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {withData.map((p) => {
            const cc = p.chatbotData!.conversationControls!
            const hasTimeLimits = (cc.timeLimits ?? []).some((t) => t.available)
            const mlLen = (cc.messageLimits ?? []).length
            return (
              <tr key={p.platformId} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                    {p.platformName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <BoolIcon value={hasTimeLimits} />
                </td>
                <td className="px-4 py-3 text-center">
                  <BoolIcon value={cc.quietHours?.available ?? false} />
                </td>
                <td className="px-4 py-3 text-center">
                  <BoolIcon value={cc.breakReminders?.available ?? false} />
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {mlLen} tier{mlLen !== 1 ? "s" : ""}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EmotionalSafetyCrosscut({ platforms }: { platforms: PlatformResearchData[] }) {
  const withData = platforms.filter((p) => p.chatbotData?.emotionalSafety)
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-foreground">Platform</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Retention Tactics</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">AI Disclosure</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Proactive</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Sycophancy Incidents</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {withData.map((p) => {
            const es = p.chatbotData!.emotionalSafety!
            const rt = es.retentionTactics ?? []
            const retentionPresent = rt.filter((t) => t.present).length
            return (
              <tr key={p.platformId} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                    {p.platformName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${retentionPresent > 2 ? "text-red-600" : retentionPresent > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {retentionPresent}
                  </span>
                  <span className="text-muted-foreground">/{rt.length}</span>
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground text-xs">{es.aiIdentityDisclosure?.frequency ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <BoolIcon value={es.aiIdentityDisclosure?.proactive ?? false} />
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{(es.sycophancyIncidents ?? []).length}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AcademicIntegrityCrosscut({ platforms }: { platforms: PlatformResearchData[] }) {
  const withData = platforms.filter((p) => p.chatbotData?.academicIntegrity)
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-foreground">Platform</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Study Mode</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Capabilities</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Detection Methods</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Parent Visibility</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {withData.map((p) => {
            const ai = p.chatbotData!.academicIntegrity!
            const caps = ai.capabilities ?? []
            const tpv = ai.teacherParentVisibility ?? []
            const capAvailable = caps.filter((c) => c.available).length
            const parentVisible = tpv.filter((v) => v.visible).length
            return (
              <tr key={p.platformId} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                    {p.platformName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <BoolIcon value={ai.studyMode?.available ?? false} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-foreground">{capAvailable}</span>
                  <span className="text-muted-foreground">/{caps.length}</span>
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{(ai.detectionMethods ?? []).length}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-foreground">{parentVisible}</span>
                  <span className="text-muted-foreground">/{tpv.length}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PrivacyDataCrosscut({ platforms }: { platforms: PlatformResearchData[] }) {
  const withData = platforms.filter((p) => p.chatbotData?.privacyDataDetail)
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-foreground">Platform</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Data Types</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Regulatory Actions</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">Memory Features</th>
            <th className="px-4 py-3 text-center font-medium text-foreground">User Control</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {withData.map((p) => {
            const pd = p.chatbotData!.privacyDataDetail!
            const dc = pd.dataCollection ?? []
            const ra = pd.regulatoryActions ?? []
            const mf = pd.memoryFeatures ?? []
            const userControlled = mf.filter((f) => f.userControl).length
            return (
              <tr key={p.platformId} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/ai-safety/${p.platformId}`} className="hover:text-brand-green transition-colors">
                    {p.platformName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{dc.length}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${ra.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {ra.length}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{mf.length}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-foreground">{userControlled}</span>
                  <span className="text-muted-foreground">/{mf.length}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────

function BoolIcon({ value }: { value: boolean }) {
  return value
    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
    : <XCircle className="w-4 h-4 text-red-400 mx-auto" />
}

function EaseBadge({ ease }: { ease: string | undefined | null }) {
  if (!ease) return <span className="text-muted-foreground text-xs">—</span>
  const lower = ease.toLowerCase()
  const cls = lower.includes("trivial")
    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    : lower.includes("easy")
      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
      : lower.includes("moderate")
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
  return (
    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {ease}
    </span>
  )
}
