"use client"

import { linkifyResearchText } from "@/lib/platform-research/entity-linker"
import { preprocessResearchText } from "./text-preprocessor"
import { chatMdComponents } from "./md-components"
import { CollapsibleMarkdownRenderer } from "./CollapsibleMarkdownRenderer"
import { ParentDetailToggle } from "./widgets/ParentDetailToggle"

interface ChatMessageContentProps {
  text: string
}

export function ChatMessageContent({ text }: ChatMessageContentProps) {
  const processed = linkifyResearchText(preprocessResearchText(text))

  return (
    <ParentDetailToggle markdown={processed}>
      {(content) => (
        <CollapsibleMarkdownRenderer content={content} components={chatMdComponents} />
      )}
    </ParentDetailToggle>
  )
}
