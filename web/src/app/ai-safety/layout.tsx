"use client"

import { PublicPageHeader } from "@/components/layout/PublicPageHeader"
import { Footer } from "@/components/marketing/Footer"
import { SubNav } from "./_components/SubNav"
export default function AISafetyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicPageHeader />
      <main className="flex-1 pt-14">
        <SubNav />
        {children}
      </main>
      <Footer />
    </div>
  )
}
