"use client"

import { useState, useCallback, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import type { ResearchScreenshot } from "@/lib/platform-research/types"

interface ScreenshotGalleryProps {
  screenshots: ResearchScreenshot[]
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handlePrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null
      return i > 0 ? i - 1 : screenshots.length - 1
    })
  }, [screenshots.length])

  const handleNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null
      return i < screenshots.length - 1 ? i + 1 : 0
    })
  }, [screenshots.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null)
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxIndex, handlePrev, handleNext])

  if (screenshots.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No screenshots captured yet.
      </div>
    )
  }

  const activeSS = lightboxIndex !== null ? screenshots[lightboxIndex] : null

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {screenshots.map((ss, i) => (
          <button
            key={ss.id}
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-ring/50 transition-all bg-muted"
          >
            {/* Placeholder representation since we may not have actual image URLs */}
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-xs text-muted-foreground text-center px-2">
                <div className="font-medium">{ss.label}</div>
                <div className="text-[10px] mt-0.5">
                  {ss.width}x{ss.height}
                </div>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {lightboxIndex !== null && activeSS && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Nav arrows */}
          {screenshots.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Content area */}
          <div className="max-w-4xl w-full mx-8 space-y-3">
            <div className="aspect-video rounded-lg bg-muted/20 border border-white/10 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-lg font-medium">{activeSS.label}</div>
                <div className="text-sm text-white/60 mt-1">
                  {activeSS.width}x{activeSS.height}
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="text-center space-y-1">
              <div className="text-sm text-white font-medium">
                {activeSS.label}
              </div>
              <div className="text-xs text-white/50 font-mono truncate">
                {activeSS.url}
              </div>
              <div className="text-xs text-white/40">
                {lightboxIndex + 1} of {screenshots.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
