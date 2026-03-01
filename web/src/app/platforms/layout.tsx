"use client"

import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export default function PlatformsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
