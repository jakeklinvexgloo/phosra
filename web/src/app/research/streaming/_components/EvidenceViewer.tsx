"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface EvidenceViewerProps {
  images: string[]          // Full URL paths like "/streaming-evidence/peacock/screenshots/foo.png"
  initialIndex?: number
  onClose: () => void
}

export function EvidenceViewer({ images, initialIndex = 0, onClose }: EvidenceViewerProps) {
  const [index, setIndex] = useState(initialIndex)

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0))
  }, [images.length])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, goPrev, goNext])

  // Extract a readable caption from the filename
  const caption = images[index]
    ?.split("/")
    .pop()
    ?.replace(/\.\w+$/, "")
    ?.replace(/[-_]/g, " ") ?? ""

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image */}
        <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden">
          <Image
            src={images[index]}
            alt={caption}
            fill
            className="object-contain"
            sizes="(max-width: 1280px) 100vw, 1280px"
            unoptimized
          />
        </div>

        {/* Caption + counter */}
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-sm text-white/60 truncate max-w-[70%]">{caption}</p>
          <span className="text-xs text-white/40">
            {index + 1} / {images.length}
          </span>
        </div>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute top-1/2 -translate-y-1/2 -left-12 lg:-left-14 text-white/50 hover:text-white transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={goNext}
              className="absolute top-1/2 -translate-y-1/2 -right-12 lg:-right-14 text-white/50 hover:text-white transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
