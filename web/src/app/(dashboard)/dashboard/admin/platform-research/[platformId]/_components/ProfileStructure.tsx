"use client"

import { Users, Lock, Shield, Eye } from "lucide-react"
import type { ProfileStructureData } from "@/lib/platform-research/research-data-types"

interface ProfileNode {
  name: string
  maturity: string
  type: "standard" | "kids"
  pinEnabled: boolean
}

interface ProfileStructureProps {
  data: ProfileStructureData
}

export function ProfileStructure({ data }: ProfileStructureProps) {
  return (
    <section id="account-structure" className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
          <Users className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Account Structure</h2>
          <p className="text-sm text-muted-foreground">{data.hierarchyDescription}</p>
        </div>
      </div>

      {/* Tree visualization */}
      <div className="plaid-card overflow-x-auto">
        {/* Root node */}
        <div className="flex flex-col items-center">
          <div
            className="rounded-lg border-2 bg-zinc-900 text-white px-5 py-3 text-center"
            style={{ borderColor: data.accountBorderColor }}
          >
            <div
              className="text-xs font-medium uppercase tracking-wide mb-0.5"
              style={{ color: data.accountLabelColor }}
            >
              {data.accountLabel}
            </div>
            <div className="text-sm font-semibold">{data.accountDescription}</div>
            <div className="text-xs text-zinc-400 mt-1">{data.accountMeta}</div>
          </div>

          {/* Connector line down from root */}
          <div className="w-px h-6 bg-border" />

          {/* Horizontal connector bar */}
          <div className="hidden md:block relative w-full max-w-[680px]">
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-border" />
          </div>

          {/* Profile cards — desktop: flex row, mobile: stacked list */}
          <div className="hidden md:flex items-start justify-center gap-3 mt-0">
            {data.profiles.map((profile) => (
              <div key={profile.name} className="flex flex-col items-center">
                {/* Vertical connector from horizontal bar */}
                <div className="w-px h-4 bg-border" />
                <ProfileCard profile={profile} />
              </div>
            ))}
          </div>

          {/* Mobile: indented list */}
          <div className="md:hidden space-y-2 w-full mt-2">
            {data.profiles.map((profile) => (
              <div key={profile.name} className="flex items-center gap-2 pl-4">
                <div className="w-px h-8 bg-border flex-shrink-0" />
                <ProfileCard profile={profile} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile settings table */}
      <div className="plaid-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Per-Profile Settings
          </h3>
        </div>
        <div className="divide-y divide-border">
          {data.settings.map((item) => (
            <div key={item.setting} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-foreground">{item.setting}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                item.configurable
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  item.configurable ? "bg-emerald-500" : "bg-muted-foreground"
                }`} />
                {item.configurable ? "Configurable" : "Not Available"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription tiers */}
      <div className="plaid-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Subscription Tiers
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-2.5 text-left font-medium text-foreground">Plan</th>
              <th className="px-4 py-2.5 text-left font-medium text-foreground">Streams</th>
              <th className="px-4 py-2.5 text-left font-medium text-foreground">Resolution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.subscriptionTiers.map((tier, idx) => (
              <tr key={tier.plan}>
                <td className={`px-4 py-2.5 text-foreground ${idx === data.subscriptionTiers.length - 1 ? "font-medium" : ""}`}>
                  {tier.plan}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{tier.streams}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{tier.resolution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ProfileCard({ profile }: { profile: ProfileNode }) {
  const isKids = profile.type === "kids"

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 min-w-[120px] text-center ${
        isKids
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-border bg-card"
      }`}
    >
      <div className="text-xs font-semibold text-foreground truncate">{profile.name}</div>
      <div
        className={`text-[10px] mt-0.5 ${
          isKids ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        }`}
      >
        {profile.maturity}
      </div>
      {isKids && (
        <span className="inline-block mt-1.5 text-[9px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          Kids
        </span>
      )}
      {profile.pinEnabled && (
        <Lock className="w-3 h-3 text-amber-500 mx-auto mt-1" />
      )}
    </div>
  )
}
