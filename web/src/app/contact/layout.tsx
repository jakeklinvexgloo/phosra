import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Contact Us | Phosra",
  description: "Reach out for enterprise sales, developer support, integration partnerships, security reporting, or press inquiries.",
  openGraph: {
    title: "Contact Us | Phosra",
    description: "Reach out for enterprise sales, developer support, integration partnerships, security reporting, or press inquiries.",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
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
