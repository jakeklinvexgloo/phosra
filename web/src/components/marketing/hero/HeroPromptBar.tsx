"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { getFilteredPrompts, PLACEHOLDER_PROMPTS, type HeroPrompt } from "./hero-prompts"

interface HeroPromptBarProps {
  onSubmit: (prompt: string) => void
}

export function HeroPromptBar({ onSubmit }: HeroPromptBarProps) {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<HeroPrompt[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderText, setPlaceholderText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Typewriter placeholder animation
  useEffect(() => {
    if (focused || value) return // Stop cycling when focused or has value

    const fullText = PLACEHOLDER_PROMPTS[placeholderIndex]
    let charIndex = 0
    let erasing = false

    const interval = setInterval(() => {
      if (!erasing) {
        charIndex++
        setPlaceholderText(fullText.slice(0, charIndex))
        if (charIndex >= fullText.length) {
          setIsTyping(false)
          // Hold for 2 seconds before erasing
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

  // Update suggestions when value changes
  useEffect(() => {
    if (value.trim().length >= 2) {
      setSuggestions(getFilteredPrompts(value, 5))
    } else {
      setSuggestions([])
    }
    setSelectedIndex(-1)
  }, [value])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSubmit = useCallback(
    (text?: string) => {
      const prompt = text || value.trim()
      if (!prompt) return
      onSubmit(prompt)
      setValue("")
      setSuggestions([])
      inputRef.current?.blur()
    },
    [value, onSubmit]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSubmit(suggestions[selectedIndex].text)
      } else {
        handleSubmit()
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Escape") {
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  const showSuggestions = focused && suggestions.length > 0

  return (
    <div ref={containerRef} className="relative max-w-lg w-full mt-6">
      {/* Input bar */}
      <div
        className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
          focused
            ? "bg-white/[0.1] border border-white/[0.15] shadow-[0_0_30px_-8px_rgba(0,212,126,0.2)]"
            : "bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12]"
        }`}
      >
        <Sparkles className="w-4 h-4 text-brand-green flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={value || focused ? "Describe your parental control needs..." : ""}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-controls="hero-suggestions"
          aria-activedescendant={
            selectedIndex >= 0 ? `hero-suggestion-${selectedIndex}` : undefined
          }
        />

        {/* Animated placeholder (only when no value and not focused) */}
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
          aria-label="Try it"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.ul
            id="hero-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden z-50 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            {suggestions.map((prompt, i) => (
              <li
                key={prompt.id}
                id={`hero-suggestion-${i}`}
                role="option"
                aria-selected={i === selectedIndex}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSubmit(prompt.text)
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  i === selectedIndex
                    ? "bg-white/[0.1] text-white"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                {prompt.text}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Subtle helper text */}
      <p className="mt-2.5 text-[11px] text-white/20 text-center">
        Try it free — powered by live AI with real API calls
      </p>
    </div>
  )
}
