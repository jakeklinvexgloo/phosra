"use client"

import { useState, Children, isValidElement } from "react"

interface TabsProps {
  children: React.ReactNode
}

interface TabProps {
  title: string
  children: React.ReactNode
}

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

export function Tabs({ children }: TabsProps) {
  const [active, setActive] = useState(0)

  const tabs: { title: string; content: React.ReactNode }[] = []
  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.props as any).title) {
      tabs.push({
        title: (child.props as any).title,
        content: (child.props as any).children,
      })
    }
  })

  if (tabs.length === 0) return <>{children}</>

  return (
    <div className="my-6">
      <div className="flex border-b border-border gap-0">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === i
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="pt-4">{tabs[active]?.content}</div>
    </div>
  )
}
