"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import type { PlatformRegistryEntry } from "@/lib/platforms/types"
import type { PlatformResearchData } from "@/lib/platform-research/research-data-types"
import { ResearchHero } from "./ResearchHero"
import { SectionNav, SECTIONS } from "./SectionNav"

interface PlatformResearchPageLayoutProps {
  platform: PlatformRegistryEntry
  data: PlatformResearchData
  children: ReactNode
}

export function PlatformResearchPageLayout({
  platform,
  data,
  children,
}: PlatformResearchPageLayoutProps) {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const observerRef = useRef<IntersectionObserver | null>(null)

  /* ── Scroll-spy via IntersectionObserver ─────────────────────────── */
  useEffect(() => {
    const sectionIds = SECTIONS.map((s) => s.id)
    const elements: HTMLElement[] = []

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) elements.push(el)
    }

    if (elements.length === 0) return

    // Track which sections are currently intersecting
    const visibleSections = new Map<string, number>()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSections.set(
              entry.target.id,
              entry.intersectionRatio
            )
          } else {
            visibleSections.delete(entry.target.id)
          }
        }

        // Pick the first visible section in document order
        if (visibleSections.size > 0) {
          for (const id of sectionIds) {
            if (visibleSections.has(id)) {
              setActiveSection(id)
              break
            }
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: [0, 0.25],
      }
    )

    for (const el of elements) {
      observerRef.current.observe(el)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <ResearchHero platform={platform} data={data} />

      {/* Mobile section nav */}
      <div className="lg:hidden sticky top-14 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1">
        <SectionNav activeSection={activeSection} />
      </div>

      {/* Main content area with sidebar TOC */}
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Desktop sidebar TOC */}
        <SectionNav activeSection={activeSection} />

        {/* Content sections */}
        <div className="space-y-6 min-w-0">{children}</div>
      </div>
    </div>
  )
}
