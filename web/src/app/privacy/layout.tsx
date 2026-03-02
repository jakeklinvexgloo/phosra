import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Footer } from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "Privacy Policy | Phosra",
  description: "How Phosra collects, uses, and protects your personal information. AES-256 encryption, zero-knowledge policy handling.",
  openGraph: {
    title: "Privacy Policy | Phosra",
    description: "How Phosra collects, uses, and protects your personal information. AES-256 encryption, zero-knowledge policy handling.",
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
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
