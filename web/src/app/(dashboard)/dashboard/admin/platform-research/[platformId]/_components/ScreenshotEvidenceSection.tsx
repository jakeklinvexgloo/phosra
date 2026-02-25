"use client"

import { useState, useMemo, useRef } from "react"
import { Eye } from "lucide-react"
import { ScreenshotLightbox } from "./ScreenshotLightbox"

interface Screenshot {
  filename: string
  label: string
  path: string
}

interface ScreenshotGroup {
  id: string
  label: string
  screenshots: Screenshot[]
}

interface ScreenshotEvidenceSectionProps {
  screenshots: ScreenshotGroup[]
  totalCount: number
}

const ALL_TAB = "__all__"

export function ScreenshotEvidenceSection({
  screenshots,
  totalCount,
}: ScreenshotEvidenceSectionProps) {
  const [activeTab, setActiveTab] = useState(ALL_TAB)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const tabBarRef = useRef<HTMLDivElement>(null)

  // Flat list of all screenshots for "All" tab
  const allScreenshots = useMemo(
    () => screenshots.flatMap((g) => g.screenshots),
    [screenshots]
  )

  // Current visible screenshots based on active tab
  const visibleScreenshots = useMemo(() => {
    if (activeTab === ALL_TAB) return allScreenshots
    const group = screenshots.find((g) => g.id === activeTab)
    return group ? group.screenshots : allScreenshots
  }, [activeTab, allScreenshots, screenshots])

  // For lightbox: we always pass the full visible list so arrow nav works within the category
  const openLightbox = (idx: number) => setLightboxIndex(idx)
  const closeLightbox = () => setLightboxIndex(null)

  if (totalCount === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No screenshots captured yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Category tab bar */}
      <div
        ref={tabBarRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        {/* All tab */}
        <button
          onClick={() => setActiveTab(ALL_TAB)}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeTab === ALL_TAB
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
          <span
            className={`text-[10px] tabular-nums ${
              activeTab === ALL_TAB ? "text-background/70" : "text-muted-foreground/70"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {screenshots.map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveTab(group.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === group.id
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {group.label}
            <span
              className={`text-[10px] tabular-nums ${
                activeTab === group.id
                  ? "text-background/70"
                  : "text-muted-foreground/70"
              }`}
            >
              {group.screenshots.length}
            </span>
          </button>
        ))}
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibleScreenshots.map((ss, i) => (
          <button
            key={`${activeTab}-${ss.path}`}
            onClick={() => openLightbox(i)}
            className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted hover:scale-[1.02] hover:ring-2 hover:ring-ring/50 transition-all"
          >
            <img
              src={ss.path}
              alt={ss.label}
              loading={i < 8 ? "eager" : "lazy"}
              className="w-full h-full object-cover"
            />

            {/* Hover overlay with Eye icon */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>

            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
              <span className="text-[10px] text-white/80 truncate block leading-tight">
                {ss.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ScreenshotLightbox
          images={visibleScreenshots}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  )
}
