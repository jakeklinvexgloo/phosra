import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader variant="transparent" />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
