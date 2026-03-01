"use client"

import { SubNav } from "./_components/SubNav"

export default function AIChatbotsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SubNav />
      {children}
    </>
  )
}
