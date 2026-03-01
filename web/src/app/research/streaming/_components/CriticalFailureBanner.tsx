"use client"

import { AlertTriangle } from "lucide-react"
import { gradeBgColor, gradeTextColor, gradeBorderColor } from "@/lib/shared/grade-colors"

interface CriticalFailureBannerProps {
  cfoId: string
  description: string
  affectedProfiles: string[]
  gradeCap: string
  testId?: string
}

export function CriticalFailureBanner({
  cfoId,
  description,
  affectedProfiles,
  gradeCap,
  testId,
}: CriticalFailureBannerProps) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-red-400">
              {cfoId}
            </span>
            {testId && (
              <span className="text-xs font-mono text-muted-foreground">
                ({testId})
              </span>
            )}
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold ${gradeBgColor(gradeCap)} ${gradeTextColor(gradeCap)} ${gradeBorderColor(gradeCap)} border`}
            >
              Grade capped at {gradeCap}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/90">{description}</p>
          {affectedProfiles.length > 0 && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Affected profiles:{" "}
              {affectedProfiles.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
