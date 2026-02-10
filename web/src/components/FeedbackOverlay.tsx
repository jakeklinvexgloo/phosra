"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { api } from "@/lib/api"
import type { UIFeedback } from "@/lib/types"

function generateSelector(el: HTMLElement): string {
  const parts: string[] = []
  let current: HTMLElement | null = el
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()
    if (current.id) {
      parts.unshift(`#${current.id}`)
      break
    }
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children)
      const sameTag = siblings.filter((s) => s.tagName === current!.tagName)
      if (sameTag.length > 1) {
        const index = sameTag.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }
    const meaningfulClass = Array.from(current.classList).find(
      (c) =>
        !c.includes(":") &&
        !c.includes("/") &&
        c.length > 3 &&
        !c.match(
          /^(p|m|w|h|bg|text|flex|grid|gap|border|rounded|font|hover|transition|animate|opacity|shadow|ring|outline|overflow|relative|absolute|fixed|sticky|inset|top|right|bottom|left|z|max|min|space|divide|sr|not|group|peer|placeholder|focus|active|disabled|first|last|odd|even|sm|md|lg|xl)-/
        )
    )
    if (meaningfulClass) {
      selector += `.${meaningfulClass}`
    }
    parts.unshift(selector)
    current = current.parentElement
  }
  return parts.join(" > ")
}

function findComponentHint(el: HTMLElement): string | undefined {
  let current: HTMLElement | null = el
  while (current) {
    const hint = current.getAttribute("data-feedback-src")
    if (hint) return hint
    current = current.parentElement
  }
  return undefined
}

export default function FeedbackOverlay() {
  // Disable in production to avoid CORS errors from old API URL
  if (process.env.NODE_ENV === "production") return null

  const [active, setActive] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null)
  const [comment, setComment] = useState("")
  const [reviewerName, setReviewerName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [existingFeedback, setExistingFeedback] = useState<UIFeedback[]>([])
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Load saved reviewer name on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("feedback_reviewer_name")
    if (saved) setReviewerName(saved)
  }, [])

  // Load existing feedback for current page
  useEffect(() => {
    if (!active) return
    api
      .listFeedback("open")
      .then((items: UIFeedback[]) => {
        const pageItems = items.filter(
          (i) => i.page_route === window.location.pathname
        )
        setExistingFeedback(pageItems)
      })
      .catch(() => {})
  }, [active])

  // Click handler for feedback mode
  useEffect(() => {
    if (!active || !enabled) return

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("[data-feedback-overlay]")) return

      e.preventDefault()
      e.stopPropagation()

      setSelectedElement(target)
      setHighlightRect(target.getBoundingClientRect())
      setPopoverPos({ x: e.clientX, y: e.clientY })
      setComment("")
    }

    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [active, enabled])

  // Hover highlight
  useEffect(() => {
    if (!active || !enabled || selectedElement) return

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("[data-feedback-overlay]")) {
        setHoverRect(null)
        return
      }
      setHoverRect(target.getBoundingClientRect())
    }

    const leave = () => setHoverRect(null)

    document.addEventListener("mousemove", handler, true)
    document.addEventListener("mouseleave", leave)
    return () => {
      document.removeEventListener("mousemove", handler, true)
      document.removeEventListener("mouseleave", leave)
    }
  }, [active, enabled, selectedElement])

  const handleSubmit = useCallback(async () => {
    if (!selectedElement || !comment.trim()) return
    setSubmitting(true)

    const name = reviewerName.trim() || "Anonymous"
    localStorage.setItem("feedback_reviewer_name", name)

    try {
      await api.submitFeedback({
        page_route: window.location.pathname,
        css_selector: generateSelector(selectedElement),
        component_hint: findComponentHint(selectedElement),
        comment: comment.trim(),
        reviewer_name: name,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        click_x: Math.round(highlightRect?.x ?? 0),
        click_y: Math.round(highlightRect?.y ?? 0),
      })

      // Refresh feedback list
      const items: UIFeedback[] = await api.listFeedback("open")
      setExistingFeedback(
        items.filter((i) => i.page_route === window.location.pathname)
      )

      setSelectedElement(null)
      setHighlightRect(null)
      setPopoverPos(null)
      setComment("")
    } catch (err) {
      console.error("Failed to submit feedback:", err)
    } finally {
      setSubmitting(false)
    }
  }, [selectedElement, comment, reviewerName, highlightRect])

  const handleCancel = useCallback(() => {
    setSelectedElement(null)
    setHighlightRect(null)
    setPopoverPos(null)
    setComment("")
  }, [])

  if (!active) return null

  // Calculate popover position to stay within viewport
  const popoverStyle = popoverPos
    ? {
        left: Math.min(popoverPos.x + 12, window.innerWidth - 340),
        top: Math.min(popoverPos.y + 12, window.innerHeight - 280),
      }
    : {}

  return (
    <div ref={overlayRef} data-feedback-overlay="true">
      {/* Hover highlight */}
      {hoverRect && enabled && !selectedElement && (
        <div
          data-feedback-overlay="true"
          style={{
            position: "fixed",
            left: hoverRect.left - 2,
            top: hoverRect.top - 2,
            width: hoverRect.width + 4,
            height: hoverRect.height + 4,
            border: "2px solid rgba(59, 130, 246, 0.5)",
            borderRadius: 4,
            pointerEvents: "none",
            zIndex: 99998,
            transition: "all 0.1s ease",
          }}
        />
      )}

      {/* Selected element highlight */}
      {highlightRect && (
        <div
          data-feedback-overlay="true"
          style={{
            position: "fixed",
            left: highlightRect.left - 3,
            top: highlightRect.top - 3,
            width: highlightRect.width + 6,
            height: highlightRect.height + 6,
            border: "3px solid #3b82f6",
            borderRadius: 4,
            pointerEvents: "none",
            zIndex: 99998,
            boxShadow: "0 0 0 4000px rgba(0, 0, 0, 0.15)",
          }}
        />
      )}

      {/* Comment popover */}
      {popoverPos && selectedElement && (
        <div
          data-feedback-overlay="true"
          style={{
            position: "fixed",
            ...popoverStyle,
            zIndex: 99999,
            width: 320,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 8,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              padding: 16,
              fontFamily: "-apple-system, system-ui, sans-serif",
              fontSize: 14,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                color: "#111",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#3b82f6",
                  display: "inline-block",
                }}
              />
              Leave Feedback
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                marginBottom: 10,
                padding: "4px 8px",
                background: "#f5f5f5",
                borderRadius: 4,
                fontFamily: "monospace",
                wordBreak: "break-all",
                maxHeight: 40,
                overflow: "hidden",
              }}
            >
              {generateSelector(selectedElement)}
            </div>
            <input
              data-feedback-overlay="true"
              type="text"
              placeholder="Your name (optional)"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e0e0e0",
                borderRadius: 4,
                padding: "6px 10px",
                fontSize: 13,
                marginBottom: 8,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
            <textarea
              data-feedback-overlay="true"
              placeholder="What should be changed here?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              autoFocus
              rows={3}
              style={{
                width: "100%",
                border: "1px solid #e0e0e0",
                borderRadius: 4,
                padding: "6px 10px",
                fontSize: 13,
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit()
                }
                if (e.key === "Escape") {
                  handleCancel()
                }
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                data-feedback-overlay="true"
                onClick={handleCancel}
                style={{
                  padding: "6px 14px",
                  fontSize: 13,
                  borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  background: "white",
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                Cancel
              </button>
              <button
                data-feedback-overlay="true"
                onClick={handleSubmit}
                disabled={!comment.trim() || submitting}
                style={{
                  padding: "6px 14px",
                  fontSize: 13,
                  borderRadius: 4,
                  border: "none",
                  background: comment.trim() && !submitting ? "#111" : "#ccc",
                  color: "white",
                  cursor: comment.trim() && !submitting ? "pointer" : "default",
                  fontWeight: 500,
                }}
              >
                {submitting ? "Sending..." : "Submit"}
              </button>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#999",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Cmd+Enter to submit, Esc to cancel
            </div>
          </div>
        </div>
      )}

      {/* Existing feedback pins */}
      {enabled &&
        !selectedElement &&
        existingFeedback.map((fb, i) => {
          if (!fb.click_x || !fb.click_y) return null
          return (
            <div
              key={fb.id}
              data-feedback-overlay="true"
              title={`${fb.reviewer_name}: ${fb.comment}`}
              style={{
                position: "fixed",
                left: fb.click_x - 12,
                top: fb.click_y - 12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#3b82f6",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                cursor: "pointer",
                zIndex: 99997,
                fontFamily: "-apple-system, system-ui, sans-serif",
              }}
            >
              {i + 1}
            </div>
          )
        })}

      {/* Floating toggle pill */}
      <div
        data-feedback-overlay="true"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "white",
          borderRadius: 100,
          padding: "8px 16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
          fontFamily: "-apple-system, system-ui, sans-serif",
          fontSize: 13,
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: enabled ? "#22c55e" : "#94a3b8",
            display: "inline-block",
          }}
        />
        <span style={{ color: "#333", fontWeight: 500 }}>Feedback</span>
        {existingFeedback.length > 0 && (
          <span
            style={{
              background: "#3b82f6",
              color: "white",
              borderRadius: 100,
              padding: "1px 7px",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {existingFeedback.length}
          </span>
        )}
        <button
          data-feedback-overlay="true"
          onClick={() => {
            setEnabled(!enabled)
            if (enabled) {
              setSelectedElement(null)
              setHighlightRect(null)
              setPopoverPos(null)
              setHoverRect(null)
            }
          }}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            borderRadius: 100,
            border: "none",
            background: enabled ? "#111" : "#f0f0f0",
            color: enabled ? "white" : "#555",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {enabled ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  )
}
