"use client"

import { useState, Children, isValidElement, cloneElement, type ReactNode, type ReactElement } from "react"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

type SortDir = "asc" | "desc" | null

interface InteractiveTableProps {
  children: ReactNode
}

/** Extract text content from React nodes recursively */
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (isValidElement(node)) return extractText((node.props as { children?: ReactNode }).children)
  return ""
}

/** Get cell values from a row element */
function getCellValues(row: ReactElement): string[] {
  const cells: string[] = []
  Children.forEach((row.props as { children?: ReactNode }).children, (child) => {
    if (isValidElement(child)) {
      cells.push(extractText(child))
    }
  })
  return cells
}

/** Smart comparison: numbers first, then strings */
function compareValues(a: string, b: string): number {
  const numA = parseFloat(a.replace(/[^0-9.-]/g, ""))
  const numB = parseFloat(b.replace(/[^0-9.-]/g, ""))
  if (!isNaN(numA) && !isNaN(numB)) return numA - numB
  return a.localeCompare(b)
}

/** Parse table children into thead and tbody rows */
function parseTableChildren(children: ReactNode): {
  thead: ReactElement | null
  rows: ReactElement[]
} {
  let thead: ReactElement | null = null
  const rows: ReactElement[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const type = child.type
    const className = (child.props as { className?: string }).className ?? ""
    if (type === "thead" || className.includes("bg-white/[0.08]")) {
      thead = child
    } else if (type === "tbody") {
      Children.forEach((child.props as { children?: ReactNode }).children, (row) => {
        if (isValidElement(row)) rows.push(row)
      })
    }
  })

  return { thead, rows }
}

export function InteractiveTable({ children }: InteractiveTableProps) {
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const { thead: theadElement, rows: tbodyRows } = parseTableChildren(children)

  // If fewer than 4 rows, just render normally (no sort)
  if (tbodyRows.length < 4) {
    return <>{children}</>
  }

  const handleHeaderClick = (colIndex: number) => {
    if (sortCol === colIndex) {
      if (sortDir === "asc") setSortDir("desc")
      else if (sortDir === "desc") {
        setSortCol(null)
        setSortDir(null)
      }
    } else {
      setSortCol(colIndex)
      setSortDir("asc")
    }
  }

  // Sort rows
  const sortedRows = [...tbodyRows]
  if (sortCol !== null && sortDir) {
    sortedRows.sort((a, b) => {
      const aVals = getCellValues(a)
      const bVals = getCellValues(b)
      const aVal = aVals[sortCol] ?? ""
      const bVal = bVals[sortCol] ?? ""
      const cmp = compareValues(aVal, bVal)
      return sortDir === "asc" ? cmp : -cmp
    })
  }

  // Enhance thead with sort indicators
  const enhancedThead = theadElement
    ? cloneElement(theadElement, {},
        Children.map(
          (theadElement.props as { children?: ReactNode }).children,
          (row) => {
            if (!isValidElement(row)) return row
            return cloneElement(row as ReactElement, {},
              Children.map(
                (row.props as { children?: ReactNode }).children,
                (th, colIdx) => {
                  if (!isValidElement(th)) return th
                  const isActive = sortCol === colIdx
                  const SortIcon = isActive
                    ? sortDir === "asc"
                      ? ArrowUp
                      : ArrowDown
                    : ArrowUpDown

                  const thProps = th.props as { className?: string; children?: ReactNode }

                  return (
                    <th
                      key={colIdx}
                      className={(thProps.className ?? "") + " cursor-pointer select-none hover:text-white/90 transition-colors"}
                      onClick={() => handleHeaderClick(colIdx!)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {thProps.children}
                        <SortIcon className={`w-3 h-3 ${isActive ? "text-brand-green" : "text-white/30"}`} />
                      </span>
                    </th>
                  )
                }
              )
            )
          }
        )
      )
    : null

  return (
    <>
      {enhancedThead}
      <tbody>{sortedRows}</tbody>
    </>
  )
}
