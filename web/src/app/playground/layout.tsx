"use client"

import { PublicPageHeader } from "@/components/layout/PublicPageHeader"

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <PublicPageHeader />
      <main className="flex-1 pt-14 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
