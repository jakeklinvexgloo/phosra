"use client"

import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
