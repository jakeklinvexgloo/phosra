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
    title: "Auth",
    items: [
      { title: "Register", href: "/developers/api-reference/auth/post-auth-register", method: "POST" },
      { title: "Login", href: "/developers/api-reference/auth/post-auth-login", method: "POST" },
      { title: "Refresh Token", href: "/developers/api-reference/auth/post-auth-refresh", method: "POST" },
      { title: "Logout", href: "/developers/api-reference/auth/post-auth-logout", method: "POST" },
      { title: "Get Current User", href: "/developers/api-reference/auth/get-auth-me", method: "GET" },
    ],
  },
  {
    title: "Quick Setup",
    items: [
      { title: "Quick Setup", href: "/developers/api-reference/setup/post-setup-quick", method: "POST" },
    ],
  },
  {
    title: "Families",
    items: [
      { title: "List Families", href: "/developers/api-reference/families/get-families", method: "GET" },
      { title: "Create Family", href: "/developers/api-reference/families/post-families", method: "POST" },
      { title: "Update Family", href: "/developers/api-reference/families/put-families", method: "PUT" },
      { title: "Delete Family", href: "/developers/api-reference/families/delete-families", method: "DELETE" },
      { title: "List Members", href: "/developers/api-reference/families/get-families-members", method: "GET" },
      { title: "Add Member", href: "/developers/api-reference/families/post-families-members", method: "POST" },
      { title: "Remove Member", href: "/developers/api-reference/families/delete-families-members", method: "DELETE" },
    ],
  },
  {
    title: "Children",
    items: [
      { title: "List Children", href: "/developers/api-reference/children/get-families-children", method: "GET" },
      { title: "Create Child", href: "/developers/api-reference/children/post-families-children", method: "POST" },
      { title: "Get Child", href: "/developers/api-reference/children/get-children", method: "GET" },
      { title: "Update Child", href: "/developers/api-reference/children/put-children", method: "PUT" },
      { title: "Delete Child", href: "/developers/api-reference/children/delete-children", method: "DELETE" },
      { title: "Age Ratings", href: "/developers/api-reference/children/get-children-age-ratings", method: "GET" },
    ],
  },
  {
    title: "Policies",
    items: [
      { title: "List Policies", href: "/developers/api-reference/policies/get-children-policies", method: "GET" },
      { title: "Create Policy", href: "/developers/api-reference/policies/post-children-policies", method: "POST" },
      { title: "Get Policy", href: "/developers/api-reference/policies/get-policies", method: "GET" },
      { title: "Update Policy", href: "/developers/api-reference/policies/put-policies", method: "PUT" },
      { title: "Delete Policy", href: "/developers/api-reference/policies/delete-policies", method: "DELETE" },
      { title: "Activate", href: "/developers/api-reference/policies/post-policies-activate", method: "POST" },
      { title: "Pause", href: "/developers/api-reference/policies/post-policies-pause", method: "POST" },
      { title: "Generate from Age", href: "/developers/api-reference/policies/post-policies-generate-from-age", method: "POST" },
    ],
  },
  {
    title: "Rules",
    items: [
      { title: "List Rules", href: "/developers/api-reference/rules/get-policies-rules", method: "GET" },
      { title: "Create Rule", href: "/developers/api-reference/rules/post-policies-rules", method: "POST" },
      { title: "Bulk Upsert", href: "/developers/api-reference/rules/put-policies-rules-bulk", method: "PUT" },
      { title: "Update Rule", href: "/developers/api-reference/rules/put-rules", method: "PUT" },
      { title: "Delete Rule", href: "/developers/api-reference/rules/delete-rules", method: "DELETE" },
    ],
  },
  {
    title: "Enforcement",
    items: [
      { title: "Trigger", href: "/developers/api-reference/enforcement/post-children-enforce", method: "POST" },
      { title: "List Jobs", href: "/developers/api-reference/enforcement/get-children-enforcement-jobs", method: "GET" },
      { title: "Get Job", href: "/developers/api-reference/enforcement/get-enforcement-jobs", method: "GET" },
      { title: "Get Results", href: "/developers/api-reference/enforcement/get-enforcement-jobs-results", method: "GET" },
      { title: "Retry", href: "/developers/api-reference/enforcement/post-enforcement-jobs-retry", method: "POST" },
    ],
  },
  {
    title: "Platforms",
    items: [
      { title: "List Platforms", href: "/developers/api-reference/platforms/get-platforms", method: "GET" },
      { title: "By Category", href: "/developers/api-reference/platforms/get-platforms-by-category", method: "GET" },
      { title: "By Capability", href: "/developers/api-reference/platforms/get-platforms-by-capability", method: "GET" },
      { title: "OAuth Authorize", href: "/developers/api-reference/platforms/get-platforms-oauth-authorize", method: "GET" },
      { title: "OAuth Callback", href: "/developers/api-reference/platforms/get-platforms-oauth-callback", method: "GET" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { title: "List Links", href: "/developers/api-reference/compliance/get-families-compliance", method: "GET" },
      { title: "Connect Platform", href: "/developers/api-reference/compliance/post-compliance", method: "POST" },
      { title: "Disconnect", href: "/developers/api-reference/compliance/delete-compliance", method: "DELETE" },
      { title: "Verify", href: "/developers/api-reference/compliance/post-compliance-verify", method: "POST" },
      { title: "Enforce", href: "/developers/api-reference/compliance/post-compliance-enforce", method: "POST" },
    ],
  },
  {
    title: "Webhooks",
    items: [
      { title: "List Webhooks", href: "/developers/api-reference/webhooks/get-families-webhooks", method: "GET" },
      { title: "Create Webhook", href: "/developers/api-reference/webhooks/post-webhooks", method: "POST" },
      { title: "Get Webhook", href: "/developers/api-reference/webhooks/get-webhooks", method: "GET" },
      { title: "Update Webhook", href: "/developers/api-reference/webhooks/put-webhooks", method: "PUT" },
      { title: "Delete Webhook", href: "/developers/api-reference/webhooks/delete-webhooks", method: "DELETE" },
      { title: "Test Webhook", href: "/developers/api-reference/webhooks/post-webhooks-test", method: "POST" },
      { title: "Deliveries", href: "/developers/api-reference/webhooks/get-webhooks-deliveries", method: "GET" },
    ],
  },
  {
    title: "Standards",
    items: [
      { title: "List Standards", href: "/developers/api-reference/standards/get-standards", method: "GET" },
      { title: "For Child", href: "/developers/api-reference/standards/get-children-standards", method: "GET" },
      { title: "Adopt Standard", href: "/developers/api-reference/standards/post-children-standards", method: "POST" },
      { title: "Remove Standard", href: "/developers/api-reference/standards/delete-children-standards", method: "DELETE" },
    ],
  },
  {
    title: "Ratings",
    items: [
      { title: "Rating Systems", href: "/developers/api-reference/ratings/get-ratings-systems", method: "GET" },
      { title: "By Age", href: "/developers/api-reference/ratings/get-ratings-by-age", method: "GET" },
      { title: "Convert Rating", href: "/developers/api-reference/ratings/get-ratings-convert", method: "GET" },
    ],
  },
  {
    title: "Devices",
    items: [
      { title: "List Devices", href: "/developers/api-reference/devices/get-children-devices", method: "GET" },
      { title: "Register Device", href: "/developers/api-reference/devices/post-children-devices", method: "POST" },
      { title: "Update Device", href: "/developers/api-reference/devices/put-devices", method: "PUT" },
      { title: "Revoke Device", href: "/developers/api-reference/devices/delete-devices", method: "DELETE" },
      { title: "Get Policy", href: "/developers/api-reference/devices/get-device-policy", method: "GET" },
      { title: "Report Status", href: "/developers/api-reference/devices/post-device-report", method: "POST" },
      { title: "Acknowledge", href: "/developers/api-reference/devices/post-device-ack", method: "POST" },
    ],
  },
  {
    title: "Sources",
    items: [
      { title: "Available Adapters", href: "/developers/api-reference/sources/get-sources-available", method: "GET" },
      { title: "Connect Source", href: "/developers/api-reference/sources/post-sources", method: "POST" },
      { title: "Get Source", href: "/developers/api-reference/sources/get-sources", method: "GET" },
      { title: "Disconnect", href: "/developers/api-reference/sources/delete-sources", method: "DELETE" },
      { title: "Sync Source", href: "/developers/api-reference/sources/post-sources-sync", method: "POST" },
      { title: "Push Rule", href: "/developers/api-reference/sources/post-sources-rules", method: "POST" },
      { title: "Guided Steps", href: "/developers/api-reference/sources/get-sources-guide", method: "GET" },
    ],
  },
]
