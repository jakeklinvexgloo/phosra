"use client"

import { useState } from "react"
import { List, X } from "lucide-react"
import { PublicPageHeader } from "@/components/layout/PublicPageHeader"
import { DevDocsSidebar } from "@/components/developers/DevDocsSidebar"
import { DevDocsSearch } from "@/components/developers/DevDocsSearch"

export default function DeveloperDocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />
      <div className="pt-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 mb-4 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {sidebarOpen ? "Close" : "Navigation"}
          </button>

          <div className="flex gap-6">
            {/* Left sidebar */}
            <div className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-[260px] flex-shrink-0`}>
              <div className="mb-4">
                <DevDocsSearch />
              </div>
              <DevDocsSidebar onNavigate={() => setSidebarOpen(false)} />
            </div>

            {/* Center content + right TOC (rendered by page component) */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
