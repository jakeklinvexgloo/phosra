"use client"

import { useCallback, useRef, useState } from "react"

/**
 * Hook that tracks which fields were recently changed.
 * Returns a Set of "profileId:field" keys that should show highlight,
 * and a function to trigger highlights for a batch of changes.
 */
export function useChangeHighlight(duration = 1500) {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const triggerHighlights = useCallback(
    (keys: string[], staggerMs = 200) => {
      keys.forEach((key, i) => {
        setTimeout(() => {
          setHighlighted((prev) => { const next = new Set(Array.from(prev)); next.add(key); return next })

          // Clear any existing timer for this key
          const existing = timers.current.get(key)
          if (existing) clearTimeout(existing)

          const timer = setTimeout(() => {
            setHighlighted((prev) => {
              const next = new Set(Array.from(prev))
              next.delete(key)
              return next
            })
            timers.current.delete(key)
          }, duration)

          timers.current.set(key, timer)
        }, i * staggerMs)
      })
    },
    [duration]
  )

  const isHighlighted = useCallback(
    (key: string) => highlighted.has(key),
    [highlighted]
  )

  return { isHighlighted, triggerHighlights }
}
