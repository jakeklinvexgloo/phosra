"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, AlertTriangle, Camera } from "lucide-react"
import type { StreamingTestResult } from "@/lib/streaming-research/streaming-data-types"
import { EvidenceViewer } from "./EvidenceViewer"

const SCORE_COLORS: Record<number, string> = {
  0: "bg-emerald-500",
  1: "bg-blue-500",
  2: "bg-amber-500",
  3: "bg-orange-500",
  4: "bg-red-500",
}

const SCORE_RING_COLORS: Record<number, string> = {
  0: "ring-emerald-500/30",
  1: "ring-blue-500/30",
  2: "ring-amber-500/30",
  3: "ring-orange-500/30",
  4: "ring-red-500/30",
}

interface CategoryResultRowProps {
  test: StreamingTestResult
  platformId: string
}

/** Build the public URL for an evidence screenshot */
function evidenceUrl(platformId: string, evidenceFilename: string): string {
  return `/streaming-evidence/${platformId}/${evidenceFilename}`
}

export function CategoryResultRow({ test, platformId }: CategoryResultRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const isCritical = test.score !== null && test.score >= 3
  const isNull = test.score === null

  const imageUrls = test.evidence.map((e) => evidenceUrl(platformId, e))

  return (
    <>
      <div
        className={`rounded-lg border transition-colors ${
          isCritical
            ? "border-l-4 border-l-red-500 border-t-border border-r-border border-b-border"
            : "border-border"
        } bg-card`}
      >
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-3 w-full text-left px-4 py-3 group"
        >
          {/* Score badge */}
          {isNull ? (
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted ring-2 ring-muted text-xs font-bold text-muted-foreground flex-shrink-0">
              N/A
            </span>
          ) : (
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold flex-shrink-0 ring-2 ${SCORE_COLORS[test.score!]} ${SCORE_RING_COLORS[test.score!]}`}
            >
              {test.score}
            </span>
          )}

          {/* Category name + weight + label */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {test.category}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground flex-shrink-0">
                {test.weight}x
              </span>
              {test.cfoTriggered && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 flex-shrink-0">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {test.cfoTriggered}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{test.label}</span>
          </div>

          {/* Evidence count */}
          {test.evidence.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
              <Camera className="w-3 h-3" />
              {test.evidence.length}
            </span>
          )}

          {/* Expand chevron */}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-4 pt-0 border-t border-border/50">
            <div className="mt-3 space-y-3">
              {/* Description */}
              <p className="text-sm text-foreground/80 leading-relaxed">
                {test.description}
              </p>

              {/* CFO alert */}
              {test.cfoTriggered && test.cfoEffect && (
                <div className="flex items-start gap-2 p-2.5 rounded-md bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-red-400">
                      {test.cfoTriggered}:
                    </span>{" "}
                    <span className="text-xs text-foreground/80">{test.cfoEffect}</span>
                  </div>
                </div>
              )}

              {/* Evidence thumbnails */}
              {test.evidence.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Camera className="w-3.5 h-3.5" />
                    <span>
                      {test.evidence.length} screenshot{test.evidence.length > 1 ? "s" : ""} captured
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {imageUrls.map((url, i) => (
                      <button
                        key={url}
                        onClick={() => setLightboxIndex(i)}
                        className="relative w-28 h-20 rounded-md overflow-hidden border border-border hover:border-brand-green/50 hover:ring-1 hover:ring-brand-green/30 transition-all flex-shrink-0 bg-muted/30"
                      >
                        <Image
                          src={url}
                          alt={test.evidence[i]}
                          fill
                          className="object-cover"
                          sizes="112px"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <EvidenceViewer
          images={imageUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
