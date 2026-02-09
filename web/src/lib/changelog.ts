export interface ChangelogEntry {
  date: string
  version: string
  title: string
  category: "feature" | "improvement" | "fix" | "breaking"
  description: string
  highlights?: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2025-02-05",
    version: "1.4.0",
    title: "Public Platform Explorer & Playground",
    category: "feature",
    description: "Platform coverage explorer and MCP playground are now publicly accessible without login. Browse all supported platforms, filter by capabilities, and try the playground sandbox before signing up.",
    highlights: [
      "Public /platforms page with full search, filter, and sort",
      "Public /playground with sandbox MCP tools",
      "New /pricing page with detailed tier comparison",
      "Public /changelog page (you're looking at it!)",
    ],
  },
  {
    date: "2025-01-28",
    version: "1.3.0",
    title: "Dark Mode & Command Palette",
    category: "feature",
    description: "Full dark mode support across the entire dashboard with system preference detection. Plus a new command palette (Cmd+K) for quick navigation.",
    highlights: [
      "Dark mode with light/dark/system toggle",
      "Command palette with fuzzy search (Cmd+K)",
      "Breadcrumb navigation in dashboard",
      "Environment badge (Live vs Sandbox)",
    ],
  },
  {
    date: "2025-01-21",
    version: "1.2.0",
    title: "Usage Analytics & Webhook Management",
    category: "feature",
    description: "New usage analytics chart on the dashboard home page showing API calls over time. Full webhook CRUD management with event selection and test delivery.",
    highlights: [
      "Interactive usage chart with 7d/30d toggle",
      "Webhook create, delete, pause/resume, and test",
      "API key management panel",
      "Enhanced settings page layout",
    ],
  },
  {
    date: "2025-01-14",
    version: "1.1.0",
    title: "MCP Playground & Inspector",
    category: "feature",
    description: "Interactive MCP playground with split-pane chat and tool inspector. Test all PCSS tools including policy creation, enforcement, and platform queries in a sandbox environment.",
    highlights: [
      "AI-powered chat with streaming responses",
      "Tool call inspector with input/output display",
      "Session management with reset capability",
      "Sandbox mode for safe experimentation",
    ],
  },
  {
    date: "2025-01-07",
    version: "1.0.2",
    title: "Improved Platform Coverage",
    category: "improvement",
    description: "Added support for 3 new platform adapters and improved capability detection across existing integrations.",
    highlights: [
      "New Android Family Link adapter",
      "Improved NextDNS capability mapping",
      "Better error handling for CleanBrowsing sync",
    ],
  },
  {
    date: "2024-12-20",
    version: "1.0.1",
    title: "Policy Engine Performance Fix",
    category: "fix",
    description: "Fixed a performance issue where policy evaluation was O(n\u00B2) when processing large category sets. Now uses indexed lookup for sub-millisecond evaluation.",
  },
  {
    date: "2024-12-15",
    version: "1.0.0",
    title: "Phosra v1.0 Launch",
    category: "feature",
    description: "Initial public release of Phosra (formerly GuardianGate). Universal parental controls API with support for 188+ platforms, 40 policy categories, and 5 age-rating systems.",
    highlights: [
      "REST API with full CRUD for families, children, policies",
      "40 policy categories across content, time, web, social, and purchase",
      "Age-to-rating mapping (MPAA, TV, ESRB, PEGI, CSM)",
      "Compliance verification for KOSA, COPPA, EU DSA",
      "Clerk authentication integration",
      "Plaid-inspired dashboard design",
    ],
  },
  {
    date: "2024-12-10",
    version: "0.9.0",
    title: "Breaking: Rebrand from GuardianGate to Phosra",
    category: "breaking",
    description: "Full rebrand from GuardianGate to Phosra. GCSS renamed to PCSS (Phosra Child Safety Standard). All API endpoints remain the same.",
    highlights: [
      "New Phosra branding, logos, and color palette",
      "GCSS \u2192 PCSS terminology throughout",
      "Updated database schema (migration 010)",
      "No breaking API changes",
    ],
  },
]

export const CATEGORY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  feature: { label: "Feature", bg: "bg-brand-green/10", text: "text-brand-green" },
  improvement: { label: "Improvement", bg: "bg-accent-teal/10", text: "text-accent-teal" },
  fix: { label: "Fix", bg: "bg-accent-purple/10", text: "text-accent-purple" },
  breaking: { label: "Breaking", bg: "bg-destructive/10", text: "text-destructive" },
}
