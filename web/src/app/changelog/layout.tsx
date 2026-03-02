import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Changelog | Phosra",
  description: "New features, improvements, and fixes for the Phosra child safety compliance platform.",
  openGraph: {
    title: "Changelog | Phosra",
    description: "New features, improvements, and fixes for the Phosra child safety compliance platform.",
  },
}

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
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
