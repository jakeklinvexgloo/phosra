import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider, themeScript } from "@/lib/theme"

export const metadata: Metadata = {
  title: "GuardianGate - Child Safety Standard",
  description: "The authoritative child safety standard for regulated technology platforms.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
