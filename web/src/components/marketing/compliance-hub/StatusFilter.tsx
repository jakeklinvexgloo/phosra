"use client"


interface StatusFilterProps {
  active: string
  onSelect: (status: string) => void
}

const PILLS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "enacted", label: "Enacted" },
  { id: "passed", label: "Passed" },
  { id: "pending", label: "Pending" },
  { id: "proposed", label: "Proposed" },
]

export function StatusFilter({ active, onSelect }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PILLS.map((pill) => {
        const isActive = active === pill.id
        const isStatusPill = pill.id !== "all"

        return (
          <button
            key={pill.id}
            onClick={() => onSelect(pill.id)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full transition-colors
              ${
                isActive && isStatusPill
                  ? "bg-foreground/10 text-foreground font-medium"
                  : isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {pill.label}
          </button>
        )
      })}
    </div>
  )
}
