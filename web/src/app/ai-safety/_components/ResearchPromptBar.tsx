"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Fuse from "fuse.js"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  ArrowRight,
  Shield,
  BookOpen,
  AlertTriangle,
  MessageSquare,
  Zap,
  Lock,
} from "lucide-react"
import { ResearchChatModal } from "./ResearchChatModal"

// ── Types ───────────────────────────────────────────────────────────

type SearchResultType = "platform" | "dimension" | "category" | "prompt" | "finding" | "control"

interface SearchResultItem {
  type: SearchResultType
  title: string
  description: string
  url: string
  tags: string[]
  grade?: string
  score?: number
  category?: string
}

interface ResearchPromptBarProps {
  items: SearchResultItem[]
}

// ── Constants ───────────────────────────────────────────────────────

const TYPE_ICONS: Record<SearchResultType, typeof Shield> = {
  platform: Shield,
  dimension: BookOpen,
  category: AlertTriangle,
  prompt: MessageSquare,
  finding: Zap,
  control: Lock,
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  platform: "Platforms",
  dimension: "Research Dimensions",
  category: "Harm Categories",
  prompt: "Test Prompts",
  finding: "Key Findings",
  control: "Phosra Controls",
}

const PLACEHOLDER_PROMPTS = [
  "Which platform is safest for a 13-year-old?",
  "Compare ChatGPT vs Claude safety scores",
  "What parental controls does Gemini offer?",
  "How does Phosra fill platform safety gaps?",
  "Which platforms lack age verification?",
]

const EXAMPLE_CHIPS = [
  { label: "Safest for teens", query: "Which platform is safest for a 13-year-old?" },
  { label: "Compare platforms", query: "Compare ChatGPT vs Claude safety" },
  { label: "Parental controls", query: "What parental controls do platforms offer?" },
]

const FUSE_OPTIONS = {
  keys: [
    { name: "title", weight: 2 },
    { name: "description", weight: 1 },
    { name: "tags", weight: 1.5 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
}

const LISTBOX_ID = "research-search-listbox"

// ── Grade Badge ─────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const color = grade.startsWith("A")
    ? "text-emerald-400 bg-emerald-500/20"
    : grade.startsWith("B")
      ? "text-blue-400 bg-blue-500/20"
      : grade.startsWith("C")
        ? "text-amber-400 bg-amber-500/20"
        : "text-red-400 bg-red-500/20"
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>
      {grade}
    </span>
  )
}

// ── Component ───────────────────────────────────────────────────────

export function ResearchPromptBar({ items }: ResearchPromptBarProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)

  // Typewriter state
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderText, setPlaceholderText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState("")

  // ── Fuse.js Search ──────────────────────────────────────────────

  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items])

  const results = useMemo(() => {
    if (!value.trim() || value.trim().length < 2) return []
    return fuse.search(value, { limit: 6 }).map((r) => r.item)
  }, [fuse, value])

  const groupedResults = useMemo(() => {
    const groups: { type: SearchResultType; items: SearchResultItem[] }[] = []
    const typeOrder: SearchResultType[] = ["platform", "dimension", "category", "prompt", "finding", "control"]
    for (const type of typeOrder) {
      const typeItems = results.filter((r) => r.type === type)
      if (typeItems.length > 0) groups.push({ type, items: typeItems })
    }
    return groups
  }, [results])

  const flatResults = useMemo(() => groupedResults.flatMap((g) => g.items), [groupedResults])

  const showDropdown = isOpen && focused && (flatResults.length > 0 || value.trim().length >= 3)

  // ── Typewriter Animation ────────────────────────────────────────

  useEffect(() => {
    if (focused || value) return

    const fullText = PLACEHOLDER_PROMPTS[placeholderIndex]
    let charIndex = 0
    let erasing = false

    const interval = setInterval(() => {
      if (!erasing) {
        charIndex++
        setPlaceholderText(fullText.slice(0, charIndex))
        if (charIndex >= fullText.length) {
          setIsTyping(false)
          setTimeout(() => {
            erasing = true
            setIsTyping(true)
          }, 2000)
        }
      } else {
        charIndex--
        setPlaceholderText(fullText.slice(0, charIndex))
        if (charIndex <= 0) {
          erasing = false
          setIsTyping(true)
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length)
        }
      }
    }, erasing ? 25 : 50)

    return () => clearInterval(interval)
  }, [placeholderIndex, focused, value])

  // ── Effects ─────────────────────────────────────────────────────

  useEffect(() => { setActiveIndex(-1) }, [flatResults])

  useEffect(() => {
    if (flatResults.length > 0 && document.activeElement === inputRef.current) {
      setIsOpen(true)
    }
  }, [flatResults])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // ── Handlers ────────────────────────────────────────────────────

  const navigateTo = useCallback(
    (url: string) => {
      router.push(url)
      setIsOpen(false)
      setValue("")
      inputRef.current?.blur()
    },
    [router],
  )

  const openChat = useCallback((prompt: string) => {
    setChatPrompt(prompt)
    setChatOpen(true)
    setIsOpen(false)
    setValue("")
    inputRef.current?.blur()
  }, [])

  const handleSubmit = useCallback(
    (text?: string) => {
      const prompt = text || value.trim()
      if (!prompt) return
      // If a search result is selected, navigate to it
      if (activeIndex >= 0 && flatResults[activeIndex]) {
        navigateTo(flatResults[activeIndex].url)
      } else {
        // Free-text → open AI chat modal
        openChat(prompt)
      }
    },
    [value, activeIndex, flatResults, navigateTo, openChat],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          if (!isOpen && flatResults.length > 0) {
            setIsOpen(true)
            setActiveIndex(0)
          } else if (isOpen) {
            // +1 for the "Ask AI" row at the end
            const maxIndex = flatResults.length // flatResults.length = "Ask AI" row
            setActiveIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
          }
          break
        case "ArrowUp":
          e.preventDefault()
          if (isOpen) {
            const maxIndex = flatResults.length
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
          }
          break
        case "Enter":
          e.preventDefault()
          if (isOpen && activeIndex >= 0 && activeIndex < flatResults.length) {
            navigateTo(flatResults[activeIndex].url)
          } else {
            // Either "Ask AI" is selected or no result selected → chat
            handleSubmit()
          }
          break
        case "Escape":
          if (isOpen) {
            e.preventDefault()
            setIsOpen(false)
          }
          break
        case "Tab":
          setIsOpen(false)
          break
      }
    },
    [isOpen, flatResults, activeIndex, navigateTo, handleSubmit],
  )

  const activeOptionId = activeIndex >= 0 ? `research-option-${activeIndex}` : undefined

  let flatIndex = -1

  return (
    <>
      <div ref={containerRef} className="relative max-w-xl w-full mx-auto">
        {/* Glow wrapper — animated gradient border */}
        <div className="relative rounded-2xl p-[1px] group">
          {/* Animated gradient border layer */}
          <div
            className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
              focused ? "opacity-100" : "opacity-60"
            }`}
            style={{
              background: "linear-gradient(135deg, rgba(0,212,126,0.4), rgba(0,180,216,0.2), rgba(0,212,126,0.1), rgba(0,212,126,0.4))",
              backgroundSize: "300% 300%",
              animation: "gradient-shift 4s ease infinite",
            }}
          />

          {/* Outer glow */}
          <div
            className={`absolute -inset-[1px] rounded-2xl transition-all duration-500 ${
              focused
                ? "shadow-[0_0_30px_-4px_rgba(0,212,126,0.3)]"
                : "shadow-[0_0_20px_-4px_rgba(0,212,126,0.12)] animate-[glow-pulse_3s_ease-in-out_infinite]"
            }`}
          />

          {/* Input bar */}
          <div
            className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
              focused
                ? "bg-[#0f2235]"
                : "bg-[#0f1f30] group-hover:bg-[#112438]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-green flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (e.target.value.trim()) {
                  setIsOpen(true)
                } else {
                  setIsOpen(false)
                }
              }}
              onFocus={() => {
                setFocused(true)
                if (flatResults.length > 0) setIsOpen(true)
              }}
              onKeyDown={handleKeyDown}
              placeholder={value || focused ? "Search research or ask a question..." : ""}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls={LISTBOX_ID}
              aria-activedescendant={activeOptionId}
              aria-autocomplete="list"
              aria-haspopup="listbox"
            />

            {/* Animated placeholder */}
            {!value && !focused && (
              <span className="absolute left-11 text-sm text-white/35 pointer-events-none select-none">
                {placeholderText}
                {isTyping && (
                  <span className="inline-block w-[2px] h-[1em] bg-white/40 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </span>
            )}

            <button
              onClick={() => handleSubmit()}
              disabled={!value.trim()}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-brand-green text-[#0D1B2A] disabled:opacity-20 disabled:bg-white/10 disabled:text-white/30 hover:opacity-90 transition-all"
              aria-label="Search or ask AI"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dropdown — search results + "Ask AI" option */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              id={LISTBOX_ID}
              role="listbox"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 w-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden z-50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-h-[400px] overflow-y-auto"
            >
              {/* Search results */}
              {flatResults.length > 0 && (
                groupedResults.map((group) => (
                  <div key={group.type} role="group" aria-label={TYPE_LABELS[group.type]}>
                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30 border-b border-white/[0.06]">
                      {TYPE_LABELS[group.type]}
                    </div>
                    {group.items.map((item) => {
                      flatIndex++
                      const idx = flatIndex
                      const Icon = TYPE_ICONS[item.type]
                      const isActive = idx === activeIndex
                      return (
                        <div
                          key={`${item.type}-${item.url}`}
                          id={`research-option-${idx}`}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => navigateTo(item.url)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                            isActive ? "bg-white/[0.1]" : "hover:bg-white/[0.06]"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white/80">{item.title}</div>
                            <div className="text-xs text-white/35 truncate">{item.description}</div>
                          </div>
                          {item.grade && <GradeBadge grade={item.grade} />}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}

              {/* "Ask AI" option — always shown when user has text */}
              {value.trim().length >= 2 && (
                <>
                  {flatResults.length > 0 && (
                    <div className="border-t border-white/[0.08]" />
                  )}
                  <div
                    id={`research-option-${flatResults.length}`}
                    role="option"
                    aria-selected={activeIndex === flatResults.length}
                    onClick={() => openChat(value.trim())}
                    onMouseEnter={() => setActiveIndex(flatResults.length)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      activeIndex === flatResults.length ? "bg-brand-green/10" : "hover:bg-white/[0.06]"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-brand-green font-medium">
                        Ask AI: &ldquo;{value.trim().length > 60 ? value.trim().slice(0, 60) + "..." : value.trim()}&rdquo;
                      </div>
                      <div className="text-xs text-white/35">Get an AI-powered answer from our research data</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-green/60" />
                  </div>
                </>
              )}

              {/* Empty state */}
              {flatResults.length === 0 && value.trim().length >= 3 && (
                <div className="px-4 py-2 text-xs text-white/30 border-b border-white/[0.06]">
                  No pages match &ldquo;{value.trim()}&rdquo;
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example chips */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {EXAMPLE_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => openChat(chip.query)}
              className="bg-white/[0.06] border border-white/[0.1] rounded-full px-3 py-1 text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.1] hover:border-brand-green/30 cursor-pointer transition-all duration-200"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Helper text */}
        <p className="mt-2 text-[11px] text-white/25 text-center">
          Search research data or ask a question — powered by AI
        </p>

        {/* Keyframe styles */}
        <style jsx>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 20px -4px rgba(0,212,126,0.12); }
            50% { box-shadow: 0 0 25px -2px rgba(0,212,126,0.2); }
          }
        `}</style>
      </div>

      {/* Chat Modal */}
      <ResearchChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        initialPrompt={chatPrompt}
      />
    </>
  )
}
