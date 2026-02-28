"use client"

import {
  ShieldCheck,
  Star,
  Users,
  Code2,
  Camera,
  AlertTriangle,
  Heart,
  BookOpen,
  MessageSquare,
  UserCheck,
  Lock,
  Database,
} from "lucide-react"
import type { PlatformResearchData } from "@/lib/platform-research/research-data-types"
import { SectionCard } from "./SectionCard"
import { CapabilityMatrix } from "./CapabilityMatrix"
import { RatingMappingChart } from "./RatingMappingChart"
import { ProfileStructure } from "./ProfileStructure"
import { TechnicalRecon } from "./TechnicalRecon"
import { ScreenshotEvidenceSection } from "./ScreenshotEvidenceSection"
import { IntegrationGapAnalysis } from "./IntegrationGapAnalysis"
import { EnforcementFlow } from "./EnforcementFlow"
import { AdapterRoadmap } from "./AdapterRoadmap"
import { RiskAssessment } from "./RiskAssessment"
import { SafetyTestingSection } from "./SafetyTestingSection"
import { EmotionalSafetySection } from "./EmotionalSafetySection"
import { AcademicIntegritySection } from "./AcademicIntegritySection"
import { ConversationControlsSection } from "./ConversationControlsSection"
import { AgeVerificationSection, ParentalControlsSection, PrivacyDataSection } from "@/components/platform-research"
import { PLATFORM_REGISTRY } from "@/lib/platforms/registry"

// ── Main Section Content Component ────────────────────────────────

interface SectionContentProps {
  data: PlatformResearchData
  category?: string
}

export function SectionContent({ data, category }: SectionContentProps) {
  const platform = PLATFORM_REGISTRY.find((p) => p.id === data.platformId)
  const platformHex = platform?.hex ?? "888888"

  return (
    <>
      {/* Safety Testing (AI Chatbots) */}
      {category === "ai_chatbots" && data.chatbotData?.safetyTesting && (
        <SafetyTestingSection data={data.chatbotData.safetyTesting} />
      )}

      {/* Capabilities */}
      <SectionCard
        id="capabilities"
        title="Capability Matrix"
        icon={ShieldCheck}
        badge={`${data.capabilities.fullyEnforceable.length + data.capabilities.partiallyEnforceable.length} enforceable`}
      >
        <CapabilityMatrix capabilities={data.capabilities} />
      </SectionCard>

      {/* Rating Mapping — hidden for AI chatbots */}
      {data.ratingMapping && category !== "ai_chatbots" && (
        <SectionCard id="ratings" title="Rating Mapping" icon={Star}>
          <RatingMappingChart ratingMapping={data.ratingMapping} platformHex={platformHex} />
        </SectionCard>
      )}

      {/* Age Verification (AI Chatbots) */}
      {category === "ai_chatbots" && data.chatbotData?.ageVerificationDetail && (
        <SectionCard id="age-verification" title="Age Verification" icon={UserCheck}>
          <AgeVerificationSection data={data.chatbotData.ageVerificationDetail} />
        </SectionCard>
      )}

      {/* Parental Controls (AI Chatbots) */}
      {category === "ai_chatbots" && data.chatbotData?.parentalControlsDetail && (
        <SectionCard id="parental-controls" title="Parental Controls" icon={Lock}>
          <ParentalControlsSection data={data.chatbotData.parentalControlsDetail} />
        </SectionCard>
      )}

      {/* Conversation Controls (AI Chatbots) */}
      {category === "ai_chatbots" && data.chatbotData?.conversationControls && (
        <SectionCard id="conversation-controls" title="Conversation Controls" icon={MessageSquare}>
          <ConversationControlsSection data={data.chatbotData.conversationControls} />
        </SectionCard>
      )}

      {/* Emotional Safety (AI Chatbots) */}
      {category === "ai_chatbots" && data.chatbotData?.emotionalSafety && (
        <SectionCard id="emotional-safety" title="Emotional Safety" icon={Heart}>
          <EmotionalSafetySection data={data.chatbotData.emotionalSafety} />
        </SectionCard>
      )}

      {/* Academic Integrity (AI Chatbots) */}
      {category === "ai_chatbots" && data.chatbotData?.academicIntegrity && (
        <SectionCard id="academic-integrity" title="Academic Integrity" icon={BookOpen}>
          <AcademicIntegritySection data={data.chatbotData.academicIntegrity} />
        </SectionCard>
      )}

      {/* Account Structure */}
      {data.sectionData?.profileStructure && (
        <SectionCard id="account-structure" title="Account Structure" icon={Users}>
          <ProfileStructure data={data.sectionData.profileStructure} />
        </SectionCard>
      )}

      {/* Privacy & Data (AI Chatbots) */}
      {category === "ai_chatbots" && data.chatbotData?.privacyDataDetail && (
        <SectionCard id="privacy-data" title="Privacy & Data" icon={Database}>
          <PrivacyDataSection data={data.chatbotData.privacyDataDetail} />
        </SectionCard>
      )}

      {/* API & Technical */}
      {data.sectionData?.technicalRecon && (
        <SectionCard id="api-technical" title="API & Technical" icon={Code2}>
          <TechnicalRecon data={data.sectionData.technicalRecon} />
        </SectionCard>
      )}

      {/* Screenshots */}
      {data.screenshots.length > 0 && (
        <SectionCard
          id="screenshots"
          title="Screenshots"
          icon={Camera}
          badge={`${data.screenshotCount}`}
        >
          <ScreenshotEvidenceSection
            screenshots={data.screenshots}
            totalCount={data.screenshotCount}
            screenshotAnalysis={data.screenshotAnalysis}
          />
        </SectionCard>
      )}

      {/* Phosra Integration — self-wrapping */}
      {data.sectionData?.integrationGap && (
        <IntegrationGapAnalysis data={data.sectionData.integrationGap} />
      )}

      {/* Enforcement Flow — self-wrapping */}
      {data.sectionData?.enforcementFlow && (
        <EnforcementFlow data={data.sectionData.enforcementFlow} />
      )}

      {/* Adapter Roadmap — self-wrapping */}
      {data.sectionData?.adapterRoadmap && (
        <AdapterRoadmap data={data.sectionData.adapterRoadmap} />
      )}

      {/* Risk Assessment */}
      {data.sectionData?.riskAssessment && (
        <SectionCard
          id="risk-assessment"
          title="Risk & Terms of Service"
          icon={AlertTriangle}
          defaultCollapsed
        >
          <RiskAssessment data={data.sectionData.riskAssessment} />
        </SectionCard>
      )}
    </>
  )
}
