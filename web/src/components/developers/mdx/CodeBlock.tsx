"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface CodeBlockProps {
  children?: React.ReactNode
  className?: string
  "data-language"?: string
  [key: string]: any
}

export function CodeBlock({ children, className, "data-language": lang, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const language = lang || className?.match(/language-(\w+)/)?.[1] || ""

  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === "string") return node
    if (Array.isArray(node)) return node.map(getTextContent).join("")
    if (node && typeof node === "object" && "props" in node) {
      return getTextContent((node as any).props.children)
    }
    return ""
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getTextContent(children))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      {language && (
        <span className="absolute top-2.5 left-4 text-[11px] font-mono text-zinc-500">
          {language}
        </span>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-3 flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
      </button>
      <pre className={className} {...props}>
        {children}
      </pre>
    </div>
  )
}
