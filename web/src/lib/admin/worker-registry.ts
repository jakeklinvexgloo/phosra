import type { WorkerDef } from "./types"

/**
 * Static registry of all automated workers.
 * Worker scripts live in scripts/workers/ and are triggered via admin API or GitHub Actions.
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
    description: "Scans child safety and parental controls industry news from RSS feeds",
    script: "scripts/workers/news-monitor.mjs",
    cron: "Daily (7am UTC)",
    enabled: true,
  },
  {
    id: "competitive-intel",
    name: "Competitive Intelligence",
    description: "Tracks competitor feature releases, pricing changes, and market positioning",
    script: "scripts/workers/competitive-intel.mjs",
    cron: "Weekly (Wed 8am UTC)",
    enabled: true,
  },
  {
    id: "compliance-alerter",
    name: "Compliance Alerter",
    description: "Monitors compliance deadlines and generates urgency alerts at 90/60/30/7 day thresholds",
    script: "scripts/workers/compliance-alerter.mjs",
    cron: "Weekly (Mon 9am UTC)",
    enabled: true,
  },
  {
    id: "provider-api-monitor",
    name: "Provider API Monitor",
    description: "Checks health and documentation status of live provider APIs (NextDNS, CleanBrowsing, etc.)",
    script: "scripts/workers/provider-api-monitor.mjs",
    cron: "Weekly (Fri 8am UTC)",
    enabled: true,
  },
  {
    id: "outreach-sequencer",
    name: "Outreach Sequencer",
    description: "Generates personalized cold emails and follow-ups for active outreach sequences",
    script: "scripts/workers/outreach-sequencer.mjs",
    cron: "Daily (2pm UTC)",
    enabled: true,
  },
  {
    id: "reply-scanner",
    name: "Reply Scanner",
    description: "Scans Gmail for replies to outreach emails and classifies intent",
    script: "scripts/workers/reply-scanner.mjs",
    cron: "Every 2 hours",
    enabled: true,
  },
  {
    id: "meeting-booker",
    name: "Meeting Booker",
    description: "Proposes meeting times for interested contacts and creates calendar events",
    script: "scripts/workers/meeting-booker.mjs",
    cron: "Daily (10am UTC)",
    enabled: true,
  },
  {
    id: "platform-researcher",
    name: "Platform Researcher",
    description: "Runs Playwright sessions to research parental controls across kids' apps and streaming providers",
    script: "scripts/platform-research/research-runner.mjs",
    cron: "Monthly (1st, 8am UTC)",
    enabled: true,
  },
]

export function getWorker(id: string): WorkerDef | undefined {
  return workerRegistry.find((w) => w.id === id)
}
