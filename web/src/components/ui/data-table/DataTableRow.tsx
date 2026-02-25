import { cn } from "@/lib/utils"
import type { ColumnDef } from "./types"

const HIDE_CLASSES: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
}

function getValue<T>(row: T, accessor: keyof T | ((row: T) => unknown)): unknown {
  return typeof accessor === "function" ? accessor(row) : row[accessor]
}

interface DataTableRowProps<T> {
  row: T
  columns: ColumnDef<T>[]
  onClick?: () => void
  isExpanded?: boolean
  expandedContent?: React.ReactNode
  className?: string
}

export function DataTableRow<T>({
  row,
  columns,
  onClick,
  isExpanded,
  expandedContent,
  className,
}: DataTableRowProps<T>) {
  return (
    <>
      <tr
        className={cn(
          "border-b border-border/50 transition-colors duration-150",
          onClick && "cursor-pointer",
          isExpanded ? "bg-muted/30" : "hover:bg-muted/40",
          className
        )}
        onClick={onClick}
      >
        {columns.map((col) => {
          const value = getValue(row, col.accessor)
          const align = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
          return (
            <td
              key={col.id}
              className={cn(
                "py-2.5 px-4",
                align,
                col.hideBelow && HIDE_CLASSES[col.hideBelow],
                col.className
              )}
              onClick={col.interactive ? (e) => e.stopPropagation() : undefined}
            >
              {col.cell ? col.cell(value, row) : (value as React.ReactNode) ?? "—"}
            </td>
          )
        })}
      </tr>
      {isExpanded && expandedContent && (
        <tr className="border-b border-border">
          <td colSpan={columns.length} className="bg-muted/20 px-6 py-4">
            {expandedContent}
          </td>
        </tr>
      )}
    </>
  )
}
