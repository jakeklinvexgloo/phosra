export interface NavItem {
  title: string
  href: string
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
}

export interface NavGroup {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

export const DOCS_NAV: NavGroup[] = [
  {
    title: "Getting Started",
    defaultOpen: true,
    items: [
      { title: "Introduction", href: "/developers" },
      { title: "Authentication", href: "/developers/authentication" },
      { title: "Quickstart", href: "/developers/quickstart" },
      { title: "Errors", href: "/developers/errors" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Families", href: "/developers/concepts/families" },
      { title: "Children & Age", href: "/developers/concepts/children-and-age" },
      { title: "Policies & Rules", href: "/developers/concepts/policies-and-rules" },
      { title: "Enforcement", href: "/developers/concepts/enforcement" },
      { title: "Strictness Levels", href: "/developers/concepts/strictness-levels" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "First-Time Setup", href: "/developers/guides/first-time-setup" },
      { title: "Third-Party Integration", href: "/developers/guides/third-party-integration" },
      { title: "Webhook Events", href: "/developers/guides/webhook-events" },
      { title: "Device Sync", href: "/developers/guides/device-sync" },
      { title: "Mobile Integration", href: "/developers/guides/mobile-integration" },
    ],
  },
  {
    title: "SDKs",
    items: [
      { title: "Overview", href: "/developers/sdks/overview" },
      { title: "TypeScript", href: "/developers/sdks/typescript" },
      { title: "MCP Server", href: "/developers/sdks/mcp-server" },
      { title: "iOS", href: "/developers/sdks/ios" },
      { title: "Android", href: "/developers/sdks/android" },
    ],
  },
  {
    title: "API Reference",
    defaultOpen: true,
    items: [
      { title: "Overview", href: "/developers/api-reference/overview" },
    ],
  },
  {
    title: "Authentication",
    items: [
      { title: "Register", href: "/developers/api-reference/auth/register", method: "POST" },
      { title: "Login", href: "/developers/api-reference/auth/login", method: "POST" },
      { title: "Refresh Token", href: "/developers/api-reference/auth/refresh", method: "POST" },
      { title: "Logout", href: "/developers/api-reference/auth/logout", method: "POST" },
      { title: "Get Current User", href: "/developers/api-reference/auth/me", method: "GET" },
    ],
  },
  {
    title: "Families",
    items: [
      { title: "List Families", href: "/developers/api-reference/families/list", method: "GET" },
      { title: "Create Family", href: "/developers/api-reference/families/create", method: "POST" },
      { title: "Get Family", href: "/developers/api-reference/families/get", method: "GET" },
      { title: "Update Family", href: "/developers/api-reference/families/update", method: "PUT" },
      { title: "Delete Family", href: "/developers/api-reference/families/delete", method: "DELETE" },
    ],
  },
  {
    title: "Family Members",
    items: [
      { title: "List Members", href: "/developers/api-reference/members/list", method: "GET" },
      { title: "Add Member", href: "/developers/api-reference/members/add", method: "POST" },
      { title: "Remove Member", href: "/developers/api-reference/members/remove", method: "DELETE" },
    ],
  },
  {
    title: "Children",
    items: [
      { title: "List Children", href: "/developers/api-reference/children/list", method: "GET" },
      { title: "Create Child", href: "/developers/api-reference/children/create", method: "POST" },
      { title: "Get Child", href: "/developers/api-reference/children/get", method: "GET" },
      { title: "Update Child", href: "/developers/api-reference/children/update", method: "PUT" },
      { title: "Delete Child", href: "/developers/api-reference/children/delete", method: "DELETE" },
      { title: "Age Ratings", href: "/developers/api-reference/children/age-ratings", method: "GET" },
    ],
  },
  {
    title: "Policies",
    items: [
      { title: "List Policies", href: "/developers/api-reference/policies/list", method: "GET" },
      { title: "Create Policy", href: "/developers/api-reference/policies/create", method: "POST" },
      { title: "Get Policy", href: "/developers/api-reference/policies/get", method: "GET" },
      { title: "Update Policy", href: "/developers/api-reference/policies/update", method: "PUT" },
      { title: "Delete Policy", href: "/developers/api-reference/policies/delete", method: "DELETE" },
      { title: "Activate Policy", href: "/developers/api-reference/policies/activate", method: "POST" },
      { title: "Pause Policy", href: "/developers/api-reference/policies/pause", method: "POST" },
      { title: "Generate from Age", href: "/developers/api-reference/policies/generate-from-age", method: "POST" },
    ],
  },
  {
    title: "Rules",
    items: [
      { title: "List Rules", href: "/developers/api-reference/rules/list", method: "GET" },
      { title: "Create Rule", href: "/developers/api-reference/rules/create", method: "POST" },
      { title: "Update Rule", href: "/developers/api-reference/rules/update", method: "PUT" },
      { title: "Delete Rule", href: "/developers/api-reference/rules/delete", method: "DELETE" },
      { title: "Bulk Upsert", href: "/developers/api-reference/rules/bulk-upsert", method: "POST" },
    ],
  },
  {
    title: "Enforcement",
    items: [
      { title: "Trigger", href: "/developers/api-reference/enforcement/trigger", method: "POST" },
      { title: "Trigger Link", href: "/developers/api-reference/enforcement/trigger-link", method: "POST" },
      { title: "List Jobs", href: "/developers/api-reference/enforcement/list-jobs", method: "GET" },
      { title: "Get Job", href: "/developers/api-reference/enforcement/get-job", method: "GET" },
      { title: "Get Results", href: "/developers/api-reference/enforcement/get-results", method: "GET" },
      { title: "Retry", href: "/developers/api-reference/enforcement/retry", method: "POST" },
    ],
  },
  {
    title: "Platforms",
    items: [
      { title: "List Platforms", href: "/developers/api-reference/platforms/list", method: "GET" },
      { title: "Get Platform", href: "/developers/api-reference/platforms/get", method: "GET" },
      { title: "By Category", href: "/developers/api-reference/platforms/by-category", method: "GET" },
      { title: "By Capability", href: "/developers/api-reference/platforms/by-capability", method: "GET" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { title: "Create Record", href: "/developers/api-reference/compliance/create", method: "POST" },
      { title: "List Records", href: "/developers/api-reference/compliance/list", method: "GET" },
      { title: "Verify", href: "/developers/api-reference/compliance/verify", method: "POST" },
      { title: "Delete Record", href: "/developers/api-reference/compliance/delete", method: "DELETE" },
      { title: "Enforce", href: "/developers/api-reference/compliance/enforce", method: "POST" },
    ],
  },
  {
    title: "Webhooks",
    items: [
      { title: "Create Webhook", href: "/developers/api-reference/webhooks/create", method: "POST" },
      { title: "Get Webhook", href: "/developers/api-reference/webhooks/get", method: "GET" },
      { title: "Update Webhook", href: "/developers/api-reference/webhooks/update", method: "PUT" },
      { title: "Delete Webhook", href: "/developers/api-reference/webhooks/delete", method: "DELETE" },
      { title: "Test Webhook", href: "/developers/api-reference/webhooks/test", method: "POST" },
      { title: "Deliveries", href: "/developers/api-reference/webhooks/deliveries", method: "GET" },
    ],
  },
  {
    title: "Quick Setup",
    items: [
      { title: "Quick Setup", href: "/developers/api-reference/setup/quick", method: "POST" },
    ],
  },
  {
    title: "Ratings",
    items: [
      { title: "Rating Systems", href: "/developers/api-reference/ratings/systems", method: "GET" },
      { title: "By Age", href: "/developers/api-reference/ratings/by-age", method: "GET" },
    ],
  },
  {
    title: "Standards",
    items: [
      { title: "List Standards", href: "/developers/api-reference/standards/list", method: "GET" },
      { title: "Get Standard", href: "/developers/api-reference/standards/get", method: "GET" },
      { title: "For Child", href: "/developers/api-reference/standards/for-child", method: "GET" },
      { title: "Adopt Standard", href: "/developers/api-reference/standards/adopt", method: "POST" },
      { title: "Remove Standard", href: "/developers/api-reference/standards/remove", method: "DELETE" },
    ],
  },
  {
    title: "Devices",
    items: [
      { title: "Register Device", href: "/developers/api-reference/devices/register", method: "POST" },
      { title: "Get Device Policy", href: "/developers/api-reference/devices/get-policy", method: "GET" },
      { title: "Report Status", href: "/developers/api-reference/devices/report", method: "POST" },
      { title: "Acknowledge", href: "/developers/api-reference/devices/ack", method: "POST" },
    ],
  },
]
