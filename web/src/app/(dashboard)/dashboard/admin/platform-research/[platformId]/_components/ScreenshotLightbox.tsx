"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface LightboxImage {
  filename: string
  label: string
  path: string
}

interface ScreenshotLightboxProps {
  images: LightboxImage[]
  initialIndex: number
  onClose: () => void
}

export function ScreenshotLightbox({
  images,
  initialIndex,
  onClose,
}: ScreenshotLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)
  const thumbnailRef = useRef<HTMLDivElement>(null)

  const current = images[currentIndex]

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0) setCurrentIndex(images.length - 1)
      else if (idx >= images.length) setCurrentIndex(0)
      else setCurrentIndex(idx)
    },
    [images.length]
  )

  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, goPrev, goNext])

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Scroll active thumbnail into view
  useEffect(() => {
    const container = thumbnailRef.current
    if (!container) return
    const active = container.querySelector("[data-active='true']") as HTMLElement
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [currentIndex])

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) {
      if (delta > 0) goPrev()
      else goNext()
    }
    touchStartX.current = null
  }

  // Preload adjacent images
  const prevIdx = currentIndex > 0 ? currentIndex - 1 : images.length - 1
  const nextIdx = currentIndex < images.length - 1 ? currentIndex + 1 : 0

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* Preload adjacent images */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <link rel="preload" as="image" href={images[prevIdx].path} />
        <link rel="preload" as="image" href={images[nextIdx].path} />

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <div className="text-sm text-white/70 tabular-nums">
            {currentIndex + 1} of {images.length}
          </div>
          <div className="text-sm text-white/50 truncate max-w-[50vw] text-center">
            {current.label}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main image area */}
        <div
          className="flex-1 flex items-center justify-center relative min-h-0 px-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Left arrow */}
          {images.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <motion.img
            key={current.path}
            src={current.path}
            alt={current.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg select-none"
            draggable={false}
          />

          {/* Right arrow */}
          {images.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Caption */}
        <div className="text-center px-4 py-2 shrink-0">
          <div className="text-xs text-white/40 font-mono truncate">
            {current.filename}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div
          ref={thumbnailRef}
          className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide shrink-0"
        >
          {images.map((img, i) => (
            <button
              key={img.path}
              data-active={i === currentIndex}
              onClick={() => setCurrentIndex(i)}
              className={`shrink-0 h-[60px] w-[90px] rounded overflow-hidden transition-all ${
                i === currentIndex
                  ? "ring-2 ring-white opacity-100"
                  : "opacity-40 hover:opacity-70"
              }`}
            >
              <img
                src={img.path}
                alt={img.label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
