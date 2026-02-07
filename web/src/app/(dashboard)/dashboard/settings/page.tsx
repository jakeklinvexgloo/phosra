"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sun, Moon, Monitor, BookOpen } from "lucide-react"
import { api } from "@/lib/api"
import { useTheme } from "@/lib/theme"
import type { User, Family } from "@/lib/types"

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const sectionItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [families, setFamilies] = useState<Family[]>([])
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookEvents, setWebhookEvents] = useState("enforcement.completed,enforcement.failed")
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    api.me().then(setUser)
    api.listFamilies().then(f => setFamilies(f || []))
  }, [])

  const createWebhook = async () => {
    if (!webhookUrl || !families.length) return
    await api.createWebhook(families[0].id, webhookUrl, webhookEvents.split(",").map(s => s.trim()))
    setWebhookUrl("")
    alert("Webhook created!")
  }

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Light", desc: "Light background" },
    { value: "dark" as const, icon: Moon, label: "Dark", desc: "Dark background" },
    { value: "system" as const, icon: Monitor, label: "System", desc: "Match OS setting" },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-8">Settings</h2>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        {/* Appearance */}
        <motion.div variants={sectionItem} className="bg-card rounded-xl shadow-sm border border-border/50 p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Appearance</h3>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(opt => {
              const Icon = opt.icon
              const isActive = theme === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="theme-settings-indicator"
                      className="absolute inset-0 rounded-xl border-2 border-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-6 h-6 relative z-10 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium relative z-10 ${isActive ? "text-primary" : "text-foreground"}`}>{opt.label}</span>
                  <span className="text-xs text-muted-foreground relative z-10">{opt.desc}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Account */}
        <motion.div variants={sectionItem} className="bg-card rounded-xl shadow-sm border border-border/50 p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Account</h3>
          {user && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted-foreground">Name</label>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground">Email</label>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Webhooks */}
        <motion.div variants={sectionItem} className="bg-card rounded-xl shadow-sm border border-border/50 p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Webhooks</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Callback URL</label>
              <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-server.com/webhook" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Events (comma-separated)</label>
              <input type="text" value={webhookEvents} onChange={(e) => setWebhookEvents(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
            </div>
            <button onClick={createWebhook} className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/25">Add Webhook</button>
          </div>
        </motion.div>

        {/* API Info */}
        <motion.div variants={sectionItem} className="bg-card rounded-xl shadow-sm border border-border/50 p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">API</h3>
          <p className="text-sm text-muted-foreground mb-2">Base URL: <code className="bg-muted px-2 py-0.5 rounded text-xs text-foreground">http://localhost:8080/api/v1</code></p>
          <p className="text-sm text-muted-foreground mb-4">Use Bearer token authentication with your access token.</p>
          <Link href="/docs" target="_blank" className="inline-flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/25">
            <BookOpen className="w-4 h-4" />
            View GCSS v1.0 Specification
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
