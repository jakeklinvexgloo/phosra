"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, Save, Sparkles, Copy, Check,
  ChevronDown, ChevronRight, Plus, Trash2,
  Lightbulb, PenLine, Eye, CheckCircle2,
  Calendar, Send as SendIcon, Archive, Clock
} from "lucide-react"
import Link from "next/link"
import { useApi } from "@/lib/useApi"
import type { PressRelease, PressReleaseStatus, PressReleaseQuote, DraftInputs, RevisionEntry } from "@/lib/press/types"
import { STATUS_LABELS, STATUS_COLORS, RELEASE_TYPE_LABELS } from "@/lib/press/types"
import { getAllMilestones } from "@/lib/fundraise/milestones"

const STATUS_FLOW: PressReleaseStatus[] = [
  "idea", "draft", "in_review", "approved", "scheduled", "distributed"
]

const STATUS_ICONS: Record<string, typeof Lightbulb> = {
  idea: Lightbulb,
  draft: PenLine,
  in_review: Eye,
  approved: CheckCircle2,
  scheduled: Calendar,
  distributed: SendIcon,
  archived: Archive,
}

export default function PressReleaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getToken } = useApi()
  const id = params.id as string

  const [release, setRelease] = useState<PressRelease | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form fields
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [releaseType, setReleaseType] = useState("product_launch")
  const [datelineCity, setDatelineCity] = useState("")
  const [datelineState, setDatelineState] = useState("")
  const [publishDate, setPublishDate] = useState("")
  const [embargoDate, setEmbargoDate] = useState("")
  const [body, setBody] = useState("")
  const [quotes, setQuotes] = useState<PressReleaseQuote[]>([])
  const [boilerplate, setBoilerplate] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [notes, setNotes] = useState("")

  // AI draft
  const [draftInputs, setDraftInputs] = useState<DraftInputs>({})
  const [feedback, setFeedback] = useState("")
  const [generating, setGenerating] = useState(false)

  // Collapsible panels
  const [showAI, setShowAI] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)

  // Auth headers helper
  const getHeaders = useCallback(async (json = false) => {
    const headers: Record<string, string> = {}
    if (json) headers["Content-Type"] = "application/json"
    const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && typeof window !== "undefined"
      ? localStorage.getItem("sandbox-session") : null
    if (sandbox) {
      headers["X-Sandbox-Session"] = sandbox
    } else {
      const token = await getToken()
      if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }, [getToken])

  // Fetch release
  const fetchRelease = useCallback(async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch(`/api/press/${id}`, { headers })
      if (res.ok) {
        const data: PressRelease = await res.json()
        setRelease(data)
        setTitle(data.title)
        setSubtitle(data.subtitle)
        setReleaseType(data.release_type)
        setDatelineCity(data.dateline_city)
        setDatelineState(data.dateline_state)
        setPublishDate(data.publish_date || "")
        setEmbargoDate(data.embargo_date || "")
        setBody(data.body)
        setQuotes(data.quotes || [])
        setBoilerplate(data.boilerplate)
        setContactName(data.contact_name)
        setContactEmail(data.contact_email)
        setContactPhone(data.contact_phone)
        setNotes(data.notes)
        setDraftInputs(data.draft_inputs || {})
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [id, getHeaders])

  useEffect(() => { fetchRelease() }, [fetchRelease])

  // Save release
  const handleSave = async () => {
    setSaving(true)
    try {
      const headers = await getHeaders(true)
      const res = await fetch(`/api/press/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title, subtitle, release_type: releaseType,
          dateline_city: datelineCity, dateline_state: datelineState,
          publish_date: publishDate || null,
          embargo_date: embargoDate || null,
          body, quotes, boilerplate,
          contact_name: contactName, contact_email: contactEmail, contact_phone: contactPhone,
          notes, draft_inputs: draftInputs,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setRelease(data)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {} finally {
      setSaving(false)
    }
  }

  // Update status
  const handleStatusChange = async (newStatus: PressReleaseStatus) => {
    if (!release || newStatus === release.status) return
    try {
      const headers = await getHeaders(true)
      const res = await fetch(`/api/press/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...release, status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setRelease(data)
      }
    } catch {}
  }

  // Generate AI draft
  const handleGenerateDraft = async () => {
    setGenerating(true)
    try {
      const headers = await getHeaders(true)
      const res = await fetch(`/api/press/${id}/draft`, {
        method: "POST",
        headers,
        body: JSON.stringify({ inputs: draftInputs }),
      })
      if (res.ok) {
        await fetchRelease()
      }
    } catch {} finally {
      setGenerating(false)
    }
  }

  // Redraft with feedback
  const handleRedraft = async () => {
    if (!feedback.trim()) return
    setGenerating(true)
    try {
      const headers = await getHeaders(true)
      const res = await fetch(`/api/press/${id}/draft`, {
        method: "POST",
        headers,
        body: JSON.stringify({ feedback }),
      })
      if (res.ok) {
        setFeedback("")
        await fetchRelease()
      }
    } catch {} finally {
      setGenerating(false)
    }
  }

  // Copy preview to clipboard
  const handleCopy = async () => {
    const text = buildPreview()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Build preview text
  const buildPreview = () => {
    const parts: string[] = []
    if (embargoDate) parts.push(`EMBARGO: Not for release until ${new Date(embargoDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`)
    parts.push("")
    if (title) parts.push(title.toUpperCase())
    if (subtitle) parts.push(subtitle)
    parts.push("")
    const dateline = [datelineCity, datelineState].filter(Boolean).join(", ")
    if (dateline && publishDate) {
      parts.push(`${dateline} -- ${new Date(publishDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} --`)
    }
    if (body) parts.push(body)
    if (quotes.length > 0) {
      parts.push("")
      for (const q of quotes) {
        parts.push(`"${q.text}"`)
        if (q.attribution) parts.push(`  -- ${q.attribution}`)
        parts.push("")
      }
    }
    if (boilerplate) {
      parts.push("")
      parts.push("About Phosra")
      parts.push(boilerplate)
    }
    if (contactName || contactEmail || contactPhone) {
      parts.push("")
      parts.push("Media Contact:")
      if (contactName) parts.push(contactName)
      if (contactEmail) parts.push(contactEmail)
      if (contactPhone) parts.push(contactPhone)
    }
    parts.push("")
    parts.push("###")
    return parts.join("\n")
  }

  // Quote management
  const addQuote = () => setQuotes([...quotes, { text: "", attribution: "" }])
  const removeQuote = (idx: number) => setQuotes(quotes.filter((_, i) => i !== idx))
  const updateQuote = (idx: number, field: keyof PressReleaseQuote, value: string) => {
    setQuotes(quotes.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-10 w-96 bg-muted rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="flex-1 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
          </div>
          <div className="w-80 space-y-3">
            {[1, 2].map(i => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}
          </div>
        </div>
      </div>
    )
  }

  // Resolve milestone context if linked
  const allMilestones = getAllMilestones()
  const linkedMilestone = release?.milestone_id
    ? allMilestones.find(m => m.id === release.milestone_id)
    : null

  if (!release) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-sm text-muted-foreground">Release not found.</p>
        <button onClick={() => router.push("/dashboard/admin/press")} className="mt-3 text-xs text-foreground hover:underline">
          Back to Press Center
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top bar: back + title + status workflow */}
      <div className="space-y-3">
        <button
          onClick={() => router.push("/dashboard/admin/press")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Press Center
        </button>

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground tracking-tight truncate">{release.title}</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
        </div>

        {/* Status workflow */}
        <div className="flex items-center gap-1">
          {STATUS_FLOW.map((s, idx) => {
            const Icon = STATUS_ICONS[s]
            const isCurrent = release.status === s
            const currentIdx = STATUS_FLOW.indexOf(release.status)
            const isPast = idx < currentIdx
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  isCurrent
                    ? STATUS_COLORS[s]
                    : isPast
                      ? "bg-muted/80 text-muted-foreground"
                      : "bg-muted/40 text-muted-foreground/50 hover:bg-muted/60 hover:text-muted-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
                {STATUS_LABELS[s]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Milestone context (if linked to a fundraise milestone) */}
      {linkedMilestone && (
        <div className="bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-pink-200 dark:border-pink-800/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                {linkedMilestone.id.toUpperCase()}
              </span>
              <span className="text-xs font-medium text-foreground">{linkedMilestone.title}</span>
            </div>
            <Link
              href="/dashboard/admin/fundraise"
              className="text-[10px] text-pink-500 hover:text-pink-600 font-medium transition-colors"
            >
              View in Fundraise
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{linkedMilestone.description}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-muted-foreground">
              Phase: <span className="font-medium text-foreground">{linkedMilestone.phaseName}</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              Due: <span className="font-medium text-foreground">{linkedMilestone.dueDate}</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              Owner: <span className="font-medium text-foreground">{linkedMilestone.owner}</span>
            </span>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* Left column - editor */}
        <div className="flex-1 lg:w-3/5 space-y-4">
          {/* Title + subtitle */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Release Type</label>
              <select
                value={releaseType}
                onChange={e => setReleaseType(e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none"
              >
                {Object.entries(RELEASE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dateline + dates */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Dateline City</label>
                <input
                  type="text"
                  value={datelineCity}
                  onChange={e => setDatelineCity(e.target.value)}
                  placeholder="San Francisco"
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Dateline State</label>
                <input
                  type="text"
                  value={datelineState}
                  onChange={e => setDatelineState(e.target.value)}
                  placeholder="CA"
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Publish Date</label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={e => setPublishDate(e.target.value)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Embargo Date</label>
                <input
                  type="date"
                  value={embargoDate}
                  onChange={e => setEmbargoDate(e.target.value)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="bg-card rounded-lg border border-border/50 p-4">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Body</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              className="mt-1 w-full min-h-[400px] px-3 py-2.5 text-sm font-mono bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 resize-y leading-relaxed"
            />
            <div className="text-right text-[10px] text-muted-foreground/50 mt-1 tabular-nums">
              {body.trim() ? body.trim().split(/\s+/).length : 0} words
            </div>
          </div>

          {/* Quotes */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Quotes</label>
              <button onClick={addQuote} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="w-3 h-3" />
                Add Quote
              </button>
            </div>
            {quotes.length === 0 && (
              <p className="text-xs text-muted-foreground/50">No quotes added yet.</p>
            )}
            {quotes.map((q, idx) => (
              <div key={idx} className="space-y-2 p-3 bg-background rounded-lg border border-border/30">
                <textarea
                  value={q.text}
                  onChange={e => updateQuote(idx, "text", e.target.value)}
                  placeholder="Quote text..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 resize-y"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={q.attribution}
                    onChange={e => updateQuote(idx, "attribution", e.target.value)}
                    placeholder="Attribution (e.g., Jane Doe, CEO)"
                    className="flex-1 h-8 px-3 text-xs bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                  />
                  <button onClick={() => removeQuote(idx)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Boilerplate */}
          <div className="bg-card rounded-lg border border-border/50 p-4">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Boilerplate</label>
            <textarea
              value={boilerplate}
              onChange={e => setBoilerplate(e.target.value)}
              rows={4}
              placeholder="About Phosra..."
              className="mt-1 w-full px-3 py-2.5 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 resize-y"
            />
          </div>

          {/* Contact fields */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Media Contact</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Name"
                  className="w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-lg border border-border/50 p-4">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Internal Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes (not published)..."
              className="mt-1 w-full px-3 py-2.5 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 resize-y"
            />
          </div>

          {/* Save button (bottom) */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Right column - AI + preview + history */}
        <div className="w-full lg:w-2/5 space-y-4">
          {/* AI Draft Panel */}
          <div className="bg-card rounded-lg border border-border/50">
            <button
              onClick={() => setShowAI(!showAI)}
              className="flex items-center justify-between w-full px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-medium text-foreground">AI Draft</span>
              </div>
              {showAI ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {showAI && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                {!body.trim() ? (
                  <>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Key Message</label>
                      <input
                        type="text"
                        value={draftInputs.key_message || ""}
                        onChange={e => setDraftInputs({ ...draftInputs, key_message: e.target.value })}
                        placeholder="What is the main message?"
                        className="mt-1 w-full h-8 px-3 text-xs bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Product Name</label>
                      <input
                        type="text"
                        value={draftInputs.product_name || ""}
                        onChange={e => setDraftInputs({ ...draftInputs, product_name: e.target.value })}
                        placeholder="Product or feature name"
                        className="mt-1 w-full h-8 px-3 text-xs bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Audience</label>
                      <input
                        type="text"
                        value={draftInputs.audience || ""}
                        onChange={e => setDraftInputs({ ...draftInputs, audience: e.target.value })}
                        placeholder="Target audience"
                        className="mt-1 w-full h-8 px-3 text-xs bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Quote Attribution</label>
                      <input
                        type="text"
                        value={draftInputs.quote_attribution || ""}
                        onChange={e => setDraftInputs({ ...draftInputs, quote_attribution: e.target.value })}
                        placeholder="e.g., Jane Doe, CEO of Phosra"
                        className="mt-1 w-full h-8 px-3 text-xs bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Additional Context</label>
                      <textarea
                        value={draftInputs.additional_context || ""}
                        onChange={e => setDraftInputs({ ...draftInputs, additional_context: e.target.value })}
                        rows={3}
                        placeholder="Any extra context, data points, or details..."
                        className="mt-1 w-full px-3 py-2 text-xs bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 resize-y"
                      />
                    </div>
                    <button
                      onClick={handleGenerateDraft}
                      disabled={generating}
                      className="w-full flex items-center justify-center gap-1.5 h-9 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {generating ? "Generating..." : "Generate Draft"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] text-muted-foreground">Provide feedback to refine the draft.</p>
                    <textarea
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      rows={4}
                      placeholder="e.g., Make it more concise, emphasize the compliance angle, add more data points..."
                      className="w-full px-3 py-2 text-xs bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 resize-y"
                    />
                    <button
                      onClick={handleRedraft}
                      disabled={generating || !feedback.trim()}
                      className="w-full flex items-center justify-center gap-1.5 h-9 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {generating ? "Generating..." : "Redraft"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Distribution Preview */}
          <div className="bg-card rounded-lg border border-border/50">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center justify-between w-full px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <SendIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-foreground">Distribution Preview</span>
              </div>
              {showPreview ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {showPreview && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                <div className="bg-background rounded-lg border border-border/30 p-3 max-h-[500px] overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/80 leading-relaxed">
                    {buildPreview()}
                  </pre>
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-medium bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy to Clipboard"}
                </button>
              </div>
            )}
          </div>

          {/* Revision History */}
          <div className="bg-card rounded-lg border border-border/50">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-foreground/60" />
                <span className="text-xs font-medium text-foreground">Revision History</span>
                {release.revision_history && release.revision_history.length > 0 && (
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    ({release.revision_history.length})
                  </span>
                )}
              </div>
              {showHistory ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {showHistory && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3">
                {!release.revision_history || release.revision_history.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50">No revisions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {release.revision_history.map((rev: RevisionEntry, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-background border border-border/30">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5">
                          <span className="text-[9px] font-medium tabular-nums text-muted-foreground">v{rev.version}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-foreground">
                              {rev.action === "ai_draft" ? "AI Draft" : rev.action === "feedback_redraft" ? "Redraft" : "Manual Edit"}
                            </span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {new Date(rev.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              {" "}
                              {new Date(rev.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>
                          {rev.feedback && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              Feedback: {rev.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
