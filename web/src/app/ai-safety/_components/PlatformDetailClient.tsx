"use client"

import { useState } from "react"
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

// ── Section Card ────────────────────────────────────────────────────

function SectionCard({
  id,
  title,
  icon: Icon,
  badge,
  children,
  defaultCollapsed = false,
}: {
  id: string
  title: string
  icon: LucideIcon
  badge?: string
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
          <Link
            href="/ai-safety"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Platforms
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">{data.platformName}</h1>
              <p className="text-white/50 mt-2 text-sm">
                Comprehensive safety research across {availableSections.length} dimensions
              </p>
            </div>

            {scorecard && (
              <div className="flex items-center gap-4">
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
        {/* Safety Testing */}
        {data.chatbotData?.safetyTesting && (
          <SectionCard
            id="safety-testing"
            title="Safety Testing"
            icon={Shield}
            badge={`${data.chatbotData.safetyTesting.scorecard.completedTests} tests`}
          >
            <SafetyTestingContent data={data.chatbotData.safetyTesting} />
          </SectionCard>
        )}

        {/* Age Verification */}
        {data.chatbotData?.ageVerificationDetail && (
          <SectionCard id="age-verification" title="Age Verification" icon={UserCheck}>
            <AgeVerificationSection data={data.chatbotData.ageVerificationDetail} />
          </SectionCard>
        )}

        {/* Parental Controls */}
        {data.chatbotData?.parentalControlsDetail && (
          <SectionCard id="parental-controls" title="Parental Controls" icon={Lock}>
            <ParentalControlsSection data={data.chatbotData.parentalControlsDetail} />
          </SectionCard>
        )}

        {/* Conversation Controls */}
        {data.chatbotData?.conversationControls && (
          <SectionCard id="conversation-controls" title="Conversation Controls" icon={MessageSquare}>
            <ConversationControlsContent data={data.chatbotData.conversationControls} />
          </SectionCard>
        )}

        {/* Emotional Safety */}
        {data.chatbotData?.emotionalSafety && (
          <SectionCard id="emotional-safety" title="Emotional Safety" icon={Heart}>
            <EmotionalSafetyContent data={data.chatbotData.emotionalSafety} />
          </SectionCard>
        )}

        {/* Academic Integrity */}
        {data.chatbotData?.academicIntegrity && (
          <SectionCard id="academic-integrity" title="Academic Integrity" icon={BookOpen}>
            <AcademicIntegrityContent data={data.chatbotData.academicIntegrity} />
          </SectionCard>
        )}

        {/* Privacy & Data */}
        {data.chatbotData?.privacyDataDetail && (
          <SectionCard id="privacy-data" title="Privacy & Data" icon={Database}>
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
            href="/ai-safety"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Platforms
          </Link>
          <Link
            href="/ai-safety/phosra-controls"
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
