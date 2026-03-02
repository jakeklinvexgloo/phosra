import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: {
    template: "%s | Phosra",
    default: "Child Safety Explainers | Phosra",
  },
  description:
    "Comprehensive guides to child safety legislation, compliance requirements, and digital safety standards.",
}

export default function ExplainersLayout({ children }: { children: React.ReactNode }) {
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
