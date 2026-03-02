import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Blog — Child Safety Engineering & Updates | Phosra",
  description: "Technical deep-dives, regulatory analysis, product launches, and company news from the Phosra engineering team.",
  openGraph: {
    title: "Blog — Child Safety Engineering & Updates | Phosra",
    description: "Technical deep-dives, regulatory analysis, product launches, and company news from the Phosra engineering team.",
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
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
