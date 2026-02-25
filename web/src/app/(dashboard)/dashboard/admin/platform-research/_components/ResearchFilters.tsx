"use client"

import { Search, Play } from "lucide-react"
import { CATEGORY_META } from "@/lib/platforms"
import type { ResearchStatus } from "@/lib/platform-research/types"

export interface ResearchFilterState {
  category: string
  status: string
  search: string
}

interface ResearchFiltersProps {
  filters: ResearchFilterState
  onFiltersChange: (filters: ResearchFilterState) => void
  onBulkResearch: () => void
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "running", label: "Running" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "not_started", label: "Not Started" },
  { value: "has_adapter", label: "Has Adapter" },
]

export function ResearchFilters({
  filters,
  onFiltersChange,
  onBulkResearch,
}: ResearchFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Category dropdown */}
      <select
        value={filters.category}
        onChange={(e) =>
          onFiltersChange({ ...filters, category: e.target.value })
        }
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">All Categories</option>
        {CATEGORY_META.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) =>
          onFiltersChange({ ...filters, status: e.target.value })
        }
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search platforms..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Bulk research button */}
      <button
        onClick={onBulkResearch}
        className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
      >
        <Play className="w-3.5 h-3.5" />
        Research All
      </button>
    </div>
  )
}
