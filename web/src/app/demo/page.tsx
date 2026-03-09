"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Shield, Users, Globe, Activity, ChevronRight, ArrowRight,
  CheckCircle2, Loader2, Monitor, Sparkles
} from "lucide-react"

/* ── Walkthrough steps ────────────────────── */

interface WalkthroughStep {
  id: string
  label: string
  description: string
  delay: number // ms before auto-advancing (0 = manual)
}

const WALKTHROUGH: WalkthroughStep[] = [
  { id: "prompt", label: "Tell Phosra what you need", description: "Type a natural-language request like \"Set up Netflix for my 8-year-old\"", delay: 0 },
  { id: "processing", label: "Phosra maps rules to platforms", description: "AI generates age-appropriate policies and maps them to each connected platform", delay: 3000 },
  { id: "dashboard", label: "See enforcement in real time", description: "Every platform shows which rules were applied, pending, or need attention", delay: 0 },
]

/* ── Demo data (shown after walkthrough) ──── */

const DEMO_CHILDREN = [
  {
    id: "demo-1", name: "Emma", age: 12,
    platforms: [
      { name: "Netflix", rules: 6, status: "enforced" as const },
      { name: "YouTube", rules: 8, status: "enforced" as const },
      { name: "NextDNS", rules: 12, status: "enforced" as const },
    ],
    totalRules: 26,
    avatarColor: "from-brand-green to-accent-teal",
  },
  {
    id: "demo-2", name: "Liam", age: 8,
    platforms: [
      { name: "Disney+", rules: 4, status: "enforced" as const },
      { name: "Roblox", rules: 9, status: "enforced" as const },
      { name: "CleanBrowsing", rules: 10, status: "enforced" as const },
      { name: "Fire Tablet", rules: 7, status: "pending" as const },
    ],
    totalRules: 30,
    avatarColor: "from-accent-purple to-accent-teal",
  },
  {
    id: "demo-3", name: "Sophia", age: 15,
    platforms: [
      { name: "Instagram", rules: 5, status: "enforced" as const },
      { name: "Spotify", rules: 3, status: "enforced" as const },
      { name: "NextDNS", rules: 8, status: "enforced" as const },
      { name: "TikTok", rules: 6, status: "enforced" as const },
    ],
    totalRules: 22,
    avatarColor: "from-accent-teal to-brand-green",
  },
]

const ENFORCEMENT_LOG = [
  { platform: "Netflix", child: "Emma", rules: 6, time: "2s ago", status: "success" as const },
  { platform: "YouTube", child: "Emma", rules: 8, time: "3s ago", status: "success" as const },
  { platform: "Roblox", child: "Liam", rules: 9, time: "4s ago", status: "success" as const },
  { platform: "Disney+", child: "Liam", rules: 4, time: "5s ago", status: "success" as const },
  { platform: "Instagram", child: "Sophia", rules: 5, time: "6s ago", status: "success" as const },
  { platform: "TikTok", child: "Sophia", rules: 6, time: "7s ago", status: "success" as const },
  { platform: "Fire Tablet", child: "Liam", rules: 7, time: "8s ago", status: "pending" as const },
]

const statusStyles = {
  enforced: { bg: "bg-brand-green/15", text: "text-brand-green", dot: "bg-brand-green" },
  pending: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" },
  success: { bg: "bg-brand-green/15", text: "text-brand-green", dot: "bg-brand-green" },
}

/* ── Main Component ───────────────────────── */

export default function DemoPage() {
  const [step, setStep] = useState(0)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [visibleLogs, setVisibleLogs] = useState(0)
  const [promptText, setPromptText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const currentStep = WALKTHROUGH[step]

  // Typewriter effect for prompt step
  useEffect(() => {
    if (step !== 0) return
    const text = "Set up protections for all my kids across every platform"
    let i = 0
    setIsTyping(true)
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setPromptText(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, 35)
      return () => clearInterval(interval)
    }, 800)
    return () => clearTimeout(timer)
  }, [step])

  // Auto-advance processing step
  useEffect(() => {
    if (step !== 1) return
    setProcessingProgress(0)
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setStep(2), 500)
          return 100
        }
        return prev + 2
      })
    }, 50)
    return () => clearInterval(interval)
  }, [step])

  // Animate enforcement logs appearing in dashboard step
  useEffect(() => {
    if (step !== 2) return
    setVisibleLogs(0)
    let count = 0
    const interval = setInterval(() => {
      count++
      setVisibleLogs(count)
      if (count >= ENFORCEMENT_LOG.length) clearInterval(interval)
    }, 300)
    return () => clearInterval(interval)
  }, [step])

  const handleNext = useCallback(() => {
    if (step < WALKTHROUGH.length - 1) setStep(step + 1)
  }, [step])

  const handleReset = useCallback(() => {
    setStep(0)
    setPromptText("")
    setSelectedChild(null)
    setProcessingProgress(0)
    setVisibleLogs(0)
  }, [])

  return (
    <div>
      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {WALKTHROUGH.map((ws, i) => (
          <button
            key={ws.id}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              i === step
                ? "bg-brand-green/15 text-brand-green border border-brand-green/25"
                : i < step
                ? "bg-white/[0.06] text-white/60 border border-white/[0.08]"
                : "bg-white/[0.03] text-white/30 border border-white/[0.05]"
            }`}
          >
            {i < step ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
            ) : (
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                i === step ? "bg-brand-green/20 text-brand-green" : "bg-white/[0.06] text-white/30"
              }`}>{i + 1}</span>
            )}
            {ws.label}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">{currentStep.label}</h1>
        <p className="text-white/40 text-sm">{currentStep.description}</p>
      </div>

      {/* Step 1: Prompt input */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="relative bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-1">
            <div className="flex items-center gap-3 px-4 py-3">
              <Sparkles className="w-4 h-4 text-brand-green flex-shrink-0" />
              <div className="flex-1 text-sm text-white/80">
                {promptText}
                {isTyping && <span className="inline-block w-[2px] h-[1em] bg-white/40 animate-pulse ml-0.5 align-text-bottom" />}
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 bg-brand-green text-foreground px-6 py-3 rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]"
          >
            Run it
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.08] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className={`w-5 h-5 text-brand-green ${processingProgress < 100 ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium text-white">
                {processingProgress < 100 ? "Mapping rules to platforms..." : "Complete!"}
              </span>
              <span className="ml-auto text-sm font-mono text-white/40">{processingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-green to-accent-teal rounded-full transition-all duration-100"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <div className="mt-4 space-y-2">
              {["Identifying children & age groups", "Generating age-appropriate policies", "Mapping rules to connected platforms", "Triggering enforcement"].map((task, i) => {
                const done = processingProgress > (i + 1) * 25
                const active = processingProgress > i * 25 && processingProgress <= (i + 1) * 25
                return (
                  <div key={task} className="flex items-center gap-2 text-xs">
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                    ) : active ? (
                      <Loader2 className="w-3.5 h-3.5 text-brand-green animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-white/[0.1]" />
                    )}
                    <span className={done ? "text-white/60" : active ? "text-white/70" : "text-white/25"}>
                      {task}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Enforcement Dashboard */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Children", value: "3", icon: Users, color: "text-brand-green" },
              { label: "Platforms", value: "11", icon: Globe, color: "text-accent-teal" },
              { label: "Rules Active", value: "78", icon: Shield, color: "text-accent-purple" },
              { label: "Enforced", value: `${Math.min(visibleLogs, ENFORCEMENT_LOG.filter(l => l.status === "success").length)}/${ENFORCEMENT_LOG.length}`, icon: Activity, color: "text-brand-green" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.08] p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-semibold text-white tabular-nums">{stat.value}</p>
                </div>
              )
            })}
          </div>

          {/* Children with platform enforcement breakdown */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Enforcement by Child</h2>
            <div className="space-y-3">
              {DEMO_CHILDREN.map((child) => (
                <div
                  key={child.id}
                  className={`bg-white/[0.04] backdrop-blur-xl rounded-xl border transition-all cursor-pointer p-5 ${
                    selectedChild === child.id
                      ? "border-brand-green/40 bg-white/[0.06]"
                      : "border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                  onClick={() => setSelectedChild(selectedChild === child.id ? null : child.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${child.avatarColor} flex items-center justify-center text-white text-sm font-semibold`}>
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{child.name}</p>
                        <p className="text-xs text-white/40">Age {child.age} &middot; {child.totalRules} rules across {child.platforms.length} platforms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1.5">
                        {child.platforms.map((p) => (
                          <span key={p.name} className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded ${
                            p.status === "enforced" ? "bg-brand-green/10 text-brand-green" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${p.status === "enforced" ? "bg-brand-green" : "bg-amber-400"}`} />
                            {p.name}
                          </span>
                        ))}
                      </div>
                      <ChevronRight className={`w-4 h-4 text-white/30 transition-transform ${
                        selectedChild === child.id ? "rotate-90" : ""
                      }`} />
                    </div>
                  </div>

                  {selectedChild === child.id && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Platform Enforcement Detail</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {child.platforms.map((p) => {
                          const style = statusStyles[p.status]
                          return (
                            <div key={p.name} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.05]">
                              <div className="flex items-center gap-2">
                                <Monitor className="w-3.5 h-3.5 text-white/30" />
                                <span className="text-xs font-medium text-white/70">{p.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white/40">{p.rules} rules</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.text}`}>
                                  <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                                  {p.status === "enforced" ? "Enforced" : "Pending"}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live enforcement log */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Enforcement Log</h2>
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Platform</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Child</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Rules</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENFORCEMENT_LOG.slice(0, visibleLogs).map((log, i) => {
                      const style = statusStyles[log.status]
                      return (
                        <tr
                          key={i}
                          className="border-b border-white/[0.04] last:border-0 animate-in fade-in slide-in-from-top-1 duration-300"
                        >
                          <td className="px-4 py-2.5 text-sm text-white/80 font-medium">{log.platform}</td>
                          <td className="px-4 py-2.5 text-sm text-white/50">{log.child}</td>
                          <td className="px-4 py-2.5 text-sm text-white/50">{log.rules} applied</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {log.status === "success" ? "Enforced" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Try the live AI or reset */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleReset}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Restart walkthrough
            </button>
            <Link
              href="/developers/playground"
              className="inline-flex items-center gap-2 text-xs font-medium text-brand-green/70 hover:text-brand-green transition-colors"
            >
              Try the live AI playground
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center py-10 mt-8 border-t border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-2">Ready to protect your family?</h3>
        <p className="text-sm text-white/40 mb-6">
          Create a free account to set up real policies and connect your platforms.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-brand-green text-foreground px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/developers/playground"
            className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
          >
            Open AI Playground
          </Link>
        </div>
      </div>
    </div>
  )
}
