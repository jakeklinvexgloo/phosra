export type SortDirection = "asc" | "desc"

export interface SortState {
  key: string
  direction: SortDirection
}

export interface ColumnDef<T> {
  id: string
  /** Property path or accessor function */
  accessor: keyof T | ((row: T) => unknown)
  header: string
  cell?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
  sortFn?: (a: T, b: T, direction: SortDirection) => number
  align?: "left" | "center" | "right"
  /** Hide below this breakpoint */
  hideBelow?: "sm" | "md" | "lg"
  /** If true, clicks in this cell won't trigger row click */
  interactive?: boolean
  className?: string
}
