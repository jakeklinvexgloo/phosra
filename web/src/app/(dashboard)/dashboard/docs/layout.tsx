"use client"

import { DocsSidebar } from "@/components/docs/DocsSidebar"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6 items-start">
      <DocsSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
