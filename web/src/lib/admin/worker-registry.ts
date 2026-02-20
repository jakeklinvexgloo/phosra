import type { WorkerDef } from "./types"

/**
 * Static registry of all automated workers.
 * Worker scripts live in scripts/workers/ and are triggered via GitHub Actions or manual API call.
 */
export const workerRegistry: WorkerDef[] = [
  {
    id: "legislation-monitor",
    name: "Legislation Monitor",
    description: "Scans global child safety legislation for updates, status changes, and new laws",
    script: "scripts/legislation-scanner.mjs",
    cron: "Weekly (Mon 8am UTC)",
    enabled: true,
  },
  {
    id: "outreach-tracker",
    name: "Outreach Tracker",
    description: "Identifies contacts needing follow-up and generates outreach reminders",
    script: "scripts/workers/outreach-tracker.mjs",
    cron: "Daily (2pm UTC)",
    enabled: true,
  },
  {
    id: "news-monitor",
    name: "News Monitor",
    description: "Scans child safety and parental controls industry news from key sources",
    script: "scripts/workers/news-monitor.mjs",
    cron: "Daily (7am UTC)",
    enabled: false,
  },
  {
    id: "competitive-intel",
    name: "Competitive Intelligence",
    description: "Tracks competitor feature releases, pricing changes, and market positioning",
    script: "scripts/workers/competitive-intel.mjs",
    cron: "Weekly (Wed 8am UTC)",
    enabled: false,
  },
  {
    id: "compliance-alerter",
    name: "Compliance Alerter",
    description: "Monitors compliance deadlines and generates urgency alerts at 90/60/30/7 day thresholds",
    script: "scripts/workers/compliance-alerter.mjs",
    cron: "Weekly (Mon 9am UTC)",
    enabled: false,
  },
  {
    id: "provider-api-monitor",
    name: "Provider API Monitor",
    description: "Checks changelogs for live provider APIs (NextDNS, CleanBrowsing, Google, Microsoft, Apple)",
    script: "scripts/workers/provider-api-monitor.mjs",
    cron: "Weekly (Fri 8am UTC)",
    enabled: false,
  },
]

export function getWorker(id: string): WorkerDef | undefined {
  return workerRegistry.find((w) => w.id === id)
}
