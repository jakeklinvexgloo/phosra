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
  { name: "category", type: "string", description: "One of 26 rule categories (e.g. web_filtering, screen_time)" },
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
      "Automatically generate a full set of policy rules based on the child's current age. Uses the built-in age-to-setting mapping across all 26 rule categories. Existing rules on the policy are replaced.",
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
    description: "List all rules in a policy. Rules are returned in category order across all 26 supported categories.",
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
      "Add a rule to a policy. The category must be one of the 26 supported categories. Config schema varies per category (see Category Reference).",
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
]

// ── Helper: group endpoints by section ─────────────────────────────────────

export const ENDPOINT_SECTIONS = [
  "Auth",
  "Families",
  "Children",
  "Policies",
  "Policy Rules",
  "Providers",
  "Connections",
  "Sync",
  "Ratings",
] as const

export type EndpointSection = (typeof ENDPOINT_SECTIONS)[number]

export function getEndpointsBySection(section: EndpointSection): EndpointDef[] {
  return ENDPOINTS.filter((e) => e.section === section)
}
