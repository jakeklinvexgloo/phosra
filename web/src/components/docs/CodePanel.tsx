"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface CodePanelProps {
  title?: string
  code: string
  language?: string
  /** Optional alternative code snippets in other languages */
  alternatives?: { label: string; language: string; code: string }[]
}

export function CodePanel({ title, code, language = "bash", alternatives }: CodePanelProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const tabs = alternatives
    ? [{ label: language === "curl" ? "cURL" : language, language, code }, ...alternatives]
    : null

  const displayCode = tabs ? tabs[activeTab].code : code
  const displayLanguage = tabs ? tabs[activeTab].language : language

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode)
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
          {tabs ? (
            <div className="flex items-center gap-0.5 ml-1">
              {tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                    activeTab === i
                      ? "bg-zinc-700 text-zinc-200"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500 font-mono">{displayLanguage}</span>
          )}
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
        <code className="text-zinc-300 font-mono whitespace-pre">{displayCode}</code>
      </pre>
    </div>
  )
}
