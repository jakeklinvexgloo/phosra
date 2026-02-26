"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

/* ── Syntax colorizers ─────────────────────────────── */

function colorizeJson(text: string) {
  return text.split("\n").map((line, i) => {
    // Comment lines
    if (line.trimStart().startsWith("//")) {
      return (
        <span key={i}>
          <span className="text-white/30">{line}</span>
          {"\n"}
        </span>
      )
    }
    const parts = line.split(/("(?:[^"\\]|\\.)*")/g)
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('"')) {
            const isKey = line.indexOf(part) < line.indexOf(":")
            return (
              <span key={j} className={isKey ? "text-sky-300" : "text-amber-300"}>
                {part}
              </span>
            )
          }
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

function colorizeGo(text: string) {
  return text.split("\n").map((line, i) => {
    // Comment lines
    if (line.trimStart().startsWith("//")) {
      return (
        <span key={i}>
          <span className="text-white/30">{line}</span>
          {"\n"}
        </span>
      )
    }

    const tokens: React.ReactNode[] = []
    let rest = line
    let key = 0

    const push = (t: string, cls?: string) => {
      tokens.push(
        cls ? (
          <span key={key++} className={cls}>{t}</span>
        ) : (
          <span key={key++}>{t}</span>
        )
      )
    }

    let m: RegExpMatchArray | null
    while (rest.length > 0) {
      if ((m = rest.match(/^(func|type|interface|return|for|if|else|range|var|package|import|defer|go|chan|select|case|switch|break|continue|map|struct|const)\b/))) {
        push(m[0], "text-purple-400")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^(context|provider|domain|error|string|bool|int|any|true|false|nil)\b/))) {
        push(m[0], "text-sky-300")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^(Context|Adapter|PlatformInfo|Capability|AuthConfig|EnforcementRequest|EnforcementResult|PolicyRule|RuleRouting|CompositeEngine)\b/))) {
        push(m[0], "text-sky-300")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^(Info|Capabilities|ValidateAuth|EnforcePolicy|GetCurrentConfig|RevokePolicy|SupportsWebhooks|RegisterWebhook|RouteRules)\b/))) {
        push(m[0], "text-brand-green")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^(matchesCapability|append)\b/))) {
        push(m[0], "text-brand-green")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^"(?:[^"\\]|\\.)*"/))) {
        push(m[0], "text-amber-300")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^\d+/))) {
        push(m[0], "text-purple-300")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^[{}()\[\],.:;*&]+/))) {
        push(m[0], "text-white/40")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^\s+/))) {
        push(m[0])
        rest = rest.slice(m[0].length)
      } else {
        push(rest[0], "text-white/60")
        rest = rest.slice(1)
      }
    }

    return (
      <span key={i}>
        {tokens}
        {"\n"}
      </span>
    )
  })
}

function colorize(text: string, language: string) {
  if (language === "json") return colorizeJson(text)
  if (language === "go") return colorizeGo(text)
  return colorizeJson(text)
}

/* ── Component ─────────────────────────────────────── */

interface BlogCodeBlockProps {
  code: string
  language: string
  filename?: string
}

export function BlogCodeBlock({ code, language, filename }: BlogCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0D1B2A] my-8">
      {/* Chrome bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          {filename && (
            <span className="text-[10px] text-white/30 font-mono">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/20 font-mono uppercase tracking-wider">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 transition-colors"
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

      {/* Code content */}
      <pre className="p-5 text-[12px] font-mono leading-relaxed overflow-x-auto">
        <code>{colorize(code, language)}</code>
      </pre>
    </div>
  )
}
