import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Reports | Phosra",
  description:
    "In-depth reports on the state of child safety legislation, community standards, and parental controls worldwide.",
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  )
}
