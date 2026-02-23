interface CardGridProps {
  cols?: number
  children: React.ReactNode
}

export function CardGrid({ cols = 2, children }: CardGridProps) {
  return (
    <div
      className="my-6 grid gap-4"
      style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  )
}
