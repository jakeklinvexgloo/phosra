"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface CodePanelProps {
  title?: string
  code: string
  language?: string
}

export function CodePanel({ title, code, language = "bash" }: CodePanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-[12px] text-zinc-400 font-medium">{title}</span>
          )}
          <span className="text-[11px] text-zinc-500 font-mono">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code block */}
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code className="text-zinc-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}
