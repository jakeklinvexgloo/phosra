"use client"

import { PortalSubNav } from "../../_components/PortalSubNav"

const TABS = [
  { label: "Portal", href: "/research/streaming" },
  { label: "Compare", href: "/research/streaming/compare" },
  { label: "Categories", href: "/research/streaming/categories" },
  { label: "Methodology", href: "/research/streaming/methodology" },
] as const

export function SubNav() {
  return <PortalSubNav tabs={TABS} basePath="/research/streaming" />
}
