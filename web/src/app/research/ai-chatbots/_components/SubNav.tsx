"use client"

import { PortalSubNav } from "../../_components/PortalSubNav"

const TABS = [
  { label: "Portal", href: "/research/ai-chatbots" },
  { label: "Compare", href: "/research/ai-chatbots/compare" },
  { label: "Prompts", href: "/research/ai-chatbots/prompts" },
  { label: "Methodology", href: "/research/ai-chatbots/methodology" },
  { label: "Controls", href: "/research/ai-chatbots/phosra-controls" },
] as const

export function SubNav() {
  return <PortalSubNav tabs={TABS} basePath="/research/ai-chatbots" />
}
