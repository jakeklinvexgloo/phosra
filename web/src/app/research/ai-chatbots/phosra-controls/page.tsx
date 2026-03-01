import { Metadata } from "next"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { PhosraControlsClient } from "../_components/PhosraControlsClient"

export const metadata: Metadata = {
  title: "Phosra Controls Matrix — AI Safety Research",
  description:
    "See what safety controls each AI chatbot platform lacks natively and how Phosra fills the gaps with parental controls, time limits, content filtering, and more.",
}

export default async function PhosraControlsPage() {
  const platforms = await loadAllChatbotResearch()

  const platformGaps = platforms.map((p) => ({
    platformId: p.platformId,
    platformName: p.platformName,
    capabilities: p.capabilities,
    gapStats: p.sectionData?.integrationGap?.stats ?? [],
    gapOpportunities: p.sectionData?.integrationGap?.gapOpportunities ?? [],
    enforcementSteps: p.sectionData?.enforcementFlow?.steps ?? [],
  }))

  return <PhosraControlsClient platforms={platformGaps} />
}
