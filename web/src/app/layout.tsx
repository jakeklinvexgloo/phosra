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
