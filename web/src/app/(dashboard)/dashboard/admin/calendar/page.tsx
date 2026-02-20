"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarDays, Plus, Clock, MapPin, Users, ExternalLink, Trash2, Loader2, X } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { GoogleConnectionStatus, CalendarEvent } from "@/lib/admin/types"

export default function CalendarPage() {
  const { getToken } = useApi()
  const [status, setStatus] = useState<GoogleConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<CalendarEvent[]>([])

  // Create event state
  const [creating, setCreating] = useState(false)
  const [newSummary, setNewSummary] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newStart, setNewStart] = useState("")
  const [newEnd, setNewEnd] = useState("")
  const [newAttendees, setNewAttendees] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const fetchEvents = useCallback(async () => {
    try {
      const token = (await getToken()) ?? undefined
      const timeMin = new Date().toISOString()
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const result = await api.listCalendarEvents(timeMin, timeMax, 50, token)
      setEvents(result.events || [])
    } catch {
      // Handle error
    }
  }, [getToken])

  useEffect(() => {
    async function init() {
      const connected = await checkConnection()
      if (connected) {
        await fetchEvents()
      }
      setLoading(false)
    }
    init()
  }, [checkConnection, fetchEvents])

  const handleConnect = async () => {
    try {
      const token = (await getToken()) ?? undefined
      const result = await api.getGoogleAuthURL(token)
      window.location.href = result.url
    } catch {
      // Handle error
    }
  }

  const handleCreate = async () => {
    if (!newSummary || !newStart || !newEnd) return
    setSaving(true)
    try {
      const token = (await getToken()) ?? undefined
      const attendeeList = newAttendees.split(",").map((e) => e.trim()).filter(Boolean)
      await api.createCalendarEvent(
        {
          summary: newSummary,
          description: newDescription || undefined,
          location: newLocation || undefined,
          start: new Date(newStart).toISOString(),
          end: new Date(newEnd).toISOString(),
          attendees: attendeeList.length > 0 ? attendeeList : undefined,
        },
        token
      )
      setCreating(false)
      setNewSummary("")
      setNewDescription("")
      setNewLocation("")
      setNewStart("")
      setNewEnd("")
      setNewAttendees("")
      await fetchEvents()
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    setDeletingId(eventId)
    try {
      const token = (await getToken()) ?? undefined
      await api.deleteCalendarEvent(eventId, token)
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } catch {
      // Handle error
    } finally {
      setDeletingId(null)
    }
  }

  const formatEventTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  }

  // Group events by date
  const groupedEvents = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const dateKey = new Date(event.start).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {})

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground text-sm animate-pulse">Loading calendar...</div>
  }

  // Not connected
  if (!status?.connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect Google to view and create calendar events.</p>
        </div>
        <div className="plaid-card text-center py-12 max-w-md mx-auto">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Connect Google Calendar</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Link your Google account to view upcoming events and schedule partner meetings.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <CalendarDays className="w-4 h-4" />
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
          <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {status.email} &middot; {events.length} upcoming events
          </p>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          New Event
        </button>
      </div>

      {/* Create Event Form */}
      {creating && (
        <div className="plaid-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Schedule Meeting</h3>
            <button onClick={() => setCreating(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Event title"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              className="plaid-input"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                <input
                  type="datetime-local"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="plaid-input"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End</label>
                <input
                  type="datetime-local"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="plaid-input"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Location (optional)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="plaid-input"
            />
            <input
              type="text"
              placeholder="Attendee emails, comma-separated (optional)"
              value={newAttendees}
              onChange={(e) => setNewAttendees(e.target.value)}
              className="plaid-input"
            />
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="plaid-input resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCreate}
                disabled={saving || !newSummary || !newStart || !newEnd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarDays className="w-3.5 h-3.5" />}
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events Timeline */}
      {events.length === 0 ? (
        <div className="plaid-card text-center py-12">
          <p className="text-muted-foreground text-sm">No upcoming events in the next 30 days.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                {formatEventDate(dayEvents[0].start)}
              </h3>
              <div className="plaid-card p-0 divide-y divide-border">
                {dayEvents.map((event) => (
                  <div key={event.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-8 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{event.summary}</div>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatEventTime(event.start)} — {new Date(event.end).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {event.attendees.length} attendee{event.attendees.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {event.html_link && (
                          <a
                            href={event.html_link}
                            target="_blank"
                            rel="noopener"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Open in Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => event.id && handleDelete(event.id)}
                          disabled={deletingId === event.id}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
                          title="Delete event"
                        >
                          {deletingId === event.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
