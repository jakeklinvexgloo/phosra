interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function Accordion({ title, children, defaultOpen }: AccordionProps) {
  return (
    <details className="my-4 group border border-border rounded-lg" open={defaultOpen}>
      <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors rounded-lg list-none [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 text-sm text-muted-foreground [&>p]:m-0">
        {children}
      </div>
    </details>
  )
}

interface AccordionGroupProps {
  children: React.ReactNode
}

export function AccordionGroup({ children }: AccordionGroupProps) {
  return <div className="my-6 space-y-2">{children}</div>
}
