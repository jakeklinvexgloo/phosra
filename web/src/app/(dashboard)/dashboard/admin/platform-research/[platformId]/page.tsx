import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FlaskConical, FileSearch, Shield } from "lucide-react"
import { loadPlatformResearch } from "@/lib/platform-research/loaders"
import { PLATFORM_REGISTRY } from "@/lib/platforms/registry"
import { getSectionsForCategory } from "@/lib/platform-research/section-registry"
import { PlatformResearchPageLayout } from "./_components/PlatformResearchPageLayout"
import { SectionContent } from "./_components/SectionContent"

export default async function PlatformResearchDetailPage({
  params,
}: {
  params: Promise<{ platformId: string }>
}) {
  const { platformId } = await params

  // Look up platform in registry
  const platform = PLATFORM_REGISTRY.find((p) => p.id === platformId)
  if (!platform) notFound()

  // Load research data from disk
  const data = await loadPlatformResearch(platformId)

  // If research data exists, show the full report
  if (data) {
    const sections = getSectionsForCategory(platform.category)
    return (
      <PlatformResearchPageLayout platform={platform} data={data} sections={sections}>
        <SectionContent data={data} category={platform.category} />
      </PlatformResearchPageLayout>
    )
  }

  // Placeholder page for platforms without research data yet
  const categoryLabel = platform.category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href="/dashboard/admin/platform-research"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Platform Research
          </Link>

          <div className="flex items-center gap-3">
            {platform.hex && (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: `#${platform.hex}` }}
              >
                {platform.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {platform.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {categoryLabel} &middot; {platform.side === "source" ? "Source" : "Target"} &middot; {platform.tier}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 border border-border/50">
            <FlaskConical className="w-10 h-10 text-muted-foreground/60" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-foreground">
              Research Not Yet Started
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {platform.name} is queued for parental control research. Once completed, this page will contain detailed findings on safety controls, API accessibility, adapter feasibility, and Phosra integration strategy.
            </p>
          </div>

          {/* What will be covered */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
            <div className="plaid-card !p-4 text-left space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-foreground">Safety Controls</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Content filters, age verification, parental controls, conversation limits, emotional safety
              </p>
            </div>
            <div className="plaid-card !p-4 text-left space-y-2">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-foreground">API & Technical</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Public APIs, authentication methods, automation feasibility, anti-detection measures
              </p>
            </div>
            <div className="plaid-card !p-4 text-left space-y-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-foreground">Phosra Adapter</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Integration strategy, capability matrix, enforcement flow, implementation roadmap
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
