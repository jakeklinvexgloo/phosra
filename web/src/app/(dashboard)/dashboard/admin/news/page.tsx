"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Newspaper,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Trash2,
  Eye,
  Filter,
} from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { NewsItem } from "@/lib/admin/types"

export default function NewsFeedPage() {
  const { getToken } = useApi()
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  const fetchNews = useCallback(async () => {
    const token = (await getToken()) ?? undefined
    try {
      const data = await api.listNews(100, showSavedOnly || undefined, token)
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [getToken, showSavedOnly])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const handleMarkRead = async (id: string) => {
    const token = (await getToken()) ?? undefined
    await api.markNewsRead(id, token).catch(() => {})
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)))
  }

  const handleToggleSaved = async (id: string) => {
    const token = (await getToken()) ?? undefined
    await api.toggleNewsSaved(id, token).catch(() => {})
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_saved: !i.is_saved } : i)))
  }

  const handleDelete = async (id: string) => {
    const token = (await getToken()) ?? undefined
    await api.deleteNewsItem(id, token).catch(() => {})
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const formatDate = (d?: string) => {
    if (!d) return ""
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  }

  const relevanceColor = (score?: number) => {
    if (!score) return "bg-muted text-muted-foreground"
    if (score >= 75) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
    if (score >= 50) return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
    return "bg-muted text-muted-foreground"
  }

  const unreadCount = items.filter((i) => !i.is_read).length
  const savedCount = items.filter((i) => i.is_saved).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">News Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} items{unreadCount > 0 && ` (${unreadCount} unread)`}
            {savedCount > 0 && ` / ${savedCount} saved`}
          </p>
        </div>
        <button
          onClick={() => setShowSavedOnly(!showSavedOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showSavedOnly
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          {showSavedOnly ? "Showing Saved" : "Show Saved Only"}
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-10 text-center">Loading news...</div>
      ) : items.length === 0 ? (
        <div className="plaid-card flex flex-col items-center justify-center py-16 text-center">
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
            <Newspaper className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-1">
            {showSavedOnly ? "No saved items" : "No news yet"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {showSavedOnly
              ? "Bookmark items from the feed to see them here."
              : "Run the News Monitor worker to scan RSS feeds and populate this feed."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`plaid-card !p-0 overflow-hidden transition-colors ${
                !item.is_read ? "border-l-2 border-l-blue-500" : ""
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm font-medium leading-tight ${
                        item.is_read ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.relevance_score != null && item.relevance_score > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${relevanceColor(item.relevance_score)}`}>
                        {item.relevance_score}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-medium">{item.source}</span>
                    {item.published_at && <span>{formatDate(item.published_at)}</span>}
                  </div>
                  {item.summary && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      title="Mark as read"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleSaved(item.id)}
                    className={`p-1.5 rounded-md transition-colors ${
                      item.is_saved
                        ? "text-amber-500 hover:text-amber-600"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    title={item.is_saved ? "Unsave" : "Save"}
                  >
                    {item.is_saved ? (
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      title="Open source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
