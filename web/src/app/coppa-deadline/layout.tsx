import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "COPPA 2.0 Deadline — April 22, 2026 Guide | Phosra",
  description: "The FTC COPPA Rule enforcement begins April 22, 2026. $53,088 per violation. Get compliant with one API integration.",
  openGraph: {
    title: "COPPA 2.0 Deadline — April 22, 2026 Guide | Phosra",
    description: "The FTC COPPA Rule enforcement begins April 22, 2026. $53,088 per violation. Get compliant with one API integration.",
  },
}

export default function COPPADeadlineLayout({ children }: { children: React.ReactNode }) {
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
