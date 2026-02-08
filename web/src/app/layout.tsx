import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const FeedbackOverlay = dynamic(
  () => import("@/components/FeedbackOverlay"),
  { ssr: false }
)

export const metadata: Metadata = {
  title: "Phosra - Child Safety Standard",
  description: "The authoritative child safety standard for regulated technology platforms.",
  icons: {
    icon: "/favicon.svg",
    apple: "/mark.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Phosra - Child Safety Standard",
    description: "The universal parental controls API. One policy for your family, enforced across every platform.",
    siteName: "Phosra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Phosra - Child Safety Standard",
    description: "The universal parental controls API. One policy for your family, enforced across every platform.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
          <FeedbackOverlay />
        </body>
      </html>
    </ClerkProvider>
  )
}
