"use client"

import { DocsSidebar } from "@/components/docs/DocsSidebar"
import { PublicPageHeader } from "@/components/layout/PublicPageHeader"

export default function PublicDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />

      {/* Content area below fixed header */}
      <div className="pt-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="docs-three-col">
            {/* Left sidebar */}
            <DocsSidebar />
            {/* Center content + Right code panel */}
            <div className="docs-content-area min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
