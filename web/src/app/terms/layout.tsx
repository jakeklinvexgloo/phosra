import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Terms of Service | Phosra",
  description: "Terms and conditions governing use of the Phosra child safety compliance platform, API, and related services.",
  openGraph: {
    title: "Terms of Service | Phosra",
    description: "Terms and conditions governing use of the Phosra child safety compliance platform, API, and related services.",
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
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
