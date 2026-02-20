"use client"

import { Newspaper } from "lucide-react"

export default function NewsFeedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">News Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Industry news and intelligence from the child safety and parental controls space
        </p>
      </div>
      <div className="plaid-card flex flex-col items-center justify-center py-16 text-center">
        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
          <Newspaper className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-lg font-medium text-foreground mb-1">Coming in Phase 2</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The News Monitor worker will scan key sources daily (FTC, TechCrunch, NCMEC, Congressional hearings)
          and populate this feed with relevance-scored, tagged industry news.
        </p>
      </div>
    </div>
  )
}
