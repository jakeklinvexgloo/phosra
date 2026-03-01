"use client"

import { AlertTriangle } from "lucide-react"
import { gradeTextColor, gradeBgColor, gradeBorderColor } from "@/lib/shared/grade-colors"

interface ProfileScoreCardProps {
  profileName: string
  grade: string
  score: number
  isCapped: boolean
  criticalFailureCount: number
}

export function ProfileScoreCard({
  profileName,
  grade,
  score,
  isCapped,
  criticalFailureCount,
}: ProfileScoreCardProps) {
  return (
    <div className={`rounded-lg border p-3 ${gradeBorderColor(grade)} ${gradeBgColor(grade)}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{profileName}</span>
        {isCapped && (
          <span className="text-[10px] font-medium text-orange-400 flex items-center gap-0.5">
            <AlertTriangle className="h-3 w-3" />
            Capped
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold ${gradeTextColor(grade)}`}>{grade}</span>
        <span className="text-xs text-muted-foreground">{score.toFixed(0)}/100</span>
      </div>
      {criticalFailureCount > 0 && (
        <p className="mt-1 text-[10px] text-red-400">
          {criticalFailureCount} critical failure{criticalFailureCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
