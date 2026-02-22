"use client"

import { useState } from "react"
import { List, X } from "lucide-react"
import { DocsSidebar } from "@/components/docs/DocsSidebar"
import { PublicPageHeader } from "@/components/layout/PublicPageHeader"

export default function PublicDocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />

      {/* Content area below fixed header */}
      <div className="pt-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 mb-4 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {sidebarOpen ? "Close" : "Table of Contents"}
          </button>

          <div className="docs-three-col">
            {/* Left sidebar — hidden on mobile unless toggled */}
            <div className={`${sidebarOpen ? "block" : "hidden"} lg:block lg:self-stretch`}>
              <DocsSidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
            {/* Center content + Right code panel */}
            <div className="docs-content-area min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
