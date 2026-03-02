import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Press & Media | Phosra",
  description: "Press releases, media resources, company facts, and brand assets for journalists covering child safety technology.",
  openGraph: {
    title: "Press & Media | Phosra",
    description: "Press releases, media resources, company facts, and brand assets for journalists covering child safety technology.",
  },
}

export default function PressLayout({ children }: { children: React.ReactNode }) {
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
