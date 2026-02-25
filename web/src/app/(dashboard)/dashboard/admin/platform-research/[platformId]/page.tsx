import { notFound } from "next/navigation"
import { loadPlatformResearch } from "@/lib/platform-research/loaders"
import { PLATFORM_REGISTRY } from "@/lib/platforms/registry"
import { PlatformResearchPageLayout } from "./_components/PlatformResearchPageLayout"

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
  if (!data) notFound()

  return (
    <PlatformResearchPageLayout platform={platform} data={data}>
      {/* Section components will be rendered here by other tasks */}
      <div className="text-sm text-muted-foreground">
        Loading research sections...
      </div>
    </PlatformResearchPageLayout>
  )
}
