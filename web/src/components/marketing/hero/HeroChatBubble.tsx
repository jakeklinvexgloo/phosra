"use client"

interface HeroChatBubbleProps {
  role: "user" | "assistant"
  text: string
  isStreaming?: boolean
}

function Cursor() {
  return (
    <span className="inline-block w-[2px] h-[1em] bg-brand-green animate-pulse ml-0.5 align-text-bottom" />
  )
}

export function HeroChatBubble({ role, text, isStreaming }: HeroChatBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-white/[0.08] rounded-2xl rounded-br-md px-3.5 py-2 max-w-[85%]">
          <p className="text-sm text-white/90 leading-relaxed">
            {text}
            {isStreaming && <Cursor />}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[90%]">
      <p className="text-sm text-white/70 leading-relaxed">
        {text}
        {isStreaming && <Cursor />}
      </p>
    </div>
  )
}
