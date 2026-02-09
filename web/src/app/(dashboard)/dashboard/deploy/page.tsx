"use client"

import { useState } from "react"
import { Rocket, Globe, Server, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type Target = "vercel-preview" | "vercel-production" | "railway"
type DeployStatus = "idle" | "deploying" | "success" | "error"

interface DeployState {
  status: DeployStatus
  message?: string
}

const TARGETS: { id: Target; label: string; description: string; icon: typeof Globe; color: string }[] = [
  {
    id: "vercel-preview",
    label: "Deploy Preview",
    description: "Push to a Vercel preview URL to test before going live",
    icon: Globe,
    color: "bg-blue-500",
  },
  {
    id: "vercel-production",
    label: "Deploy to Production",
    description: "Push the latest code live to your Vercel production domain",
    icon: Rocket,
    color: "bg-brand-green",
  },
  {
    id: "railway",
    label: "Deploy API",
    description: "Rebuild and deploy the Go API backend on Railway",
    icon: Server,
    color: "bg-purple-500",
  },
]

export default function DeployPage() {
  const [states, setStates] = useState<Record<Target, DeployState>>({
    "vercel-preview": { status: "idle" },
    "vercel-production": { status: "idle" },
    "railway": { status: "idle" },
  })

  const trigger = async (target: Target) => {
    setStates((s) => ({ ...s, [target]: { status: "deploying" } }))

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStates((s) => ({ ...s, [target]: { status: "error", message: data.error } }))
        return
      }

      setStates((s) => ({
        ...s,
        [target]: { status: "success", message: "Deploy triggered! Check your hosting dashboard for progress." },
      }))
    } catch {
      setStates((s) => ({
        ...s,
        [target]: { status: "error", message: "Network error. Are you online?" },
      }))
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Deploy</h1>
        <p className="text-sm text-muted-foreground">
          Trigger deployments to preview or production. Each button sends a webhook to your hosting provider.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {TARGETS.map(({ id, label, description, icon: Icon, color }) => {
          const state = states[id]
          const isDeploying = state.status === "deploying"

          return (
            <div
              key={id}
              className="border border-border rounded-sm p-5 bg-background flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-sm ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-background" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                {state.status === "success" && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {state.message}
                  </p>
                )}
                {state.status === "error" && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {state.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => trigger(id)}
                disabled={isDeploying}
                className="px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-sm hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  "Deploy"
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-10 p-4 bg-muted/50 border border-border rounded-sm max-w-2xl">
        <h3 className="text-sm font-semibold text-foreground mb-2">Setup</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Add deploy hook URLs as environment variables in your hosting provider:
        </p>
        <div className="space-y-1.5 font-mono text-xs text-muted-foreground">
          <p><span className="text-foreground">VERCEL_DEPLOY_HOOK_PREVIEW</span> — Vercel &gt; Project Settings &gt; Git &gt; Deploy Hooks</p>
          <p><span className="text-foreground">VERCEL_DEPLOY_HOOK_PRODUCTION</span> — Same section, set branch to <code className="bg-muted px-1 rounded">main</code></p>
          <p><span className="text-foreground">RAILWAY_DEPLOY_HOOK</span> — Railway &gt; Project Settings &gt; Deploy Triggers</p>
        </div>
      </div>
    </div>
  )
}
