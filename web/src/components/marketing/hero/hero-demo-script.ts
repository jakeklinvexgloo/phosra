/**
 * Static data for the hero chat + terminal demo animation.
 * Multiple scenarios rotate to show Phosra's flexibility.
 *
 * Scenario 1: Netflix parental controls (single turn)
 *   → follow-up: "Now do the same for YouTube and Roblox"
 * Scenario 2: Four Norms school-hours device blocking
 * Scenario 3: COPPA 2.0 privacy & ad protections
 */

export type StepType =
  | "user"
  | "thinking"
  | "tool-start"
  | "tool-complete"
  | "log-pending"
  | "log-success"
  | "log-result"
  | "assistant"
  | "result"
  | "pause"
  | "fade"

export interface DemoStep {
  type: StepType
  /** Chat: message text for user/assistant */
  text?: string
  /** Chat: tool name for tool-start/tool-complete */
  toolName?: string
  /** Chat: human-readable label for tool pills */
  toolLabel?: string
  /** Terminal: HTTP method */
  method?: string
  /** Terminal: API path */
  path?: string
  /** Terminal: latency string */
  latency?: string
  /** Terminal: result line text (for platform results) */
  resultText?: string
  /** Result card: display text for the enforcement summary */
  resultCardText?: string
  /** How long this step takes (ms) */
  duration: number
}

export interface DemoScenario {
  /** Unique key for React reconciliation */
  id: string
  /** The sequence of steps to play */
  steps: DemoStep[]
}

/* ── Scenario 1: Netflix setup + follow-up for YouTube & Roblox ─── */

const SCENARIO_NETFLIX: DemoScenario = {
  id: "netflix",
  steps: [
    // Turn 1: Netflix parental controls
    {
      type: "user",
      text: "Chap is 10. Set up Netflix parental controls.",
      duration: 1600,
    },
    { type: "thinking", duration: 500 },
    {
      type: "tool-start",
      toolName: "quick_setup",
      toolLabel: "Creating policy...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/setup/quick",
      duration: 700,
    },
    {
      type: "log-success",
      path: "/v1/setup/quick",
      latency: "142ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "quick_setup", duration: 150 },
    {
      type: "tool-start",
      toolName: "trigger_enforcement",
      toolLabel: "Pushing to Netflix...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/enforcement/trigger",
      duration: 700,
    },
    {
      type: "log-success",
      path: "/v1/enforcement/trigger",
      latency: "87ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "trigger_enforcement", duration: 150 },
    {
      type: "assistant",
      text: "Done! Chap can watch G and PG on Netflix. PG-13, R, and NC-17 are blocked.",
      duration: 2400,
    },
    { type: "log-result", resultText: "\u2192 Netflix: 6 rules applied", duration: 400 },
    { type: "log-result", resultText: "\u2192 Fire Tablet: 8 rules applied", duration: 400 },
    { type: "log-result", resultText: "\u2192 NextDNS: 5 rules applied", duration: 400 },
    {
      type: "result",
      resultCardText: "Netflix \u2014 6 rules applied",
      duration: 2000,
    },

    // Turn 2: Follow-up in same conversation
    {
      type: "user",
      text: "Now do the same for YouTube and Roblox.",
      duration: 1400,
    },
    { type: "thinking", duration: 400 },
    {
      type: "tool-start",
      toolName: "bulk_upsert_rules",
      toolLabel: "Extending policy...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/rules/bulk",
      duration: 600,
    },
    {
      type: "log-success",
      path: "/v1/rules/bulk",
      latency: "98ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "bulk_upsert_rules", duration: 150 },
    {
      type: "tool-start",
      toolName: "trigger_enforcement",
      toolLabel: "Pushing to platforms...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/enforcement/trigger",
      duration: 600,
    },
    {
      type: "log-success",
      path: "/v1/enforcement/trigger",
      latency: "64ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "trigger_enforcement", duration: 150 },
    {
      type: "assistant",
      text: "Done! YouTube is set to restricted mode with supervised content. Roblox chat is contacts-only, and E10+ experiences are blocked.",
      duration: 2800,
    },
    { type: "log-result", resultText: "\u2192 YouTube: 4 rules applied", duration: 350 },
    { type: "log-result", resultText: "\u2192 Roblox: 5 rules applied", duration: 350 },
    {
      type: "result",
      resultCardText: "3 platforms \u2014 15 rules total",
      duration: 2500,
    },

    // Hold + fade
    { type: "pause", duration: 2500 },
    { type: "fade", duration: 800 },
  ],
}

/* ── Scenario 2: Four Norms — school-hours blocking for 4 kids ──── */

const SCENARIO_FOUR_NORMS: DemoScenario = {
  id: "four-norms",
  steps: [
    {
      type: "user",
      text: "Follow the Four Norms standard. Block all devices for my 4 elementary schoolers during 8:30\u20133:00.",
      duration: 2200,
    },
    { type: "thinking", duration: 500 },
    {
      type: "tool-start",
      toolName: "list_children",
      toolLabel: "Finding kids...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "GET",
      path: "/v1/children",
      duration: 500,
    },
    {
      type: "log-success",
      path: "/v1/children",
      latency: "31ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "list_children", duration: 150 },
    {
      type: "tool-start",
      toolName: "bulk_upsert_rules",
      toolLabel: "Applying Four Norms...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/rules/bulk",
      duration: 700,
    },
    {
      type: "log-success",
      path: "/v1/rules/bulk",
      latency: "156ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "bulk_upsert_rules", duration: 150 },
    {
      type: "tool-start",
      toolName: "trigger_enforcement",
      toolLabel: "Enforcing on devices...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/enforcement/trigger",
      duration: 800,
    },
    {
      type: "log-success",
      path: "/v1/enforcement/trigger",
      latency: "203ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "trigger_enforcement", duration: 150 },
    {
      type: "assistant",
      text: "All set! Chap, Samson, Mona, and Ramsay are blocked 8:30 AM\u20133:00 PM on school days. No social media, 2hr daily limit, and strict content filtering per the Four Norms.",
      duration: 3200,
    },
    { type: "log-result", resultText: "\u2192 Chap: 6 rules \u00b7 Fire Tablet + Watch", duration: 350 },
    { type: "log-result", resultText: "\u2192 Samson: 6 rules \u00b7 Fire Tablet + Watch", duration: 350 },
    { type: "log-result", resultText: "\u2192 Mona: 6 rules \u00b7 Fire Tablet + Watch", duration: 350 },
    { type: "log-result", resultText: "\u2192 Ramsay: 5 rules \u00b7 Fire Tablet", duration: 350 },
    { type: "log-result", resultText: "\u2192 NextDNS: school-hours block active", duration: 350 },
    {
      type: "result",
      resultCardText: "Four Norms \u2014 4 kids, 23 rules enforced",
      duration: 2500,
    },

    { type: "pause", duration: 2500 },
    { type: "fade", duration: 800 },
  ],
}

/* ── Scenario 3: COPPA 2.0 — privacy & ad protections ──────────── */

const SCENARIO_COPPA: DemoScenario = {
  id: "coppa",
  steps: [
    {
      type: "user",
      text: "Make Coldy COPPA 2.0 compliant. He\u2019s 5. Block ads, delete his data, full privacy lockdown.",
      duration: 2000,
    },
    { type: "thinking", duration: 500 },
    {
      type: "tool-start",
      toolName: "quick_setup",
      toolLabel: "Creating policy...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/setup/quick",
      duration: 600,
    },
    {
      type: "log-success",
      path: "/v1/setup/quick",
      latency: "118ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "quick_setup", duration: 150 },
    {
      type: "tool-start",
      toolName: "bulk_upsert_rules",
      toolLabel: "COPPA 2.0 rules...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/rules/bulk",
      duration: 700,
    },
    {
      type: "log-success",
      path: "/v1/rules/bulk",
      latency: "134ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "bulk_upsert_rules", duration: 150 },
    {
      type: "tool-start",
      toolName: "data_deletion_request",
      toolLabel: "Eraser Button...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/data/deletion-request",
      duration: 800,
    },
    {
      type: "log-success",
      path: "/v1/data/deletion-request",
      latency: "287ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "data_deletion_request", duration: 150 },
    {
      type: "tool-start",
      toolName: "trigger_enforcement",
      toolLabel: "Enforcing privacy...",
      duration: 200,
    },
    {
      type: "log-pending",
      method: "POST",
      path: "/v1/enforcement/trigger",
      duration: 700,
    },
    {
      type: "log-success",
      path: "/v1/enforcement/trigger",
      latency: "178ms",
      duration: 150,
    },
    { type: "tool-complete", toolName: "trigger_enforcement", duration: 150 },
    {
      type: "assistant",
      text: "Coldy is fully COPPA 2.0 compliant. Targeted ads blocked, data deletion requests sent to 6 platforms, geolocation disabled, and parental consent gates active.",
      duration: 3000,
    },
    { type: "log-result", resultText: "\u2192 targeted_ad_block: 6 platforms", duration: 350 },
    { type: "log-result", resultText: "\u2192 data_deletion: 6 requests sent", duration: 350 },
    { type: "log-result", resultText: "\u2192 geolocation_opt_in: disabled", duration: 350 },
    { type: "log-result", resultText: "\u2192 parental_consent_gate: active", duration: 350 },
    { type: "log-result", resultText: "\u2192 commercial_data_ban: enforced", duration: 350 },
    {
      type: "result",
      resultCardText: "COPPA 2.0 \u2014 5 protections, 6 platforms",
      duration: 2500,
    },

    { type: "pause", duration: 2500 },
    { type: "fade", duration: 800 },
  ],
}

/* ── Export ordered scenario list ────────────────────────────────── */

export const DEMO_SCENARIOS: DemoScenario[] = [
  SCENARIO_FOUR_NORMS,
  SCENARIO_COPPA,
  SCENARIO_NETFLIX,
]
