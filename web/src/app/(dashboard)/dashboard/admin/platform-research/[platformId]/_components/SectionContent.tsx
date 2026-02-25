"use client"

import {
  ShieldCheck,
  Star,
  Users,
  Code2,
  Camera,
  AlertTriangle,
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

interface SectionContentProps {
  data: PlatformResearchData
}

export function SectionContent({ data }: SectionContentProps) {
  return (
    <>
      {/* Capabilities */}
      <SectionCard
        id="capabilities"
        title="Capability Matrix"
        icon={ShieldCheck}
        badge={`${data.capabilities.fullyEnforceable.length + data.capabilities.partiallyEnforceable.length} enforceable`}
      >
        <CapabilityMatrix capabilities={data.capabilities} />
      </SectionCard>

      {/* Rating Mapping */}
      {data.ratingMapping && (
        <SectionCard id="ratings" title="Rating Mapping" icon={Star}>
          <RatingMappingChart ratingMapping={data.ratingMapping} />
        </SectionCard>
      )}

      {/* Account Structure */}
      <SectionCard id="account-structure" title="Account Structure" icon={Users}>
        <ProfileStructure />
      </SectionCard>

      {/* API & Technical */}
      <SectionCard id="api-technical" title="API & Technical" icon={Code2}>
        <TechnicalRecon />
      </SectionCard>

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
          />
        </SectionCard>
      )}

      {/* Phosra Integration — self-wrapping */}
      <IntegrationGapAnalysis />

      {/* Enforcement Flow — self-wrapping */}
      <EnforcementFlow />

      {/* Adapter Roadmap — self-wrapping */}
      <AdapterRoadmap />

      {/* Risk Assessment */}
      <SectionCard
        id="risk-assessment"
        title="Risk & Terms of Service"
        icon={AlertTriangle}
        defaultCollapsed
      >
        <RiskAssessment />
      </SectionCard>
    </>
  )
}
