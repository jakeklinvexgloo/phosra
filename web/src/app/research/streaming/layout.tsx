"use client"

import { ResearchChatWidget } from "@/app/research/ai-chatbots/_components/ResearchChatWidget"
import { SubNav } from "./_components/SubNav"

export default function StreamingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SubNav />
      {children}
      <ResearchChatWidget />
    </>
  )
}
