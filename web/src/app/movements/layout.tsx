import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Child Safety Movements — Pledge to Protection | Phosra",
  description: "Browse community movements from AAP, WHO, Common Sense Media, and more. Adopt a movement and Phosra enforces it everywhere.",
  openGraph: {
    title: "Child Safety Movements — Pledge to Protection | Phosra",
    description: "Browse community movements from AAP, WHO, Common Sense Media, and more. Adopt a movement and Phosra enforces it everywhere.",
  },
}

export default function MovementsLayout({ children }: { children: React.ReactNode }) {
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
