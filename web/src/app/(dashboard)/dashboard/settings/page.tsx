"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useApi } from "@/lib/useApi"
import { api } from "@/lib/api"
import type { Family } from "@/lib/types"

export default function SettingsPage() {
  const { user } = useUser()
  const { getToken } = useApi()
  const [families, setFamilies] = useState<Family[]>([])
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookEvents, setWebhookEvents] = useState("enforcement.completed,enforcement.failed")

  useEffect(() => {
    getToken().then(token => api.listFamilies(token ?? undefined).then(f => setFamilies(f || [])))
  }, [getToken])

  const createWebhook = async () => {
    if (!webhookUrl || !families.length) return
    const token = await getToken()
    await api.createWebhook(families[0].id, webhookUrl, webhookEvents.split(",").map(s => s.trim()), token ?? undefined)
    setWebhookUrl("")
    alert("Webhook created!")
  }

  return (
    <div>
      <h2 className="text-h2 text-foreground mb-8">Settings</h2>

      <div className="space-y-6">
        {/* Account */}
        <div className="plaid-card">
          <h3 className="section-header mb-4">Account</h3>
          {user && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted-foreground">Name</label>
                <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground">Email</label>
                <p className="text-sm font-medium text-foreground">{user.emailAddresses?.[0]?.emailAddress}</p>
              </div>
            </div>
          )}
        </div>

        {/* Webhooks */}
        <div className="plaid-card">
          <h3 className="section-header mb-4">Webhooks</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Callback URL</label>
              <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-server.com/webhook" className="plaid-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Events (comma-separated)</label>
              <input type="text" value={webhookEvents} onChange={(e) => setWebhookEvents(e.target.value)} className="plaid-input" />
            </div>
            <button onClick={createWebhook} className="bg-foreground text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition">Add Webhook</button>
          </div>
        </div>

        {/* API Info */}
        <div className="plaid-card">
          <h3 className="section-header mb-4">API</h3>
          <p className="text-sm text-muted-foreground mb-2">Base URL: <code className="bg-muted px-2 py-0.5 rounded text-xs text-foreground">http://localhost:8080/api/v1</code></p>
          <p className="text-sm text-muted-foreground mb-4">Use Bearer token authentication with your access token.</p>
          <Link href="/dashboard/docs" className="inline-flex items-center gap-2 bg-foreground text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition">
            <BookOpen className="w-4 h-4" />
            View PCSS v1.0 Specification
          </Link>
        </div>
      </div>
    </div>
  )
}
