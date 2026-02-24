"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { WebhookPanel } from "@/components/dashboard/WebhookPanel"
import { useStytchUser } from "@stytch/nextjs"

export default function SettingsPage() {
  const { user } = useStytchUser()

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
                <p className="text-sm font-medium text-foreground">{user.name.first_name} {user.name.last_name}</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground">Email</label>
                <p className="text-sm font-medium text-foreground">{user.emails[0]?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* API Keys */}
        <div className="plaid-card">
          <h3 className="section-header mb-2">API Keys</h3>
          <p className="text-sm text-muted-foreground mb-3">Manage your API keys for the Phosra platform.</p>
          <Link href="/dashboard/developers/keys" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
            Manage API Keys <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Webhooks */}
        <WebhookPanel />

        {/* API Info */}
        <div className="plaid-card">
          <h3 className="section-header mb-4">API</h3>
          <p className="text-sm text-muted-foreground mb-2">Base URL: <code className="bg-muted px-2 py-0.5 rounded text-xs text-foreground">https://api.phosra.com/api/v1</code></p>
          <p className="text-sm text-muted-foreground mb-4">Use Bearer token authentication with your access token.</p>
          <Link href="/dashboard/docs" className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition">
            <BookOpen className="w-4 h-4" />
            View PCSS v1.0 Specification
          </Link>
        </div>
      </div>
    </div>
  )
}
