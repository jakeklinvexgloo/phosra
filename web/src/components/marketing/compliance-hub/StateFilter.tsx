"use client"

interface StateFilterProps {
  states: string[]
  active: string | null
  onSelect: (state: string | null) => void
}

export function StateFilter({ states, active, onSelect }: StateFilterProps) {
  return (
    <div className="flex overflow-x-auto sm:flex-wrap gap-1.5 pb-3 border-b border-border mb-4 no-scrollbar">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-full transition-colors ${
          active === null
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        All States
      </button>
      {states.map((state) => (
        <button
          key={state}
          type="button"
          onClick={() => onSelect(state)}
          className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-full transition-colors ${
            active === state
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {state}
        </button>
      ))}
    </div>
  )
}
