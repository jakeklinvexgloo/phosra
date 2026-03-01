import type { Metadata } from "next"
import Link from "next/link"
import { STREAMING_TEST_CATEGORIES } from "@/lib/streaming-research/streaming-data-types"

export const metadata: Metadata = {
  title: "Test Categories — Streaming Safety — Phosra",
  description:
    "Browse all 9 streaming safety test categories and see how platforms score on each.",
}

function weightColor(weight: number): string {
  if (weight >= 5) return "bg-red-500/20 text-red-400"
  if (weight >= 4) return "bg-orange-500/20 text-orange-400"
  if (weight >= 3) return "bg-amber-500/20 text-amber-400"
  return "bg-blue-500/20 text-blue-400"
}

export default function CategoriesIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
          Test Categories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Our streaming safety framework tests 9 categories of parental control effectiveness.
          Select a category to see how all platforms score.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STREAMING_TEST_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/research/streaming/categories/${cat.id}`}
            className="group block border border-border bg-card rounded-lg p-5 hover:border-brand-green/50 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-muted-foreground">{cat.id}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${weightColor(cat.weight)}`}
              >
                Weight {cat.weight}
              </span>
            </div>
            <h2 className="text-lg font-display font-semibold text-foreground group-hover:text-brand-green transition-colors">
              {cat.category}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
