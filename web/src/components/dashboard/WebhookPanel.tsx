"use client"

import { useState } from "react"
import { Plus, Trash2, Play, Pause, Zap, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Webhook {
  id: string
  url: string
  events: string[]
  status: "active" | "paused"
  createdAt: string
  lastTriggered?: string
}

// Mock data
const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: "wh_1",
    url: "https://api.example.com/webhooks/phosra",
    events: ["enforcement.completed", "enforcement.failed"],
    status: "active",
    createdAt: "2025-01-20",
    lastTriggered: "2 hours ago",
  },
]

const AVAILABLE_EVENTS = [
  "enforcement.completed",
  "enforcement.failed",
  "policy.created",
  "policy.updated",
  "child.created",
  "compliance.verified",
  "compliance.revoked",
]

export function WebhookPanel() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS)
  const [showCreate, setShowCreate] = useState(false)
  const [newUrl, setNewUrl] = useState("")
  const [newEvents, setNewEvents] = useState<string[]>(["enforcement.completed", "enforcement.failed"])
  const [testingId, setTestingId] = useState<string | null>(null)

  const toggleEvent = (event: string) => {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  const createWebhook = () => {
    if (!newUrl) return
    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      url: newUrl,
      events: newEvents,
      status: "active",
      createdAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    }
    setWebhooks([...webhooks, webhook])
    setNewUrl("")
    setNewEvents(["enforcement.completed", "enforcement.failed"])
    setShowCreate(false)
    toast({ title: "Webhook created", description: "Your endpoint has been registered.", variant: "success" })
  }

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id))
    toast({ title: "Webhook deleted", variant: "default" })
  }

  const toggleStatus = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w
      )
    )
  }

  const testWebhook = async (id: string) => {
    setTestingId(id)
    // Simulate test delay
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setTestingId(null)
    toast({ title: "Test payload sent", description: "200 OK — webhook is working.", variant: "success" })
  }

  return (
    <div className="plaid-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header">Webhooks</h3>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Endpoint
          </button>
        )}
      </div>

      {/* Existing webhooks */}
      {webhooks.length > 0 && (
        <div className="space-y-3 mb-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono text-foreground truncate block">{webhook.url}</code>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        webhook.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          webhook.status === "active" ? "bg-success" : "bg-muted-foreground"
                        }`}
                      />
                      {webhook.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {webhook.createdAt}
                    {webhook.lastTriggered && ` · Last triggered ${webhook.lastTriggered}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => testWebhook(webhook.id)}
                    disabled={testingId === webhook.id}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    title="Test"
                  >
                    <Zap className={`w-3.5 h-3.5 ${testingId === webhook.id ? "animate-pulse" : ""}`} />
                  </button>
                  <button
                    onClick={() => toggleStatus(webhook.id)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title={webhook.status === "active" ? "Pause" : "Resume"}
                  >
                    {webhook.status === "active" ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
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

      {webhooks.length === 0 && !showCreate && (
        <p className="text-sm text-muted-foreground mb-4">
          No webhooks configured. Add an endpoint to receive real-time notifications.
        </p>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">New Webhook</p>
            <button
              onClick={() => setShowCreate(false)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Callback URL</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="plaid-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Events</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_EVENTS.map((event) => (
                <button
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={`text-xs font-mono px-2 py-1 rounded-full border transition-colors ${
                    newEvents.includes(event)
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={createWebhook}
            disabled={!newUrl || newEvents.length === 0}
            className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition disabled:opacity-50"
          >
            Create Webhook
          </button>
        </div>
      )}
    </div>
  )
}
