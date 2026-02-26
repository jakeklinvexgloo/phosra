"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, Save, Check, ChevronDown, ChevronRight,
  Plus, Trash2, ExternalLink, Clock,
} from "lucide-react"
import Link from "next/link"
import { useApi } from "@/lib/useApi"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type {
  Journalist, JournalistPitch, PressCoverage, JournalistActivity,
  JournalistBeat, JournalistRelationshipStatus, JournalistTier,
  PitchAngle, RecentArticle, PitchStatus, CoverageTone,
} from "@/lib/journalists/types"
import {
  BEAT_LABELS, RELATIONSHIP_STATUS_LABELS, PITCH_STATUS_LABELS,
  TONE_LABELS, ACTIVITY_TYPE_LABELS,
} from "@/lib/journalists/types"

// ─── Pitch status → badge variant ──────────────────────────────────
const PITCH_STATUS_VARIANT: Record<PitchStatus, "default" | "info" | "warning" | "purple" | "success" | "destructive"> = {
  draft: "default",
  ready: "info",
  sent: "warning",
  opened: "info",
  replied: "purple",
  interested: "success",
  declined: "destructive",
  covered: "success",
  no_response: "default",
}

// ─── Coverage tone → badge variant ─────────────────────────────────
const TONE_VARIANT: Record<CoverageTone, "success" | "default" | "destructive" | "warning"> = {
  positive: "success",
  neutral: "default",
  negative: "destructive",
  mixed: "warning",
}

// ─── timeAgo helper ────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

// ─── API response shape ────────────────────────────────────────────
interface JournalistDetail extends Journalist {
  pitches: JournalistPitch[]
  coverage: PressCoverage[]
  activities: JournalistActivity[]
}

export default function JournalistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getToken } = useApi()
  const id = params.id as string

  const [journalist, setJournalist] = useState<JournalistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // ─── Form fields ───────────────────────────────────────────────
  const [name, setName] = useState("")
  const [publication, setPublication] = useState("")
  const [title, setTitle] = useState("")
  const [beat, setBeat] = useState<JournalistBeat | "">("")
  const [subBeats, setSubBeats] = useState("")
  const [email, setEmail] = useState("")
  const [twitterHandle, setTwitterHandle] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [phone, setPhone] = useState("")
  const [tier, setTier] = useState<JournalistTier>(2)
  const [relevanceScore, setRelevanceScore] = useState<number>(50)
  const [relationshipStatus, setRelationshipStatus] = useState<JournalistRelationshipStatus>("identified")
  const [notes, setNotes] = useState("")

  // ─── JSONB array fields ────────────────────────────────────────
  const [pitchAngles, setPitchAngles] = useState<PitchAngle[]>([])
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([])

  // ─── Collapsible sections ──────────────────────────────────────
  const [showAngles, setShowAngles] = useState(true)
  const [showArticles, setShowArticles] = useState(true)

  // ─── Inline add forms ──────────────────────────────────────────
  const [addingAngle, setAddingAngle] = useState(false)
  const [newAngle, setNewAngle] = useState({ angle: "", context: "", relevance: "" })
  const [addingArticle, setAddingArticle] = useState(false)
  const [newArticle, setNewArticle] = useState({ title: "", url: "", date: "", relevance_note: "" })

  // ─── Auth headers ──────────────────────────────────────────────
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

  // ─── Fetch journalist ──────────────────────────────────────────
  const fetchJournalist = useCallback(async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch(`/api/journalists/${id}`, { headers })
      if (res.ok) {
        const data: JournalistDetail = await res.json()
        setJournalist(data)
        setName(data.name)
        setPublication(data.publication)
        setTitle(data.title || "")
        setBeat(data.beat || "")
        setSubBeats((data.sub_beats || []).join(", "))
        setEmail(data.email || "")
        setTwitterHandle(data.twitter_handle || "")
        setLinkedinUrl(data.linkedin_url || "")
        setPhone(data.phone || "")
        setTier(data.tier)
        setRelevanceScore(data.relevance_score ?? 50)
        setRelationshipStatus(data.relationship_status)
        setNotes(data.notes || "")
        setPitchAngles(data.pitch_angles || [])
        setRecentArticles(data.recent_articles || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [id, getHeaders])

  useEffect(() => { fetchJournalist() }, [fetchJournalist])

  // ─── Save journalist ──────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      const headers = await getHeaders(true)
      const res = await fetch(`/api/journalists/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name,
          publication,
          title: title || null,
          beat: beat || null,
          sub_beats: subBeats ? subBeats.split(",").map(s => s.trim()).filter(Boolean) : [],
          email: email || null,
          twitter_handle: twitterHandle || null,
          linkedin_url: linkedinUrl || null,
          phone: phone || null,
          tier,
          relevance_score: relevanceScore,
          relationship_status: relationshipStatus,
          notes: notes || null,
          pitch_angles: pitchAngles,
          recent_articles: recentArticles,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setJournalist(prev => prev ? { ...prev, ...data } : prev)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {} finally {
      setSaving(false)
    }
  }

  // ─── Delete journalist ─────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch(`/api/journalists/${id}`, {
        method: "DELETE",
        headers,
      })
      if (res.ok) {
        router.push("/dashboard/admin/journalists")
      }
    } catch {}
  }

  // ─── Pitch angle management ────────────────────────────────────
  const addAngle = () => {
    if (!newAngle.angle.trim()) return
    setPitchAngles([...pitchAngles, { ...newAngle }])
    setNewAngle({ angle: "", context: "", relevance: "" })
    setAddingAngle(false)
  }
  const removeAngle = (idx: number) => setPitchAngles(pitchAngles.filter((_, i) => i !== idx))

  // ─── Recent article management ────────────────────────────────
  const addArticle = () => {
    if (!newArticle.title.trim()) return
    setRecentArticles([...recentArticles, { ...newArticle }])
    setNewArticle({ title: "", url: "", date: "", relevance_note: "" })
    setAddingArticle(false)
  }
  const removeArticle = (idx: number) => setRecentArticles(recentArticles.filter((_, i) => i !== idx))

  // ─── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-10 w-96 bg-muted rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="flex-1 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
          </div>
          <div className="w-80 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!journalist) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-sm text-muted-foreground">Journalist not found.</p>
        <button onClick={() => router.push("/dashboard/admin/journalists")} className="mt-3 text-xs text-foreground hover:underline">
          Back to Journalists
        </button>
      </div>
    )
  }

  // ─── Derived stats ────────────────────────────────────────────
  const pitches = journalist.pitches || []
  const coverage = journalist.coverage || []
  const activities = journalist.activities || []
  const pitchCount = pitches.length
  const responseCount = pitches.filter(p =>
    p.pitch_status === "replied" || p.pitch_status === "interested" || p.pitch_status === "covered"
  ).length
  const coverageCount = coverage.length

  const formatDate = (d: string | null) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="space-y-3">
        <button
          onClick={() => router.push("/dashboard/admin/journalists")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Journalists
        </button>

        <PageHeader
          title={name || "Untitled"}
          description={[publication, beat ? BEAT_LABELS[beat as JournalistBeat] : null].filter(Boolean).join(" · ")}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={saving}
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "Saving..." : saved ? "Saved" : "Save"}
              </Button>
              {!showDeleteConfirm ? (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    Confirm Delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* ─── Left column (2/3) ──────────────────────────────── */}
        <div className="flex-1 space-y-4" style={{ flexBasis: "66.6%" }}>

          {/* Profile Section */}
          <div className="plaid-card p-4 space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Profile</span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Publication</label>
                <input
                  type="text"
                  value={publication}
                  onChange={e => setPublication(e.target.value)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Senior Reporter"
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Beat</label>
                <select
                  value={beat}
                  onChange={e => setBeat(e.target.value as JournalistBeat)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none appearance-none"
                >
                  <option value="">Select beat...</option>
                  {Object.entries(BEAT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Sub Beats</label>
              <input
                type="text"
                value={subBeats}
                onChange={e => setSubBeats(e.target.value)}
                placeholder="e.g., COPPA, age verification, content moderation"
                className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
              />
              <p className="text-[10px] text-muted-foreground/50 mt-1">Comma-separated</p>
            </div>

            {/* Divider */}
            <div className="border-t border-border/30" />

            {/* Contact fields */}
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Contact</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Twitter / X</label>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={e => setTwitterHandle(e.target.value)}
                  placeholder="@handle"
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">LinkedIn</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/30" />

            {/* Tier, Relevance, Relationship */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Tier</label>
                <select
                  value={tier}
                  onChange={e => setTier(Number(e.target.value) as JournalistTier)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none appearance-none"
                >
                  <option value={1}>Tier 1</option>
                  <option value={2}>Tier 2</option>
                  <option value={3}>Tier 3</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Relevance Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={relevanceScore}
                  onChange={e => setRelevanceScore(Number(e.target.value))}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Relationship</label>
                <select
                  value={relationshipStatus}
                  onChange={e => setRelationshipStatus(e.target.value as JournalistRelationshipStatus)}
                  className="mt-1 w-full h-9 px-3 text-sm bg-background border border-border/50 rounded-lg focus:outline-none appearance-none"
                >
                  {Object.entries(RELATIONSHIP_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pitch Angles Section (collapsible) */}
          <div className="plaid-card">
            <button
              onClick={() => setShowAngles(!showAngles)}
              className="flex items-center justify-between w-full px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">Pitch Angles</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">({pitchAngles.length})</span>
              </div>
              {showAngles ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {showAngles && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                {pitchAngles.length === 0 && !addingAngle && (
                  <p className="text-xs text-muted-foreground/50">No pitch angles added yet.</p>
                )}
                {pitchAngles.map((pa, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-lg border border-border/30 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{pa.angle}</p>
                        {pa.context && <p className="text-xs text-muted-foreground mt-0.5">{pa.context}</p>}
                        {pa.relevance && <p className="text-[10px] text-muted-foreground/70 mt-0.5">Relevance: {pa.relevance}</p>}
                      </div>
                      <button onClick={() => removeAngle(idx)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {addingAngle ? (
                  <div className="p-3 bg-background rounded-lg border border-border/30 space-y-2">
                    <input
                      type="text"
                      value={newAngle.angle}
                      onChange={e => setNewAngle({ ...newAngle, angle: e.target.value })}
                      placeholder="Angle"
                      className="w-full h-8 px-3 text-xs bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                    />
                    <input
                      type="text"
                      value={newAngle.context}
                      onChange={e => setNewAngle({ ...newAngle, context: e.target.value })}
                      placeholder="Context"
                      className="w-full h-8 px-3 text-xs bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                    />
                    <input
                      type="text"
                      value={newAngle.relevance}
                      onChange={e => setNewAngle({ ...newAngle, relevance: e.target.value })}
                      placeholder="Relevance"
                      className="w-full h-8 px-3 text-xs bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={addAngle}
                        className="px-3 py-1.5 text-[10px] font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingAngle(false); setNewAngle({ angle: "", context: "", relevance: "" }) }}
                        className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingAngle(true)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Angle
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recent Articles Section (collapsible) */}
          <div className="plaid-card">
            <button
              onClick={() => setShowArticles(!showArticles)}
              className="flex items-center justify-between w-full px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">Recent Articles</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">({recentArticles.length})</span>
              </div>
              {showArticles ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {showArticles && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                {recentArticles.length === 0 && !addingArticle && (
                  <p className="text-xs text-muted-foreground/50">No articles added yet.</p>
                )}
                {recentArticles.map((a, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-lg border border-border/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {a.url ? (
                          <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1">
                            {a.title}
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-foreground">{a.title}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {a.date && <span className="text-[10px] text-muted-foreground">{formatDate(a.date)}</span>}
                          {a.relevance_note && <span className="text-[10px] text-muted-foreground/70">{a.relevance_note}</span>}
                        </div>
                      </div>
                      <button onClick={() => removeArticle(idx)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {addingArticle ? (
                  <div className="p-3 bg-background rounded-lg border border-border/30 space-y-2">
                    <input
                      type="text"
                      value={newArticle.title}
                      onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
                      placeholder="Article title"
                      className="w-full h-8 px-3 text-xs bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                    />
                    <input
                      type="url"
                      value={newArticle.url}
                      onChange={e => setNewArticle({ ...newArticle, url: e.target.value })}
                      placeholder="URL"
                      className="w-full h-8 px-3 text-xs bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={newArticle.date}
                        onChange={e => setNewArticle({ ...newArticle, date: e.target.value })}
                        className="h-8 px-3 text-xs bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                      />
                      <input
                        type="text"
                        value={newArticle.relevance_note}
                        onChange={e => setNewArticle({ ...newArticle, relevance_note: e.target.value })}
                        placeholder="Relevance note"
                        className="h-8 px-3 text-xs bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={addArticle}
                        className="px-3 py-1.5 text-[10px] font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingArticle(false); setNewArticle({ title: "", url: "", date: "", relevance_note: "" }) }}
                        className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingArticle(true)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Article
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right column (1/3) ─────────────────────────────── */}
        <div className="space-y-4" style={{ flexBasis: "33.3%", flexShrink: 0 }}>

          {/* Quick Stats */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Quick Stats</span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pitches sent</span>
                <span className="text-xs font-medium tabular-nums">{pitchCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Responses</span>
                <span className="text-xs font-medium tabular-nums">{responseCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Coverage articles</span>
                <span className="text-xs font-medium tabular-nums">{coverageCount}</span>
              </div>
              <div className="border-t border-border/30 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last contacted</span>
                  <span className="text-xs font-medium">{formatDate(journalist.last_contact_at)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Next follow-up</span>
                <span className="text-xs font-medium">{formatDate(journalist.next_followup_at)}</span>
              </div>
            </div>
          </div>

          {/* Pitch History */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Pitch History</span>
            {pitches.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">No pitches yet.</p>
            ) : (
              <div className="space-y-2">
                {pitches.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-background rounded-lg border border-border/30">
                    <div className="flex-1 min-w-0">
                      {p.press_release_id ? (
                        <Link
                          href={`/dashboard/admin/press/${p.press_release_id}`}
                          className="text-xs font-medium text-foreground hover:underline truncate block"
                        >
                          {p.press_release_title || p.pitch_subject || "Untitled pitch"}
                        </Link>
                      ) : (
                        <span className="text-xs font-medium text-foreground truncate block">
                          {p.pitch_subject || "Untitled pitch"}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{formatDate(p.created_at)}</span>
                    </div>
                    <Badge variant={PITCH_STATUS_VARIANT[p.pitch_status]} size="sm">
                      {PITCH_STATUS_LABELS[p.pitch_status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coverage */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Coverage</span>
            {coverage.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">No coverage yet.</p>
            ) : (
              <div className="space-y-2">
                {coverage.map(c => (
                  <div key={c.id} className="p-2 bg-background rounded-lg border border-border/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {c.article_url ? (
                          <a href={c.article_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-foreground hover:underline inline-flex items-center gap-1">
                            {c.article_title}
                            <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                          </a>
                        ) : (
                          <span className="text-xs font-medium text-foreground">{c.article_title}</span>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{c.publication}</span>
                          <span className="text-[10px] text-muted-foreground">{formatDate(c.published_at)}</span>
                        </div>
                      </div>
                      <Badge variant={TONE_VARIANT[c.tone]} size="sm">
                        {TONE_LABELS[c.tone]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-foreground/60" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Activity</span>
            </div>
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {activities.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-2 py-1.5">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium text-foreground">
                        {ACTIVITY_TYPE_LABELS[a.activity_type]}
                      </span>
                      {a.subject && (
                        <span className="text-[10px] text-muted-foreground ml-1.5">{a.subject}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 tabular-nums flex-shrink-0">
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Notes</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={5}
              placeholder="Internal notes about this journalist..."
              className="w-full px-3 py-2.5 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 resize-y"
            />
          </div>

        </div>
      </div>
    </div>
  )
}
