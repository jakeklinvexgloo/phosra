"use client"

import { DocsSidebar } from "@/components/docs/DocsSidebar"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-three-col">
      {/* Left sidebar — fixed width, sticky */}
      <DocsSidebar />
      {/* Center content + Right code panel handled via SideBySideLayout grid within EndpointCard */}
      <div className="docs-content-area min-w-0">{children}</div>
    </div>
  )
}
