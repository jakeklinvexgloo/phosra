"use client"

import { SiteHeader } from "@/components/layout/SiteHeader"

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <SiteHeader />
      <main className="flex-1 pt-20 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
