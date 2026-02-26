"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useInView } from "framer-motion"
import { AnimatedSection, WaveTexture, GradientMesh } from "./shared"
import { PLATFORM_STATS } from "@/lib/platforms"

/* ── Code snippets (plain strings for typewriter) ───── */

const CODE_SNIPPETS = {
  curl: `curl -X POST https://api.phosra.com/v1/setup/quick \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "family_name": "The Smiths",
    "child_name": "Emma",
    "child_birth_date": "2017-03-15",
    "strictness": "recommended"
  }'`,

  python: `import phosra

client = phosra.Client(api_key="$API_KEY")

result = client.setup.quick(
    family_name="The Smiths",
    child_name="Emma",
    child_birth_date="2017-03-15",
    strictness="recommended"
)

print(f"{result.rules_generated} rules enforced")`,

  node: `import Phosra from "@phosra/sdk";

const client = new Phosra({ apiKey: "$API_KEY" });

const result = await client.setup.quick({
  familyName: "The Smiths",
  childName: "Emma",
  childBirthDate: "2017-03-15",
  strictness: "recommended",
});

console.log(\`\${result.rulesGenerated} rules enforced\`);`,

  response: `// 200 OK — 24 rules generated across 4 platform categories
{
  "family_id": "fam_8x2kP4nL",
  "child": { "name": "Emma", "age": 8 },
  "rules_generated": 24,
  "enforcement": [
    { "Streaming":   "supported", "rules": 6 },
    { "Devices":     "supported", "rules": 8 },
    { "DNS Filter":  "supported", "rules": 5 },
    { "Video":       "supported", "rules": 5 }
  ]
}`,
}

type LangTab = "curl" | "python" | "node"

const LANG_TABS: { key: LangTab; label: string }[] = [
  { key: "curl", label: "cURL" },
  { key: "python", label: "Python" },
  { key: "node", label: "Node.js" },
]

const METRICS = [
  { value: "< 100ms", label: "p50 latency" },
  { value: "99.9%", label: "uptime" },
  { value: "45", label: "safety categories" },
]

/* ── Syntax highlighting ────────────────── */

function highlightLine(line: string, lang: LangTab | "response"): React.ReactNode[] {
  const tokens: React.ReactNode[] = []
  let rest = line
  let key = 0

  const push = (text: string, cls?: string) => {
    tokens.push(
      cls ? (
        <span key={key++} className={cls}>{text}</span>
      ) : (
        <span key={key++}>{text}</span>
      )
    )
  }

  if (lang === "response") {
    // Comment lines
    if (rest.trimStart().startsWith("//")) {
      push(rest, "text-white/30")
      return tokens
    }
    // JSON highlighting
    let m: RegExpMatchArray | null
    while (rest.length > 0) {
      if ((m = rest.match(/^("(?:[^"\\]|\\.)*")\s*:/))) {
        // JSON key
        push(m[1], "text-sky-300")
        rest = rest.slice(m[1].length)
      } else if ((m = rest.match(/^:\s*("(?:[^"\\]|\\.)*")/))) {
        push(": ", "text-white/40")
        push(m[1].trim(), "text-brand-green")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^"(?:[^"\\]|\\.)*"/))) {
        push(m[0], "text-brand-green")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^\d+/))) {
        push(m[0], "text-amber-400")
        rest = rest.slice(m[0].length)
      } else if ((m = rest.match(/^[{}\[\],:\s]+/))) {
        push(m[0], "text-white/40")
        rest = rest.slice(m[0].length)
      } else {
        push(rest[0], "text-white/50")
        rest = rest.slice(1)
      }
    }
    return tokens
  }

  // Comment lines
  if (rest.trimStart().startsWith("//") || rest.trimStart().startsWith("#")) {
    push(rest, "text-white/30")
    return tokens
  }

  // Generic highlighting for curl/python/node
  let m: RegExpMatchArray | null
  while (rest.length > 0) {
    if ((m = rest.match(/^(import|from|const|let|await|new|print|console)\b/))) {
      push(m[0], "text-purple-400")
      rest = rest.slice(m[0].length)
    } else if ((m = rest.match(/^(curl|-X|-H|-d)\b/))) {
      push(m[0], "text-sky-400")
      rest = rest.slice(m[0].length)
    } else if ((m = rest.match(/^(POST|GET|PUT|DELETE)\b/))) {
      push(m[0], "text-sky-400")
      rest = rest.slice(m[0].length)
    } else if ((m = rest.match(/^(https?:\/\/[^\s\\]+)/))) {
      push(m[0], "text-brand-green")
      rest = rest.slice(m[0].length)
    } else if ((m = rest.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/))) {
      push(m[0], "text-emerald-400")
      rest = rest.slice(m[0].length)
    } else if ((m = rest.match(/^f"/))) {
      // Python f-string start
      push('f"', "text-emerald-400")
      rest = rest.slice(2)
    } else if ((m = rest.match(/^\d+/))) {
      push(m[0], "text-amber-400")
      rest = rest.slice(m[0].length)
    } else if ((m = rest.match(/^(phosra|Phosra|client|result)\b/))) {
      push(m[0], "text-sky-300")
      rest = rest.slice(m[0].length)
    } else if ((m = rest.match(/^\\\n?$/))) {
      push(m[0], "text-white/30")
      rest = rest.slice(m[0].length)
    } else if ((m = rest.match(/^(\.|=|=>|\(|\)|{|}|,|;|\[|\]|:)+/))) {
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
  return tokens
}

/* ── Highlighted code block (static, for reduced-motion / final state) ── */

function HighlightedCode({
  code,
  lang,
  visibleChars,
}: {
  code: string
  lang: LangTab | "response"
  visibleChars?: number
}) {
  const lines = code.split("\n")
  let charsSoFar = 0

  return (
    <code className="block px-3 sm:px-5 py-4 sm:py-5 text-[10px] sm:text-[13px] leading-5 sm:leading-6 font-mono">
      {lines.map((line, i) => {
        const lineStart = charsSoFar
        charsSoFar += line.length + 1 // +1 for newline

        // If typewriter is active, determine how much of this line to show
        let displayLine = line
        if (visibleChars !== undefined) {
          if (lineStart >= visibleChars) return null // Line not yet reached
          const charsAvail = visibleChars - lineStart
          if (charsAvail < line.length) {
            displayLine = line.slice(0, charsAvail)
          }
        }

        const isEnforcementLine =
          lang === "response" && displayLine.includes('"enforcement"')

        return (
          <div
            key={i}
            className={
              isEnforcementLine
                ? "bg-brand-green/[0.06] -mx-3 sm:-mx-5 px-3 sm:px-5 border-l-2 border-brand-green"
                : ""
            }
          >
            <span className="inline-block w-6 sm:w-8 text-right text-white/20 select-none mr-2 sm:mr-4">
              {i + 1}
            </span>
            {highlightLine(displayLine, lang)}
            {"\n"}
          </div>
        )
      })}
    </code>
  )
}

/* ── Main Section ────────────────────────── */

export function DevSection() {
  const codeRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(codeRef, { once: false, amount: 0.3 })

  const [lang, setLang] = useState<LangTab>("curl")
  const [showResponse, setShowResponse] = useState(false)
  const [visibleChars, setVisibleChars] = useState(0)
  const [typingDone, setTypingDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepRef = useRef<"typing" | "pause" | "response-typing" | "response-pause" | "idle">("idle")
  const langRef = useRef<LangTab>("curl")

  // Reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    }
  }, [])

  // Cleanup helper
  const clearTimers = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  // Typewriter engine
  const typeCode = (text: string, speed: number, onDone: () => void) => {
    let idx = 0
    setVisibleChars(0)
    intervalRef.current = setInterval(() => {
      idx += 2 // 2 chars per tick for speed
      if (idx >= text.length) {
        idx = text.length
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        setVisibleChars(idx)
        onDone()
        return
      }
      setVisibleChars(idx)
    }, speed)
  }

  // Animation sequence
  const runSequence = () => {
    clearTimers()
    const currentLang = langRef.current
    const code = CODE_SNIPPETS[currentLang]

    // Reset state
    setShowResponse(false)
    setTypingDone(false)
    setLang(currentLang)
    setVisibleChars(0)
    stepRef.current = "typing"

    // Step 1: Type out the request code (~3s)
    typeCode(code, 20, () => {
      setTypingDone(true)
      stepRef.current = "pause"

      // Step 2: Pause 2s, then switch to response
      timerRef.current = setTimeout(() => {
        setShowResponse(true)
        setVisibleChars(0)
        setTypingDone(false)
        stepRef.current = "response-typing"

        // Step 3: Type out response (~2.5s)
        typeCode(CODE_SNIPPETS.response, 18, () => {
          setTypingDone(true)
          stepRef.current = "response-pause"

          // Step 4: Pause 3.5s, then cycle to next language
          timerRef.current = setTimeout(() => {
            const langs: LangTab[] = ["curl", "python", "node"]
            const nextIdx = (langs.indexOf(langRef.current) + 1) % langs.length
            langRef.current = langs[nextIdx]
            stepRef.current = "idle"
            runSequence()
          }, 3500)
        })
      }, 2000)
    })
  }

  // Start/stop based on visibility and hover
  useEffect(() => {
    if (prefersReducedMotion) return

    if (isInView && !isHovered) {
      // Small delay before starting
      timerRef.current = setTimeout(() => runSequence(), 400)
    } else {
      clearTimers()
      if (!isInView) {
        // Full reset when out of view
        stepRef.current = "idle"
        langRef.current = "curl"
        setLang("curl")
        setShowResponse(false)
        setVisibleChars(0)
        setTypingDone(false)
      }
    }

    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, isHovered, prefersReducedMotion])

  // Copy handler
  const handleCopy = async () => {
    const text = showResponse ? CODE_SNIPPETS.response : CODE_SNIPPETS[lang]
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  // Manual tab switch
  const handleLangTab = (newLang: LangTab) => {
    if (newLang === lang && !showResponse) return
    clearTimers()
    langRef.current = newLang
    setLang(newLang)
    setShowResponse(false)
    setVisibleChars(CODE_SNIPPETS[newLang].length)
    setTypingDone(true)
    stepRef.current = "idle"
    // Restart sequence after a pause
    timerRef.current = setTimeout(() => runSequence(), 4000)
  }

  const handleResponseTab = () => {
    if (showResponse) return
    clearTimers()
    setShowResponse(true)
    setVisibleChars(CODE_SNIPPETS.response.length)
    setTypingDone(true)
    stepRef.current = "idle"
    timerRef.current = setTimeout(() => runSequence(), 4000)
  }

  // Current code & lang for display
  const activeCode = showResponse ? CODE_SNIPPETS.response : CODE_SNIPPETS[lang]
  const activeLang: LangTab | "response" = showResponse ? "response" : lang

  // Blinking cursor visible when typing
  const showCursor = !typingDone && !prefersReducedMotion && isInView

  return (
    <section id="developers" className="relative py-24 sm:py-32 overflow-hidden bg-[#0A1628]">
      <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.08} />
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0A1628"]}
        className="opacity-40"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-20 items-center">
          {/* Left — text */}
          <AnimatedSection direction="left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-xs font-medium text-white/70">For Developers</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-[42px] xl:text-[52px] text-white leading-[1.15] mb-6">
              {PLATFORM_STATS.marketingTotal} platforms.{" "}
              <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                One open spec.
              </span>
            </h2>

            <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-10 max-w-sm sm:max-w-lg">
              Quick Setup creates a family, adds a child, generates 24 age-appropriate rules, and pushes them to every connected platform &mdash; across streaming, devices, DNS filters, and more &mdash; all in a single request.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group relative inline-flex items-center px-7 py-3.5 bg-brand-green text-foreground text-sm font-semibold rounded-sm transition-all hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)]"
              >
                Get API Keys
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/dashboard/docs"
                className="inline-flex items-center px-7 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 hover:border-white/30 transition-all"
              >
                Read the Docs
              </Link>
            </div>
          </AnimatedSection>

          {/* Right — interactive code block */}
          <AnimatedSection direction="right" delay={0.2} className="min-w-0">
            <div
              ref={codeRef}
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Glow behind code block */}
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-green/10 via-accent-teal/5 to-transparent rounded-2xl blur-2xl" />

              <div className="relative bg-[#0D1117] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_60px_-12px_rgba(0,212,126,0.15)]">
                {/* Terminal header */}
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-white/30 font-mono ml-1 sm:ml-2">Terminal</span>
                  <span className="ml-auto text-[10px] sm:text-[11px] text-white/30 font-mono hidden sm:inline">/v1/setup/quick</span>
                </div>

                {/* Language tabs + Response tab */}
                <div className="flex items-center gap-0.5 sm:gap-1 px-3 sm:px-5 py-2 border-b border-white/[0.04] bg-white/[0.01] overflow-x-auto no-scrollbar">
                  {LANG_TABS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => handleLangTab(t.key)}
                      className={`px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono rounded transition-colors shrink-0 ${
                        lang === t.key && !showResponse
                          ? "text-white bg-white/10"
                          : "text-white/30 hover:text-white/60"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                  <div className="w-px h-4 bg-white/[0.08] mx-0.5 sm:mx-1 shrink-0" />
                  <button
                    onClick={handleResponseTab}
                    className={`px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono rounded transition-colors shrink-0 ${
                      showResponse
                        ? "text-brand-green bg-brand-green/10"
                        : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    Response
                  </button>

                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    className="ml-auto flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] font-mono rounded border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/15 transition-all shrink-0"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3 h-3 text-brand-green" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-brand-green">Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Code content */}
                <div className="relative overflow-x-auto min-h-[260px] sm:min-h-[300px]">
                  {prefersReducedMotion ? (
                    <HighlightedCode
                      code={CODE_SNIPPETS.curl}
                      lang="curl"
                    />
                  ) : (
                    <pre className="relative">
                      <HighlightedCode
                        code={activeCode}
                        lang={activeLang}
                        visibleChars={visibleChars}
                      />
                      {/* Blinking cursor */}
                      {showCursor && (
                        <span className="inline-block w-[2px] h-4 bg-brand-green animate-pulse absolute" style={{ marginLeft: -1 }} />
                      )}
                    </pre>
                  )}
                </div>
              </div>

              {/* Metric pills below code block */}
              <div className="flex flex-wrap gap-3 mt-5">
                {METRICS.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm"
                  >
                    <span className="text-sm font-bold text-white">{m.value}</span>
                    <span className="text-xs text-white/40">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
