"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { api } from "@/lib/api"
import type { Platform, Family, ComplianceLink } from "@/lib/types"

const tierConfig = {
  compliant: { dot: "bg-success", text: "text-success", border: "border-success/30", bg: "bg-success/10", label: "Compliant" },
  provisional: { dot: "bg-warning", text: "text-warning", border: "border-warning/30", bg: "bg-warning/10", label: "Provisional" },
  pending: { dot: "bg-muted-foreground", text: "text-muted-foreground", border: "border-border", bg: "bg-muted", label: "Pending Compliance" },
}

const categoryLabels: Record<string, string> = {
  dns: "DNS Filtering",
  streaming: "Streaming",
  gaming: "Gaming",
  device: "Devices",
  browser: "Browser",
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const cardItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [links, setLinks] = useState<ComplianceLink[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [verifyingTo, setVerifyingTo] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    api.listPlatforms().then(p => setPlatforms(p || []))
    api.listFamilies().then(f => {
      setFamilies(f || [])
      if (f && f.length > 0) {
        api.listComplianceLinks(f[0].id).then(c => setLinks(c || []))
      }
    })
  }, [])

  const isVerified = (platformId: string) => links.some(c => c.platform_id === platformId && c.status === "verified")

  const verify = async (platformId: string) => {
    if (!families.length) return
    await api.verifyCompliance(families[0].id, platformId, apiKey)
    const c = await api.listComplianceLinks(families[0].id)
    setLinks(c || [])
    setVerifyingTo(null)
    setApiKey("")
  }

  const revoke = async (linkId: string) => {
    await api.revokeCertification(linkId)
    if (families.length) {
      const c = await api.listComplianceLinks(families[0].id)
      setLinks(c || [])
    }
  }

  const grouped = platforms.reduce<Record<string, Platform[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Regulated Platforms</h2>
      <p className="text-sm text-muted-foreground mb-8">Platforms subject to GuardianGate Child Safety Standard compliance requirements.</p>

      {Object.entries(grouped).map(([category, categoryPlatforms]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-medium text-foreground mb-4">{categoryLabels[category] || category}</h3>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {categoryPlatforms.map(platform => {
              const link = links.find(c => c.platform_id === platform.id)
              const tier = tierConfig[platform.tier] || tierConfig.pending
              return (
                <motion.div key={platform.id} variants={cardItem} className="bg-card rounded-xl shadow-sm border border-border/50 p-6 card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-foreground">{platform.name}</h4>
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${tier.bg} ${tier.text} border ${tier.border}`}>
                      <span className={`status-dot ${tier.dot}`} />
                      {tier.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{platform.description}</p>
                  {(() => {
                    const legislationMap: Record<string, string[]> = {
                      nextdns: ["KOSA", "COPPA 2.0", "EU DSA"],
                      cleanbrowsing: ["KOSA", "COPPA 2.0"],
                      android: ["KOSA", "COPPA 2.0", "CA SB 976"],
                      microsoft: ["KOSA", "EU DSA"],
                      apple: ["KOSA", "CA SB 976", "FL HB 3"],
                      netflix: ["EU DSA", "UK OSA"],
                      disney_plus: ["COPPA 2.0", "EU DSA"],
                      youtube: ["KOSA", "COPPA 2.0", "EU DSA", "CA SB 976"],
                      xbox: ["KOSA", "EU DSA"],
                      playstation: ["KOSA", "EU DSA"],
                    }
                    const badges = legislationMap[platform.id] || []
                    return badges.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {badges.map(law => (
                          <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20">
                            {law}
                          </span>
                        ))}
                      </div>
                    ) : <div className="mb-4" />
                  })()}

                  {platform.capabilities && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {platform.capabilities.slice(0, 4).map(cap => (
                        <span key={cap} className="px-2 py-0.5 bg-primary/5 text-primary rounded text-xs">{cap.replace("_", " ")}</span>
                      ))}
                    </div>
                  )}

                  {isVerified(platform.id) ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-success font-medium">
                        <span className="status-dot bg-success status-dot-pulse" />
                        Verified
                      </span>
                      {link && <button onClick={() => revoke(link.id)} className="text-xs text-destructive hover:underline">Revoke Certification</button>}
                    </div>
                  ) : verifyingTo === platform.id ? (
                    <div className="space-y-2">
                      {platform.auth_type === "api_key" && (
                        <input type="text" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground" />
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => verify(platform.id)} className="gradient-primary text-white px-3 py-1 rounded text-xs">Verify Compliance</button>
                        <button onClick={() => setVerifyingTo(null)} className="px-3 py-1 rounded border border-border text-foreground text-xs">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setVerifyingTo(platform.id)} className="w-full bg-muted text-foreground py-2 rounded-lg text-sm font-medium hover:bg-muted/70 transition">
                      {platform.auth_type === "manual" ? "View Compliance Instructions" : "Verify Compliance"}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      ))}
    </div>
  )
}
