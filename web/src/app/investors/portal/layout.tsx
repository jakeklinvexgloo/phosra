import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Investor Data Room — Phosra",
  description: "You've been invited to view the Phosra investor data room. Access pitch deck, financials, and due diligence materials.",
  openGraph: {
    title: "Phosra — Investor Data Room",
    description: "You've been invited to view confidential investor materials.",
    siteName: "Phosra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phosra — Investor Data Room",
    description: "You've been invited to view confidential investor materials.",
  },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
