"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Shield,
  UserCheck,
  Lock,
  MessageSquare,
  Heart,
  BookOpen,
  Database,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  AlertTriangle,
  Zap,
  Clock,
  type LucideIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { PlatformResearchData } from "@/lib/platform-research/research-data-types"
import { AgeVerificationSection } from "@/components/platform-research/AgeVerificationSection"
import { ParentalControlsSection } from "@/components/platform-research/ParentalControlsSection"
import { PrivacyDataSection } from "@/components/platform-research/PrivacyDataSection"
import { SafetyTestingContent } from "./SafetyTestingContent"
import { ConversationControlsContent } from "./ConversationControlsContent"
import { EmotionalSafetyContent } from "./EmotionalSafetyContent"
import { AcademicIntegrityContent } from "./AcademicIntegrityContent"
import { PhosraGapSection } from "./PhosraGapSection"
import { Breadcrumbs } from "./Breadcrumbs"

// ── Grade Helpers ───────────────────────────────────────────────────

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-500"
  if (grade.startsWith("B")) return "text-blue-500"
  if (grade.startsWith("C")) return "text-amber-500"
  if (grade.startsWith("D")) return "text-orange-500"
  if (grade === "F") return "text-red-500"
  return "text-muted-foreground"
}

function gradeBg(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-100 dark:bg-emerald-900/30"
  if (grade.startsWith("B")) return "bg-blue-100 dark:bg-blue-900/30"
  if (grade.startsWith("C")) return "bg-amber-100 dark:bg-amber-900/30"
  if (grade.startsWith("D")) return "bg-orange-100 dark:bg-orange-900/30"
  if (grade === "F") return "bg-red-100 dark:bg-red-900/30"
  return "bg-muted"
}

// ── Risk Badge Helpers ──────────────────────────────────────────────

type RiskLevel = "green" | "yellow" | "red"

function riskBadgeClasses(level: RiskLevel): string {
  switch (level) {
    case "green":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    case "yellow":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    case "red":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  }
}

function gradeRiskLevel(grade: string): RiskLevel {
  if (grade.startsWith("A")) return "green"
  if (grade.startsWith("B")) return "yellow"
  return "red"
}

function circumventionRiskLevel(ease: string): RiskLevel {
  const lower = ease.toLowerCase()
  if (lower.includes("difficult")) return "green"
  if (lower.includes("moderate")) return "yellow"
  return "red"
}

// ── Executive Summary Generator ─────────────────────────────────────

function generateExecutiveSummary(data: PlatformResearchData): string | null {
  const scorecard = data.chatbotData?.safetyTesting?.scorecard
  if (!scorecard) return null

  const parts: string[] = []

  // Weakest categories (worst avgScore)
  const sorted = [...scorecard.categoryScores].sort((a, b) => b.avgScore - a.avgScore)
  const weakest = sorted.filter((c) => c.avgScore >= 1.5).slice(0, 2)
  const weakStr = weakest
    .map((c) => `${c.label.toLowerCase()} (score ${c.avgScore.toFixed(1)}/4)`)
    .join(" and ")

  parts.push(
    `${data.platformName} scored ${scorecard.overallGrade} (${scorecard.numericalScore}/100)${
      weakStr ? ` with notable weaknesses in ${weakStr}` : ""
    }.`
  )

  if (scorecard.gradeCap && scorecard.gradeCapReasons?.length) {
    parts.push(`Grade capped at ${scorecard.gradeCap} due to ${scorecard.gradeCapReasons[0].toLowerCase()}.`)
  }

  // Count concerning dimensions
  const concerning: string[] = []
  if (data.chatbotData?.ageVerificationDetail) {
    const ease = data.chatbotData.ageVerificationDetail.circumventionEase?.toLowerCase() ?? ""
    if (ease.includes("trivial") || ease.includes("easy")) concerning.push("age verification")
  }
  if (scorecard.criticalFailures.length > 0) concerning.push("safety testing")
  if (data.chatbotData?.emotionalSafety?.retentionTactics?.some((t) => t.present))
    concerning.push("emotional safety")
  if (data.chatbotData?.privacyDataDetail?.regulatoryActions?.length)
    concerning.push("privacy")

  if (concerning.length > 0) {
    parts.push(`${concerning.length} research dimension${concerning.length !== 1 ? "s have" : " has"} concerning findings.`)
  }

  return parts.join(" ")
}

// ── Key Findings Generator ──────────────────────────────────────────

interface KeyFinding {
  text: string
  severity: "critical" | "warning" | "info"
}

function generateKeyFindings(data: PlatformResearchData): KeyFinding[] {
  const findings: KeyFinding[] = []
  const scorecard = data.chatbotData?.safetyTesting?.scorecard

  // Critical failures from safety testing
  if (scorecard?.criticalFailures.length) {
    const count = scorecard.criticalFailures.length
    const highRisk = scorecard.criticalFailures.filter((f) => f.riskLevel === "HIGH")
    if (highRisk.length > 0) {
      findings.push({
        text: `${highRisk.length} HIGH-risk critical failure${highRisk.length !== 1 ? "s" : ""} in safety testing: ${highRisk
          .slice(0, 2)
          .map((f) => f.category.toLowerCase())
          .join(", ")}`,
        severity: "critical",
      })
    } else {
      findings.push({
        text: `${count} critical failure${count !== 1 ? "s" : ""} detected in safety testing`,
        severity: "critical",
      })
    }
  }

  // Age verification weakness
  if (data.chatbotData?.ageVerificationDetail) {
    const ease = data.chatbotData.ageVerificationDetail.circumventionEase?.toLowerCase() ?? ""
    if (ease.includes("trivial") || ease.includes("easy")) {
      findings.push({
        text: `Age verification bypass rated "${data.chatbotData.ageVerificationDetail.circumventionEase}" — minors can easily circumvent age gates`,
        severity: "critical",
      })
    }
  }

  // Retention tactics
  if (data.chatbotData?.emotionalSafety?.retentionTactics) {
    const present = data.chatbotData.emotionalSafety.retentionTactics.filter((t) => t.present)
    if (present.length > 0) {
      findings.push({
        text: `${present.length} emotional retention tactic${present.length !== 1 ? "s" : ""} detected: ${present
          .slice(0, 2)
          .map((t) => t.tactic.toLowerCase())
          .join(", ")}`,
        severity: "warning",
      })
    }
  }

  // Regulatory actions
  if (data.chatbotData?.privacyDataDetail?.regulatoryActions?.length) {
    const count = data.chatbotData.privacyDataDetail.regulatoryActions.length
    const fines = data.chatbotData.privacyDataDetail.regulatoryActions
      .filter((a) => a.fineAmount)
      .map((a) => a.fineAmount)
    findings.push({
      text: `${count} regulatory action${count !== 1 ? "s" : ""}${fines.length ? ` including fines of ${fines.join(", ")}` : ""}`,
      severity: "warning",
    })
  }

  // Weakest safety category
  if (scorecard?.categoryScores.length) {
    const worst = [...scorecard.categoryScores].sort((a, b) => b.avgScore - a.avgScore)[0]
    if (worst && worst.avgScore >= 2.0) {
      findings.push({
        text: `Weakest safety category: ${worst.label} (avg score ${worst.avgScore.toFixed(1)}/4, grade ${worst.grade})`,
        severity: "warning",
      })
    }
  }

  // Parental controls gaps
  if (data.chatbotData?.parentalControlsDetail?.configurableControls) {
    const available = data.chatbotData.parentalControlsDetail.configurableControls.filter((c) => c.available).length
    const total = data.chatbotData.parentalControlsDetail.configurableControls.length
    if (total > 0 && available / total < 0.5) {
      findings.push({
        text: `Only ${available} of ${total} parental controls available — significant gaps in parent oversight`,
        severity: "warning",
      })
    }
  }

  return findings.slice(0, 4)
}

// ── Reading Time Estimator ──────────────────────────────────────────

function estimateReadingTime(data: PlatformResearchData): number {
  let wordEstimate = 0
  const cd = data.chatbotData

  if (cd?.safetyTesting) {
    wordEstimate += cd.safetyTesting.results.length * 30
    wordEstimate += cd.safetyTesting.scorecard.categoryScores.length * 20
    wordEstimate += cd.safetyTesting.scorecard.criticalFailures.length * 40
  }
  if (cd?.ageVerificationDetail) {
    wordEstimate += (cd.ageVerificationDetail.verificationMethods?.length ?? 0) * 20
    wordEstimate += (cd.ageVerificationDetail.ageTiers?.length ?? 0) * 15
    wordEstimate += (cd.ageVerificationDetail.circumventionMethods?.length ?? 0) * 15
    wordEstimate += 100
  }
  if (cd?.parentalControlsDetail) {
    wordEstimate += (cd.parentalControlsDetail.configurableControls?.length ?? 0) * 15
    wordEstimate += (cd.parentalControlsDetail.visibilityMatrix?.length ?? 0) * 10
    wordEstimate += 100
  }
  if (cd?.conversationControls) {
    wordEstimate += (cd.conversationControls.timeLimits?.length ?? 0) * 15
    wordEstimate += (cd.conversationControls.featureMatrix?.length ?? 0) * 10
    wordEstimate += 80
  }
  if (cd?.emotionalSafety) {
    wordEstimate += (cd.emotionalSafety.retentionTactics?.length ?? 0) * 20
    wordEstimate += (cd.emotionalSafety.sycophancyIncidents?.length ?? 0) * 30
    wordEstimate += (cd.emotionalSafety.policyTimeline?.length ?? 0) * 15
    wordEstimate += 100
  }
  if (cd?.academicIntegrity) {
    wordEstimate += (cd.academicIntegrity.capabilities?.length ?? 0) * 15
    wordEstimate += (cd.academicIntegrity.detectionMethods?.length ?? 0) * 20
    wordEstimate += 80
  }
  if (cd?.privacyDataDetail) {
    wordEstimate += (cd.privacyDataDetail.dataCollection?.length ?? 0) * 15
    wordEstimate += (cd.privacyDataDetail.regulatoryActions?.length ?? 0) * 30
    wordEstimate += 100
  }

  return Math.max(3, Math.ceil(wordEstimate / 250))
}

// ── Section-level Risk Badges ───────────────────────────────────────

function getSectionBadge(
  sectionId: string,
  data: PlatformResearchData
): { label: string; level: RiskLevel } | null {
  const cd = data.chatbotData
  switch (sectionId) {
    case "safety-testing": {
      const grade = cd?.safetyTesting?.scorecard.overallGrade
      if (!grade) return null
      return { label: grade, level: gradeRiskLevel(grade) }
    }
    case "age-verification": {
      const ease = cd?.ageVerificationDetail?.circumventionEase
      if (!ease) return null
      return { label: ease, level: circumventionRiskLevel(ease) }
    }
    case "parental-controls": {
      const ctrls = cd?.parentalControlsDetail?.configurableControls
      if (!ctrls?.length) return null
      const available = ctrls.filter((c) => c.available).length
      const ratio = available / ctrls.length
      return {
        label: `${available}/${ctrls.length} controls`,
        level: ratio >= 0.7 ? "green" : ratio >= 0.4 ? "yellow" : "red",
      }
    }
    case "conversation-controls": {
      const cc = cd?.conversationControls
      if (!cc) return null
      let count = 0
      if (cc.quietHours?.available) count++
      if (cc.breakReminders?.available) count++
      if (cc.followUpSuggestions?.available) count++
      const timeLimitAvail = (cc.timeLimits ?? []).filter((t) => t.available).length
      count += timeLimitAvail
      return {
        label: `${count} features`,
        level: count >= 3 ? "green" : count >= 1 ? "yellow" : "red",
      }
    }
    case "emotional-safety": {
      const tactics = cd?.emotionalSafety?.retentionTactics
      if (!tactics?.length) return null
      const present = tactics.filter((t) => t.present).length
      return {
        label: `${present} tactic${present !== 1 ? "s" : ""} found`,
        level: present === 0 ? "green" : present <= 2 ? "yellow" : "red",
      }
    }
    case "academic-integrity": {
      const sm = cd?.academicIntegrity?.studyMode
      if (!sm) return null
      return {
        label: sm.available ? "Study mode" : "No study mode",
        level: sm.available ? "green" : "yellow",
      }
    }
    case "privacy-data": {
      const actions = cd?.privacyDataDetail?.regulatoryActions
      if (!actions) return null
      const count = actions.length
      return {
        label: `${count} action${count !== 1 ? "s" : ""}`,
        level: count === 0 ? "green" : count <= 2 ? "yellow" : "red",
      }
    }
    default:
      return null
  }
}

// ── Section Card ────────────────────────────────────────────────────

function SectionCard({
  id,
  title,
  icon: Icon,
  badge,
  riskBadge,
  children,
  defaultCollapsed = false,
}: {
  id: string
  title: string
  icon: LucideIcon
  badge?: string
  riskBadge?: { label: string; level: RiskLevel } | null
  children: React.ReactNode
  defaultCollapsed?: boolean
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-lg border border-border bg-card p-5 sm:p-6 scroll-mt-20"
    >
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="flex items-center gap-2.5 w-full text-left group"
      >
        <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <h2 className="text-lg font-semibold text-foreground flex-1">{title}</h2>
        {riskBadge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskBadgeClasses(riskBadge.level)}`}>
            {riskBadge.label}
          </span>
        )}
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {badge}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            collapsed ? "" : "rotate-180"
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border/50">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

// ── Section Definitions ─────────────────────────────────────────────

interface SectionDef {
  id: string
  label: string
  icon: LucideIcon
}

const SECTIONS: SectionDef[] = [
  { id: "safety-testing", label: "Safety Testing", icon: Shield },
  { id: "age-verification", label: "Age Verification", icon: UserCheck },
  { id: "parental-controls", label: "Parental Controls", icon: Lock },
  { id: "conversation-controls", label: "Conversation Controls", icon: MessageSquare },
  { id: "emotional-safety", label: "Emotional Safety", icon: Heart },
  { id: "academic-integrity", label: "Academic Integrity", icon: BookOpen },
  { id: "privacy-data", label: "Privacy & Data", icon: Database },
  { id: "phosra-integration", label: "Phosra Integration", icon: Zap },
]

// ── Main Component ──────────────────────────────────────────────────

interface PlatformDetailClientProps {
  data: PlatformResearchData
}

export function PlatformDetailClient({ data }: PlatformDetailClientProps) {
  const [activeSection, setActiveSection] = useState("safety-testing")
  const scorecard = data.chatbotData?.safetyTesting?.scorecard

  const executiveSummary = useMemo(() => generateExecutiveSummary(data), [data])
  const keyFindings = useMemo(() => generateKeyFindings(data), [data])
  const readingTime = useMemo(() => estimateReadingTime(data), [data])

  // Filter sections to only those with data
  const availableSections = SECTIONS.filter((s) => {
    switch (s.id) {
      case "safety-testing":
        return !!data.chatbotData?.safetyTesting
      case "age-verification":
        return !!data.chatbotData?.ageVerificationDetail
      case "parental-controls":
        return !!data.chatbotData?.parentalControlsDetail
      case "conversation-controls":
        return !!data.chatbotData?.conversationControls
      case "emotional-safety":
        return !!data.chatbotData?.emotionalSafety
      case "academic-integrity":
        return !!data.chatbotData?.academicIntegrity
      case "privacy-data":
        return !!data.chatbotData?.privacyDataDetail
      case "phosra-integration":
        return !!data.sectionData?.integrationGap
      default:
        return false
    }
  })

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <Breadcrumbs
            items={[
              { label: "AI Safety", href: "/research/ai-chatbots" },
              { label: "Platforms" },
              { label: data.platformName },
            ]}
          />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">{data.platformName}</h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-white/50 text-sm">
                  Comprehensive safety research across {availableSections.length} dimensions
                </p>
                <span className="inline-flex items-center gap-1 text-white/40 text-xs">
                  <Clock className="w-3 h-3" />
                  ~{readingTime} min read
                </span>
              </div>
              {executiveSummary && (
                <p className="text-white/60 text-sm mt-3 max-w-2xl leading-relaxed">
                  {executiveSummary}
                </p>
              )}
            </div>

            {scorecard && (
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className={`flex flex-col items-center px-5 py-3 rounded-xl ${gradeBg(scorecard.overallGrade)}`}>
                  <span className={`text-3xl font-bold ${gradeColor(scorecard.overallGrade)}`}>
                    {scorecard.overallGrade}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {scorecard.numericalScore}/100
                  </span>
                </div>
                <div className="text-sm text-white/60 space-y-1">
                  <div>{scorecard.completedTests}/{scorecard.totalTests} tests scored</div>
                  {scorecard.gradeCap && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      Capped at {scorecard.gradeCap}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Navigation */}
      <div className="sticky top-14 z-30 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {availableSections.map((s) => {
              const Icon = s.icon
              const isActive = activeSection === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-brand-green/10 text-brand-green"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 space-y-6">
        {/* Key Findings Summary */}
        {keyFindings.length > 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Key Findings
            </h3>
            <ul className="space-y-2">
              {keyFindings.map((finding, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      finding.severity === "critical"
                        ? "bg-red-500"
                        : finding.severity === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <span className="text-foreground/80">{finding.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Testing */}
        {data.chatbotData?.safetyTesting && (
          <SectionCard
            id="safety-testing"
            title="Safety Testing"
            icon={Shield}
            riskBadge={getSectionBadge("safety-testing", data)}
            badge={`${data.chatbotData.safetyTesting.scorecard.completedTests} tests`}
          >
            <SafetyTestingContent data={data.chatbotData.safetyTesting} />
          </SectionCard>
        )}

        {/* Age Verification */}
        {data.chatbotData?.ageVerificationDetail && (
          <SectionCard
            id="age-verification"
            title="Age Verification"
            icon={UserCheck}
            riskBadge={getSectionBadge("age-verification", data)}
          >
            <AgeVerificationSection data={data.chatbotData.ageVerificationDetail} />
          </SectionCard>
        )}

        {/* Parental Controls */}
        {data.chatbotData?.parentalControlsDetail && (
          <SectionCard
            id="parental-controls"
            title="Parental Controls"
            icon={Lock}
            riskBadge={getSectionBadge("parental-controls", data)}
          >
            <ParentalControlsSection data={data.chatbotData.parentalControlsDetail} />
          </SectionCard>
        )}

        {/* Conversation Controls */}
        {data.chatbotData?.conversationControls && (
          <SectionCard
            id="conversation-controls"
            title="Conversation Controls"
            icon={MessageSquare}
            riskBadge={getSectionBadge("conversation-controls", data)}
          >
            <ConversationControlsContent data={data.chatbotData.conversationControls} />
          </SectionCard>
        )}

        {/* Emotional Safety */}
        {data.chatbotData?.emotionalSafety && (
          <SectionCard
            id="emotional-safety"
            title="Emotional Safety"
            icon={Heart}
            riskBadge={getSectionBadge("emotional-safety", data)}
          >
            <EmotionalSafetyContent data={data.chatbotData.emotionalSafety} />
          </SectionCard>
        )}

        {/* Academic Integrity */}
        {data.chatbotData?.academicIntegrity && (
          <SectionCard
            id="academic-integrity"
            title="Academic Integrity"
            icon={BookOpen}
            riskBadge={getSectionBadge("academic-integrity", data)}
          >
            <AcademicIntegrityContent data={data.chatbotData.academicIntegrity} />
          </SectionCard>
        )}

        {/* Privacy & Data */}
        {data.chatbotData?.privacyDataDetail && (
          <SectionCard
            id="privacy-data"
            title="Privacy & Data"
            icon={Database}
            riskBadge={getSectionBadge("privacy-data", data)}
          >
            <PrivacyDataSection data={data.chatbotData.privacyDataDetail} />
          </SectionCard>
        )}

        {/* Phosra Integration */}
        {data.sectionData?.integrationGap && (
          <SectionCard id="phosra-integration" title="Phosra Integration" icon={Zap}>
            <PhosraGapSection
              gap={data.sectionData.integrationGap}
              enforcement={data.sectionData?.enforcementFlow}
            />
          </SectionCard>
        )}
      </div>

      {/* Next/Prev Navigation */}
      <div className="border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-6 flex justify-between">
          <Link
            href="/research/ai-chatbots"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Platforms
          </Link>
          <Link
            href="/research/ai-chatbots/phosra-controls"
            className="inline-flex items-center gap-1.5 text-sm text-brand-green hover:text-brand-green/80 transition-colors font-medium"
          >
            Phosra Controls Matrix
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
