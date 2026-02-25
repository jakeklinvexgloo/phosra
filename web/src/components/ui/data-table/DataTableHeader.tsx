import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ColumnDef, SortState } from "./types"

interface DataTableHeaderProps<T> {
  columns: ColumnDef<T>[]
  sort: SortState | null
  onSort: (key: string) => void
}

const HIDE_CLASSES: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
}

export function DataTableHeader<T>({ columns, sort, onSort }: DataTableHeaderProps<T>) {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/30">
        {columns.map((col) => {
          const isSorted = sort?.key === col.id
          const align = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
          return (
            <th
              key={col.id}
              className={cn(
                "py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70",
                align,
                col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                col.hideBelow && HIDE_CLASSES[col.hideBelow],
                col.className
              )}
              onClick={() => col.sortable && onSort(col.id)}
            >
              <span className="inline-flex items-center gap-1">
                {col.header}
                {col.sortable && isSorted && (
                  sort.direction === "asc"
                    ? <ChevronUp className="w-3 h-3" />
                    : <ChevronDown className="w-3 h-3" />
                )}
              </span>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
