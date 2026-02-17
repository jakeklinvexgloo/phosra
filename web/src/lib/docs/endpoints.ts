import type { EndpointDef } from "@/components/docs/EndpointCard"
import type { FieldDef } from "@/components/docs/ParamTable"

// ── Shared response field definitions ──────────────────────────────────────

const userFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Unique user identifier" },
  { name: "email", type: "string", description: "User email address" },
  { name: "name", type: "string", description: "User display name" },
  { name: "created_at", type: "datetime", description: "Account creation timestamp" },
]

const tokenFields: FieldDef[] = [
  { name: "access_token", type: "string", description: "JWT access token (15 min TTL)" },
  { name: "refresh_token", type: "string", description: "Refresh token for obtaining new access tokens" },
  { name: "expires_at", type: "datetime", description: "Access token expiration timestamp" },
]

const familyFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Family identifier" },
  { name: "name", type: "string", description: "Family display name" },
  { name: "created_at", type: "datetime", description: "Family creation timestamp" },
]

const childFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Child identifier" },
  { name: "family_id", type: "uuid", description: "Parent family identifier" },
  { name: "name", type: "string", description: "Child display name" },
  { name: "birth_date", type: "date", description: "Date of birth (YYYY-MM-DD)" },
  { name: "avatar_url", type: "string", description: "Optional avatar URL" },
  { name: "created_at", type: "datetime", description: "Record creation timestamp" },
]

const policyFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Policy identifier" },
  { name: "child_id", type: "uuid", description: "Associated child identifier" },
  { name: "name", type: "string", description: "Policy display name" },
  { name: "status", type: "enum", description: "One of: active, paused, draft" },
  { name: "priority", type: "integer", description: "Evaluation priority (lower = higher precedence)" },
  { name: "created_at", type: "datetime", description: "Policy creation timestamp" },
]

const policyRuleFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Rule identifier" },
  { name: "policy_id", type: "uuid", description: "Parent policy identifier" },
  { name: "category", type: "string", description: "One of 45 rule categories (e.g. web_filtering, screen_time)" },
  { name: "enabled", type: "boolean", description: "Whether this rule is active" },
  { name: "config", type: "object", description: "Category-specific configuration (JSONB)" },
  { name: "created_at", type: "datetime", description: "Rule creation timestamp" },
]

const providerFields: FieldDef[] = [
  { name: "id", type: "string", description: "Provider slug (e.g. nextdns, cleanbrowing)" },
  { name: "name", type: "string", description: "Provider display name" },
  { name: "category", type: "enum", description: "One of: dns, streaming, gaming, device, browser" },
  { name: "tier", type: "enum", description: "Integration level: live, partial, or stub" },
  { name: "description", type: "string", description: "Human-readable provider description" },
  { name: "auth_type", type: "enum", description: "One of: api_key, oauth2, manual" },
  { name: "capabilities", type: "string[]", description: "Supported rule categories for this provider" },
]

const connectionFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Connection identifier" },
  { name: "family_id", type: "uuid", description: "Owning family identifier" },
  { name: "provider_id", type: "string", description: "Connected provider slug" },
  { name: "status", type: "enum", description: "One of: connected, disconnected, error" },
  { name: "last_sync_at", type: "datetime", description: "Last successful sync timestamp" },
  { name: "last_sync_status", type: "string", description: "Status of last sync attempt" },
  { name: "connected_at", type: "datetime", description: "Initial connection timestamp" },
]

const deviceRegistrationFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Device registration identifier" },
  { name: "child_id", type: "uuid", description: "Associated child identifier" },
  { name: "family_id", type: "uuid", description: "Parent family identifier" },
  { name: "platform_id", type: "string", description: "Platform slug (always 'apple')" },
  { name: "device_name", type: "string", description: "Human-readable device name (e.g. 'Sofia\\'s iPad')" },
  { name: "device_model", type: "string", description: "Device model identifier (e.g. 'iPad Pro 11-inch')" },
  { name: "os_version", type: "string", description: "iOS version (e.g. '18.2')" },
  { name: "app_version", type: "string", description: "Phosra iOS app version (e.g. '1.0.0')" },
  { name: "apns_token", type: "string", description: "Apple Push Notification token (optional)" },
  { name: "capabilities", type: "string[]", description: "Apple frameworks the device supports (e.g. FamilyControls, ManagedSettings, DeviceActivity, WebContentFilter)" },
  { name: "enforcement_summary", type: "object", description: "Per-category enforcement results from the device's last enforcement_status report" },
  { name: "last_seen_at", type: "datetime", description: "Last time the device contacted the API" },
  { name: "last_policy_version", type: "integer", description: "Last policy version the device acknowledged" },
  { name: "status", type: "enum", description: "One of: active, inactive, revoked" },
  { name: "created_at", type: "datetime", description: "Registration timestamp" },
  { name: "updated_at", type: "datetime", description: "Last update timestamp" },
]

const compiledPolicyFields: FieldDef[] = [
  { name: "version", type: "integer", description: "Policy version (auto-increments on changes)" },
  { name: "child_id", type: "uuid", description: "Child this policy applies to" },
  { name: "child_age", type: "integer", description: "Child's current age in years" },
  { name: "age_group", type: "string", description: "Age group label (e.g. 'Child', 'Teen')" },
  { name: "policy_id", type: "uuid", description: "Source policy identifier" },
  { name: "status", type: "string", description: "Policy status (active)" },
  { name: "generated_at", type: "datetime", description: "When the compiled document was generated" },
  {
    name: "content_filter", type: "object", description: "Content restriction settings",
    children: [
      { name: "age_rating", type: "string", description: "Apple age rating (4+, 9+, 12+, 17+)" },
      { name: "max_ratings", type: "object", description: "Max rating per system (mpaa, tvpg, esrb, pegi, csm, apple)" },
      { name: "blocked_apps", type: "string[]", description: "Blocked app bundle IDs" },
      { name: "allowed_apps", type: "string[]", description: "Allowed app bundle IDs (if allowlist mode)" },
      { name: "allowlist_mode", type: "boolean", description: "If true, only allowed_apps are permitted" },
    ],
  },
  {
    name: "screen_time", type: "object", description: "Screen time limits",
    children: [
      { name: "daily_limit_minutes", type: "integer", description: "Daily screen time cap in minutes" },
      { name: "per_app_limits", type: "object[]", description: "Per-app time limits (bundle_id + daily_minutes)" },
      { name: "downtime_windows", type: "object[]", description: "Scheduled downtime (days_of_week, start_time, end_time)" },
      { name: "always_allowed_apps", type: "string[]", description: "Apps exempt from screen time (e.g. Phone, Maps)" },
      { name: "schedule", type: "object", description: "Weekday/weekend allowed hours" },
    ],
  },
  {
    name: "purchases", type: "object", description: "Purchase controls",
    children: [
      { name: "require_approval", type: "boolean", description: "Require parent approval for purchases" },
      { name: "block_iap", type: "boolean", description: "Block in-app purchases entirely" },
      { name: "spending_cap_usd", type: "number", description: "Monthly spending cap in USD" },
    ],
  },
  {
    name: "privacy", type: "object", description: "Privacy settings",
    children: [
      { name: "location_sharing_enabled", type: "boolean", description: "Share location with family" },
      { name: "profile_visibility", type: "string", description: "One of: private, friends_only, public" },
      { name: "account_creation_approval", type: "boolean", description: "Require approval for new accounts" },
      { name: "data_sharing_restricted", type: "boolean", description: "Restrict data sharing with third parties" },
    ],
  },
  {
    name: "social", type: "object", description: "Social interaction controls",
    children: [
      { name: "chat_mode", type: "string", description: "Chat restriction (e.g. contacts_only, disabled)" },
      { name: "dm_restriction", type: "string", description: "DM restriction level" },
      { name: "multiplayer_mode", type: "string", description: "Multiplayer restriction (e.g. friends_only)" },
    ],
  },
  {
    name: "notifications", type: "object", description: "Notification controls",
    children: [
      { name: "curfew_start", type: "string", description: "Notification curfew start (HH:MM)" },
      { name: "curfew_end", type: "string", description: "Notification curfew end (HH:MM)" },
      { name: "usage_timer_minutes", type: "integer", description: "Show usage reminder every N minutes" },
    ],
  },
  {
    name: "web_filter", type: "object", description: "Web filtering settings",
    children: [
      { name: "level", type: "string", description: "Filter level (e.g. strict, moderate, off)" },
      { name: "safe_search", type: "boolean", description: "Enforce SafeSearch on search engines" },
      { name: "blocked_domains", type: "string[]", description: "Custom blocked domains" },
      { name: "allowed_domains", type: "string[]", description: "Custom allowed domains" },
      { name: "blocked_categories", type: "string[]", description: "Blocked web categories (e.g. gambling, dating)" },
    ],
  },
]

const syncJobFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Sync job identifier" },
  { name: "child_id", type: "uuid", description: "Target child identifier" },
  { name: "policy_id", type: "uuid", description: "Policy being enforced" },
  { name: "trigger_type", type: "enum", description: "One of: manual, auto, webhook" },
  { name: "status", type: "enum", description: "One of: pending, running, completed, failed, partial" },
  { name: "started_at", type: "datetime", description: "Job start timestamp" },
  { name: "completed_at", type: "datetime", description: "Job completion timestamp" },
  { name: "created_at", type: "datetime", description: "Job creation timestamp" },
]

const syncJobResultFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Result record identifier" },
  { name: "sync_job_id", type: "uuid", description: "Parent sync job identifier" },
  { name: "provider_id", type: "string", description: "Provider this result is for" },
  { name: "status", type: "string", description: "Provider-level sync status" },
  { name: "rules_applied", type: "integer", description: "Number of rules successfully pushed" },
  { name: "rules_skipped", type: "integer", description: "Rules skipped (unsupported by provider)" },
  { name: "rules_failed", type: "integer", description: "Rules that failed to apply" },
  { name: "error_message", type: "string", description: "Error details if status is failed" },
  { name: "details", type: "object", description: "Provider-specific result metadata" },
]

const memberFields: FieldDef[] = [
  { name: "id", type: "uuid", description: "Member record identifier" },
  { name: "user_id", type: "uuid", description: "User account identifier" },
  { name: "family_id", type: "uuid", description: "Family identifier" },
  { name: "role", type: "enum", description: "One of: owner, parent, guardian" },
  { name: "email", type: "string", description: "Member email address" },
  { name: "name", type: "string", description: "Member display name" },
  { name: "joined_at", type: "datetime", description: "When the member joined the family" },
]

const standardFields: FieldDef[] = [
  { name: "id", type: "string", description: "Standard identifier" },
  { name: "slug", type: "string", description: "URL-friendly slug" },
  { name: "name", type: "string", description: "Standard display name" },
  { name: "description", type: "string", description: "Summary of the standard's purpose" },
  { name: "rules", type: "object[]", description: "Recommended rules with categories and values" },
  { name: "rules_count", type: "integer", description: "Number of rules in the standard" },
  { name: "category", type: "string", description: "Standard category (expert, pledge, organization)" },
]

const complianceLinkFields: FieldDef[] = [
  { name: "id", type: "string", description: "Compliance link identifier" },
  { name: "platform", type: "string", description: "Platform identifier" },
  { name: "child_id", type: "uuid", description: "Linked child identifier" },
  { name: "status", type: "enum", description: "One of: verified, auth_failed, manual, pending" },
  { name: "capabilities", type: "string[]", description: "Rule categories this platform can enforce" },
  { name: "verified_at", type: "datetime", description: "Last successful verification timestamp" },
  { name: "last_sync_at", type: "datetime", description: "Last enforcement sync timestamp" },
]

const webhookFields: FieldDef[] = [
  { name: "id", type: "string", description: "Webhook identifier" },
  { name: "family_id", type: "uuid", description: "Owning family identifier" },
  { name: "url", type: "string", description: "Delivery endpoint URL" },
  { name: "events", type: "string[]", description: "Subscribed event types" },
  { name: "status", type: "enum", description: "One of: active, paused, failed" },
  { name: "created_at", type: "datetime", description: "Webhook creation timestamp" },
]

const webhookRequestFields: FieldDef[] = [
  { name: "url", type: "string", required: true, description: "HTTPS endpoint URL for delivery" },
  { name: "events", type: "string[]", required: true, description: "Event types to subscribe to" },
  { name: "secret", type: "string", required: true, description: "HMAC-SHA256 signing secret" },
]

// ── Endpoint definitions ───────────────────────────────────────────────────

export const ENDPOINTS: EndpointDef[] = [
  // ─── Auth ────────────────────────────────────────────────────────────────
  {
    id: "post-auth-register",
    method: "POST",
    path: "/auth/register",
    section: "Auth",
    summary: "Register a new account",
    description:
      "Create a new user account. Returns the user object and a token pair (access + refresh). The access token expires in 15 minutes; use the refresh endpoint to obtain a new one.",
    requestFields: [
      { name: "email", type: "string", required: true, description: "Valid email address" },
      { name: "password", type: "string", required: true, description: "Minimum 8 characters" },
      { name: "name", type: "string", required: true, description: "Display name" },
    ],
    responseFields: [
      { name: "user", type: "object", description: "Created user", children: userFields },
      { name: "tokens", type: "object", description: "JWT token pair", children: tokenFields },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "parent@example.com",
    "password": "securepass123",
    "name": "Jane Parent"
  }'`,
    responseExample: JSON.stringify(
      {
        user: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "parent@example.com",
          name: "Jane Parent",
          created_at: "2025-01-15T10:30:00Z",
        },
        tokens: {
          access_token: "eyJhbGciOiJIUzI1NiIs...",
          refresh_token: "dGhpcyBpcyBhIHJlZnJl...",
          expires_at: "2025-01-15T10:45:00Z",
        },
      },
      null,
      2,
    ),
  },
  {
    id: "post-auth-login",
    method: "POST",
    path: "/auth/login",
    section: "Auth",
    summary: "Login",
    description:
      "Authenticate with email and password. Returns a user object and token pair. Previous refresh tokens remain valid until explicitly revoked via logout.",
    requestFields: [
      { name: "email", type: "string", required: true, description: "Registered email address" },
      { name: "password", type: "string", required: true, description: "Account password" },
    ],
    responseFields: [
      { name: "user", type: "object", description: "Authenticated user", children: userFields },
      { name: "tokens", type: "object", description: "JWT token pair", children: tokenFields },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "parent@example.com",
    "password": "securepass123"
  }'`,
    responseExample: JSON.stringify(
      {
        user: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "parent@example.com",
          name: "Jane Parent",
          created_at: "2025-01-15T10:30:00Z",
        },
        tokens: {
          access_token: "eyJhbGciOiJIUzI1NiIs...",
          refresh_token: "dGhpcyBpcyBhIHJlZnJl...",
          expires_at: "2025-01-15T10:45:00Z",
        },
      },
      null,
      2,
    ),
  },
  {
    id: "post-auth-refresh",
    method: "POST",
    path: "/auth/refresh",
    section: "Auth",
    summary: "Refresh access token",
    description:
      "Exchange a valid refresh token for a new token pair. The old refresh token is revoked (rotation). No Authorization header required.",
    requestFields: [
      {
        name: "refresh_token",
        type: "string",
        required: true,
        description: "Valid refresh token from login or previous refresh",
      },
    ],
    responseFields: tokenFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{
    "refresh_token": "dGhpcyBpcyBhIHJlZnJl..."
  }'`,
    responseExample: JSON.stringify(
      {
        access_token: "eyJhbGciOiJIUzI1NiIs...",
        refresh_token: "bmV3IHJlZnJlc2ggdG9r...",
        expires_at: "2025-01-15T11:00:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "post-auth-logout",
    method: "POST",
    path: "/auth/logout",
    section: "Auth",
    summary: "Logout",
    description:
      "Revoke all refresh tokens for the current user. The access token remains valid until its TTL expires (15 min). Requires a valid access token.",
    curlExample: `curl -X POST http://localhost:8080/api/v1/auth/logout \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 204 No Content",
  },
  {
    id: "get-auth-me",
    method: "GET",
    path: "/auth/me",
    section: "Auth",
    summary: "Get current user",
    description: "Return the authenticated user's profile. Requires a valid access token.",
    responseFields: userFields,
    curlExample: `curl http://localhost:8080/api/v1/auth/me \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "parent@example.com",
        name: "Jane Parent",
        created_at: "2025-01-15T10:30:00Z",
      },
      null,
      2,
    ),
  },

  // ─── Families ────────────────────────────────────────────────────────────
  {
    id: "get-families",
    method: "GET",
    path: "/families",
    section: "Families",
    summary: "List families",
    description: "Return all families the authenticated user belongs to, including families where the user is owner, parent, or guardian.",
    responseFields: [
      {
        name: "[]",
        type: "Family[]",
        description: "Array of family objects",
        children: familyFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/families \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          name: "Smith Family",
          created_at: "2025-01-10T08:00:00Z",
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "post-families",
    method: "POST",
    path: "/families",
    section: "Families",
    summary: "Create family",
    description:
      "Create a new family group. The authenticated user becomes the owner automatically. A user can belong to multiple families.",
    requestFields: [
      { name: "name", type: "string", required: true, description: "Family display name" },
    ],
    responseFields: familyFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/families \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Smith Family" }'`,
    responseExample: JSON.stringify(
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Smith Family",
        created_at: "2025-01-10T08:00:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "get-families-id",
    method: "GET",
    path: "/families/{familyID}",
    section: "Families",
    summary: "Get family",
    description: "Retrieve details of a specific family. Caller must be a member of the family.",
    responseFields: familyFields,
    curlExample: `curl http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Smith Family",
        created_at: "2025-01-10T08:00:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "put-families-id",
    method: "PUT",
    path: "/families/{familyID}",
    section: "Families",
    summary: "Update family",
    description: "Update family properties. Only the family owner can perform updates.",
    requestFields: [
      { name: "name", type: "string", description: "New family display name" },
    ],
    curlExample: `curl -X PUT http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Smith-Jones Family" }'`,
    responseExample: "// 200 OK",
  },
  {
    id: "delete-families-id",
    method: "DELETE",
    path: "/families/{familyID}",
    section: "Families",
    summary: "Delete family",
    description:
      "Permanently delete a family and all associated children, policies, and connections. Only the family owner can delete. This action cannot be undone.",
    curlExample: `curl -X DELETE http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 204 No Content",
  },

  // ─── Children ────────────────────────────────────────────────────────────
  {
    id: "get-family-children",
    method: "GET",
    path: "/families/{familyID}/children",
    section: "Children",
    summary: "List children",
    description: "List all children belonging to a family. Caller must be a family member.",
    responseFields: [
      {
        name: "[]",
        type: "Child[]",
        description: "Array of child objects",
        children: childFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890/children \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          name: "Alex",
          birth_date: "2015-06-20",
          avatar_url: null,
          created_at: "2025-01-10T08:15:00Z",
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "post-family-children",
    method: "POST",
    path: "/families/{familyID}/children",
    section: "Children",
    summary: "Add child",
    description:
      "Add a child to a family. The birth date is used for age-based policy generation and content rating calculations.",
    requestFields: [
      { name: "name", type: "string", required: true, description: "Child display name" },
      {
        name: "birth_date",
        type: "date",
        required: true,
        description: "Date of birth in YYYY-MM-DD format",
      },
    ],
    responseFields: childFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890/children \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Alex",
    "birth_date": "2015-06-20"
  }'`,
    responseExample: JSON.stringify(
      {
        id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Alex",
        birth_date: "2015-06-20",
        avatar_url: null,
        created_at: "2025-01-10T08:15:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "get-child",
    method: "GET",
    path: "/children/{childID}",
    section: "Children",
    summary: "Get child",
    description: "Retrieve details of a specific child. Caller must be a member of the child's family.",
    responseFields: childFields,
    curlExample: `curl http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Alex",
        birth_date: "2015-06-20",
        avatar_url: null,
        created_at: "2025-01-10T08:15:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "put-child",
    method: "PUT",
    path: "/children/{childID}",
    section: "Children",
    summary: "Update child",
    description: "Update a child's profile. Only family members with parent or owner role can update.",
    requestFields: [
      { name: "name", type: "string", description: "Updated display name" },
      { name: "birth_date", type: "date", description: "Updated date of birth" },
    ],
    curlExample: `curl -X PUT http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901 \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Alexander" }'`,
    responseExample: "// 200 OK",
  },
  {
    id: "delete-child",
    method: "DELETE",
    path: "/children/{childID}",
    section: "Children",
    summary: "Delete child",
    description:
      "Remove a child and all associated policies and sync history. Only the family owner can delete children.",
    curlExample: `curl -X DELETE http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 204 No Content",
  },
  {
    id: "get-child-age-ratings",
    method: "GET",
    path: "/children/{childID}/age-ratings",
    section: "Children",
    summary: "Get age ratings",
    description:
      "Return age-appropriate content ratings for a child across all supported rating systems (MPAA, TV Parental Guidelines, ESRB, PEGI, Common Sense Media). Calculated from the child's birth date.",
    responseFields: [
      { name: "age", type: "integer", description: "Child's current age in years" },
      {
        name: "ratings",
        type: "object",
        description: "Map of rating system ID to maximum allowed rating",
        children: [
          { name: "system_id", type: "string", description: "Rating system identifier" },
          { name: "code", type: "string", description: "Rating code (e.g. PG-13, T, PEGI 12)" },
          { name: "name", type: "string", description: "Full rating name" },
          { name: "min_age", type: "integer", description: "Minimum recommended age" },
        ],
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/age-ratings \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        age: 10,
        ratings: {
          mpaa: { code: "PG", name: "Parental Guidance Suggested", min_age: 8 },
          tv: { code: "TV-PG", name: "Parental Guidance Suggested", min_age: 8 },
          esrb: { code: "E10+", name: "Everyone 10+", min_age: 10 },
          pegi: { code: "PEGI 12", name: "PEGI 12", min_age: 12 },
          csm: { code: "10+", name: "Age 10+", min_age: 10 },
        },
      },
      null,
      2,
    ),
  },

  // ─── Policies ────────────────────────────────────────────────────────────
  {
    id: "get-child-policies",
    method: "GET",
    path: "/children/{childID}/policies",
    section: "Policies",
    summary: "List policies",
    description:
      "List all safety policies for a child, ordered by priority. Each child can have multiple policies (e.g. weekday vs weekend).",
    responseFields: [
      {
        name: "[]",
        type: "Policy[]",
        description: "Array of policy objects",
        children: policyFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/policies \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
          child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          name: "School Days",
          status: "active",
          priority: 1,
          created_at: "2025-01-10T09:00:00Z",
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "post-child-policies",
    method: "POST",
    path: "/children/{childID}/policies",
    section: "Policies",
    summary: "Create policy",
    description:
      "Create a new safety policy for a child. The policy starts in draft status. Add rules, then activate it to begin enforcement.",
    requestFields: [
      { name: "name", type: "string", required: true, description: "Policy display name (e.g. \"School Days\", \"Weekend\")" },
    ],
    responseFields: policyFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/policies \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "School Days" }'`,
    responseExample: JSON.stringify(
      {
        id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        name: "School Days",
        status: "draft",
        priority: 1,
        created_at: "2025-01-10T09:00:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "post-policy-activate",
    method: "POST",
    path: "/policies/{policyID}/activate",
    section: "Policies",
    summary: "Activate policy",
    description:
      "Transition a policy from draft or paused to active. An active policy's rules will be enforced on the next sync. Only one policy per child can be active at a time; activating one pauses others.",
    curlExample: `curl -X POST http://localhost:8080/api/v1/policies/c3d4e5f6-a7b8-9012-cdef-123456789012/activate \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 200 OK",
  },
  {
    id: "post-policy-pause",
    method: "POST",
    path: "/policies/{policyID}/pause",
    section: "Policies",
    summary: "Pause policy",
    description:
      "Pause an active policy. Rules remain configured but will not be enforced until reactivated. Pausing does not remove already-pushed rules from providers.",
    curlExample: `curl -X POST http://localhost:8080/api/v1/policies/c3d4e5f6-a7b8-9012-cdef-123456789012/pause \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 200 OK",
  },
  {
    id: "post-policy-generate-from-age",
    method: "POST",
    path: "/policies/{policyID}/generate-from-age",
    section: "Policies",
    summary: "Auto-generate rules from age",
    description:
      "Automatically generate a full set of policy rules based on the child's current age. Uses the built-in age-to-setting mapping across all 45 rule categories. Existing rules on the policy are replaced.",
    responseFields: [
      {
        name: "[]",
        type: "PolicyRule[]",
        description: "Generated rules",
        children: policyRuleFields,
      },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/policies/c3d4e5f6-a7b8-9012-cdef-123456789012/generate-from-age \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "d4e5f6a7-b8c9-0123-def0-123456789abc",
          policy_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
          category: "web_filtering",
          enabled: true,
          config: { block_categories: ["adult", "gambling", "violence"] },
          created_at: "2025-01-10T09:05:00Z",
        },
        {
          id: "e5f6a7b8-c9d0-1234-ef01-23456789abcd",
          policy_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
          category: "screen_time",
          enabled: true,
          config: { daily_limit_minutes: 120, bedtime: "21:00" },
          created_at: "2025-01-10T09:05:00Z",
        },
      ],
      null,
      2,
    ),
  },

  // ─── Policy Rules ────────────────────────────────────────────────────────
  {
    id: "get-policy-rules",
    method: "GET",
    path: "/policies/{policyID}/rules",
    section: "Policy Rules",
    summary: "List rules",
    description: "List all rules in a policy. Rules are returned in category order across all 45 supported categories.",
    responseFields: [
      {
        name: "[]",
        type: "PolicyRule[]",
        description: "Array of rule objects",
        children: policyRuleFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/policies/c3d4e5f6-a7b8-9012-cdef-123456789012/rules \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "d4e5f6a7-b8c9-0123-def0-123456789abc",
          policy_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
          category: "web_filtering",
          enabled: true,
          config: { block_categories: ["adult", "gambling", "violence"] },
          created_at: "2025-01-10T09:05:00Z",
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "post-policy-rules",
    method: "POST",
    path: "/policies/{policyID}/rules",
    section: "Policy Rules",
    summary: "Create rule",
    description:
      "Add a rule to a policy. The category must be one of the 45 supported categories. Config schema varies per category (see Category Reference).",
    requestFields: [
      {
        name: "category",
        type: "string",
        required: true,
        description: "Rule category (e.g. web_filtering, screen_time, app_restrictions)",
      },
      { name: "enabled", type: "boolean", description: "Whether the rule is active (default: true)" },
      {
        name: "config",
        type: "object",
        required: true,
        description: "Category-specific configuration object",
      },
    ],
    responseFields: policyRuleFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/policies/c3d4e5f6-a7b8-9012-cdef-123456789012/rules \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "screen_time",
    "enabled": true,
    "config": {
      "daily_limit_minutes": 120,
      "bedtime": "21:00",
      "wake_time": "07:00"
    }
  }'`,
    responseExample: JSON.stringify(
      {
        id: "f6a7b8c9-d0e1-2345-f012-3456789abcde",
        policy_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        category: "screen_time",
        enabled: true,
        config: {
          daily_limit_minutes: 120,
          bedtime: "21:00",
          wake_time: "07:00",
        },
        created_at: "2025-01-10T09:10:00Z",
      },
      null,
      2,
    ),
  },

  // ─── Policy Rules (continued) ───────────────────────────────────────────
  {
    id: "put-rule",
    method: "PUT",
    path: "/rules/{ruleID}",
    section: "Policy Rules",
    summary: "Update rule",
    description:
      "Update an existing policy rule's configuration or enabled status. The category cannot be changed — delete and recreate if a different category is needed.",
    requestFields: [
      { name: "enabled", type: "boolean", description: "Whether the rule is active" },
      { name: "config", type: "object", description: "Updated category-specific configuration" },
    ],
    responseFields: policyRuleFields,
    curlExample: `curl -X PUT http://localhost:8080/api/v1/rules/d4e5f6a7-b8c9-0123-def0-123456789abc \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "enabled": true,
    "config": { "daily_limit_minutes": 90, "bedtime": "20:00" }
  }'`,
    responseExample: JSON.stringify(
      {
        id: "d4e5f6a7-b8c9-0123-def0-123456789abc",
        policy_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        category: "time_daily_limit",
        enabled: true,
        config: { daily_limit_minutes: 90, bedtime: "20:00" },
        created_at: "2025-01-10T09:05:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "delete-rule",
    method: "DELETE",
    path: "/rules/{ruleID}",
    section: "Policy Rules",
    summary: "Delete rule",
    description:
      "Remove a rule from a policy. The rule is permanently deleted. To temporarily disable a rule, set enabled to false instead.",
    curlExample: `curl -X DELETE http://localhost:8080/api/v1/rules/d4e5f6a7-b8c9-0123-def0-123456789abc \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 204 No Content",
  },
  {
    id: "put-policy-rules-bulk",
    method: "PUT",
    path: "/policies/{policyID}/rules/bulk",
    section: "Policy Rules",
    summary: "Bulk upsert rules",
    description:
      "Create or update multiple rules in a single request. For each entry, if a rule with the given category already exists on the policy it is updated; otherwise a new rule is created. This is the recommended way to configure multiple categories at once.",
    requestFields: [
      {
        name: "rules",
        type: "object[]",
        required: true,
        description: "Array of rule objects with category, enabled, and config",
        children: [
          { name: "category", type: "string", required: true, description: "Rule category" },
          { name: "enabled", type: "boolean", description: "Whether the rule is active (default: true)" },
          { name: "config", type: "object", required: true, description: "Category-specific configuration" },
        ],
      },
    ],
    responseFields: [
      { name: "created", type: "integer", description: "Number of new rules created" },
      { name: "updated", type: "integer", description: "Number of existing rules updated" },
    ],
    curlExample: `curl -X PUT http://localhost:8080/api/v1/policies/c3d4e5f6-a7b8-9012-cdef-123456789012/rules/bulk \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "rules": [
      { "category": "web_filter_level", "config": { "level": "strict" } },
      { "category": "time_daily_limit", "config": { "daily_limit_minutes": 120 } },
      { "category": "content_rating", "config": { "max_mpaa": "PG", "max_esrb": "E" } }
    ]
  }'`,
    responseExample: JSON.stringify({ created: 1, updated: 2 }, null, 2),
  },

  // ─── Providers ───────────────────────────────────────────────────────────
  {
    id: "get-providers",
    method: "GET",
    path: "/providers",
    section: "Providers",
    summary: "List providers",
    description:
      "List all available providers with their integration tier, supported capabilities, and authentication method. This endpoint is public and does not require authentication.",
    responseFields: [
      {
        name: "[]",
        type: "Provider[]",
        description: "Array of provider objects",
        children: providerFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/providers`,
    responseExample: JSON.stringify(
      [
        {
          id: "nextdns",
          name: "NextDNS",
          category: "dns",
          tier: "live",
          description: "DNS-level web filtering and analytics",
          auth_type: "api_key",
          capabilities: [
            "web_filtering",
            "safe_search",
            "youtube_restricted",
            "block_bypass_methods",
          ],
        },
        {
          id: "cleanbrowing",
          name: "CleanBrowsing",
          category: "dns",
          tier: "live",
          description: "Family-friendly DNS filtering",
          auth_type: "api_key",
          capabilities: ["web_filtering", "safe_search"],
        },
      ],
      null,
      2,
    ),
  },

  {
    id: "get-provider",
    method: "GET",
    path: "/platforms/{platformID}",
    section: "Providers",
    summary: "Get provider details",
    description:
      "Get detailed information about a specific provider including capabilities, authentication method, and integration tier. This endpoint is public.",
    responseFields: providerFields,
    curlExample: `curl http://localhost:8080/api/v1/platforms/nextdns`,
    responseExample: JSON.stringify(
      {
        id: "nextdns",
        name: "NextDNS",
        category: "dns",
        tier: "live",
        description: "DNS-level web filtering and analytics",
        auth_type: "api_key",
        capabilities: ["web_filtering", "safe_search", "youtube_restricted", "block_bypass_methods"],
      },
      null,
      2,
    ),
  },
  {
    id: "get-platforms-by-category",
    method: "GET",
    path: "/platforms/by-category",
    section: "Providers",
    summary: "List by category",
    description:
      "Filter platforms by category (dns, streaming, gaming, device, browser). Useful for discovering which platforms serve a particular need. Query parameter: ?category=dns",
    requestFields: [
      { name: "category", type: "string", required: true, description: "Platform category filter (query parameter)" },
    ],
    curlExample: `curl "http://localhost:8080/api/v1/platforms/by-category?category=dns"`,
    responseExample: JSON.stringify(
      [
        { id: "nextdns", name: "NextDNS", tier: "live" },
        { id: "cleanbrowsing", name: "CleanBrowsing", tier: "live" },
      ],
      null,
      2,
    ),
  },
  {
    id: "get-platforms-by-capability",
    method: "GET",
    path: "/platforms/by-capability",
    section: "Providers",
    summary: "List by capability",
    description:
      "Filter platforms by supported rule category. Returns all platforms that can enforce a specific rule type. Query parameter: ?capability=web_filter_level",
    requestFields: [
      { name: "capability", type: "string", required: true, description: "Rule category to filter by (query parameter)" },
    ],
    curlExample: `curl "http://localhost:8080/api/v1/platforms/by-capability?capability=web_filter_level"`,
    responseExample: JSON.stringify(
      [
        { id: "nextdns", name: "NextDNS", tier: "live", support: "full" },
        { id: "cleanbrowsing", name: "CleanBrowsing", tier: "live", support: "partial" },
      ],
      null,
      2,
    ),
  },

  // ─── Connections ─────────────────────────────────────────────────────────
  {
    id: "post-connections",
    method: "POST",
    path: "/connections",
    section: "Connections",
    summary: "Connect to provider",
    description:
      "Establish a connection between a family and a provider. Credentials are encrypted with AES-256-GCM before storage. The connection is verified immediately upon creation.",
    requestFields: [
      { name: "family_id", type: "uuid", required: true, description: "Family to connect the provider to" },
      {
        name: "provider_id",
        type: "string",
        required: true,
        description: "Provider slug (e.g. nextdns, android)",
      },
      {
        name: "credentials",
        type: "string",
        required: true,
        description: "Provider-specific credentials (API key, OAuth token, etc.)",
      },
    ],
    responseFields: connectionFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/connections \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "family_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "provider_id": "nextdns",
    "credentials": "your-nextdns-api-key"
  }'`,
    responseExample: JSON.stringify(
      {
        id: "e5f6a7b8-c9d0-1234-ef01-23456789abcd",
        family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        provider_id: "nextdns",
        status: "connected",
        last_sync_at: null,
        last_sync_status: null,
        connected_at: "2025-01-10T10:00:00Z",
      },
      null,
      2,
    ),
  },

  // ─── Sync ────────────────────────────────────────────────────────────────
  {
    id: "post-child-sync",
    method: "POST",
    path: "/children/{childID}/sync",
    section: "Sync",
    summary: "Trigger sync",
    description:
      "Trigger enforcement sync for a child across all connected providers. Pushes the active policy's rules to each provider. Returns a sync job that can be polled for status.",
    responseFields: syncJobFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/sync \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        id: "f6a7b8c9-d0e1-2345-f012-3456789abcde",
        child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        policy_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        trigger_type: "manual",
        status: "pending",
        started_at: null,
        completed_at: null,
        created_at: "2025-01-10T10:30:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "get-sync-job",
    method: "GET",
    path: "/sync/jobs/{jobID}",
    section: "Sync",
    summary: "Get sync job status",
    description:
      "Check the status of a sync job. Poll this endpoint until status is completed, failed, or partial.",
    responseFields: syncJobFields,
    curlExample: `curl http://localhost:8080/api/v1/sync/jobs/f6a7b8c9-d0e1-2345-f012-3456789abcde \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        id: "f6a7b8c9-d0e1-2345-f012-3456789abcde",
        child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        policy_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        trigger_type: "manual",
        status: "completed",
        started_at: "2025-01-10T10:30:01Z",
        completed_at: "2025-01-10T10:30:05Z",
        created_at: "2025-01-10T10:30:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "get-sync-job-results",
    method: "GET",
    path: "/sync/jobs/{jobID}/results",
    section: "Sync",
    summary: "Get sync results",
    description:
      "Get per-provider results for a completed sync job. Each result shows how many rules were applied, skipped, or failed for that provider.",
    responseFields: [
      {
        name: "[]",
        type: "SyncJobResult[]",
        description: "Per-provider result breakdown",
        children: syncJobResultFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/sync/jobs/f6a7b8c9-d0e1-2345-f012-3456789abcde/results \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "a7b8c9d0-e1f2-3456-0123-456789abcdef",
          sync_job_id: "f6a7b8c9-d0e1-2345-f012-3456789abcde",
          provider_id: "nextdns",
          status: "completed",
          rules_applied: 8,
          rules_skipped: 2,
          rules_failed: 0,
          error_message: null,
          details: { profile_id: "abc123" },
        },
      ],
      null,
      2,
    ),
  },

  {
    id: "post-sync-job-retry",
    method: "POST",
    path: "/enforcement/jobs/{jobID}/retry",
    section: "Sync",
    summary: "Retry failed job",
    description:
      "Retry a failed or partial enforcement job. Only failed providers are retried — providers that previously succeeded are skipped. Requires the original job to be in failed or partial status.",
    curlExample: `curl -X POST http://localhost:8080/api/v1/enforcement/jobs/f6a7b8c9-d0e1-2345-f012-3456789abcde/retry \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        id: "a1b2c3d4-new-retry-job-id",
        parent_job_id: "f6a7b8c9-d0e1-2345-f012-3456789abcde",
        status: "pending",
        retry_count: 1,
        providers_retrying: ["nextdns"],
        created_at: "2025-01-10T10:35:00Z",
      },
      null,
      2,
    ),
  },

  // ─── Ratings ─────────────────────────────────────────────────────────────
  {
    id: "get-rating-systems",
    method: "GET",
    path: "/ratings/systems",
    section: "Ratings",
    summary: "List rating systems",
    description:
      "List all supported content rating systems (MPAA, TV Parental Guidelines, ESRB, PEGI, Common Sense Media). This endpoint is public.",
    responseFields: [
      {
        name: "[]",
        type: "RatingSystem[]",
        description: "Array of rating system objects",
        children: [
          { name: "id", type: "string", description: "System identifier (e.g. mpaa, esrb)" },
          { name: "name", type: "string", description: "Full system name" },
          { name: "country", type: "string", description: "Country/region of origin" },
          { name: "media_type", type: "string", description: "Media type: film, tv, game, or general" },
        ],
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/ratings/systems`,
    responseExample: JSON.stringify(
      [
        { id: "mpaa", name: "MPAA", country: "US", media_type: "film" },
        { id: "tv", name: "TV Parental Guidelines", country: "US", media_type: "tv" },
        { id: "esrb", name: "ESRB", country: "US/CA", media_type: "game" },
        { id: "pegi", name: "PEGI", country: "EU", media_type: "game" },
        { id: "csm", name: "Common Sense Media", country: "US", media_type: "general" },
      ],
      null,
      2,
    ),
  },
  {
    id: "get-ratings-by-age",
    method: "GET",
    path: "/ratings/by-age",
    section: "Ratings",
    summary: "Get ratings by age",
    description:
      "Look up the maximum appropriate content rating for a given age across all rating systems. This endpoint is public and useful for previewing age mappings without creating a child profile.",
    requestFields: [
      {
        name: "age",
        type: "integer",
        required: true,
        description: "Age in years (query parameter: ?age=10)",
      },
    ],
    responseFields: [
      { name: "age", type: "integer", description: "Queried age" },
      {
        name: "ratings",
        type: "object",
        description: "Map of rating system ID to maximum allowed rating",
      },
    ],
    curlExample: `curl "http://localhost:8080/api/v1/ratings/by-age?age=10"`,
    responseExample: JSON.stringify(
      {
        age: 10,
        ratings: {
          mpaa: { code: "PG", name: "Parental Guidance Suggested", min_age: 8 },
          tv: { code: "TV-PG", name: "Parental Guidance Suggested", min_age: 8 },
          esrb: { code: "E10+", name: "Everyone 10+", min_age: 10 },
          pegi: { code: "PEGI 12", name: "PEGI 12", min_age: 12 },
          csm: { code: "10+", name: "Age 10+", min_age: 10 },
        },
      },
      null,
      2,
    ),
  },
  // ─── Family Members ──────────────────────────────────────────────────────
  {
    id: "get-family-members",
    method: "GET",
    path: "/families/{familyID}/members",
    section: "Family Members",
    summary: "List family members",
    description:
      "List all members of a family with their roles and permissions. Roles include owner (full admin), parent (manage children and policies), and guardian (read-only access).",
    responseFields: [
      {
        name: "[]",
        type: "Member[]",
        description: "Array of family member objects",
        children: memberFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890/members \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "m1a2b3c4-d5e6-7890-abcd-ef1234567890",
          user_id: "550e8400-e29b-41d4-a716-446655440000",
          family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          role: "owner",
          email: "parent@example.com",
          name: "Jane Parent",
          joined_at: "2025-01-10T08:00:00Z",
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "post-family-members",
    method: "POST",
    path: "/families/{familyID}/members",
    section: "Family Members",
    summary: "Add member",
    description:
      "Invite a user to join a family. The invited user must have an existing Phosra account. Only the family owner can add new members. Supported roles: parent, guardian.",
    requestFields: [
      { name: "email", type: "string", required: true, description: "Email address of the user to invite" },
      { name: "role", type: "enum", required: true, description: "One of: parent, guardian" },
    ],
    responseFields: memberFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890/members \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "coparent@example.com",
    "role": "parent"
  }'`,
    responseExample: JSON.stringify(
      {
        id: "m2b3c4d5-e6f7-8901-bcde-f12345678901",
        user_id: "660e8400-e29b-41d4-a716-446655440001",
        family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        role: "parent",
        email: "coparent@example.com",
        name: "John Co-Parent",
        joined_at: "2025-01-12T14:30:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "delete-family-member",
    method: "DELETE",
    path: "/families/{familyID}/members/{memberID}",
    section: "Family Members",
    summary: "Remove member",
    description:
      "Remove a member from a family. Only the family owner can remove members. The owner cannot remove themselves — use Delete Family instead. Removed members immediately lose access to all family data.",
    curlExample: `curl -X DELETE http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890/members/m2b3c4d5-e6f7-8901-bcde-f12345678901 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 204 No Content",
  },

  // ─── Community Standards ────────────────────────────────────────────────
  {
    id: "get-standards",
    method: "GET",
    path: "/standards",
    section: "Community Standards",
    summary: "List community standards",
    description:
      "List all available community standards (movements). Each standard defines a set of recommended rules based on expert guidance — e.g. Wait Until 8th, Four Norms (Anxious Generation), Common Sense Media guidelines. This endpoint is public.",
    responseFields: [
      {
        name: "[]",
        type: "Standard[]",
        description: "Array of community standard objects",
        children: standardFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/standards`,
    responseExample: JSON.stringify(
      [
        {
          id: "four-norms",
          slug: "four-norms",
          name: "Four Norms (Anxious Generation)",
          description: "Jonathan Haidt's four foundational norms for childhood in the smartphone age.",
          rules_count: 6,
          category: "expert",
        },
        {
          id: "wait-until-8th",
          slug: "wait-until-8th",
          name: "Wait Until 8th",
          description: "The pledge to wait until at least 8th grade before giving children a smartphone.",
          rules_count: 4,
          category: "pledge",
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "get-standard",
    method: "GET",
    path: "/standards/{slug}",
    section: "Community Standards",
    summary: "Get standard details",
    description:
      "Get full details of a community standard including all recommended rules, age thresholds, and supporting research. This endpoint is public.",
    responseFields: standardFields,
    curlExample: `curl http://localhost:8080/api/v1/standards/four-norms`,
    responseExample: JSON.stringify(
      {
        id: "four-norms",
        slug: "four-norms",
        name: "Four Norms (Anxious Generation)",
        description: "Jonathan Haidt's four foundational norms for childhood in the smartphone age.",
        rules: [
          { category: "social_media_min_age", value: "16", label: "No social media before 16" },
          { category: "time_daily_limit", value: "120", label: "Phone-free schools" },
          { category: "time_bedtime", value: "enabled", label: "Device-free bedrooms" },
        ],
        rules_count: 6,
        category: "expert",
      },
      null,
      2,
    ),
  },
  {
    id: "get-child-standards",
    method: "GET",
    path: "/children/{childID}/standards",
    section: "Community Standards",
    summary: "List adopted standards",
    description:
      "List all community standards adopted for a specific child. Adopted standards automatically generate corresponding policy rules.",
    curlExample: `curl http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/standards \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          standard_id: "four-norms",
          name: "Four Norms (Anxious Generation)",
          adopted_at: "2025-01-15T10:00:00Z",
          rules_applied: 6,
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "post-child-standards",
    method: "POST",
    path: "/children/{childID}/standards",
    section: "Community Standards",
    summary: "Adopt standard",
    description:
      "Adopt a community standard for a child. This generates policy rules matching the standard's recommendations and adds them to the child's active policy. If rules for the same categories already exist, they are updated to match the standard.",
    requestFields: [
      { name: "standard_id", type: "string", required: true, description: "Slug of the community standard to adopt" },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/standards \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "standard_id": "four-norms" }'`,
    responseExample: JSON.stringify(
      {
        standard_id: "four-norms",
        name: "Four Norms (Anxious Generation)",
        adopted_at: "2025-01-15T10:00:00Z",
        rules_applied: 6,
        rules_created: 3,
        rules_updated: 3,
      },
      null,
      2,
    ),
  },
  {
    id: "delete-child-standard",
    method: "DELETE",
    path: "/children/{childID}/standards/{standardID}",
    section: "Community Standards",
    summary: "Unadopt standard",
    description:
      "Remove a community standard from a child. The associated policy rules are not automatically deleted — they remain as manually-configured rules. To remove the rules as well, delete them individually or regenerate the policy from age.",
    curlExample: `curl -X DELETE http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/standards/four-norms \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 204 No Content",
  },

  // ─── Compliance Links ──────────────────────────────────────────────────
  {
    id: "post-compliance",
    method: "POST",
    path: "/compliance",
    section: "Compliance Links",
    summary: "Verify compliance",
    description:
      "Create a compliance link between a child and a platform. Credentials are encrypted with AES-256-GCM before storage. The platform is contacted immediately to verify that the credentials are valid.",
    requestFields: [
      { name: "platform", type: "string", required: true, description: "Platform identifier (e.g. nextdns, android, apple_mdm)" },
      { name: "credentials", type: "object", required: true, description: "Platform-specific credential object" },
      { name: "child_id", type: "uuid", required: true, description: "Child to link the platform to" },
    ],
    responseFields: complianceLinkFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/compliance \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "platform": "nextdns",
    "credentials": { "api_key": "ndns_abc...", "profile_id": "abc123" },
    "child_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  }'`,
    responseExample: JSON.stringify(
      {
        id: "cl_abc123",
        platform: "nextdns",
        child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        status: "verified",
        capabilities: ["web_filter_level", "web_safesearch", "web_category_block"],
        verified_at: "2025-01-10T10:00:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "get-family-compliance",
    method: "GET",
    path: "/families/{familyID}/compliance",
    section: "Compliance Links",
    summary: "List compliance links",
    description:
      "List all compliance links (platform connections) across all children in a family. Shows verification status, capabilities, and last sync time for each link.",
    responseFields: [
      {
        name: "[]",
        type: "ComplianceLink[]",
        description: "Array of compliance link objects",
        children: complianceLinkFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890/compliance \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "cl_abc123",
          platform: "nextdns",
          child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          status: "verified",
          capabilities: ["web_filter_level", "web_safesearch"],
          verified_at: "2025-01-10T10:00:00Z",
          last_sync_at: "2025-01-12T18:00:00Z",
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "post-compliance-verify",
    method: "POST",
    path: "/compliance/{linkID}/verify",
    section: "Compliance Links",
    summary: "Re-verify link",
    description:
      "Re-verify a compliance link with new or existing credentials. Use this when platform credentials have been rotated or when a previous verification has expired. Credentials are re-encrypted on update.",
    requestFields: [
      { name: "credentials", type: "object", description: "Updated platform credentials (optional — re-verifies existing if omitted)" },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/compliance/cl_abc123/verify \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "credentials": { "api_key": "ndns_NEW_key...", "profile_id": "abc123" }
  }'`,
    responseExample: JSON.stringify(
      {
        id: "cl_abc123",
        platform: "nextdns",
        status: "verified",
        previous_status: "auth_failed",
        verified_at: "2025-01-15T09:15:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "delete-compliance",
    method: "DELETE",
    path: "/compliance/{linkID}",
    section: "Compliance Links",
    summary: "Revoke certification",
    description:
      "Permanently remove a compliance link. Encrypted credentials are deleted. Future enforcement will skip this platform. Active rules on the platform are not automatically removed — run enforcement with the platform disconnected to clear them.",
    curlExample: `curl -X DELETE http://localhost:8080/api/v1/compliance/cl_abc123 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 204 No Content",
  },
  {
    id: "post-compliance-enforce",
    method: "POST",
    path: "/compliance/{linkID}/enforce",
    section: "Compliance Links",
    summary: "Enforce on link",
    description:
      "Trigger enforcement on a single compliance link. Unlike child-wide enforcement which pushes to all linked platforms, this targets a specific platform connection. Useful for re-pushing rules after re-verification.",
    curlExample: `curl -X POST http://localhost:8080/api/v1/compliance/cl_abc123/enforce \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        job_id: "f6a7b8c9-d0e1-2345-f012-3456789abcde",
        platform: "nextdns",
        status: "pending",
        created_at: "2025-01-15T09:20:00Z",
      },
      null,
      2,
    ),
  },

  // ─── Webhooks ──────────────────────────────────────────────────────────
  {
    id: "post-webhooks",
    method: "POST",
    path: "/webhooks",
    section: "Webhooks",
    summary: "Create webhook",
    description:
      "Register a webhook endpoint to receive real-time notifications for enforcement, policy, and compliance events. All payloads are signed with HMAC-SHA256 using the provided secret.",
    requestFields: webhookRequestFields,
    responseFields: webhookFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/webhooks \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://api.example.com/webhooks/phosra",
    "events": ["enforcement.completed", "enforcement.failed", "policy.updated"],
    "secret": "whsec_your_secret_key"
  }'`,
    responseExample: JSON.stringify(
      {
        id: "wh_abc123",
        family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        url: "https://api.example.com/webhooks/phosra",
        events: ["enforcement.completed", "enforcement.failed", "policy.updated"],
        status: "active",
        created_at: "2025-01-10T10:00:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "get-webhook",
    method: "GET",
    path: "/webhooks/{webhookID}",
    section: "Webhooks",
    summary: "Get webhook",
    description: "Retrieve details of a specific webhook including its event subscriptions and delivery statistics.",
    responseFields: webhookFields,
    curlExample: `curl http://localhost:8080/api/v1/webhooks/wh_abc123 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        id: "wh_abc123",
        family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        url: "https://api.example.com/webhooks/phosra",
        events: ["enforcement.completed", "enforcement.failed", "policy.updated"],
        status: "active",
        created_at: "2025-01-10T10:00:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "put-webhook",
    method: "PUT",
    path: "/webhooks/{webhookID}",
    section: "Webhooks",
    summary: "Update webhook",
    description: "Update a webhook's URL, event subscriptions, or secret. Changes take effect immediately for the next delivery.",
    requestFields: webhookRequestFields,
    curlExample: `curl -X PUT http://localhost:8080/api/v1/webhooks/wh_abc123 \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "events": ["enforcement.completed", "enforcement.failed", "policy.updated", "compliance.verified"]
  }'`,
    responseExample: "// 200 OK",
  },
  {
    id: "delete-webhook",
    method: "DELETE",
    path: "/webhooks/{webhookID}",
    section: "Webhooks",
    summary: "Delete webhook",
    description: "Permanently delete a webhook. No further events will be delivered to this endpoint. Pending deliveries are cancelled.",
    curlExample: `curl -X DELETE http://localhost:8080/api/v1/webhooks/wh_abc123 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "// 204 No Content",
  },
  {
    id: "post-webhook-test",
    method: "POST",
    path: "/webhooks/{webhookID}/test",
    section: "Webhooks",
    summary: "Test webhook",
    description:
      "Send a test ping event to the webhook endpoint. Returns delivery status, response code, and latency. Use this to verify your endpoint is correctly configured and can handle HMAC signature verification.",
    curlExample: `curl -X POST http://localhost:8080/api/v1/webhooks/wh_abc123/test \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        delivery_id: "del_test01",
        event: "test.ping",
        status: "delivered",
        response_code: 200,
        response_time_ms: 145,
      },
      null,
      2,
    ),
  },
  {
    id: "get-webhook-deliveries",
    method: "GET",
    path: "/webhooks/{webhookID}/deliveries",
    section: "Webhooks",
    summary: "List deliveries",
    description:
      "List recent webhook deliveries with status, response codes, and timestamps. Failed deliveries are retried with exponential backoff (1min, 5min, 30min). Delivery history is retained for 30 days.",
    curlExample: `curl http://localhost:8080/api/v1/webhooks/wh_abc123/deliveries \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        { id: "del_001", event: "enforcement.completed", status: "delivered", response_code: 200, timestamp: "2025-01-12T18:05:00Z" },
        { id: "del_002", event: "policy.updated", status: "delivered", response_code: 200, timestamp: "2025-01-12T17:30:00Z" },
      ],
      null,
      2,
    ),
  },

  // ─── Quick Setup ───────────────────────────────────────────────────────
  {
    id: "post-setup-quick",
    method: "POST",
    path: "/setup/quick",
    section: "Quick Setup",
    summary: "One-call onboarding",
    description:
      "Single-call onboarding that creates a family (if needed), registers a child, generates all 45 age-appropriate policy rules, and activates the policy. This is the recommended entry point for parent-facing applications.",
    requestFields: [
      { name: "family_id", type: "uuid", description: "Existing family ID (optional — omit to create new family)" },
      { name: "family_name", type: "string", description: "Family name (used when creating new family)" },
      { name: "child_name", type: "string", required: true, description: "Child display name" },
      { name: "birth_date", type: "date", required: true, description: "Child date of birth (YYYY-MM-DD)" },
      { name: "strictness", type: "enum", description: "One of: recommended (default), strict, relaxed" },
    ],
    responseFields: [
      { name: "family", type: "object", description: "Created or existing family" },
      { name: "child", type: "object", description: "Created child profile with computed age" },
      { name: "policy", type: "object", description: "Active policy with rule count" },
      { name: "rules", type: "object[]", description: "Generated policy rules (~20-25 enabled)" },
      { name: "age_group", type: "string", description: "Computed age group (toddler, child, tween, teen)" },
      { name: "max_ratings", type: "object", description: "Age-appropriate content ratings across 5 systems" },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/setup/quick \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "child_name": "Emma",
    "birth_date": "2019-03-15",
    "strictness": "recommended"
  }'`,
    responseExample: JSON.stringify(
      {
        family: { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "My Family" },
        child: { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "Emma", birth_date: "2019-03-15", age: 6 },
        policy: { id: "c3d4e5f6-a7b8-9012-cdef-123456789012", status: "active", rules_count: 22 },
        age_group: "child",
        max_ratings: { mpaa: "PG", tv: "TV-Y7", esrb: "E", pegi: "7", csm: "6+" },
      },
      null,
      2,
    ),
  },

  // ─── Enforcement Jobs ──────────────────────────────────────────────────
  {
    id: "post-child-enforce",
    method: "POST",
    path: "/children/{childID}/enforce",
    section: "Enforcement",
    summary: "Trigger enforcement",
    description:
      "Push the child's active policy rules to all verified compliance links (platform connections). Creates an enforcement job that fans out to each connected platform concurrently. Returns the job for status polling.",
    responseFields: syncJobFields,
    curlExample: `curl -X POST http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/enforce \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        id: "f6a7b8c9-d0e1-2345-f012-3456789abcde",
        child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        trigger_type: "manual",
        status: "pending",
        created_at: "2025-01-10T10:30:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "get-child-enforcement-jobs",
    method: "GET",
    path: "/children/{childID}/enforcement/jobs",
    section: "Enforcement",
    summary: "List enforcement jobs",
    description:
      "List all enforcement jobs for a child, ordered by creation time (newest first). Useful for viewing enforcement history and identifying failures.",
    responseFields: [
      {
        name: "[]",
        type: "EnforcementJob[]",
        description: "Array of enforcement job objects",
        children: syncJobFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/enforcement/jobs \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "f6a7b8c9-d0e1-2345-f012-3456789abcde",
          child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          trigger_type: "manual",
          status: "completed",
          started_at: "2025-01-10T10:30:01Z",
          completed_at: "2025-01-10T10:30:05Z",
          created_at: "2025-01-10T10:30:00Z",
        },
      ],
      null,
      2,
    ),
  },

  // ─── Reports ───────────────────────────────────────────────────────────
  {
    id: "get-family-reports",
    method: "GET",
    path: "/families/{familyID}/reports/overview",
    section: "Reports",
    summary: "Family overview report",
    description:
      "Get a comprehensive overview report for a family including per-child enforcement status, compliance link health, recent activity, and rule coverage statistics.",
    curlExample: `curl http://localhost:8080/api/v1/families/a1b2c3d4-e5f6-7890-abcd-ef1234567890/reports/overview \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      {
        family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        children: [
          {
            id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
            name: "Emma",
            age: 6,
            active_policy: "School Days",
            rules_enabled: 22,
            platforms_connected: 2,
            last_enforcement: "2025-01-12T18:00:00Z",
            enforcement_status: "healthy",
          },
        ],
        compliance_summary: {
          total_links: 2,
          verified: 2,
          failed: 0,
        },
        enforcement_summary: {
          total_jobs_7d: 5,
          success_rate: 1.0,
          avg_rules_pushed: 26,
        },
      },
      null,
      2,
    ),
  },

  // ─── Feedback ──────────────────────────────────────────────────────────
  {
    id: "post-feedback",
    method: "POST",
    path: "/feedback",
    section: "Feedback",
    summary: "Submit feedback",
    description:
      "Submit product feedback or a feature request. This endpoint is public and does not require authentication, allowing anonymous feedback from site visitors.",
    requestFields: [
      { name: "type", type: "enum", required: true, description: "One of: bug, feature, general" },
      { name: "message", type: "string", required: true, description: "Feedback message (max 2000 characters)" },
      { name: "email", type: "string", description: "Optional contact email for follow-up" },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/feedback \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "feature",
    "message": "Would love to see Roku integration",
    "email": "user@example.com"
  }'`,
    responseExample: JSON.stringify(
      {
        id: "fb_abc123",
        type: "feature",
        message: "Would love to see Roku integration",
        status: "new",
        created_at: "2025-01-15T14:00:00Z",
      },
      null,
      2,
    ),
  },

  // ─── Apple Device Sync ──────────────────────────────────────────────────
  {
    id: "post-register-device",
    method: "POST",
    path: "/children/{childID}/devices",
    section: "Apple Device Sync",
    summary: "Register device",
    description:
      "Register an Apple device for on-device policy enforcement. Returns a one-time API key that the iOS app stores in Keychain. The API key is used for all subsequent device-auth requests (policy polling, reports, ack). The plaintext key is never stored server-side — only its SHA-256 hash.",
    requestFields: [
      { name: "device_name", type: "string", required: true, description: "Human-readable name (e.g. 'Sofia\\'s iPad')" },
      { name: "device_model", type: "string", required: true, description: "Device model (e.g. 'iPad Pro 11-inch')" },
      { name: "os_version", type: "string", required: true, description: "iOS version (e.g. '18.2')" },
      { name: "app_version", type: "string", required: true, description: "Phosra app version (e.g. '1.0.0')" },
      { name: "apns_token", type: "string", description: "Apple Push Notification token (optional)" },
      { name: "capabilities", type: "string[]", description: "Apple frameworks the device supports (e.g. ['FamilyControls', 'ManagedSettings', 'DeviceActivity'])" },
    ],
    responseFields: [
      { name: "device", type: "DeviceRegistration", description: "The registered device", children: deviceRegistrationFields },
      { name: "api_key", type: "string", description: "One-time device API key — store in Keychain immediately" },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/devices \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_name": "Sofia'\\''s iPad",
    "device_model": "iPad Pro 11-inch",
    "os_version": "18.2",
    "app_version": "1.0.0"
  }'`,
    responseExample: JSON.stringify(
      {
        device: {
          id: "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
          child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          platform_id: "apple",
          device_name: "Sofia's iPad",
          device_model: "iPad Pro 11-inch",
          os_version: "18.2",
          app_version: "1.0.0",
          apns_token: null,
          capabilities: ["FamilyControls", "ManagedSettings", "DeviceActivity"],
          enforcement_summary: {},
          last_seen_at: null,
          last_policy_version: 0,
          status: "active",
          created_at: "2026-02-17T10:00:00Z",
          updated_at: "2026-02-17T10:00:00Z",
        },
        api_key: "a3f8b2c1d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef",
      },
      null,
      2,
    ),
  },
  {
    id: "get-child-devices",
    method: "GET",
    path: "/children/{childID}/devices",
    section: "Apple Device Sync",
    summary: "List devices",
    description:
      "List all registered Apple devices for a child. Shows each device's status, last seen time, and which policy version it last acknowledged. Useful for the parent dashboard to monitor device health.",
    responseFields: [
      {
        name: "[]",
        type: "DeviceRegistration[]",
        description: "Registered devices for this child",
        children: deviceRegistrationFields,
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/children/b2c3d4e5-f6a7-8901-bcde-f12345678901/devices \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: JSON.stringify(
      [
        {
          id: "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
          child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          family_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          platform_id: "apple",
          device_name: "Sofia's iPad",
          device_model: "iPad Pro 11-inch",
          os_version: "18.2",
          app_version: "1.0.0",
          capabilities: ["FamilyControls", "ManagedSettings", "DeviceActivity"],
          enforcement_summary: {
            content_rating: { status: "enforced", framework: "ManagedSettings" },
            time_daily_limit: { status: "enforced", framework: "DeviceActivity" },
            web_safesearch: { status: "enforced", framework: "ManagedSettings" },
          },
          last_seen_at: "2026-02-17T14:30:00Z",
          last_policy_version: 3,
          status: "active",
          created_at: "2026-02-17T10:00:00Z",
          updated_at: "2026-02-17T14:30:00Z",
        },
      ],
      null,
      2,
    ),
  },
  {
    id: "put-update-device",
    method: "PUT",
    path: "/devices/{deviceID}",
    section: "Apple Device Sync",
    summary: "Update device",
    description:
      "Update device metadata such as APNs token, app version, or device name. All fields are optional — only provided fields are updated. Typically called when the iOS app updates or the APNs token rotates.",
    requestFields: [
      { name: "device_name", type: "string", description: "Updated device name" },
      { name: "apns_token", type: "string", description: "Updated Apple Push Notification token" },
      { name: "app_version", type: "string", description: "Updated app version after upgrade" },
      { name: "os_version", type: "string", description: "Updated iOS version after OS update" },
    ],
    responseFields: deviceRegistrationFields,
    curlExample: `curl -X PUT http://localhost:8080/api/v1/devices/d1e2f3a4-b5c6-7890-abcd-ef1234567890 \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "apns_token": "new_apns_token_abc123",
    "app_version": "1.1.0"
  }'`,
    responseExample: JSON.stringify(
      {
        id: "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
        child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        platform_id: "apple",
        device_name: "Sofia's iPad",
        device_model: "iPad Pro 11-inch",
        os_version: "18.2",
        app_version: "1.1.0",
        apns_token: "new_apns_token_abc123",
        last_policy_version: 3,
        status: "active",
        updated_at: "2026-02-17T15:00:00Z",
      },
      null,
      2,
    ),
  },
  {
    id: "delete-revoke-device",
    method: "DELETE",
    path: "/devices/{deviceID}",
    section: "Apple Device Sync",
    summary: "Revoke device",
    description:
      "Revoke a device's API key, preventing it from polling for policies or submitting reports. The device registration is kept for audit purposes but marked as 'revoked'. The iOS app will receive 401 on its next request.",
    curlExample: `curl -X DELETE http://localhost:8080/api/v1/devices/d1e2f3a4-b5c6-7890-abcd-ef1234567890 \\
  -H "Authorization: Bearer <access_token>"`,
    responseExample: "",
  },
  {
    id: "get-device-policy",
    method: "GET",
    path: "/device/policy",
    section: "Apple Device Sync",
    summary: "Get compiled policy",
    description:
      "Fetch the compiled policy document for the authenticated device's child. Returns a structured JSON document the iOS app interprets to configure FamilyControls, ManagedSettings, and DeviceActivity. Supports conditional polling: pass ?since_version=N to get a 304 Not Modified if the policy hasn't changed. Auth: X-Device-Key header (not Bearer JWT).",
    requestFields: [
      { name: "since_version", type: "integer", description: "Return 304 if current version is <= this value (query parameter)" },
    ],
    responseFields: compiledPolicyFields,
    curlExample: `curl http://localhost:8080/api/v1/device/policy?since_version=2 \\
  -H "X-Device-Key: <device_api_key>"`,
    responseExample: JSON.stringify(
      {
        version: 3,
        child_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        child_age: 7,
        age_group: "Child",
        policy_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        status: "active",
        generated_at: "2026-02-17T15:00:00Z",
        content_filter: {
          age_rating: "4+",
          max_ratings: { mpaa: "PG", tvpg: "TV-Y7", esrb: "E", pegi: "7", csm: "7+", apple: "4+" },
          blocked_apps: ["com.epic.fortnite"],
          allowed_apps: [],
          allowlist_mode: false,
        },
        screen_time: {
          daily_limit_minutes: 120,
          per_app_limits: [{ bundle_id: "com.google.youtube", daily_minutes: 30 }],
          downtime_windows: [{ days_of_week: ["mon", "tue", "wed", "thu", "fri"], start_time: "20:00", end_time: "07:00" }],
          always_allowed_apps: ["com.apple.mobilephone", "com.apple.MobileSMS", "com.apple.Maps"],
          schedule: { weekday: { start: "07:00", end: "20:00" }, weekend: { start: "08:00", end: "21:00" } },
        },
        purchases: {
          require_approval: true,
          block_iap: true,
          spending_cap_usd: 0,
        },
        privacy: {
          location_sharing_enabled: true,
          profile_visibility: "private",
          account_creation_approval: true,
          data_sharing_restricted: true,
        },
        social: {
          chat_mode: "contacts_only",
          dm_restriction: "disabled",
          multiplayer_mode: "friends_only",
        },
        notifications: {
          curfew_start: "20:00",
          curfew_end: "07:00",
          usage_timer_minutes: 30,
        },
        web_filter: {
          level: "strict",
          safe_search: true,
          blocked_domains: ["reddit.com", "4chan.org"],
          allowed_domains: [],
          blocked_categories: ["gambling", "dating", "adult"],
        },
      },
      null,
      2,
    ),
  },
  {
    id: "post-device-report",
    method: "POST",
    path: "/device/report",
    section: "Apple Device Sync",
    summary: "Submit activity report",
    description:
      "Submit an activity report from the iOS app. Reports are stored in device_reports and fanned out to the activity_logs table for unified analytics. Report types: screen_time (daily usage), app_usage (per-app breakdown), web_activity (browsing history), blocked_attempt (enforcement events), enforcement_status (per-category enforcement results — also updates the device's enforcement_summary for the parent dashboard). Auth: X-Device-Key header.",
    requestFields: [
      { name: "report_type", type: "string", required: true, description: "One of: screen_time, app_usage, web_activity, blocked_attempt, enforcement_status" },
      { name: "payload", type: "object", required: true, description: "Report data (varies by report_type). For enforcement_status: { policy_version, results: [{ category, status, framework, detail }] }" },
      { name: "reported_at", type: "datetime", required: true, description: "When the activity occurred on-device" },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/device/report \\
  -H "X-Device-Key: <device_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "report_type": "screen_time",
    "payload": {
      "total_minutes": 95,
      "by_category": { "games": 40, "education": 30, "social": 25 },
      "top_apps": [
        { "bundle_id": "com.mojang.minecraftpe", "minutes": 35 },
        { "bundle_id": "com.duolingo", "minutes": 30 }
      ]
    },
    "reported_at": "2026-02-17T20:00:00Z"
  }'`,
    responseExample: JSON.stringify(
      { status: "accepted" },
      null,
      2,
    ),
  },
  {
    id: "post-device-ack",
    method: "POST",
    path: "/device/ack",
    section: "Apple Device Sync",
    summary: "Acknowledge policy version",
    description:
      "Confirm that the iOS app has successfully applied a specific policy version. Updates the device's last_policy_version so the parent dashboard can verify enforcement is current. Auth: X-Device-Key header.",
    requestFields: [
      { name: "version", type: "integer", required: true, description: "The policy version that was successfully applied" },
    ],
    curlExample: `curl -X POST http://localhost:8080/api/v1/device/ack \\
  -H "X-Device-Key: <device_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{ "version": 3 }'`,
    responseExample: JSON.stringify(
      { acknowledged_version: 3 },
      null,
      2,
    ),
  },
  {
    id: "get-platform-mappings",
    method: "GET",
    path: "/platform-mappings/{platformID}",
    section: "Apple Device Sync",
    summary: "Get platform mappings",
    description:
      "Get platform-specific identifier mappings. Currently supports 'apple' — returns Apple age ratings, App Store category bundle IDs, system app bundle IDs, default always-allowed apps, and a category-to-framework mapping that tells the iOS app which Apple framework (ManagedSettings, DeviceActivity, FamilyControls) to use for each Phosra rule category. This endpoint is public and does not require authentication.",
    responseFields: [
      {
        name: "age_ratings", type: "object", description: "MPAA/TVPG rating to Apple age rating mapping",
      },
      {
        name: "app_categories", type: "object", description: "Category → bundle IDs and App Store categories",
        children: [
          { name: "{category}", type: "object", description: "Category mapping (e.g. social-media, gaming)" },
        ],
      },
      {
        name: "system_apps", type: "object", description: "System app name → bundle ID (e.g. phone → com.apple.mobilephone)",
      },
      {
        name: "always_allowed", type: "string[]", description: "Default always-allowed bundle IDs (Phone, Messages, etc.)",
      },
      {
        name: "category_frameworks", type: "object", description: "Phosra rule category → Apple framework mapping for on-device enforcement",
        children: [
          { name: "{category}", type: "object", description: "Framework mapping per rule category",
            children: [
              { name: "framework", type: "string", description: "Apple framework: ManagedSettings, DeviceActivity, FamilyControls, or none" },
              { name: "api_class", type: "string", description: "Specific API class (e.g. ManagedSettingsStore.webContent)" },
              { name: "min_os", type: "string", description: "Minimum iOS version required (e.g. 16.0)" },
              { name: "notes", type: "string", description: "Implementation hints for the iOS app" },
            ],
          },
        ],
      },
    ],
    curlExample: `curl http://localhost:8080/api/v1/platform-mappings/apple`,
    responseExample: JSON.stringify(
      {
        age_ratings: {
          G: "4+", PG: "9+", "PG-13": "12+", R: "17+", "NC-17": "17+",
          "TV-Y": "4+", "TV-Y7": "4+", "TV-PG": "9+", "TV-14": "12+", "TV-MA": "17+",
          E: "4+", "E10+": "9+", T: "12+", M: "17+", AO: "17+",
        },
        app_categories: {
          "social-media": {
            bundle_ids: ["com.burbn.instagram", "com.atebits.Tweetie2", "com.toyopagroup.picaboo"],
            app_store_category: "Social Networking",
          },
          gaming: {
            bundle_ids: ["com.supercell.laser", "com.epic.fortnite", "com.mojang.minecraftpe"],
            app_store_category: "Games",
          },
        },
        system_apps: {
          phone: "com.apple.mobilephone",
          messages: "com.apple.MobileSMS",
          facetime: "com.apple.facetime",
          maps: "com.apple.Maps",
          camera: "com.apple.camera",
        },
        always_allowed: [
          "com.apple.mobilephone",
          "com.apple.MobileSMS",
          "com.apple.facetime",
          "com.apple.Maps",
        ],
        category_frameworks: {
          content_rating: { framework: "ManagedSettings", api_class: "ManagedSettingsStore.application", min_os: "16.0" },
          time_daily_limit: { framework: "DeviceActivity", api_class: "DeviceActivitySchedule", min_os: "16.0" },
          web_safesearch: { framework: "ManagedSettings", api_class: "ManagedSettingsStore.webContent.autoFilter", min_os: "16.0" },
          purchase_block_iap: { framework: "ManagedSettings", api_class: "ManagedSettingsStore.appStore.denyInAppPurchases", min_os: "16.0" },
          social_contacts: { framework: "FamilyControls", api_class: "AuthorizationCenter", min_os: "16.0" },
          algo_feed_control: { framework: "none", api_class: "", min_os: "", notes: "Platform-level — no Apple API; enforce by blocking/limiting social apps" },
        },
      },
      null,
      2,
    ),
  },
]

// ── Helper: group endpoints by section ─────────────────────────────────────

export const ENDPOINT_SECTIONS = [
  "Auth",
  "Families",
  "Children",
  "Policies",
  "Policy Rules",
  "Family Members",
  "Community Standards",
  "Providers",
  "Connections",
  "Compliance Links",
  "Sync",
  "Enforcement",
  "Webhooks",
  "Quick Setup",
  "Ratings",
  "Reports",
  "Feedback",
  "Apple Device Sync",
] as const

export type EndpointSection = (typeof ENDPOINT_SECTIONS)[number]

export function getEndpointsBySection(section: EndpointSection): EndpointDef[] {
  return ENDPOINTS.filter((e) => e.section === section)
}
