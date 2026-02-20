"use client"

import { useMemo, useRef, useState } from "react"
import { Heart, ShieldAlert, Sparkles, Waves } from "lucide-react"
import type { EmotionAnalysis, EmotionFrame } from "@/lib/admin/types"

interface EmotionTimelineProps {
  emotionData: EmotionAnalysis
  currentTimeMs?: number
  onSeek?: (timeMs: number) => void
}

// Key emotions we track and display
const TRACKED_EMOTIONS = [
  { key: "Confidence", label: "Confidence", color: "bg-emerald-400", textColor: "text-emerald-600", icon: ShieldAlert },
  { key: "Excitement", label: "Enthusiasm", color: "bg-blue-400", textColor: "text-blue-600", icon: Sparkles },
  { key: "Anxiety", label: "Nervousness", color: "bg-red-400", textColor: "text-red-600", icon: Heart },
  { key: "Calmness", label: "Calmness", color: "bg-purple-400", textColor: "text-purple-600", icon: Waves },
] as const

function getEmotionScore(frame: EmotionFrame, emotionName: string): number {
  const e = frame.emotions?.find((em) => em.name === emotionName)
  return e ? e.score : 0
}

export function EmotionTimeline({ emotionData, currentTimeMs, onSeek }: EmotionTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null)
  const [activeEmotion, setActiveEmotion] = useState<string | null>(null)

  const frames = emotionData.frames || []
  const totalDurationMs = frames.length > 0 ? frames[frames.length - 1].end_ms : 0

  // Downsample frames for rendering (max ~60 bars)
  const displayFrames = useMemo(() => {
    if (frames.length <= 60) return frames
    const step = Math.ceil(frames.length / 60)
    return frames.filter((_, i) => i % step === 0)
  }, [frames])

  // Find the current frame index based on video time
  const currentFrameIdx = useMemo(() => {
    if (currentTimeMs == null) return -1
    return displayFrames.findIndex(
      (f) => currentTimeMs >= f.start_ms && currentTimeMs <= f.end_ms
    )
  }, [displayFrames, currentTimeMs])

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return `${m}:${String(s % 60).padStart(2, "0")}`
  }

  if (frames.length === 0) {
    return (
      <div className="plaid-card text-center py-8">
        <Heart className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No emotion data available for this session.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Confidence", value: emotionData.confidence_avg, color: "text-emerald-500", bgColor: "bg-emerald-400" },
          { label: "Enthusiasm", value: emotionData.enthusiasm_avg, color: "text-blue-500", bgColor: "bg-blue-400" },
          { label: "Nervousness", value: emotionData.nervousness_avg, color: "text-red-500", bgColor: "bg-red-400" },
          { label: "Calmness", value: emotionData.calm_avg, color: "text-purple-500", bgColor: "bg-purple-400" },
        ].map(({ label, value, color, bgColor }) => (
          <div key={label} className="plaid-card text-center py-3">
            <div className={`text-2xl font-bold tabular-nums ${color}`}>
              {Math.round(value)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden mx-4">
              <div
                className={`h-full rounded-full transition-all ${bgColor}`}
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Confidence Insight */}
      <div className="plaid-card bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Vocal Confidence:</span>{" "}
          Your voice conveyed confidence{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {Math.round(emotionData.confidence_avg)}%
          </span>{" "}
          of the time.
          {emotionData.nervousness_peaks && emotionData.nervousness_peaks.length > 0 && (
            <span>
              {" "}Nervousness spiked at{" "}
              {emotionData.nervousness_peaks.slice(0, 3).map((ms, i) => (
                <button
                  key={ms}
                  onClick={() => onSeek?.(ms)}
                  className="font-mono text-xs text-red-500 hover:text-red-700 underline mx-0.5"
                >
                  {formatTime(ms)}{i < Math.min(emotionData.nervousness_peaks.length, 3) - 1 ? "," : ""}
                </button>
              ))}
              {emotionData.nervousness_peaks.length > 3 && (
                <span className="text-xs text-muted-foreground"> (+{emotionData.nervousness_peaks.length - 3} more)</span>
              )}
              . Practice these sections.
            </span>
          )}
        </p>
      </div>

      {/* Emotion Timeline Chart */}
      <div className="plaid-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Emotion Timeline</h3>
          <div className="flex items-center gap-2">
            {TRACKED_EMOTIONS.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveEmotion(activeEmotion === key ? null : key)}
                className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-all ${
                  activeEmotion === key
                    ? "bg-muted text-foreground font-medium"
                    : activeEmotion
                    ? "opacity-40 hover:opacity-70"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className={`w-2 h-2 rounded-sm ${color}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative h-32 flex items-end gap-px cursor-pointer"
          onMouseLeave={() => setHoveredFrame(null)}
        >
          {displayFrames.map((frame, i) => {
            const isCurrentFrame = i === currentFrameIdx
            const isHovered = i === hoveredFrame

            // Stacked bar: show tracked emotions
            const bars = TRACKED_EMOTIONS.map(({ key, color }) => ({
              key,
              color,
              value: getEmotionScore(frame, key) * 100,
            })).filter(({ key }) => !activeEmotion || key === activeEmotion)

            const totalHeight = Math.max(
              ...bars.map((b) => b.value),
              4
            )

            return (
              <div
                key={i}
                className={`flex-1 flex flex-col items-center justify-end relative group ${
                  isCurrentFrame ? "ring-1 ring-foreground rounded-sm" : ""
                }`}
                onMouseEnter={() => setHoveredFrame(i)}
                onClick={() => onSeek?.(frame.start_ms)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-popover border border-border rounded-md shadow-lg p-2 whitespace-nowrap text-[10px]">
                    <div className="font-mono text-muted-foreground mb-1">{formatTime(frame.start_ms)}</div>
                    {TRACKED_EMOTIONS.map(({ key, label, textColor }) => (
                      <div key={key} className={`flex justify-between gap-3 ${textColor}`}>
                        <span>{label}</span>
                        <span className="font-medium tabular-nums">{Math.round(getEmotionScore(frame, key) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bars */}
                {bars.map(({ key, color, value }) => (
                  <div
                    key={key}
                    className={`w-full rounded-t-sm transition-all ${color} ${
                      isHovered ? "opacity-90" : "opacity-60"
                    } ${activeEmotion && activeEmotion !== key ? "opacity-20" : ""}`}
                    style={{
                      height: `${Math.max(value / 100 * 100, 2)}%`,
                      position: "absolute",
                      bottom: 0,
                    }}
                  />
                ))}
              </div>
            )
          })}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
          <span>0:00</span>
          {totalDurationMs > 0 && <span>{formatTime(totalDurationMs / 2)}</span>}
          {totalDurationMs > 0 && <span>{formatTime(totalDurationMs)}</span>}
        </div>
      </div>

      {/* Dominant Emotions */}
      {emotionData.dominant_emotions && emotionData.dominant_emotions.length > 0 && (
        <div className="plaid-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Dominant Vocal Emotions</h3>
          <div className="flex flex-wrap gap-2">
            {emotionData.dominant_emotions.map((e, i) => (
              <div
                key={e.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs ${
                  i === 0 ? "bg-muted font-medium" : ""
                }`}
              >
                <span className="text-foreground">{e.name}</span>
                <span className="text-muted-foreground tabular-nums">{(e.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
