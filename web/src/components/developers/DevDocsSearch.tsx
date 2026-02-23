"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search, FileText, Code2 } from "lucide-react"

interface SearchEntry {
  title: string
  href: string
  section: string
  excerpt: string
  method?: string
}

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-600",
  POST: "text-blue-600",
  PUT: "text-amber-600",
  DELETE: "text-red-600",
  PATCH: "text-purple-600",
}

export function DevDocsSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<SearchEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  // Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Lazy-load search index on first open
  useEffect(() => {
    if (open && !loaded) {
      fetch("/api/developers/search-index")
        .then((r) => r.json())
        .then((data) => {
          setEntries(data)
          setLoaded(true)
        })
        .catch(() => setLoaded(true))
    }
  }, [open, loaded])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  // Group entries by section
  const grouped = entries.reduce<Record<string, SearchEntry[]>>((acc, entry) => {
    if (!acc[entry.section]) acc[entry.section] = []
    acc[entry.section].push(entry)
    return acc
  }, {})

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-md hover:bg-muted/50 transition-colors w-full"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search docs...</span>
        <kbd className="hidden sm:inline text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
          ⌘K
        </kbd>
      </button>

      {/* Command palette dialog */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search developer documentation"
        className="fixed inset-0 z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

        <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
          <Command.Input
            placeholder="Search documentation..."
            className="w-full px-4 py-3 text-sm bg-transparent border-b border-border outline-none placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            {Object.entries(grouped).map(([section, items]) => (
              <Command.Group key={section} heading={section} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                {items.map((entry) => (
                  <Command.Item
                    key={entry.href}
                    value={`${entry.title} ${entry.excerpt}`}
                    onSelect={() => handleSelect(entry.href)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm data-[selected=true]:bg-muted transition-colors"
                  >
                    {entry.method ? (
                      <span className={`text-[10px] font-bold font-mono w-9 flex-shrink-0 ${METHOD_COLORS[entry.method] || "text-muted-foreground"}`}>
                        {entry.method}
                      </span>
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-foreground truncate">{entry.title}</div>
                      {entry.excerpt && (
                        <div className="text-xs text-muted-foreground truncate">{entry.excerpt}</div>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
          <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </div>
        </div>
      </Command.Dialog>
    </>
  )
}
