"use client"

import { useState } from "react"
import { Mail, Send, ExternalLink, Phone, Loader2, ChevronDown, ChevronRight, StickyNote, Calendar, MessageSquare } from "lucide-react"
import type { OutreachContact, OutreachActivity, GmailMessage } from "@/lib/admin/types"

const ACTIVITY_ICONS: Record<string, { icon: typeof Mail; color: string }> = {
  email_sent: { icon: Mail, color: "bg-blue-500" },
  linkedin_message: { icon: MessageSquare, color: "bg-blue-700" },
  call: { icon: Phone, color: "bg-green-500" },
  meeting: { icon: Calendar, color: "bg-purple-500" },
  note: { icon: StickyNote, color: "bg-amber-500" },
}

function formatDate(d?: string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatGmailDate(d?: string) {
  if (!d) return ""
  const date = new Date(d)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function extractName(from: string) {
  const match = from.match(/^(.+?)\s*</)
  return match ? match[1].replace(/"/g, "") : from.split("@")[0]
}

interface ContactDetailProps {
  contact: OutreachContact
  activities: OutreachActivity[]
  gmailThreads: GmailMessage[]
  gmailLoading: boolean
  gmailConnected: boolean
  expandedMessageId: string | null
  expandedMessage: GmailMessage | null
  onExpandMessage: (msg: GmailMessage) => void
  onAddNote: (contactId: string, note: string) => void
  onSendEmail: (to: string, subject: string, body: string, contactId: string) => void
  sendingEmail: boolean
  onTagClick: (tag: string) => void
}

export function ContactDetail({
  contact, activities,
  gmailThreads, gmailLoading, gmailConnected,
  expandedMessageId, expandedMessage, onExpandMessage,
  onAddNote, onSendEmail, sendingEmail,
  onTagClick,
}: ContactDetailProps) {
  const [noteText, setNoteText] = useState("")
  const [showCompose, setShowCompose] = useState(false)
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")

  const handleNoteSubmit = () => {
    if (!noteText.trim()) return
    onAddNote(contact.id, noteText.trim())
    setNoteText("")
  }

  const handleSend = () => {
    if (!contact.email || !composeSubject) return
    onSendEmail(contact.email, composeSubject, composeBody, contact.id)
    setShowCompose(false)
    setComposeSubject("")
    setComposeBody("")
  }

  return (
    <div className="px-5 py-4 bg-muted/20 border-t border-border">
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Contact info + Email threads */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="space-y-1.5">
            {contact.email && (
              <div className="text-xs flex items-center gap-1">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-foreground hover:underline">{contact.email}</a>
                <button
                  onClick={() => setShowCompose(!showCompose)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  title="Compose email"
                >
                  <Send className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
            {contact.linkedin_url && (
              <div className="text-xs flex items-center gap-1">
                <span className="text-muted-foreground">LinkedIn:</span>
                <a href={contact.linkedin_url} target="_blank" rel="noopener" className="text-foreground hover:underline flex items-center gap-0.5">
                  Profile <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
            {contact.twitter_handle && (
              <div className="text-xs">
                <span className="text-muted-foreground">X:</span>{" "}
                <a href={`https://x.com/${contact.twitter_handle}`} target="_blank" rel="noopener" className="text-foreground hover:underline">
                  @{contact.twitter_handle}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="text-xs flex items-center gap-1">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground">{contact.phone}</span>
              </div>
            )}
            {contact.relevance_score != null && (
              <div className="text-xs flex items-center gap-2">
                <span className="text-muted-foreground">Relevance:</span>
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      contact.relevance_score >= 80 ? "bg-brand-green" : contact.relevance_score >= 50 ? "bg-amber-500" : "bg-muted-foreground/40"
                    }`}
                    style={{ width: `${contact.relevance_score}%` }}
                  />
                </div>
                <span className="font-medium">{contact.relevance_score}/100</span>
              </div>
            )}
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {contact.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {contact.notes && (
              <div className="text-xs text-muted-foreground mt-1">{contact.notes}</div>
            )}
          </div>

          {/* Inline compose */}
          {showCompose && contact.email && (
            <div className="rounded-lg border border-border p-3 space-y-2 bg-background">
              <div className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Compose</div>
              <div className="text-xs text-muted-foreground">To: {contact.email}</div>
              <input
                type="text"
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="plaid-input text-sm"
              />
              <textarea
                placeholder="Write your message..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={4}
                className="plaid-input resize-none text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sendingEmail || !composeSubject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sendingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Gmail threads */}
          {gmailConnected && contact.email && (
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                {contact.email_status === "draft_ready" ? "Drafts & Email History" : "Email History"}
              </div>
              {gmailLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading threads...
                </div>
              ) : gmailThreads.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  {contact.email_status === "draft_ready"
                    ? "No drafts found. Compose a new email below or create a draft in Gmail."
                    : "No email history found."}
                </div>
              ) : (
                <div className="space-y-0.5 rounded-lg border border-border overflow-hidden">
                  {gmailThreads.map((msg) => {
                    const isDraft = msg.labels?.includes("DRAFT")
                    return (
                    <div key={msg.id}>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-muted/30 transition-colors ${isDraft ? "bg-purple-50/50 dark:bg-purple-900/5" : ""}`}
                        onClick={() => onExpandMessage(msg)}
                      >
                        <div className="flex items-center w-4 flex-shrink-0">
                          {expandedMessageId === msg.id ? (
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        {isDraft && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex-shrink-0">
                            DRAFT
                          </span>
                        )}
                        <div className="w-20 flex-shrink-0 truncate font-medium text-foreground">
                          {isDraft ? "Me" : extractName(msg.from)}
                        </div>
                        <div className="flex-1 truncate text-muted-foreground">{msg.subject || "(no subject)"}</div>
                        <div className="text-muted-foreground tabular-nums flex-shrink-0">{formatGmailDate(msg.date)}</div>
                      </div>
                      {expandedMessageId === msg.id && expandedMessage && (
                        <div className="px-3 py-2 bg-muted/20 border-t border-border text-xs">
                          <div className="space-y-1 mb-2">
                            <div><span className="text-muted-foreground">From:</span> {expandedMessage.from}</div>
                            <div><span className="text-muted-foreground">To:</span> {expandedMessage.to?.join(", ")}</div>
                            <div><span className="text-muted-foreground">Subject:</span> <span className="font-medium">{expandedMessage.subject}</span></div>
                          </div>
                          {expandedMessage.body_text ? (
                            <pre className="text-xs text-foreground whitespace-pre-wrap font-sans border-t border-border pt-2 max-h-48 overflow-y-auto">
                              {expandedMessage.body_text}
                            </pre>
                          ) : expandedMessage.snippet ? (
                            <div className="text-xs text-muted-foreground border-t border-border pt-2">{expandedMessage.snippet}</div>
                          ) : null}
                          <div className="flex gap-3 mt-2 pt-2 border-t border-border">
                            {expandedMessage.labels?.includes("DRAFT") ? (
                              <a
                                href={`https://mail.google.com/mail/u/0/#drafts/${expandedMessage.id}`}
                                target="_blank"
                                rel="noopener"
                                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
                              >
                                <ExternalLink className="w-2.5 h-2.5" /> Edit draft in Gmail
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowCompose(true)
                                  setComposeSubject(`Re: ${expandedMessage.subject}`)
                                }}
                                className="text-xs text-foreground hover:underline flex items-center gap-1"
                              >
                                <Send className="w-2.5 h-2.5" /> Reply
                              </button>
                            )}
                            {expandedMessage.thread_id && (
                              <a
                                href={`https://mail.google.com/mail/u/0/#${expandedMessage.labels?.includes("DRAFT") ? "drafts" : "inbox"}/${expandedMessage.thread_id}`}
                                target="_blank"
                                rel="noopener"
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                              >
                                <ExternalLink className="w-2.5 h-2.5" /> Open in Gmail
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Activity timeline + Quick notes */}
        <div className="space-y-4">
          {/* Activity timeline */}
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
              Activity
            </div>
            {activities.length > 0 ? (
              <div className="relative ml-3">
                {/* Vertical line */}
                <div className="absolute left-0 top-1 bottom-1 w-px bg-border" />
                <div className="space-y-3">
                  {activities.map((a) => {
                    const config = ACTIVITY_ICONS[a.activity_type] || ACTIVITY_ICONS.note
                    const Icon = config.icon
                    return (
                      <div key={a.id} className="flex items-start gap-3 relative pl-4">
                        <div className={`absolute left-0 top-0.5 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center ${config.color}`}>
                          <Icon className="w-2 h-2 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs">
                            <span className="font-medium capitalize">{a.activity_type.replace("_", " ")}</span>
                            {a.subject && <span className="text-muted-foreground">: {a.subject}</span>}
                          </div>
                          {a.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.body}</div>}
                        </div>
                        <div className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">{formatDate(a.created_at)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No activity yet.</div>
            )}
          </div>

          {/* Quick notes */}
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
              Quick Note
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNoteSubmit()}
                className="plaid-input flex-1 text-sm"
                data-note-input
              />
              <button
                onClick={handleNoteSubmit}
                disabled={!noteText.trim()}
                className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
