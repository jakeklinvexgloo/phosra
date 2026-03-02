import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader variant="transparent" />
      <main className="flex-1 pt-20 relative">
        {/* Dark band behind transparent nav — matches hero gradient start color */}
        <div className="absolute inset-x-0 top-0 h-[200px] bg-[#0D1B2A]" aria-hidden="true" />
        <div className="relative">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
