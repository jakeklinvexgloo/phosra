import type { Metadata, Viewport } from "next"
import dynamic from "next/dynamic"
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Inter, DM_Serif_Display, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const FeedbackOverlay = dynamic(
  () => import("@/components/FeedbackOverlay"),
  { ssr: false }
)

const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((m) => m.Toaster),
  { ssr: false }
)

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://phosra.com"),
  title: "Phosra - Child Safety Standard",
  description: "The authoritative child safety standard for regulated technology platforms.",
  icons: {
    icon: "/favicon.svg",
    apple: "/mark.svg",
  },
  manifest: "/site.webmanifest",
  themeColor: "#0D1B2A",
  openGraph: {
    title: "Phosra - Child Safety Standard",
    description: "The child safety infrastructure that powers parental controls apps. One policy, enforced across every platform.",
    siteName: "Phosra",
    url: "https://phosra.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phosra - Child Safety Standard",
    description: "The child safety infrastructure that powers parental controls apps. One policy, enforced across every platform.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${dmSerif.variable} ${jetbrainsMono.variable} antialiased bg-[#0D1B2A]`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            {/* <FeedbackOverlay /> */}
          </ThemeProvider>
        </body>
      </html>
    </AuthKitProvider>
  )
}
