import React from "react"

interface StepsProps {
  children: React.ReactNode
}

interface StepProps {
  title?: string
  children: React.ReactNode
}

export function Step({ title, children }: StepProps) {
  return (
    <div className="relative pl-10 pb-8 last:pb-0">
      {children && (
        <div className="text-sm text-muted-foreground [&>p]:m-0 [&>p:first-child]:mt-0">
          {title && <h4 className="text-sm font-semibold text-foreground mb-2 mt-0">{title}</h4>}
          {children}
        </div>
      )}
    </div>
  )
}

export function Steps({ children }: StepsProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement)

  return (
    <div className="my-6 relative">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-1 bottom-1 w-px bg-border" />
      {items.map((child, i) => (
        <div key={i} className="relative">
          {/* Number circle */}
          <div className="absolute left-0 top-0 w-[30px] h-[30px] rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground z-10">
            {i + 1}
          </div>
          {child}
        </div>
      ))}
    </div>
  )
}
