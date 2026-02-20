"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, Mail, Send, ChevronDown, ChevronRight, Paperclip, RefreshCw, Loader2, X, ExternalLink } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { GoogleConnectionStatus, GmailMessage, GmailListResponse } from "@/lib/admin/types"

export default function GmailPage() {
  const { getToken } = useApi()
  const [status, setStatus] = useState<GoogleConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<GmailMessage[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | undefined>()
  const [totalEstimate, setTotalEstimate] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedMessage, setExpandedMessage] = useState<GmailMessage | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Compose state
  const [composing, setComposing] = useState(false)
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [sending, setSending] = useState(false)

  const checkConnection = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const s = await api.getGoogleStatus(token)
      setStatus(s)
      return s.connected
    } catch {
      setStatus({ connected: false, email: "", scopes: [] })
      return false
    }
  }, [getToken])

  const fetchMessages = useCallback(async (query?: string, pageToken?: string) => {
    try {
      const token = (await getToken()) ?? undefined
      const result: GmailListResponse = await api.listGmailMessages(query || undefined, pageToken, 20, token)
      if (pageToken) {
        setMessages((prev) => [...prev, ...(result.messages || [])])
      } else {
        setMessages(result.messages || [])
      }
      setNextPageToken(result.next_page_token)
      setTotalEstimate(result.total_estimate)
    } catch {
      // Handle error
    }
  }, [getToken])

  useEffect(() => {
    async function init() {
      const connected = await checkConnection()
      if (connected) {
        await fetchMessages()
      }
      setLoading(false)
    }
    init()
  }, [checkConnection, fetchMessages])

  const handleSearch = async () => {
    setLoading(true)
    setExpandedId(null)
    setExpandedMessage(null)
    await fetchMessages(searchQuery)
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setExpandedId(null)
    setExpandedMessage(null)
    await fetchMessages(searchQuery || undefined)
    setRefreshing(false)
  }

  const handleLoadMore = async () => {
    if (nextPageToken) {
      await fetchMessages(searchQuery || undefined, nextPageToken)
    }
  }

  const handleExpand = async (msg: GmailMessage) => {
    if (expandedId === msg.id) {
      setExpandedId(null)
      setExpandedMessage(null)
      return
    }
    setExpandedId(msg.id)
    try {
      const token = (await getToken()) ?? undefined
      const full = await api.getGmailMessage(msg.id, token)
      setExpandedMessage(full)
    } catch {
      setExpandedMessage(null)
    }
  }

  const handleConnect = async () => {
    try {
      const token = (await getToken()) ?? undefined
      const result = await api.getGoogleAuthURL(token)
      window.location.href = result.url
    } catch {
      // Handle error
    }
  }

  const handleDisconnect = async () => {
    const token = (await getToken()) ?? undefined
    await api.disconnectGoogle(token)
    setStatus({ connected: false, email: "", scopes: [] })
    setMessages([])
  }

  const handleSend = async () => {
    if (!composeTo || !composeSubject) return
    setSending(true)
    try {
      const token = (await getToken()) ?? undefined
      await api.sendGmailMessage({ to: composeTo, subject: composeSubject, body: composeBody }, token)
      setComposing(false)
      setComposeTo("")
      setComposeSubject("")
      setComposeBody("")
      // Refresh to show sent message
      await fetchMessages(searchQuery || undefined)
    } catch {
      // Handle error
    } finally {
      setSending(false)
    }
  }

  const formatDate = (d?: string) => {
    if (!d) return ""
    const date = new Date(d)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const extractName = (from: string) => {
    const match = from.match(/^(.+?)\s*</)
    return match ? match[1].replace(/"/g, "") : from.split("@")[0]
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground text-sm animate-pulse">
        Loading Gmail...
      </div>
    )
  }

  // Not connected — show connect card
  if (!status?.connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gmail</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect your Google account to manage emails from the dashboard.</p>
        </div>
        <div className="plaid-card text-center py-12 max-w-md mx-auto">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Connect Gmail</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Link your Google account to read, send, and manage emails directly from the admin dashboard.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Mail className="w-4 h-4" />
            Connect Google Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gmail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {status.email} &middot; {totalEstimate} messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setComposing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
            Compose
          </button>
          <button
            onClick={handleDisconnect}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="plaid-input pl-9"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Compose Panel */}
      {composing && (
        <div className="plaid-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">New Message</h3>
            <button onClick={() => setComposing(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="To"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              className="plaid-input"
            />
            <input
              type="text"
              placeholder="Subject"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              className="plaid-input"
            />
            <textarea
              placeholder="Write your message..."
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              rows={6}
              className="plaid-input resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSend}
                disabled={sending || !composeTo || !composeSubject}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message List */}
      {messages.length === 0 ? (
        <div className="plaid-card text-center py-12">
          <p className="text-muted-foreground text-sm">No messages found.</p>
        </div>
      ) : (
        <div className="plaid-card p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => handleExpand(msg)}
                >
                  <div className="flex items-center justify-center w-5 flex-shrink-0">
                    {expandedId === msg.id ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="w-36 flex-shrink-0 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{extractName(msg.from)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground truncate">{msg.subject || "(no subject)"}</span>
                      {msg.has_attachments && <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{msg.snippet}</div>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap flex-shrink-0">
                    {formatDate(msg.date)}
                  </div>
                </div>

                {/* Expanded email */}
                {expandedId === msg.id && expandedMessage && (
                  <div className="px-5 py-4 bg-muted/20 border-t border-border">
                    <div className="space-y-2 mb-4">
                      <div className="text-xs">
                        <span className="text-muted-foreground">From:</span>{" "}
                        <span className="text-foreground">{expandedMessage.from}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">To:</span>{" "}
                        <span className="text-foreground">{expandedMessage.to?.join(", ")}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Date:</span>{" "}
                        <span className="text-foreground">{expandedMessage.date}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Subject:</span>{" "}
                        <span className="text-foreground font-medium">{expandedMessage.subject}</span>
                      </div>
                    </div>
                    {expandedMessage.body_html ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-sm border-t border-border pt-3"
                        dangerouslySetInnerHTML={{ __html: expandedMessage.body_html }}
                      />
                    ) : expandedMessage.body_text ? (
                      <pre className="text-sm text-foreground whitespace-pre-wrap font-sans border-t border-border pt-3">
                        {expandedMessage.body_text}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No body content available.</p>
                    )}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setComposing(true)
                          setComposeTo(expandedMessage.from.replace(/.*<(.+?)>.*/, "$1"))
                          setComposeSubject(`Re: ${expandedMessage.subject}`)
                        }}
                        className="text-xs text-foreground hover:underline flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Reply
                      </button>
                      {expandedMessage.thread_id && (
                        <a
                          href={`https://mail.google.com/mail/u/0/#inbox/${expandedMessage.thread_id}`}
                          target="_blank"
                          rel="noopener"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Open in Gmail
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load more */}
          {nextPageToken && (
            <div className="px-5 py-3 border-t border-border text-center">
              <button
                onClick={handleLoadMore}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Load more messages...
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
