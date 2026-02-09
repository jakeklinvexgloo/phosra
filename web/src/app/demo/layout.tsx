"use client"

import Link from "next/link"
import { ArrowLeft, Eye } from "lucide-react"

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="fixed top-0 left-0 right-0 h-10 bg-gradient-to-r from-brand-green/90 to-accent-teal/90 z-50 flex items-center justify-center gap-3 px-4">
        <Eye className="w-4 h-4 text-foreground" />
        <span className="text-xs font-semibold text-foreground">
          Interactive Demo &mdash; this is sample data, not a real account
        </span>
        <Link
          href="/login"
          className="ml-4 text-xs font-bold text-foreground underline underline-offset-2 hover:opacity-80 transition"
        >
          Create a real account
        </Link>
      </div>

      {/* Back link */}
      <div className="fixed top-10 left-0 right-0 h-12 border-b border-border bg-background z-40 flex items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Phosra
        </Link>
      </div>

      <main className="pt-[88px]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
