"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  Check,
  AlertTriangle,
  EyeIcon,
  XCircle,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import type {
  ScreenshotAnalysisData,
  ScreenshotAnalysis,
  AutomationFeasibility,
  FindingSeverity,
  UxRating,
  RelevanceLevel,
} from "@/lib/platform-research/research-data-types"

interface LightboxImage {
  filename: string
  label: string
  path: string
}

interface ScreenshotLightboxProps {
  images: LightboxImage[]
  initialIndex: number
  onClose: () => void
  screenshotAnalysis?: ScreenshotAnalysisData | null
}

// ── Badge / styling helpers (duplicated inline for lightbox context) ──

const automationBadgeColor = (f: AutomationFeasibility) => {
  switch (f) {
    case "fully_automatable":
      return "bg-green-900/60 text-green-300"
    case "partially_automatable":
      return "bg-amber-900/60 text-amber-300"
    case "read_only":
      return "bg-blue-900/60 text-blue-300"
    case "not_automatable":
      return "bg-red-900/60 text-red-300"
  }
}

const automationLabel = (f: AutomationFeasibility) => {
  switch (f) {
    case "fully_automatable":
      return "API"
    case "partially_automatable":
      return "Playwright"
    case "read_only":
      return "Read Only"
    case "not_automatable":
      return "Manual"
  }
}

const severityColor = (s: FindingSeverity) => {
  switch (s) {
    case "critical":
      return "border-red-500 bg-red-500/10"
    case "important":
      return "border-amber-500 bg-amber-500/10"
    case "informational":
      return "border-blue-500 bg-blue-500/10"
  }
}

const uxColor = (r: UxRating) => {
  switch (r) {
    case "excellent":
      return "bg-green-900/60 text-green-300"
    case "good":
      return "bg-emerald-900/60 text-emerald-300"
    case "fair":
      return "bg-amber-900/60 text-amber-300"
    case "poor":
      return "bg-red-900/60 text-red-300"
  }
}

const relevanceDot = (r: RelevanceLevel) => {
  switch (r) {
    case "high":
      return "bg-green-500"
    case "medium":
      return "bg-yellow-500"
    case "low":
      return "bg-gray-400"
    case "none":
      return "bg-gray-600"
  }
}

function AutomationIcon({ feasibility }: { feasibility: AutomationFeasibility }) {
  switch (feasibility) {
    case "fully_automatable":
      return <Check className="w-3 h-3" />
    case "partially_automatable":
      return <AlertTriangle className="w-3 h-3" />
    case "read_only":
      return <EyeIcon className="w-3 h-3" />
    case "not_automatable":
      return <XCircle className="w-3 h-3" />
  }
}

/** Dark-themed analysis panel for the lightbox drawer */
function LightboxAnalysisPanel({ analysis }: { analysis: ScreenshotAnalysis }) {
  return (
    <div className="space-y-3 text-sm">
      {/* Description */}
      <div>
        <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
          Description
        </h4>
        <p className="text-white/80 leading-relaxed">{analysis.description}</p>
      </div>

      {/* Phosra Relevance */}
      <div className="border-l-2 border-purple-500 pl-3">
        <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
          Phosra Relevance
        </h4>
        <p className="text-white/80 leading-relaxed">{analysis.phosraRelevance}</p>
        {analysis.relatedRuleCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {analysis.relatedRuleCategories.map((rc) => (
              <span
                key={rc}
                className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-900/50 text-purple-300"
              >
                {rc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Automation */}
      <div>
        <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
          Automation
        </h4>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${automationBadgeColor(
            analysis.automation.feasibility
          )}`}
        >
          <AutomationIcon feasibility={analysis.automation.feasibility} />
          {automationLabel(analysis.automation.feasibility)}
        </span>
        <p className="text-white/70 mt-1">
          <span className="text-white/90 font-medium">Method:</span> {analysis.automation.method}
        </p>
        <p className="text-white/50 text-xs mt-0.5">{analysis.automation.notes}</p>
        {analysis.automation.technicalDetails && (
          <p className="text-[10px] text-white/40 mt-1 font-mono bg-white/5 p-1.5 rounded">
            {analysis.automation.technicalDetails}
          </p>
        )}
      </div>

      {/* Findings */}
      {analysis.findings.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            Findings
          </h4>
          <div className="space-y-1.5">
            {analysis.findings.map((finding, i) => (
              <div
                key={i}
                className={`border-l-2 rounded-r p-2 ${severityColor(finding.severity)}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-white/90">{finding.label}</span>
                  <span className="text-[9px] uppercase font-semibold text-white/40">
                    {finding.severity}
                  </span>
                  {finding.ruleCategory && (
                    <span className="text-[9px] font-mono bg-white/10 px-1 py-0.5 rounded text-white/50">
                      {finding.ruleCategory}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60">{finding.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UX Assessment */}
      <div>
        <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
          UX Assessment
        </h4>
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${uxColor(
            analysis.ux.rating
          )}`}
        >
          {analysis.ux.rating}
        </span>
        <p className="text-white/50 text-xs mt-1">{analysis.ux.notes}</p>
      </div>

      {/* Security Notes */}
      {analysis.securityNotes.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            Security Notes
          </h4>
          <ul className="list-disc list-inside space-y-0.5">
            {analysis.securityNotes.map((note, i) => (
              <li key={i} className="text-xs text-white/70">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* API Indicators */}
      {analysis.apiIndicators.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            API Indicators
          </h4>
          <ul className="list-disc list-inside space-y-0.5">
            {analysis.apiIndicators.map((indicator, i) => (
              <li key={i} className="text-xs text-white/70">
                <code className="text-[10px] bg-white/10 px-1 py-0.5 rounded font-mono text-white/60">
                  {indicator}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps Identified */}
      {analysis.gapsIdentified.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            Gaps Identified
          </h4>
          <ul className="list-disc list-inside space-y-0.5">
            {analysis.gapsIdentified.map((gap, i) => (
              <li key={i} className="text-xs text-white/70">
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comparison Notes */}
      {analysis.comparisonNotes && (
        <div>
          <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            Comparison Notes
          </h4>
          <p className="text-xs text-white/70 leading-relaxed">{analysis.comparisonNotes}</p>
        </div>
      )}

      {/* Metadata footer */}
      {(analysis.analyst || analysis.analyzedAt) && (
        <div className="text-[9px] text-white/30 flex items-center gap-3 pt-2 border-t border-white/10">
          {analysis.analyst && <span>Analyst: {analysis.analyst}</span>}
          {analysis.analyzedAt && <span>Analyzed: {analysis.analyzedAt}</span>}
        </div>
      )}
    </div>
  )
}

// ── Main Lightbox Component ──────────────────────────────────────

export function ScreenshotLightbox({
  images,
  initialIndex,
  onClose,
  screenshotAnalysis,
}: ScreenshotLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const thumbnailRef = useRef<HTMLDivElement>(null)

  const current = images[currentIndex]

  // Get analysis for current screenshot
  const currentAnalysis: ScreenshotAnalysis | null =
    screenshotAnalysis?.screenshots[current.filename] ?? null
  const hasAnalysisForCurrent = currentAnalysis !== null

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
          <div className="flex items-center gap-2">
            {/* Show Analysis toggle — only visible when analysis exists */}
            {hasAnalysisForCurrent && (
              <button
                onClick={() => setShowAnalysis((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  showAnalysis
                    ? "bg-indigo-600 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                aria-label={showAnalysis ? "Hide Analysis" : "Show Analysis"}
              >
                {showAnalysis ? (
                  <PanelRightClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelRightOpen className="w-3.5 h-3.5" />
                )}
                {showAnalysis ? "Hide Analysis" : "Show Analysis"}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main content area: image + optional analysis panel */}
        <div className="flex-1 flex min-h-0">
          {/* Image area */}
          <div
            className={`flex-1 flex items-center justify-center relative px-4 transition-all duration-300 ${
              showAnalysis && hasAnalysisForCurrent ? "lg:pr-0" : ""
            }`}
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
              className={`max-h-[85vh] object-contain rounded-lg select-none transition-all duration-300 ${
                showAnalysis && hasAnalysisForCurrent
                  ? "max-w-[55vw]"
                  : "max-w-[90vw]"
              }`}
              draggable={false}
            />

            {/* Right arrow */}
            {images.length > 1 && (
              <button
                onClick={goNext}
                className={`absolute top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors ${
                  showAnalysis && hasAnalysisForCurrent
                    ? "right-2"
                    : "right-2 sm:right-4"
                }`}
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Analysis drawer — slides in from the right */}
          {showAnalysis && hasAnalysisForCurrent && currentAnalysis && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="hidden lg:block shrink-0 border-l border-white/10 overflow-hidden"
            >
              <div className="w-[400px] h-full overflow-y-auto p-4 scrollbar-hide">
                {/* Relevance indicator */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                  <div
                    className={`w-2 h-2 rounded-full ${relevanceDot(currentAnalysis.relevance)}`}
                  />
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                    {currentAnalysis.relevance} relevance
                  </span>
                </div>
                <LightboxAnalysisPanel analysis={currentAnalysis} />
              </div>
            </motion.div>
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
          {images.map((img, i) => {
            const imgAnalysis = screenshotAnalysis?.screenshots[img.filename]
            return (
              <button
                key={img.path}
                data-active={i === currentIndex}
                onClick={() => setCurrentIndex(i)}
                className={`shrink-0 h-[60px] w-[90px] rounded overflow-hidden transition-all relative ${
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
                {/* Small relevance dot on thumbnails with analysis */}
                {imgAnalysis && (
                  <div className="absolute bottom-0.5 left-0.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${relevanceDot(imgAnalysis.relevance)}`}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
