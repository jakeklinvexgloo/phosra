import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Brand Assets | Phosra",
  description: "Download Phosra logos, color palette, typography specs, and usage guidelines for press, partners, and developers.",
  openGraph: {
    title: "Brand Assets | Phosra",
    description: "Download Phosra logos, color palette, typography specs, and usage guidelines for press, partners, and developers.",
  },
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
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
