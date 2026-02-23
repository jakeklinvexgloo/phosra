"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import React from "react"

interface CodeTabsProps {
  children: React.ReactNode
}

export function CodeTabs({ children }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)

  // Extract code blocks from children
  const tabs: { label: string; content: React.ReactNode; code: string }[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      // Handle pre > code blocks produced by rehype-pretty-code
      const props = child.props as any
      const label = props["data-language"] || props.className?.match(/language-(\w+)/)?.[1] || "Code"
      const code = typeof props.children === "string" ? props.children : ""
      tabs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), content: child, code })
    }
  })

  if (tabs.length === 0) return <>{children}</>

  const handleCopy = () => {
    navigator.clipboard.writeText(tabs[activeTab].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <div className="flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                activeTab === i
                  ? "bg-zinc-700 text-zinc-200"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        {tabs[activeTab].content}
      </div>
    </div>
  )
}
