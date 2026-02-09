"use client"

import { PublicPageHeader } from "@/components/layout/PublicPageHeader"
import { Footer } from "@/components/marketing/Footer"

export default function PlatformsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicPageHeader />
      <main className="flex-1 pt-14">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
