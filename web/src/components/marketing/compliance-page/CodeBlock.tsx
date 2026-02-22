"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  title: string
  language: string
  code: string
  response?: string
}

function colorizeJson(text: string) {
  return text.split("\n").map((line, i) => {
    // String values
    const parts = line.split(/("(?:[^"\\]|\\.)*")/g)
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('"')) {
            // Key vs value: keys are followed by ":"
            const isKey = line.indexOf(part) < line.indexOf(":")
            return (
              <span key={j} className={isKey ? "text-sky-300" : "text-amber-300"}>
                {part}
              </span>
            )
          }
          // Numbers
          const numParts = part.split(/(\b\d+\.?\d*\b)/g)
          return (
            <span key={j}>
              {numParts.map((np, k) =>
                /^\d+\.?\d*$/.test(np) ? (
                  <span key={k} className="text-purple-300">{np}</span>
                ) : (
                  <span key={k} className="text-white/60">{np}</span>
                )
              )}
            </span>
          )
        })}
        {"\n"}
      </span>
    )
  })
}

function colorizeBash(text: string) {
  return text.split("\n").map((line, i) => {
    // Comment lines
    if (line.trimStart().startsWith("#")) {
      return (
        <span key={i} className="text-emerald-400">
          {line}{"\n"}
        </span>
      )
    }
    // curl command
    if (line.trimStart().startsWith("curl")) {
      return (
        <span key={i}>
          <span className="text-emerald-400">curl</span>
          <span className="text-white/70">{line.slice(line.indexOf("curl") + 4)}</span>
          {"\n"}
        </span>
      )
    }
    // Headers with -H
    if (line.trimStart().startsWith("-H")) {
      const parts = line.split(/("(?:[^"\\]|\\.)*")/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('"') ? (
              <span key={j} className="text-amber-300">{part}</span>
            ) : (
              <span key={j} className="text-sky-300">{part}</span>
            )
          )}
          {"\n"}
        </span>
      )
    }
    // Data flag -d
    if (line.trimStart().startsWith("-d")) {
      return (
        <span key={i}>
          <span className="text-sky-300">{line.slice(0, line.indexOf("-d") + 2)}</span>
          <span className="text-white/70">{line.slice(line.indexOf("-d") + 2)}</span>
          {"\n"}
        </span>
      )
    }
    // Strings in quotes
    if (line.includes('"')) {
      const parts = line.split(/("(?:[^"\\]|\\.)*")/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('"') ? (
              <span key={j} className="text-amber-300">{part}</span>
            ) : (
              <span key={j} className="text-white/70">{part}</span>
            )
          )}
          {"\n"}
        </span>
      )
    }
    return (
      <span key={i} className="text-white/70">
        {line}{"\n"}
      </span>
    )
  })
}

function colorize(text: string, language: string) {
  if (language === "json") return colorizeJson(text)
  if (language === "bash") return colorizeBash(text)
  // Fallback
  return text.split("\n").map((line, i) => (
    <span key={i} className="text-white/70">{line}{"\n"}</span>
  ))
}

export function CodeBlock({ title, language, code, response }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState<"request" | "response">("request")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = activeTab === "request" ? code : (response ?? "")
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayCode = activeTab === "request" ? code : (response ?? "")
  const displayLang = activeTab === "request" ? language : "json"

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0D1B2A]">
      {/* Chrome bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] text-white/30 font-mono">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/20 font-mono uppercase tracking-wider">
            {displayLang}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white/30" />
            )}
          </button>
        </div>
      </div>

      {/* Tab bar (only when response exists) */}
      {response && (
        <div className="flex border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab("request")}
            className={`px-4 py-2.5 text-[11px] font-medium transition-colors ${
              activeTab === "request"
                ? "text-brand-green border-b border-brand-green bg-white/[0.03]"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab("response")}
            className={`px-4 py-2.5 text-[11px] font-medium transition-colors ${
              activeTab === "response"
                ? "text-brand-green border-b border-brand-green bg-white/[0.03]"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            Response
          </button>
        </div>
      )}

      {/* Code content */}
      <pre className="p-4 text-[12px] font-mono leading-relaxed overflow-x-auto">
        <code>{colorize(displayCode, displayLang)}</code>
      </pre>
    </div>
  )
}
