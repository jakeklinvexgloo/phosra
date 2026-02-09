"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight, ChevronLeft, Check, Clock, Shield, Eye, Bell, Ban, MapPin, Sparkles } from "lucide-react"
import { api } from "@/lib/api"
import type { Family, QuickSetupResponse, Strictness, Platform, ComplianceLink } from "@/lib/types"

const steps = ["Tell us about your child", "Here's what we'll protect", "Connect your platforms"]

function computeAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function ageGroupLabel(age: number): string {
  if (age <= 6) return "Toddler"
  if (age <= 9) return "Child"
  if (age <= 12) return "Preteen"
  if (age <= 16) return "Teen"
  return "Young Adult"
}

export default function QuickSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [childName, setChildName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [strictness, setStrictness] = useState<Strictness>("recommended")
  const [families, setFamilies] = useState<Family[]>([])
  const [familiesLoaded, setFamiliesLoaded] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | undefined>()
  const [setupResult, setSetupResult] = useState<QuickSetupResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [links, setLinks] = useState<ComplianceLink[]>([])
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")

  const age = birthDate ? computeAge(birthDate) : null

  if (!familiesLoaded) {
    setFamiliesLoaded(true)
    api.listFamilies().then((f) => {
      setFamilies(f || [])
      if (f && f.length > 0) setSelectedFamilyId(f[0].id)
    })
  }

  const handleStep1Next = async () => {
    if (!childName || !birthDate) {
      setError("Please fill in the child's name and birth date.")
      return
    }
    if (age !== null && (age < 0 || age > 18)) {
      setError("Birth date must result in an age between 0 and 18.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const req: any = {
        child_name: childName,
        birth_date: birthDate,
        strictness,
      }
      if (selectedFamilyId) {
        req.family_id = selectedFamilyId
      }
      const result = await api.quickSetup(req)
      setSetupResult(result)
      setStep(1)
    } catch (err: any) {
      setError(err.message || "Setup failed")
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Next = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        api.listPlatforms(),
        setupResult ? api.listComplianceLinks(setupResult.family.id) : Promise.resolve([]),
      ])
      setPlatforms(p || [])
      setLinks(c || [])
      setStep(2)
    } catch {
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const verifyPlatform = async (platformId: string) => {
    if (!setupResult) return
    try {
      await api.verifyCompliance(setupResult.family.id, platformId, apiKey)
      const c = await api.listComplianceLinks(setupResult.family.id)
      setLinks(c || [])
      setVerifyingPlatform(null)
      setApiKey("")
    } catch (err: any) {
      setError(err.message || "Verification failed")
    }
  }

  const verifiedCount = links.filter((l) => l.status === "verified").length

  const handleEnforce = async () => {
    if (!setupResult) return
    try {
      await api.triggerChildEnforcement(setupResult.child.id)
      router.push(`/dashboard/children/${setupResult.child.id}`)
    } catch {
      router.push(`/dashboard/children/${setupResult.child.id}`)
    }
  }

  const summaryCards = setupResult
    ? [
        { icon: Clock, label: "Screen Time", value: `${setupResult.rule_summary.screen_time_minutes} min/day` },
        { icon: Shield, label: "Content Rating", value: setupResult.rule_summary.content_rating || "N/A" },
        { icon: Eye, label: "Web Filtering", value: setupResult.rule_summary.web_filter_level || "N/A" },
        { icon: Bell, label: "Bedtime", value: setupResult.rule_summary.bedtime_hour ? `${setupResult.rule_summary.bedtime_hour}:00` : "N/A" },
        { icon: Ban, label: "Ad Blocking", value: "On" },
        { icon: MapPin, label: "Location Tracking", value: "Off" },
        { icon: Sparkles, label: "Algorithmic Feed", value: "Chronological" },
      ]
    : []

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-h2 text-foreground">Quick Setup</h2>
        <p className="text-muted-foreground mt-1">Set up protection for your child in under a minute.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < step ? "bg-foreground text-background" : i === step ? "bg-accent/15 text-brand-green border-2 border-brand-green" : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden md:block ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Tell us about your child */}
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="plaid-card space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Child&apos;s name</label>
                <input
                  type="text"
                  placeholder="e.g., Emma"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="plaid-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date of birth</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="plaid-input"
                />
                {age !== null && age >= 0 && (
                  <span className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-accent/10 text-brand-green rounded text-sm font-medium">
                    {age} years old &middot; {ageGroupLabel(age)}
                  </span>
                )}
              </div>

              {families.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Family</label>
                  <select
                    value={selectedFamilyId || ""}
                    onChange={(e) => setSelectedFamilyId(e.target.value || undefined)}
                    className="plaid-input"
                  >
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                    <option value="">Create new family</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Protection level</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["recommended", "strict", "relaxed"] as Strictness[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStrictness(s)}
                      className={`px-4 py-3 rounded border text-sm font-medium transition-colors ${
                        strictness === s
                          ? "border-foreground text-foreground bg-muted"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="capitalize">{s}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s === "recommended" && "Age-appropriate defaults"}
                        {s === "strict" && "Tighter limits & more blocking"}
                        {s === "relaxed" && "Lighter touch, more freedom"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleStep1Next}
                disabled={loading || !childName || !birthDate}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Policy summary */}
        {step === 1 && setupResult && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-accent/5 border border-accent/20 rounded p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-brand-green font-bold text-lg">
                  {setupResult.child.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{setupResult.child.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {ageGroupLabel(computeAge(setupResult.child.birth_date))} &middot; {setupResult.rule_summary.total_rules_enabled} rules active
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {summaryCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="plaid-card">
                    <Icon className="w-5 h-5 text-brand-green mb-2" />
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-sm font-medium text-foreground capitalize">{card.value}</p>
                  </div>
                )
              })}
            </div>

            {setupResult.max_ratings && Object.keys(setupResult.max_ratings).length > 0 && (
              <div className="plaid-card">
                <h4 className="text-sm font-medium text-foreground mb-3">Max Content Ratings</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(setupResult.max_ratings).map(([system, rating]) => (
                    <div key={system} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded">
                      <span className="text-xs uppercase text-muted-foreground font-medium">{system}</span>
                      <span className="text-sm font-medium text-brand-green">{rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleStep2Next}
                disabled={loading}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Connect Platforms
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Connect platforms */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="plaid-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">Verified Platforms</h3>
                <span className="text-sm text-muted-foreground">
                  {verifiedCount} of {platforms.length} connected
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-6">
                <div
                  className="bg-brand-green h-2 rounded-full transition-all duration-500"
                  style={{ width: platforms.length > 0 ? `${(verifiedCount / platforms.length) * 100}%` : "0%" }}
                />
              </div>

              <div className="space-y-0 divide-y divide-border">
                {platforms.map((platform) => {
                  const link = links.find((l) => l.platform_id === platform.id)
                  const verified = link?.status === "verified"
                  return (
                    <div key={platform.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{platform.name}</p>
                        <p className="text-xs text-muted-foreground">{platform.description}</p>
                      </div>
                      {verified ? (
                        <span className="flex items-center gap-1.5 text-sm text-success font-medium">
                          <span className="status-dot bg-success" />
                          Verified
                        </span>
                      ) : verifyingPlatform === platform.id ? (
                        <div className="flex items-center gap-2">
                          {platform.auth_type === "api_key" && (
                            <input
                              type="text"
                              placeholder="API Key"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              className="w-36 rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-foreground"
                            />
                          )}
                          <button onClick={() => verifyPlatform(platform.id)} className="bg-foreground text-background px-3 py-1 rounded-full text-xs font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition">
                            Verify
                          </button>
                          <button onClick={() => setVerifyingPlatform(null)} className="text-xs text-muted-foreground hover:text-foreground">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setVerifyingPlatform(platform.id)}
                          className="text-xs font-medium text-foreground hover:underline"
                        >
                          Verify Compliance
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(setupResult ? `/dashboard/children/${setupResult.child.id}` : "/dashboard")}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Skip for now
                </button>
                {verifiedCount > 0 && (
                  <button
                    onClick={handleEnforce}
                    className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/90 hover:shadow-sm active:scale-[0.98] transition"
                  >
                    Enforce Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
