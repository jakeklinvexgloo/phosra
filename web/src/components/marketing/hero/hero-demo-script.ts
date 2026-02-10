/**
 * Static data for the hero chat + terminal demo animation.
 * Each step drives both the chat pane and terminal pane in sync.
 * Total loop: ~13 seconds.
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
  /** How long this step takes (ms) */
  duration: number
}

export const DEMO_SCRIPT: DemoStep[] = [
  // User types their request
  {
    type: "user",
    text: "Chap is 10. Set up Netflix parental controls.",
    duration: 1800,
  },
  // Thinking indicator
  { type: "thinking", duration: 600 },

  // Tool 1: quick_setup
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
    duration: 800,
  },
  {
    type: "log-success",
    method: "POST",
    path: "/v1/setup/quick",
    latency: "142ms",
    duration: 200,
  },
  { type: "tool-complete", toolName: "quick_setup", duration: 200 },

  // Tool 2: trigger_enforcement
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
    duration: 800,
  },
  {
    type: "log-success",
    method: "POST",
    path: "/v1/enforcement/trigger",
    latency: "87ms",
    duration: 200,
  },
  { type: "tool-complete", toolName: "trigger_enforcement", duration: 200 },

  // AI streams the response
  {
    type: "assistant",
    text: "Done! Chap can watch G and PG on Netflix. PG-13, R, and NC-17 are blocked. Screen time: 2 hrs/day.",
    duration: 3000,
  },

  // Terminal: platform results appear line by line
  {
    type: "log-result",
    resultText: "\u2192 Netflix: 6 rules applied",
    duration: 500,
  },
  {
    type: "log-result",
    resultText: "\u2192 Fire Tablet: 8 rules applied",
    duration: 500,
  },
  {
    type: "log-result",
    resultText: "\u2192 NextDNS: 5 rules applied",
    duration: 500,
  },

  // Enforcement result card in chat
  { type: "result", duration: 1500 },

  // Hold the completed state
  { type: "pause", duration: 3000 },

  // Fade out before loop
  { type: "fade", duration: 800 },
]
