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
import { PLATFORM_REGISTRY } from "@/lib/platforms/registry"

interface SectionContentProps {
  data: PlatformResearchData
}

export function SectionContent({ data }: SectionContentProps) {
  const platform = PLATFORM_REGISTRY.find((p) => p.id === data.platformId)
  const platformHex = platform?.hex ?? "888888"

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
          <RatingMappingChart ratingMapping={data.ratingMapping} platformHex={platformHex} />
        </SectionCard>
      )}

      {/* Account Structure */}
      {data.sectionData?.profileStructure && (
        <SectionCard id="account-structure" title="Account Structure" icon={Users}>
          <ProfileStructure data={data.sectionData.profileStructure} />
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
