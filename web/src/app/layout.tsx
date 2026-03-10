import type { Metadata, Viewport } from "next"
import dynamic from "next/dynamic"
import StytchProvider from "@/components/StytchProvider"
import { ThemeProvider } from "@/components/ui/theme-provider"
import localFont from "next/font/local"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const generalSans = localFont({
  src: [
    { path: "../../public/fonts/GeneralSans-Variable.woff2", style: "normal" },
    { path: "../../public/fonts/GeneralSans-VariableItalic.woff2", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
})

const cabinetGrotesk = localFont({
  src: "../../public/fonts/CabinetGrotesk-Variable.woff2",
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
  metadataBase: new URL("https://www.phosra.com"),
  title: "Phosra - Child Safety Spec",
  description: "The authoritative child safety specification for regulated technology platforms.",
  icons: {
    icon: "/favicon.svg",
    apple: "/mark.svg",
  },
  manifest: "/site.webmanifest",
  themeColor: "#0D1B2A",
  openGraph: {
    title: "Phosra - Child Safety Spec",
    description: "The child safety infrastructure that powers parental controls apps. One policy, enforced across every platform.",
    siteName: "Phosra",
    url: "https://www.phosra.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phosra - Child Safety Spec",
    description: "The child safety infrastructure that powers parental controls apps. One policy, enforced across every platform.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Phosra",
                url: "https://www.phosra.com",
                logo: "https://www.phosra.com/logo.svg",
                description:
                  "Child safety compliance infrastructure for technology platforms. Track 67+ global child safety laws and enforce parental controls across 229+ platforms.",
                foundingDate: "2025",
                founders: [
                  { "@type": "Person", name: "Jake Klinvex" },
                  { "@type": "Person", name: "Susannah Klinvex" },
                ],
                sameAs: ["https://github.com/jakeklinvexgloo/phosra"],
                knowsAbout: [
                  "child safety compliance",
                  "COPPA",
                  "KOSA",
                  "parental controls",
                  "age verification",
                  "AI safety",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Phosra",
                url: "https://www.phosra.com",
              },
            ]),
          }}
        />
      </head>
      <body className={`${generalSans.variable} ${cabinetGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-[#0D1B2A]`}>
        <StytchProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            {/* <FeedbackOverlay /> */}
          </ThemeProvider>
        </StytchProvider>
      </body>
    </html>
  )
}
