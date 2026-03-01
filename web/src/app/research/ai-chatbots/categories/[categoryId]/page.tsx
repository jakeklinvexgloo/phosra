import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { Breadcrumbs } from "../../_components/Breadcrumbs"

// Get all unique categories from the data at build time
export async function generateStaticParams() {
  const platforms = await loadAllChatbotResearch()
  const categories = new Set<string>()
  for (const p of platforms) {
    for (const r of p.chatbotData?.safetyTesting?.results ?? []) {
      categories.add(r.category)
    }
  }
  return Array.from(categories).map((id) => ({ categoryId: id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>
}): Promise<Metadata> {
  const { categoryId } = await params
  const label = categoryId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: `${label} — Safety Category — Phosra AI Safety`,
    description: `How all AI chatbot platforms scored on ${label} safety tests`,
  }
}

function scoreBg(score: number): string {
  if (score === 0) return "bg-emerald-500 text-white"
  if (score === 1) return "bg-blue-500 text-white"
  if (score === 2) return "bg-amber-500 text-white"
  if (score === 3) return "bg-orange-500 text-white"
  return "bg-red-500 text-white"
}

function avgScoreBg(avg: number): string {
  if (avg < 0.5) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
  if (avg < 1.5) return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
  if (avg < 2.5) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
  if (avg < 3.5) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200"
  return "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100"
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const platforms = await loadAllChatbotResearch()

  // Gather per-platform data for this category
  const categoryData = platforms
    .map((p) => {
      const results = (p.chatbotData?.safetyTesting?.results ?? []).filter(
        (r) => r.category === categoryId && r.score !== null
      )
      if (results.length === 0) return null
      const avg = results.reduce((sum, r) => sum + (r.score ?? 0), 0) / results.length
      return {
        platformId: p.platformId,
        platformName: p.platformName,
        avg,
        results,
      }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => a.avg - b.avg) // Best (lowest) first

  if (categoryData.length === 0) notFound()

  const label = categoryData[0].results[0].categoryLabel

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <Breadcrumbs
            items={[
              { label: "AI Safety", href: "/research/ai-chatbots" },
              { label: "Categories" },
              { label },
            ]}
          />
          <h1 className="text-3xl font-display font-bold">{label}</h1>
          <p className="text-white/50 mt-2 text-sm">
            How all {categoryData.length} platforms scored on {label.toLowerCase()} safety tests
          </p>
        </div>
      </section>

      {/* Ranked Bar Chart */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Platform Rankings</h2>
        <p className="text-xs text-muted-foreground mb-4">Lower average score = safer (0 = full block, 4 = enthusiastic)</p>

        <div className="space-y-3 sm:space-y-2">
          {categoryData.map((pd) => (
            <div key={pd.platformId} className="flex items-center gap-2 sm:gap-3">
              <Link
                href={`/research/ai-chatbots/${pd.platformId}`}
                className="text-xs sm:text-sm font-medium text-foreground hover:text-brand-green transition-colors min-w-[80px] sm:min-w-[100px]"
              >
                {pd.platformName}
              </Link>
              <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden relative">
                <div
                  className={`h-full rounded ${avgScoreBg(pd.avg)} flex items-center justify-end px-2`}
                  style={{ width: `${Math.max(5, (pd.avg / 4) * 100)}%` }}
                >
                  <span className="text-[10px] font-bold">{pd.avg.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-0.5 flex-shrink-0 overflow-x-auto">
                {pd.results.map((r) => (
                  <span
                    key={r.id}
                    className={`inline-block w-7 h-7 sm:w-5 sm:h-5 rounded text-[10px] sm:text-[9px] font-bold text-center leading-7 sm:leading-5 ${scoreBg(r.score!)}`}
                    title={r.prompt}
                  >
                    {r.score}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Individual Test Results */}
        <h2 className="text-lg font-semibold text-foreground mt-10">Test Prompts in This Category</h2>
        <div className="space-y-4">
          {/* Get unique prompts from first platform's results */}
          {categoryData[0].results.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-foreground mb-3">{r.prompt}</p>
              <div className="flex flex-wrap gap-3 sm:gap-2">
                {categoryData.map((pd) => {
                  const match = pd.results.find((pr) => pr.id === r.id)
                  return match ? (
                    <div key={pd.platformId} className="text-center">
                      <span
                        className={`inline-block w-9 h-9 sm:w-7 sm:h-7 rounded text-sm sm:text-xs font-bold text-center leading-9 sm:leading-7 ${scoreBg(match.score!)}`}
                        title={`${pd.platformName}: ${match.score}`}
                        aria-label={`${pd.platformName}: score ${match.score}`}
                      >
                        {match.score}
                      </span>
                      <div className="text-[9px] sm:text-[8px] text-muted-foreground mt-0.5 max-w-[70px] sm:max-w-[60px] truncate">
                        {pd.platformName}
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
