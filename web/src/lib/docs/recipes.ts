import type { Recipe } from "./types"

export const RECIPES: Recipe[] = [
  {
    id: "first-time-setup",
    title: "First-Time Parent Setup",
    summary: "Maria protects her 7-year-old with standard protections across NextDNS and Android",
    icon: "\u{1F680}",
    tags: ["Quick Setup", "NextDNS", "Android"],
    scenario: "Maria just downloaded the Phosra app. Her daughter Sofia is 7 years old. Maria wants standard age-appropriate protection without manually configuring 35 categories. She has a NextDNS account for home WiFi filtering and an Android tablet for Sofia.",
    actors: ["Parent App", "Phosra API", "NextDNS", "Android"],
    flowDiagram: `Parent App          Phosra API        NextDNS        Android
    |                       |                   |              |
    |── POST /register ────>|                   |              |
    |<── 201 token ─────────|                   |              |
    |── POST /setup/quick ─>|                   |              |
    |   (Sofia, age 7)      |── generate rules ─|              |
    |<── 201 family+policy ─|                   |              |
    |── POST /compliance ──>|                   |              |
    |   (NextDNS creds)     |── verify ────────>|              |
    |<── 200 verified ──────|                   |              |
    |── POST /compliance ──>|                   |              |
    |   (Android creds)     |── verify ─────────|─────────────>|
    |<── 200 verified ──────|                   |              |
    |── POST /enforce ─────>|── push rules ────>|              |
    |                       |── push rules ─────|─────────────>|
    |<── 200 results ───────|                   |              |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/auth/register",
        description: "Maria creates her account",
        requestBody: `{
  "email": "maria@example.com",
  "password": "SecureP@ss123",
  "name": "Maria Garcia"
}`,
        responseBody: `{
  "user": { "id": "usr_abc123", "email": "maria@example.com" },
  "access_token": "eyJhbG...",
  "refresh_token": "rt_xyz..."
}`,
        whatHappens: "Account created with hashed password. JWT issued with 15-minute expiry. Refresh token (SHA-256 hashed) stored in database."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Quick Setup creates family, child, and age-appropriate policy in one call",
        requestBody: `{
  "child_name": "Sofia",
  "child_birth_date": "2019-03-15",
  "protection_level": "recommended"
}`,
        responseBody: `{
  "family": { "id": "fam_def456" },
  "child": { "id": "child_ghi789", "age": 7 },
  "policy": {
    "id": "pol_jkl012",
    "status": "active",
    "rules_count": 22,
    "content_ratings": { "mpaa": "PG", "tv": "TV-Y7", "esrb": "E", "pegi": "7" }
  }
}`,
        whatHappens: "API computes Sofia's age (7), generates 22 rules from the recommended template: PG content ratings, 2hr daily screen time, SafeSearch on, social media blocked, notifications curfewed 8PM-7AM."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Link and verify NextDNS account for home DNS filtering",
        requestBody: `{
  "platform": "nextdns",
  "credentials": { "api_key": "ndns_abc...", "profile_id": "abc123" },
  "child_id": "child_ghi789"
}`,
        responseBody: `{
  "id": "comp_mno345",
  "platform": "nextdns",
  "status": "verified",
  "capabilities": ["web_filter", "safe_search", "dns_block"]
}`,
        whatHappens: "API encrypts the NextDNS API key with AES-256-GCM, calls NextDNS API to verify credentials, and maps platform capabilities to policy rule categories."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Link and verify Android device for app and content controls",
        requestBody: `{
  "platform": "android",
  "credentials": { "device_token": "and_xyz..." },
  "child_id": "child_ghi789"
}`,
        responseBody: `{
  "id": "comp_pqr678",
  "platform": "android",
  "status": "verified",
  "capabilities": ["content_rating", "app_block", "screen_time", "safe_search"]
}`,
        whatHappens: "Android device token verified. Platform registered with broader capabilities than DNS \u2014 it can enforce content ratings, app restrictions, and screen time limits."
      },
      {
        number: 5,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push all policy rules to both verified platforms",
        requestBody: `{
  "policy_id": "pol_jkl012",
  "platforms": ["comp_mno345", "comp_pqr678"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 },
    { "platform": "android", "status": "success", "rules_pushed": 18 }
  ]
}`,
        whatHappens: "Each platform receives only the rules it can enforce. NextDNS gets 8 DNS-level rules (web filter, safe search, blocked domains). Android gets 18 rules including content ratings, screen time, and app restrictions."
      }
    ],
    keyTeachingPoint: "Quick Setup reduces 35 categories to a single API call. Each platform only receives the rules it can actually enforce \u2014 define once, push everywhere."
  },
  {
    id: "app-integration",
    title: "Third-Party App Integration",
    summary: "DevCo builds 'KidShield' using the Phosra API with webhooks",
    icon: "\u{1F50C}",
    tags: ["Integration", "Webhooks", "OAuth"],
    scenario: "DevCo is building 'KidShield', a parental control app. They need to register as an API consumer, discover available platforms, set up webhook notifications for enforcement events, and execute their first policy enforcement.",
    actors: ["KidShield App", "Phosra API", "Webhook Endpoint"],
    flowDiagram: `KidShield App       Phosra API       Webhook Endpoint
    |                       |                       |
    |── POST /register ────>|                       |
    |<── 201 token ─────────|                       |
    |── GET /platforms ────>|                       |
    |<── 200 platforms ─────|                       |
    |── POST /webhooks ────>|                       |
    |<── 201 webhook ───────|                       |
    |── POST /setup/quick ─>|                       |
    |<── 201 policy ────────|                       |
    |── POST /enforce ─────>|                       |
    |<── 200 results ───────|                       |
    |                       |── POST event ────────>|
    |                       |   (HMAC-signed)       |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/auth/register",
        description: "Register the KidShield service account",
        requestBody: `{
  "email": "api@kidshield.dev",
  "password": "K1dSh!eld_Api_2024",
  "name": "KidShield Service"
}`,
        responseBody: `{
  "user": { "id": "usr_ks001" },
  "access_token": "eyJhbG..."
}`,
        whatHappens: "Service account created. In production, this would use OAuth client credentials flow, but the API supports direct registration for development."
      },
      {
        number: 2,
        method: "GET",
        endpoint: "/api/v1/platforms",
        description: "Discover which platforms are available and their capabilities",
        responseBody: `{
  "platforms": [
    { "id": "nextdns", "name": "NextDNS", "capabilities": ["web_filter", "safe_search", "dns_block"], "status": "live" },
    { "id": "cleanbrowsing", "name": "CleanBrowsing", "capabilities": ["web_filter", "safe_search"], "status": "live" },
    { "id": "android", "name": "Android", "capabilities": ["content_rating", "app_block", "screen_time"], "status": "live" },
    { "id": "apple_mdm", "name": "Apple MDM", "capabilities": ["content_rating", "app_block"], "status": "manual" },
    { "id": "microsoft", "name": "Microsoft Family", "capabilities": ["content_rating", "screen_time"], "status": "partial" }
  ]
}`,
        whatHappens: "Returns all 5 supported platforms with their capabilities and live/manual/partial status. KidShield uses this to show users which platforms they can connect."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/webhooks",
        description: "Register a webhook to receive enforcement and policy events",
        requestBody: `{
  "url": "https://api.kidshield.dev/webhooks/phosra",
  "events": ["enforcement.completed", "enforcement.failed", "policy.updated"],
  "secret": "whsec_kidshield_prod_key"
}`,
        responseBody: `{
  "id": "wh_abc123",
  "url": "https://api.kidshield.dev/webhooks/phosra",
  "events": ["enforcement.completed", "enforcement.failed", "policy.updated"],
  "status": "active"
}`,
        whatHappens: "Webhook registered. All future events matching the subscribed types will be POST-ed to the URL with an HMAC-SHA256 signature in the X-Signature header for verification."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Create a family and policy through KidShield's onboarding",
        requestBody: `{
  "child_name": "Alex",
  "child_birth_date": "2012-08-20",
  "protection_level": "strict"
}`,
        responseBody: `{
  "family": { "id": "fam_ks001" },
  "child": { "id": "child_ks001", "age": 13 },
  "policy": { "id": "pol_ks001", "rules_count": 26 }
}`,
        whatHappens: "Strict protection for a 13-year-old generates 26 rules \u2014 stricter than recommended. Social media fully restricted, content ratings capped at PG-13, screen time at 1.5 hours."
      },
      {
        number: 5,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push policy to connected platforms",
        requestBody: `{
  "policy_id": "pol_ks001"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 }
  ]
}`,
        whatHappens: "Enforcement runs. After completion, a webhook event is sent to KidShield's endpoint with HMAC signature, allowing the app to update its UI in real-time."
      }
    ],
    keyTeachingPoint: "Third-party apps integrate by discovering platforms, registering webhooks, and using the same Quick Setup API. HMAC-signed webhooks provide real-time event delivery."
  },
  {
    id: "dns-protection",
    title: "DNS-Level Web Protection",
    summary: "Set up home WiFi (NextDNS) and school Chromebook (CleanBrowsing) DNS filtering",
    icon: "\u{1F310}",
    tags: ["NextDNS", "CleanBrowsing", "DNS"],
    scenario: "The Chen family wants DNS-level protection on two networks: NextDNS on the home router for all home devices, and CleanBrowsing on their daughter's school Chromebook (the school requires CleanBrowsing). Both should enforce the same policy but through different DNS providers.",
    actors: ["Parent App", "Phosra API", "NextDNS", "CleanBrowsing"],
    flowDiagram: `Parent App          Phosra API       NextDNS      CleanBrowsing
    |                       |                   |              |
    |── POST /compliance ──>|                   |              |
    |   (NextDNS)           |── verify ────────>|              |
    |<── 200 verified ──────|                   |              |
    |── POST /compliance ──>|                   |              |
    |   (CleanBrowsing)     |── verify ─────────|─────────────>|
    |<── 200 verified ──────|                   |              |
    |── PUT /rules/bulk ───>|                   |              |
    |   (web_filter rules)  |                   |              |
    |<── 200 updated ───────|                   |              |
    |── POST /enforce ─────>|── push DNS ──────>|              |
    |                       |── push DNS ───────|─────────────>|
    |<── 200 results ───────|                   |              |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Verify NextDNS credentials for home network",
        requestBody: `{
  "platform": "nextdns",
  "credentials": { "api_key": "ndns_home...", "profile_id": "home_profile" },
  "child_id": "child_chen01"
}`,
        responseBody: `{
  "id": "comp_ndns01",
  "platform": "nextdns",
  "status": "verified",
  "capabilities": ["web_filter", "safe_search", "dns_block"]
}`,
        whatHappens: "NextDNS API key validated. Profile ID confirmed. Capabilities mapped \u2014 NextDNS supports web filtering, safe search enforcement, and custom domain blocking."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Verify CleanBrowsing credentials for school Chromebook",
        requestBody: `{
  "platform": "cleanbrowsing",
  "credentials": { "api_key": "cb_school..." },
  "child_id": "child_chen01"
}`,
        responseBody: `{
  "id": "comp_cb01",
  "platform": "cleanbrowsing",
  "status": "verified",
  "capabilities": ["web_filter", "safe_search"]
}`,
        whatHappens: "CleanBrowsing verified with fewer capabilities than NextDNS \u2014 it supports web filtering and safe search but not custom domain blocking."
      },
      {
        number: 3,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_chen01/rules/bulk",
        description: "Update web filtering rules \u2014 enable additional blocked categories",
        requestBody: `{
  "rules": [
    { "category": "web_filter", "config": { "blocked_categories": ["adult", "gambling", "malware", "social_media", "gaming"] } },
    { "category": "safe_search", "config": { "enabled": true, "engine": "all" } }
  ]
}`,
        responseBody: `{
  "updated": 2,
  "policy_version": 3
}`,
        whatHappens: "Bulk rule update modifies two categories at once. Policy version incremented to track changes. These rules apply to both DNS platforms on next enforcement."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push updated rules to both DNS providers simultaneously",
        requestBody: `{
  "policy_id": "pol_chen01",
  "platforms": ["comp_ndns01", "comp_cb01"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8, "details": "5 blocked categories + safe_search + 0 custom domains" },
    { "platform": "cleanbrowsing", "status": "success", "rules_pushed": 6, "details": "5 blocked categories + safe_search (no custom domain support)" }
  ]
}`,
        whatHappens: "Same policy, different push counts. NextDNS gets 8 rules (including custom domain blocking capability). CleanBrowsing gets 6 rules (no custom domain support). Each platform receives only what it can enforce."
      }
    ],
    keyTeachingPoint: "Multiple DNS providers can enforce the same policy. The API handles capability differences \u2014 CleanBrowsing gets fewer rules than NextDNS because it supports fewer features."
  },
  {
    id: "child-turns-13",
    title: "Child Turns 13",
    summary: "Birthday triggers automatic age re-evaluation and relaxed teen-appropriate rules",
    icon: "\u{1F382}",
    tags: ["Age Ratings", "Policy Update", "Lifecycle"],
    scenario: "Emma's 13th birthday is today. Her policy was generated when she was 12 with PG content ratings, 2-hour screen time, and social media blocked. Now that she's a teenager, the API needs to recalculate age-appropriate defaults \u2014 PG-13 content, 3-hour screen time, and supervised social media access.",
    actors: ["Parent App", "Phosra API", "Platforms"],
    flowDiagram: `Parent App          Phosra API            Platforms
    |                       |                           |
    |── GET /children/{id} >|                           |
    |<── 200 (age: 13) ────|                           |
    |── GET /age-ratings ──>|                           |
    |   ?age=13             |                           |
    |<── 200 ratings ───────|                           |
    |── POST /generate ────>|                           |
    |   from-age            |── recalculate rules ──    |
    |<── 200 new policy ────|                           |
    |── PUT /activate ─────>|                           |
    |<── 200 activated ─────|                           |
    |── POST /enforce ─────>|── push updated rules ───>|
    |<── 200 results ───────|                           |`,
    steps: [
      {
        number: 1,
        method: "GET",
        endpoint: "/api/v1/families/fam_001/children/child_emma",
        description: "Check Emma's current age \u2014 the API computes it from birth date",
        responseBody: `{
  "id": "child_emma",
  "name": "Emma",
  "birth_date": "2013-02-07",
  "age": 13,
  "active_policy_id": "pol_emma_v1"
}`,
        whatHappens: "Age is computed dynamically from birth_date, not stored. Today being Emma's birthday, the API returns age: 13 instead of yesterday's 12."
      },
      {
        number: 2,
        method: "GET",
        endpoint: "/api/v1/ratings/age-ratings?age=13",
        description: "Look up age-appropriate content ratings for a 13-year-old",
        responseBody: `{
  "age": 13,
  "ratings": {
    "mpaa": "PG-13",
    "tv": "TV-14",
    "esrb": "T",
    "pegi": "12",
    "csm": "13+"
  }
}`,
        whatHappens: "The age-to-rating map returns teen-appropriate ratings. PG-13 movies and T-rated games are now allowed, up from PG and E."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/policies/generate-from-age",
        description: "Generate a new policy based on Emma's current age",
        requestBody: `{
  "child_id": "child_emma",
  "protection_level": "recommended"
}`,
        responseBody: `{
  "policy": {
    "id": "pol_emma_v2",
    "status": "draft",
    "rules_count": 24,
    "changes_from_previous": {
      "relaxed": ["content_rating (PG\u2192PG-13)", "time_daily_limit (2h\u21923h)", "social_access (blocked\u2192supervised)"],
      "unchanged": 19,
      "tightened": ["targeted_ad_block (now required by COPPA 2.0 for 13-16)"]
    }
  }
}`,
        whatHappens: "New policy generated as a draft. The API shows exactly what changed: 3 rules relaxed for teen appropriateness, 1 rule tightened due to COPPA 2.0 applying to the 13-16 age bracket."
      },
      {
        number: 4,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_emma_v2/activate",
        description: "Parent reviews changes and activates the new policy",
        responseBody: `{
  "id": "pol_emma_v2",
  "status": "active",
  "previous_policy": "pol_emma_v1",
  "previous_status": "archived"
}`,
        whatHappens: "New policy activated, old policy archived (not deleted \u2014 full audit trail preserved). The child's active_policy_id pointer is updated."
      },
      {
        number: 5,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push the updated teen-appropriate rules to all connected platforms",
        requestBody: `{
  "policy_id": "pol_emma_v2"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 },
    { "platform": "android", "status": "success", "rules_pushed": 20 }
  ]
}`,
        whatHappens: "All platforms receive updated rules. Android now allows T-rated games and supervised social media. NextDNS unblocks social media domains that were previously filtered."
      }
    ],
    keyTeachingPoint: "Age is computed dynamically, not stored. When a child's age crosses a threshold, generate-from-age recalculates all 35 categories and shows exactly what changed."
  },
  {
    id: "multi-child",
    title: "Multi-Child Family",
    summary: "Two children (ages 5 and 14) with different policies under the same family",
    icon: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}",
    tags: ["Family", "Multiple Policies", "Age Tiers"],
    scenario: "The Johnsons have two kids: Lily (5) and Marcus (14). They need very different protection levels \u2014 Lily needs allowlist-only content access and 1-hour screen time, while Marcus needs teen-appropriate ratings and 3 hours. Both share the same family account and NextDNS profile.",
    actors: ["Parent App", "Phosra API", "NextDNS"],
    flowDiagram: `Parent App          Phosra API            NextDNS
    |                       |                           |
    |── POST /setup/quick ─>|                           |
    |   (Lily, age 5)       |── generate 20 rules ──   |
    |<── 201 policy_lily ───|                           |
    |── POST /setup/quick ─>|                           |
    |   (Marcus, age 14)    |── generate 24 rules ──   |
    |<── 201 policy_marcus ─|                           |
    |── POST /enforce ─────>|                           |
    |   (policy_lily)       |── push strict DNS ──────>|
    |<── 200 ───────────────|                           |
    |── POST /enforce ─────>|                           |
    |   (policy_marcus)     |── push teen DNS ────────>|
    |<── 200 ───────────────|                           |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Set up Lily (age 5) with recommended protection",
        requestBody: `{
  "child_name": "Lily",
  "child_birth_date": "2021-06-10",
  "protection_level": "strict"
}`,
        responseBody: `{
  "family": { "id": "fam_johnson" },
  "child": { "id": "child_lily", "age": 5 },
  "policy": { "id": "pol_lily", "rules_count": 20 }
}`,
        whatHappens: "Lily gets strict protection for a 5-year-old: G-rated content only, 1-hour screen time, all social media blocked, allowlist mode available. Family created on first call."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Set up Marcus (age 14) with recommended protection under the same family",
        requestBody: `{
  "child_name": "Marcus",
  "child_birth_date": "2012-01-22",
  "protection_level": "recommended",
  "family_id": "fam_johnson"
}`,
        responseBody: `{
  "family": { "id": "fam_johnson" },
  "child": { "id": "child_marcus", "age": 14 },
  "policy": { "id": "pol_marcus", "rules_count": 24 }
}`,
        whatHappens: "Marcus gets recommended teen protection: PG-13 content, 3-hour screen time, supervised social media. Same family \u2014 family_id passed to avoid creating a duplicate."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Enforce Lily's strict policy on NextDNS",
        requestBody: `{
  "policy_id": "pol_lily",
  "platforms": ["comp_ndns_lily"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8, "profile": "lily_profile" }
  ]
}`,
        whatHappens: "Lily's NextDNS profile gets the strictest DNS filtering: adult + social + gaming + streaming all blocked. Safe search enforced on all engines."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Enforce Marcus's teen policy on NextDNS",
        requestBody: `{
  "policy_id": "pol_marcus",
  "platforms": ["comp_ndns_marcus"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 6, "profile": "marcus_profile" }
  ]
}`,
        whatHappens: "Marcus's NextDNS profile is more permissive: adult + gambling blocked, but social media and gaming allowed. Different child = different NextDNS profile = different rules."
      }
    ],
    keyTeachingPoint: "Each child gets their own policy under a shared family. The same platform (NextDNS) can enforce different rules per child using separate profiles."
  },
  {
    id: "co-parenting",
    title: "Co-Parenting Setup",
    summary: "Divorced parents share family access with role-based permissions",
    icon: "\u{1F91D}",
    tags: ["Family Members", "Roles", "Shared Access"],
    scenario: "David and Sarah are divorced and share custody of their son Jake (10). David set up Phosra initially. Sarah needs her own account with the ability to view policies and trigger enforcement, but David retains admin control over policy changes.",
    actors: ["David (Admin)", "Phosra API", "Sarah (Member)"],
    flowDiagram: `David (Admin)       Phosra API        Sarah (Member)
    |                       |                       |
    |── POST /members ─────>|                       |
    |   (invite Sarah)      |── send invite ───────>|
    |<── 201 invite ────────|                       |
    |                       |<── POST /accept ──────|
    |                       |── 200 member added ──>|
    |                       |                       |
    |                       |<── GET /policies ─────|
    |                       |── 200 (read-only) ───>|
    |                       |<── POST /enforce ─────|
    |                       |── 200 results ───────>|`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/families/fam_custody/members",
        description: "David invites Sarah as a family member with 'member' role",
        requestBody: `{
  "email": "sarah@example.com",
  "role": "member",
  "permissions": ["view_policies", "view_reports", "trigger_enforcement"]
}`,
        responseBody: `{
  "invite": {
    "id": "inv_abc123",
    "email": "sarah@example.com",
    "role": "member",
    "status": "pending",
    "expires_at": "2026-02-14T00:00:00Z"
  }
}`,
        whatHappens: "Invitation created with a 7-day expiry. Sarah receives a member role \u2014 she can view and enforce but cannot modify policies. Only admin role can change rules."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/invites/inv_abc123/accept",
        description: "Sarah accepts the invitation from her own account",
        responseBody: `{
  "family": { "id": "fam_custody" },
  "member": {
    "user_id": "usr_sarah",
    "role": "member",
    "permissions": ["view_policies", "view_reports", "trigger_enforcement"]
  }
}`,
        whatHappens: "Sarah is now a family member. She sees the same children, policies, and reports as David, but cannot edit policy rules or manage family settings."
      },
      {
        number: 3,
        method: "GET",
        endpoint: "/api/v1/families/fam_custody/policies",
        description: "Sarah views Jake's current policy (read-only)",
        responseBody: `{
  "policies": [{
    "id": "pol_jake",
    "child": { "id": "child_jake", "name": "Jake", "age": 10 },
    "status": "active",
    "rules_count": 22,
    "last_enforced": "2026-02-06T18:00:00Z"
  }]
}`,
        whatHappens: "Sarah can see the full policy details including all rules, but PUT/DELETE operations on rules would return 403 Forbidden for the member role."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Sarah triggers enforcement from her device during her custody time",
        requestBody: `{
  "policy_id": "pol_jake"
}`,
        responseBody: `{
  "results": [
    { "platform": "android", "status": "success", "rules_pushed": 18 }
  ],
  "triggered_by": "usr_sarah"
}`,
        whatHappens: "Sarah can trigger enforcement because she has the trigger_enforcement permission. The audit log records that Sarah (not David) triggered this enforcement."
      }
    ],
    keyTeachingPoint: "Role-based family membership lets co-parents share access. Members can view and enforce but only admins can modify policy rules."
  },
  {
    id: "block-game",
    title: "Blocking a Specific Game",
    summary: "Parent sees Fortnite usage and blocks it across both DNS and Android",
    icon: "\u{1F3AE}",
    tags: ["Game Block", "NextDNS", "Android"],
    scenario: "Dad notices his 9-year-old son is spending hours on Fortnite, which is rated T (Teen) by ESRB \u2014 above the E (Everyone) limit in the child's policy. The content rating rule should have caught this but Epic Games' launcher domain wasn't in the filter list. Dad needs to explicitly block Fortnite at both the DNS level and the Android app level.",
    actors: ["Parent App", "Phosra API", "NextDNS", "Android"],
    flowDiagram: `Parent App          Phosra API       NextDNS        Android
    |                       |                   |              |
    |── GET /reports ──────>|                   |              |
    |<── 200 usage data ────|                   |              |
    |── PUT /rules/{id} ───>|                   |              |
    |   (web_custom_block)  |                   |              |
    |<── 200 updated ───────|                   |              |
    |── PUT /rules/{id} ───>|                   |              |
    |   (app_block)         |                   |              |
    |<── 200 updated ───────|                   |              |
    |── POST /enforce ─────>|── block domain ──>|              |
    |                       |── block app ──────|─────────────>|
    |<── 200 results ───────|                   |              |`,
    steps: [
      {
        number: 1,
        method: "GET",
        endpoint: "/api/v1/reports?child_id=child_son01&period=7d",
        description: "Check recent activity reports to see Fortnite usage",
        responseBody: `{
  "usage": [
    { "app": "Fortnite", "package": "com.epicgames.fortnite", "daily_avg_minutes": 142, "rating": "T (Teen)" },
    { "app": "YouTube", "daily_avg_minutes": 45, "rating": "T (Teen)" }
  ],
  "alerts": [
    { "type": "rating_violation", "app": "Fortnite", "expected_max": "E", "actual": "T" }
  ]
}`,
        whatHappens: "Reports show Fortnite averaging 2+ hours/day with a rating violation alert. The T rating exceeds the child's E (Everyone) maximum."
      },
      {
        number: 2,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_son/rules/rule_web_block",
        description: "Add Fortnite domains to the custom web blocklist",
        requestBody: `{
  "category": "web_custom_block",
  "config": {
    "domains": ["epicgames.com", "fortnite.com", "unrealengine.com"]
  }
}`,
        responseBody: `{
  "id": "rule_web_block",
  "category": "web_custom_block",
  "config": { "domains": ["epicgames.com", "fortnite.com", "unrealengine.com"] },
  "updated_at": "2026-02-07T10:30:00Z"
}`,
        whatHappens: "Three domains added to the custom blocklist. This will be enforced at the DNS level \u2014 any device using the child's NextDNS profile will be unable to resolve these domains."
      },
      {
        number: 3,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_son/rules/rule_app_block",
        description: "Block the Fortnite app by package name on Android",
        requestBody: `{
  "category": "app_block",
  "config": {
    "packages": ["com.epicgames.fortnite", "com.epicgames.launcher"]
  }
}`,
        responseBody: `{
  "id": "rule_app_block",
  "category": "app_block",
  "config": { "packages": ["com.epicgames.fortnite", "com.epicgames.launcher"] },
  "updated_at": "2026-02-07T10:31:00Z"
}`,
        whatHappens: "App blocked by Android package name. Both the game and the Epic Games launcher are blocked, preventing reinstallation through the launcher."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push both blocking rules to NextDNS and Android",
        requestBody: `{
  "policy_id": "pol_son",
  "platforms": ["comp_ndns_son", "comp_android_son"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 9, "details": "+3 blocked domains" },
    { "platform": "android", "status": "success", "rules_pushed": 19, "details": "+2 blocked packages" }
  ]
}`,
        whatHappens: "DNS-level block prevents Fortnite web access on any device. Android app block prevents launch on the tablet. Two-layer protection \u2014 even if the child uses a different network, the app itself won't launch."
      }
    ],
    keyTeachingPoint: "Defense in depth: block both the DNS domain and the app package. DNS blocking covers all devices on the network, app blocking covers the specific device even on other networks."
  },
  {
    id: "apple-manual",
    title: "Apple Device (Manual Flow)",
    summary: "Set up iPad protection via MDM profile \u2014 Apple requires manual steps",
    icon: "\u{1F34E}",
    tags: ["Apple MDM", "Manual", "Guided Steps"],
    scenario: "Mom wants to protect her daughter's iPad. Unlike NextDNS and Android which have push APIs, Apple's MDM requires manual installation of a configuration profile. The Phosra API generates the profile and provides step-by-step instructions for the parent.",
    actors: ["Parent App", "Phosra API", "Apple MDM"],
    flowDiagram: `Parent App          Phosra API         Apple iPad
    |                       |                        |
    |── POST /compliance ──>|                        |
    |   (apple_mdm)         |                        |
    |<── 200 status:manual ─|                        |
    |── POST /enforce ─────>|                        |
    |   (apple_mdm)         |── generate profile ──  |
    |<── 200 manual_steps ──|                        |
    |                       |                        |
    |   [Parent follows steps on iPad]               |
    |                       |                        |
    |── GET /results ──────>|                        |
    |<── 200 pending_manual─|                        |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Register the Apple device \u2014 returns 'manual' status instead of 'verified'",
        requestBody: `{
  "platform": "apple_mdm",
  "credentials": { "device_name": "Sofia's iPad", "apple_id_hint": "sofia@icloud.com" },
  "child_id": "child_sofia"
}`,
        responseBody: `{
  "id": "comp_apple01",
  "platform": "apple_mdm",
  "status": "manual",
  "capabilities": ["content_rating", "app_block", "screen_time", "web_filter"],
  "note": "Apple MDM requires manual profile installation"
}`,
        whatHappens: "Unlike NextDNS which returns 'verified', Apple returns 'manual' status. The API can't auto-verify Apple devices \u2014 parent must install a configuration profile on the device."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Request enforcement \u2014 API generates an MDM profile and manual steps",
        requestBody: `{
  "policy_id": "pol_sofia",
  "platforms": ["comp_apple01"]
}`,
        responseBody: `{
  "results": [{
    "platform": "apple_mdm",
    "status": "manual_steps",
    "profile_url": "https://api.phosra.dev/profiles/mdm_abc123.mobileconfig",
    "manual_steps": [
      "1. On the iPad, open Safari and go to the profile URL",
      "2. Tap 'Allow' when prompted to download the configuration profile",
      "3. Open Settings \u2192 General \u2192 VPN & Device Management",
      "4. Tap the Phosra profile and tap 'Install'",
      "5. Enter the iPad passcode when prompted",
      "6. Tap 'Install' again to confirm"
    ],
    "expires_at": "2026-02-07T11:00:00Z"
  }]
}`,
        whatHappens: "API generates an MDM .mobileconfig file with all policy rules embedded. The profile URL is time-limited (30 minutes). Manual steps guide the parent through installation."
      },
      {
        number: 3,
        method: "GET",
        endpoint: "/api/v1/enforce/results?compliance_id=comp_apple01",
        description: "Check if the manual installation was completed",
        responseBody: `{
  "compliance_id": "comp_apple01",
  "platform": "apple_mdm",
  "enforcement_status": "pending_manual",
  "profile_installed": false,
  "last_checked": "2026-02-07T10:35:00Z",
  "instructions": "Awaiting manual profile installation on device"
}`,
        whatHappens: "The API can't confirm installation until the device checks in. Status remains 'pending_manual' until the MDM profile phones home, at which point it changes to 'enforced'."
      }
    ],
    keyTeachingPoint: "Not all platforms support push-based enforcement. Apple MDM uses a 'manual_steps' flow where the API generates instructions and a configuration profile for the parent to install."
  },
  {
    id: "re-verification",
    title: "Platform Re-Verification",
    summary: "NextDNS API key was rotated \u2014 fix the failed enforcement and re-verify",
    icon: "\u{1F511}",
    tags: ["Re-Verify", "Error Recovery", "NextDNS"],
    scenario: "Enforcement failed because the parent rotated their NextDNS API key without updating Phosra. The stored (encrypted) key no longer works. The parent needs to see the failure, provide the new key, and re-verify the platform connection.",
    actors: ["Parent App", "Phosra API", "NextDNS"],
    flowDiagram: `Parent App          Phosra API            NextDNS
    |                       |                           |
    |── POST /enforce ─────>|── push rules ────────────>|
    |                       |<── 401 unauthorized ──────|
    |<── 200 (failed) ──────|                           |
    |── GET /results ──────>|                           |
    |<── 200 auth_failed ───|                           |
    |── POST /verify ──────>|                           |
    |   (new API key)       |── verify new key ────────>|
    |                       |<── 200 ok ────────────────|
    |<── 200 re-verified ───|                           |
    |── POST /enforce ─────>|── push rules ────────────>|
    |                       |<── 200 ok ────────────────|
    |<── 200 success ───────|                           |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Attempt enforcement \u2014 it fails because the API key was rotated",
        requestBody: `{
  "policy_id": "pol_family01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "failed", "error": "authentication_failed", "message": "NextDNS returned 401: Invalid API key" }
  ]
}`,
        whatHappens: "Enforcement attempted but NextDNS rejected the stored API key. The result includes the specific error so the parent knows exactly what went wrong."
      },
      {
        number: 2,
        method: "GET",
        endpoint: "/api/v1/enforce/results?compliance_id=comp_ndns01",
        description: "Get detailed enforcement results and failure history",
        responseBody: `{
  "compliance_id": "comp_ndns01",
  "platform": "nextdns",
  "status": "auth_failed",
  "last_success": "2026-02-05T18:00:00Z",
  "last_failure": "2026-02-07T09:00:00Z",
  "failure_count": 3,
  "action_required": "Re-verify platform credentials"
}`,
        whatHappens: "Detailed status shows the platform has been failing for 2 days with 3 consecutive failures. The action_required field tells the parent exactly what to do."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/compliance/comp_ndns01/verify",
        description: "Re-verify with the new NextDNS API key",
        requestBody: `{
  "credentials": { "api_key": "ndns_NEW_rotated_key...", "profile_id": "abc123" }
}`,
        responseBody: `{
  "id": "comp_ndns01",
  "platform": "nextdns",
  "status": "verified",
  "previous_status": "auth_failed",
  "verified_at": "2026-02-07T09:15:00Z"
}`,
        whatHappens: "New API key encrypted with AES-256-GCM and stored. Old key overwritten. NextDNS API called to verify the new credentials work. Status changes from auth_failed back to verified."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Retry enforcement with the new verified credentials",
        requestBody: `{
  "policy_id": "pol_family01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 }
  ]
}`,
        whatHappens: "Enforcement succeeds with the new credentials. All 8 DNS rules pushed to NextDNS. The failure counter resets to zero."
      }
    ],
    keyTeachingPoint: "When platform credentials change, enforcement fails gracefully with a clear error. Re-verify the credentials, then retry enforcement \u2014 the API handles the key rotation transparently."
  },
  {
    id: "webhook-dashboard",
    title: "Webhook-Driven Dashboard",
    summary: "Build a real-time dashboard using HMAC-signed webhook events",
    icon: "\u{1F4CA}",
    tags: ["Webhooks", "HMAC", "Real-Time"],
    scenario: "A developer is building a real-time parental controls dashboard. Instead of polling the API, they register a webhook endpoint to receive events as they happen \u2014 enforcement completions, policy changes, and failures. Each event is HMAC-signed for verification.",
    actors: ["Dashboard", "Phosra API", "Webhook Server"],
    flowDiagram: `Dashboard App       Phosra API       Webhook Server
    |                       |                       |
    |── POST /webhooks ────>|                       |
    |<── 201 webhook ───────|                       |
    |── POST /test ────────>|                       |
    |                       |── POST test event ───>|
    |                       |   (HMAC-signed)       |
    |<── 200 test ok ───────|<── 200 ──────────────|
    |                       |                       |
    |── POST /enforce ─────>|                       |
    |<── 200 ───────────────|                       |
    |                       |── POST event ────────>|
    |                       |   enforcement.done    |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/webhooks",
        description: "Register a webhook endpoint for enforcement and policy events",
        requestBody: `{
  "url": "https://dashboard.example.com/hooks/gg",
  "events": ["enforcement.completed", "enforcement.failed", "policy.updated", "policy.activated"],
  "secret": "whsec_dashboard_secret_key_2024"
}`,
        responseBody: `{
  "id": "wh_dash01",
  "url": "https://dashboard.example.com/hooks/gg",
  "events": ["enforcement.completed", "enforcement.failed", "policy.updated", "policy.activated"],
  "status": "active",
  "created_at": "2026-02-07T10:00:00Z"
}`,
        whatHappens: "Webhook registered with 4 event types. The secret is used to generate HMAC-SHA256 signatures for each delivery, allowing the receiver to verify authenticity."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/webhooks/wh_dash01/test",
        description: "Send a test event to verify the endpoint works",
        responseBody: `{
  "test_delivery": {
    "id": "del_test01",
    "event": "test.ping",
    "status": "delivered",
    "response_code": 200,
    "response_time_ms": 145,
    "signature": "sha256=abc123..."
  }
}`,
        whatHappens: "A test ping is sent to the webhook URL. The API confirms delivery, response code, and latency. If the endpoint returns non-2xx, the test fails and the developer knows to fix their server."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Trigger an enforcement \u2014 webhook fires automatically after completion",
        requestBody: `{
  "policy_id": "pol_dash01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 }
  ]
}`,
        whatHappens: "Enforcement completes. The API automatically sends an enforcement.completed event to all registered webhooks. The dashboard receives it in real-time and updates its UI."
      },
      {
        number: 4,
        method: "GET",
        endpoint: "/api/v1/webhooks/wh_dash01/deliveries",
        description: "Check webhook delivery history for debugging",
        responseBody: `{
  "deliveries": [
    { "id": "del_001", "event": "enforcement.completed", "status": "delivered", "response_code": 200, "timestamp": "2026-02-07T10:05:00Z" },
    { "id": "del_test01", "event": "test.ping", "status": "delivered", "response_code": 200, "timestamp": "2026-02-07T10:01:00Z" }
  ]
}`,
        whatHappens: "Delivery log shows all webhook events sent, their status, and response codes. Failed deliveries are retried with exponential backoff (1min, 5min, 30min)."
      }
    ],
    keyTeachingPoint: "Webhooks eliminate polling. Register once, receive HMAC-signed events in real-time. Use the test endpoint to verify setup, and the deliveries endpoint to debug issues."
  },
  {
    id: "emergency-pause",
    title: "Emergency Policy Pause",
    summary: "Temporarily pause all restrictions and re-enable them later",
    icon: "\u23F8\uFE0F",
    tags: ["Pause", "Emergency", "Lifecycle"],
    scenario: "Mom is at a doctor's appointment and needs her 8-year-old to access a video call app that's normally blocked. She pauses the policy temporarily to remove all restrictions, then re-activates it when she's done.",
    actors: ["Parent App", "Phosra API", "Platforms"],
    flowDiagram: `Parent App          Phosra API            Platforms
    |                       |                           |
    |── PUT /pause ────────>|                           |
    |<── 200 paused ────────|                           |
    |── POST /enforce ─────>|── remove restrictions ──>|
    |<── 200 cleared ───────|                           |
    |                       |                           |
    |   [... appointment time passes ...]               |
    |                       |                           |
    |── PUT /activate ─────>|                           |
    |<── 200 active ────────|                           |
    |── POST /enforce ─────>|── restore restrictions ─>|
    |<── 200 enforced ──────|                           |`,
    steps: [
      {
        number: 1,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_child01/pause",
        description: "Pause the policy \u2014 marks it as inactive without deleting any rules",
        requestBody: `{
  "reason": "Doctor appointment - need video call access",
  "auto_resume_minutes": 60
}`,
        responseBody: `{
  "id": "pol_child01",
  "status": "paused",
  "paused_at": "2026-02-07T14:00:00Z",
  "auto_resume_at": "2026-02-07T15:00:00Z",
  "paused_by": "usr_mom",
  "reason": "Doctor appointment - need video call access"
}`,
        whatHappens: "Policy status changed to 'paused'. All rules preserved but marked as not-enforceable. Optional auto-resume timer set for 60 minutes as a safety net."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Enforce the paused state \u2014 removes active restrictions from platforms",
        requestBody: `{
  "policy_id": "pol_child01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 0, "details": "Policy paused: all restrictions removed" },
    { "platform": "android", "status": "success", "rules_pushed": 0, "details": "Policy paused: all restrictions removed" }
  ]
}`,
        whatHappens: "With the policy paused, enforcement pushes zero rules \u2014 effectively removing all restrictions. The child now has unrestricted access on all platforms."
      },
      {
        number: 3,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_child01/activate",
        description: "Re-activate the policy to restore all protections",
        responseBody: `{
  "id": "pol_child01",
  "status": "active",
  "activated_at": "2026-02-07T14:45:00Z",
  "was_paused_for_minutes": 45,
  "rules_count": 22
}`,
        whatHappens: "Policy reactivated. All 22 rules are now enforceable again. Auto-resume timer cancelled since the parent manually resumed. Duration logged for audit trail."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push all restrictions back to platforms",
        requestBody: `{
  "policy_id": "pol_child01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 },
    { "platform": "android", "status": "success", "rules_pushed": 18 }
  ]
}`,
        whatHappens: "Full enforcement restored. All DNS filters and Android restrictions back in place. If the parent had forgotten, auto-resume would have triggered at the 60-minute mark."
      }
    ],
    keyTeachingPoint: "Pause/activate is non-destructive \u2014 rules are preserved, just not enforced. The optional auto_resume_minutes timer provides a safety net so restrictions are automatically restored."
  },
  {
    id: "custom-blocklist",
    title: "Custom Web Blocklist",
    summary: "Block reddit.com and 4chan.org across both DNS providers",
    icon: "\u{1F6AB}",
    tags: ["Custom Domains", "NextDNS", "CleanBrowsing"],
    scenario: "A parent discovers their 11-year-old has been accessing Reddit and 4chan, which aren't caught by the standard web filter categories. They need to add these specific domains to a custom blocklist and push the blocks to both NextDNS (home) and CleanBrowsing (school Chromebook).",
    actors: ["Parent App", "Phosra API", "NextDNS", "CleanBrowsing"],
    flowDiagram: `Parent App          Phosra API       NextDNS      CleanBrowsing
    |                       |                   |              |
    |── PUT /rules/{id} ───>|                   |              |
    |   (custom domains)    |                   |              |
    |<── 200 updated ───────|                   |              |
    |── POST /enforce ─────>|── block domains ─>|              |
    |                       |── block domains ──|─────────────>|
    |<── 200 results ───────|                   |              |`,
    steps: [
      {
        number: 1,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_child11/rules/rule_custom_block",
        description: "Add reddit.com and 4chan.org to the custom web blocklist",
        requestBody: `{
  "category": "web_custom_block",
  "config": {
    "domains": ["reddit.com", "4chan.org", "old.reddit.com", "i.reddit.com"]
  }
}`,
        responseBody: `{
  "id": "rule_custom_block",
  "category": "web_custom_block",
  "config": {
    "domains": ["reddit.com", "4chan.org", "old.reddit.com", "i.reddit.com"]
  },
  "domain_count": 4,
  "updated_at": "2026-02-07T11:00:00Z"
}`,
        whatHappens: "Four domains added to custom blocklist. Subdomains (old.reddit.com, i.reddit.com) need to be listed explicitly since DNS blocking is exact-match unless the platform supports wildcard."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push the custom blocklist to both DNS providers",
        requestBody: `{
  "policy_id": "pol_child11",
  "platforms": ["comp_ndns_home", "comp_cb_school"]
}`,
        responseBody: `{
  "results": [
    {
      "platform": "nextdns",
      "status": "success",
      "rules_pushed": 9,
      "details": "+4 custom blocked domains (wildcards supported)"
    },
    {
      "platform": "cleanbrowsing",
      "status": "success",
      "rules_pushed": 7,
      "details": "+4 custom blocked domains (exact match only)"
    }
  ]
}`,
        whatHappens: "Both DNS providers receive the domain blocklist. NextDNS supports wildcard blocking (*.reddit.com), so all subdomains are covered. CleanBrowsing uses exact-match only, so only the 4 listed domains are blocked."
      }
    ],
    keyTeachingPoint: "Custom domain blocking supplements category-based filtering. Different DNS providers may handle wildcards differently \u2014 NextDNS blocks all subdomains, CleanBrowsing blocks exact matches only."
  },
  {
    id: "school-district",
    title: "School District Bulk Setup",
    summary: "IT admin onboards 200 students via scripted API calls to CleanBrowsing",
    icon: "\u{1F3EB}",
    tags: ["Bulk", "Script", "CleanBrowsing", "Enterprise"],
    scenario: "Lincoln Middle School's IT administrator needs to onboard 200 students at once. They'll use a script to call the API in a loop: register a service account, run Quick Setup for each student from a CSV, verify CleanBrowsing for the school network, and enforce a uniform policy across all students.",
    actors: ["IT Script", "Phosra API", "CleanBrowsing"],
    flowDiagram: `IT Script           Phosra API          CleanBrowsing
    |                       |                          |
    |── POST /register ────>|                          |
    |<── 201 token ─────────|                          |
    |                       |                          |
    |── POST /setup/quick ─>| (\u00D7200, from CSV)         |
    |   student_1           |                          |
    |── POST /setup/quick ─>|                          |
    |   student_2           |                          |
    |   ...                 |                          |
    |── POST /setup/quick ─>|                          |
    |   student_200         |                          |
    |                       |                          |
    |── POST /compliance ──>| (\u00D7200)                   |
    |   (CleanBrowsing)     |── verify ───────────────>|
    |                       |                          |
    |── POST /enforce ─────>| (\u00D7200)                   |
    |                       |── push rules ───────────>|
    |<── 200 results ───────|                          |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/auth/register",
        description: "Register the school's IT service account",
        requestBody: `{
  "email": "it-admin@lincoln.edu",
  "password": "L1ncoln_IT_2024!",
  "name": "Lincoln MS IT Admin"
}`,
        responseBody: `{
  "user": { "id": "usr_lincoln_it" },
  "access_token": "eyJhbG..."
}`,
        whatHappens: "Service account created for the school. This account will own all 200 student families. In production, schools would have a dedicated 'organization' tier with bulk rate limits."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Run Quick Setup for each student (called 200 times from CSV loop)",
        requestBody: `{
  "child_name": "Student, Jane",
  "child_birth_date": "2014-05-12",
  "protection_level": "strict",
  "family_id": "fam_lincoln_ms"
}`,
        responseBody: `{
  "family": { "id": "fam_lincoln_ms" },
  "child": { "id": "child_jane_doe", "age": 11 },
  "policy": { "id": "pol_jane_doe", "rules_count": 24 }
}`,
        whatHappens: "Each student gets their own child profile and policy under the school family. All use 'strict' protection. The script loops through a CSV calling this endpoint 200 times with a 100ms delay between calls."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Verify CleanBrowsing for each student's Chromebook (200 times)",
        requestBody: `{
  "platform": "cleanbrowsing",
  "credentials": { "api_key": "cb_lincoln_ms..." },
  "child_id": "child_jane_doe"
}`,
        responseBody: `{
  "id": "comp_cb_jane",
  "platform": "cleanbrowsing",
  "status": "verified"
}`,
        whatHappens: "Each student's Chromebook is linked to the school's CleanBrowsing account. The same API key is used for all students but each gets a unique compliance record for tracking."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Enforce policies in batch \u2014 called for each student's policy",
        requestBody: `{
  "policy_id": "pol_jane_doe"
}`,
        responseBody: `{
  "results": [
    { "platform": "cleanbrowsing", "status": "success", "rules_pushed": 6 }
  ]
}`,
        whatHappens: "Each student's policy is enforced individually on CleanBrowsing. The script collects all results and generates a summary report: 198 succeeded, 2 failed (invalid student birth dates in CSV)."
      }
    ],
    keyTeachingPoint: "The same API works for both individual parents and school districts. Bulk onboarding is just a loop over Quick Setup + Compliance + Enforce. Use CSV exports and scripting for scale."
  },
]
