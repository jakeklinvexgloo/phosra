"use client"

const METHOD_STYLES: Record<string, string> = {
  "API Read": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "API Write": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Playwright": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Playwright + MFA": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Built-in": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Phosra-Managed": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
}

interface EnforcementMethodBadgeProps {
  method: string
}

export function EnforcementMethodBadge({ method }: EnforcementMethodBadgeProps) {
  const styles = METHOD_STYLES[method] ?? "bg-muted text-muted-foreground"

  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${styles}`}
    >
      {method}
    </span>
  )
}
