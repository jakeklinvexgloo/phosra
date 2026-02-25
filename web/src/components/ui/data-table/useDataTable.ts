"use client"

import { useMemo, useState } from "react"
import type { SortState, ColumnDef } from "./types"

interface UseDataTableOptions<T> {
  data: T[]
  columns: ColumnDef<T>[]
  initialSort?: SortState
  searchKeys?: (keyof T)[]
}

interface UseDataTableReturn<T> {
  rows: T[]
  sort: SortState | null
  toggleSort: (key: string) => void
  search: string
  setSearch: (value: string) => void
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  toggleExpanded: (id: string) => void
}

function getValue<T>(row: T, accessor: keyof T | ((row: T) => unknown)): unknown {
  return typeof accessor === "function" ? accessor(row) : row[accessor]
}

export function useDataTable<T>({
  data,
  columns,
  initialSort,
  searchKeys = [],
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc" ? { key, direction: "desc" } : null
      }
      return { key, direction: "asc" }
    })
  }

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const rows = useMemo(() => {
    let result = [...data]

    // Search
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        searchKeys.some((key) => {
          const val = row[key]
          return typeof val === "string" && val.toLowerCase().includes(q)
        })
      )
    }

    // Sort
    if (sort) {
      const col = columns.find((c) => c.id === sort.key)
      if (col) {
        result.sort((a, b) => {
          if (col.sortFn) return col.sortFn(a, b, sort.direction)
          const aVal = getValue(a, col.accessor)
          const bVal = getValue(b, col.accessor)
          if (aVal == null && bVal == null) return 0
          if (aVal == null) return 1
          if (bVal == null) return -1
          let cmp = 0
          if (typeof aVal === "number" && typeof bVal === "number") {
            cmp = aVal - bVal
          } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
            cmp = aVal === bVal ? 0 : aVal ? -1 : 1
          } else {
            cmp = String(aVal).localeCompare(String(bVal))
          }
          return sort.direction === "asc" ? cmp : -cmp
        })
      }
    }

    return result
  }, [data, columns, search, searchKeys, sort])

  return { rows, sort, toggleSort, search, setSearch, expandedId, setExpandedId, toggleExpanded }
}
