/**
 * MCP tool definitions for the Phosra API.
 * Each tool maps 1:1 to a REST endpoint.
 *
 * Adapted from web/src/lib/playground/tools.ts for standalone use.
 */

import type { ToolDefinition } from "./types.js";

const str = (desc: string) => ({ type: "string" as const, description: desc });
const int = (desc: string) => ({ type: "integer" as const, description: desc });

export const TOOLS: ToolDefinition[] = [
  // -- Auth --------------------------------------------------
  {
    name: "get_current_user",
    description:
      "Get the current authenticated user's profile (name, email, ID).",
    input_schema: { type: "object", properties: {}, required: [] },
    http: { method: "GET", path: "/auth/me" },
  },

  // -- Quick Setup -------------------------------------------
  {
    name: "quick_setup",
    description:
      "One-step onboarding: creates a family, adds a child, generates age-appropriate policy rules, and activates the policy. If family_id is provided, uses that existing family. Strictness can be 'recommended', 'strict', or 'relaxed'.",
    input_schema: {
      type: "object",
      properties: {
        child_name: str("The child's display name"),
        birth_date: str("Child's birth date in YYYY-MM-DD format"),
        strictness: str(
          "One of: recommended, strict, relaxed (default: recommended)"
        ),
        family_id: str("Optional: existing family UUID to add the child to"),
        family_name: str(
          "Optional: name for a new family (defaults to '{child_name}'s Family')"
        ),
      },
      required: ["child_name", "birth_date"],
    },
    http: { method: "POST", path: "/setup/quick" },
  },

  // -- Families ----------------------------------------------
  {
    name: "list_families",
    description: "List all families the current user belongs to.",
    input_schema: { type: "object", properties: {}, required: [] },
    http: { method: "GET", path: "/families" },
  },
  {
    name: "create_family",
    description: "Create a new family group.",
    input_schema: {
      type: "object",
      properties: { name: str("Family name") },
      required: ["name"],
    },
    http: { method: "POST", path: "/families" },
  },
  {
    name: "get_family",
    description: "Get details of a specific family.",
    input_schema: {
      type: "object",
      properties: { family_id: str("Family UUID") },
      required: ["family_id"],
    },
    http: { method: "GET", path: "/families/{family_id}" },
  },
  {
    name: "update_family",
    description: "Update a family's name.",
    input_schema: {
      type: "object",
      properties: {
        family_id: str("Family UUID"),
        name: str("New family name"),
      },
      required: ["family_id", "name"],
    },
    http: { method: "PUT", path: "/families/{family_id}" },
  },
  {
    name: "delete_family",
    description: "Delete a family and all its children, policies, and rules.",
    input_schema: {
      type: "object",
      properties: { family_id: str("Family UUID") },
      required: ["family_id"],
    },
    http: { method: "DELETE", path: "/families/{family_id}" },
  },

  // -- Family Members ----------------------------------------
  {
    name: "list_family_members",
    description:
      "List all members of a family with their roles (owner, parent, guardian).",
    input_schema: {
      type: "object",
      properties: { family_id: str("Family UUID") },
      required: ["family_id"],
    },
    http: { method: "GET", path: "/families/{family_id}/members" },
  },
  {
    name: "add_family_member",
    description: "Add a user to a family with a specific role.",
    input_schema: {
      type: "object",
      properties: {
        family_id: str("Family UUID"),
        user_id: str("User UUID to add"),
        role: str("Role: owner, parent, or guardian"),
      },
      required: ["family_id", "user_id", "role"],
    },
    http: { method: "POST", path: "/families/{family_id}/members" },
  },
  {
    name: "remove_family_member",
    description: "Remove a member from a family.",
    input_schema: {
      type: "object",
      properties: {
        family_id: str("Family UUID"),
        member_id: str("Member UUID to remove"),
      },
      required: ["family_id", "member_id"],
    },
    http: {
      method: "DELETE",
      path: "/families/{family_id}/members/{member_id}",
    },
  },

  // -- Children ----------------------------------------------
  {
    name: "list_children",
    description: "List all children in a family.",
    input_schema: {
      type: "object",
      properties: { family_id: str("Family UUID") },
      required: ["family_id"],
    },
    http: { method: "GET", path: "/families/{family_id}/children" },
  },
  {
    name: "create_child",
    description:
      "Add a new child to a family. Birth date determines age-appropriate ratings.",
    input_schema: {
      type: "object",
      properties: {
        family_id: str("Family UUID"),
        name: str("Child's display name"),
        birth_date: str("Birth date in YYYY-MM-DD format"),
      },
      required: ["family_id", "name", "birth_date"],
    },
    http: { method: "POST", path: "/families/{family_id}/children" },
  },
  {
    name: "get_child",
    description:
      "Get details of a specific child including age and family.",
    input_schema: {
      type: "object",
      properties: { child_id: str("Child UUID") },
      required: ["child_id"],
    },
    http: { method: "GET", path: "/children/{child_id}" },
  },
  {
    name: "update_child",
    description: "Update a child's name or birth date.",
    input_schema: {
      type: "object",
      properties: {
        child_id: str("Child UUID"),
        name: str("New name"),
        birth_date: str("New birth date in YYYY-MM-DD format"),
      },
      required: ["child_id"],
    },
    http: { method: "PUT", path: "/children/{child_id}" },
  },
  {
    name: "delete_child",
    description: "Delete a child and all their policies and rules.",
    input_schema: {
      type: "object",
      properties: { child_id: str("Child UUID") },
      required: ["child_id"],
    },
    http: { method: "DELETE", path: "/children/{child_id}" },
  },
  {
    name: "get_child_age_ratings",
    description:
      "Get the recommended content ratings for a child based on their age, across all 5 rating systems (MPAA, TV, ESRB, PEGI, CSM).",
    input_schema: {
      type: "object",
      properties: { child_id: str("Child UUID") },
      required: ["child_id"],
    },
    http: { method: "GET", path: "/children/{child_id}/age-ratings" },
  },

  // -- Policies ----------------------------------------------
  {
    name: "list_policies",
    description: "List all policies for a child.",
    input_schema: {
      type: "object",
      properties: { child_id: str("Child UUID") },
      required: ["child_id"],
    },
    http: { method: "GET", path: "/children/{child_id}/policies" },
  },
  {
    name: "create_policy",
    description:
      "Create a new policy for a child. Policies start in 'draft' status.",
    input_schema: {
      type: "object",
      properties: {
        child_id: str("Child UUID"),
        name: str("Policy name"),
        priority: int("Priority (higher = takes precedence)"),
      },
      required: ["child_id", "name"],
    },
    http: { method: "POST", path: "/children/{child_id}/policies" },
  },
  {
    name: "get_policy",
    description: "Get details of a specific policy.",
    input_schema: {
      type: "object",
      properties: { policy_id: str("Policy UUID") },
      required: ["policy_id"],
    },
    http: { method: "GET", path: "/policies/{policy_id}" },
  },
  {
    name: "update_policy",
    description: "Update a policy's name or priority.",
    input_schema: {
      type: "object",
      properties: {
        policy_id: str("Policy UUID"),
        name: str("New policy name"),
        priority: int("New priority"),
      },
      required: ["policy_id"],
    },
    http: { method: "PUT", path: "/policies/{policy_id}" },
  },
  {
    name: "delete_policy",
    description: "Delete a policy and all its rules.",
    input_schema: {
      type: "object",
      properties: { policy_id: str("Policy UUID") },
      required: ["policy_id"],
    },
    http: { method: "DELETE", path: "/policies/{policy_id}" },
  },
  {
    name: "activate_policy",
    description: "Activate a policy so its rules are enforced.",
    input_schema: {
      type: "object",
      properties: { policy_id: str("Policy UUID") },
      required: ["policy_id"],
    },
    http: { method: "POST", path: "/policies/{policy_id}/activate" },
  },
  {
    name: "pause_policy",
    description: "Pause a policy to temporarily stop enforcement.",
    input_schema: {
      type: "object",
      properties: { policy_id: str("Policy UUID") },
      required: ["policy_id"],
    },
    http: { method: "POST", path: "/policies/{policy_id}/pause" },
  },
  {
    name: "generate_rules_from_age",
    description:
      "Auto-generate age-appropriate rules for a policy based on the child's birth date. Replaces existing rules with defaults for the child's age group.",
    input_schema: {
      type: "object",
      properties: { policy_id: str("Policy UUID") },
      required: ["policy_id"],
    },
    http: { method: "POST", path: "/policies/{policy_id}/generate-from-age" },
  },

  // -- Rules -------------------------------------------------
  {
    name: "list_rules",
    description:
      "List all rules in a policy. Returns each rule's category, enabled status, and JSON config.",
    input_schema: {
      type: "object",
      properties: { policy_id: str("Policy UUID") },
      required: ["policy_id"],
    },
    http: { method: "GET", path: "/policies/{policy_id}/rules" },
  },
  {
    name: "create_rule",
    description:
      "Create a new rule in a policy. Category must be one of the 45 supported categories. Config is a JSON object specific to the category.",
    input_schema: {
      type: "object",
      properties: {
        policy_id: str("Policy UUID"),
        category: str(
          "Rule category (e.g., time_daily_limit, content_rating, web_safesearch)"
        ),
        enabled: { type: "boolean", description: "Whether the rule is active" },
        config: {
          type: "object",
          description: "Category-specific configuration JSON",
        },
      },
      required: ["policy_id", "category", "enabled", "config"],
    },
    http: { method: "POST", path: "/policies/{policy_id}/rules" },
  },
  {
    name: "bulk_upsert_rules",
    description:
      "Create or update multiple rules at once for a policy.",
    input_schema: {
      type: "object",
      properties: {
        policy_id: str("Policy UUID"),
        rules: {
          type: "array",
          description:
            "Array of rule objects with category, enabled, and config",
          items: { type: "object" },
        },
      },
      required: ["policy_id", "rules"],
    },
    http: { method: "PUT", path: "/policies/{policy_id}/rules/bulk" },
  },
  {
    name: "update_rule",
    description: "Update a specific rule's enabled status or config.",
    input_schema: {
      type: "object",
      properties: {
        rule_id: str("Rule UUID"),
        enabled: { type: "boolean", description: "Whether the rule is active" },
        config: {
          type: "object",
          description: "Updated configuration JSON",
        },
      },
      required: ["rule_id"],
    },
    http: { method: "PUT", path: "/rules/{rule_id}" },
  },
  {
    name: "delete_rule",
    description: "Delete a specific rule from a policy.",
    input_schema: {
      type: "object",
      properties: { rule_id: str("Rule UUID") },
      required: ["rule_id"],
    },
    http: { method: "DELETE", path: "/rules/{rule_id}" },
  },

  // -- Platforms ---------------------------------------------
  {
    name: "list_platforms",
    description:
      "List all platforms Phosra can integrate with, including their category, compliance tier, auth type, and capabilities.",
    input_schema: { type: "object", properties: {}, required: [] },
    http: { method: "GET", path: "/platforms" },
  },
  {
    name: "get_platform",
    description:
      "Get details of a specific platform including capabilities and manual setup steps.",
    input_schema: {
      type: "object",
      properties: {
        platform_id: str(
          "Platform ID (e.g., 'nextdns', 'android', 'netflix')"
        ),
      },
      required: ["platform_id"],
    },
    http: { method: "GET", path: "/platforms/{platform_id}" },
  },
  {
    name: "list_platforms_by_category",
    description:
      "Filter platforms by category: dns, streaming, gaming, device, browser.",
    input_schema: {
      type: "object",
      properties: { category: str("Platform category") },
      required: ["category"],
    },
    http: { method: "GET", path: "/platforms/by-category" },
  },
  {
    name: "list_platforms_by_capability",
    description:
      "Filter platforms by capability: web_filtering, content_rating, time_limit, etc.",
    input_schema: {
      type: "object",
      properties: { capability: str("Capability name") },
      required: ["capability"],
    },
    http: { method: "GET", path: "/platforms/by-capability" },
  },

  // -- Compliance Links --------------------------------------
  {
    name: "list_compliance_links",
    description:
      "List all platform connections for a family, showing verification status and last enforcement.",
    input_schema: {
      type: "object",
      properties: { family_id: str("Family UUID") },
      required: ["family_id"],
    },
    http: { method: "GET", path: "/families/{family_id}/compliance" },
  },
  {
    name: "connect_platform",
    description:
      "Connect a platform to the family by providing credentials for verification.",
    input_schema: {
      type: "object",
      properties: {
        family_id: str("Family UUID"),
        platform_id: str("Platform ID"),
        credentials: {
          type: "object",
          description:
            "Platform-specific credentials (api_key, oauth_token, etc.)",
        },
      },
      required: ["family_id", "platform_id", "credentials"],
    },
    http: { method: "POST", path: "/compliance" },
  },
  {
    name: "disconnect_platform",
    description: "Disconnect a platform from the family.",
    input_schema: {
      type: "object",
      properties: { link_id: str("Compliance link UUID") },
      required: ["link_id"],
    },
    http: { method: "DELETE", path: "/compliance/{link_id}" },
  },
  {
    name: "verify_connection",
    description:
      "Re-verify an existing platform connection (test that credentials still work).",
    input_schema: {
      type: "object",
      properties: { link_id: str("Compliance link UUID") },
      required: ["link_id"],
    },
    http: { method: "POST", path: "/compliance/{link_id}/verify" },
  },

  // -- Enforcement -------------------------------------------
  {
    name: "trigger_enforcement",
    description:
      "Push the child's active policy rules to connected platforms. If platform_ids is provided, only those platforms are targeted; otherwise enforcement fans out to ALL connected platforms. Returns the job ID for tracking.",
    input_schema: {
      type: "object",
      properties: {
        child_id: str("Child UUID"),
        platform_ids: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional list of platform IDs to target (e.g., ['netflix', 'youtube']). If omitted, pushes to ALL connected platforms. Valid IDs: netflix, paramount_plus, youtube_tv, peacock, prime_video, youtube, nextdns, android, fire_tablet, apple_watch, fire_tv_stick.",
        },
      },
      required: ["child_id"],
    },
    http: { method: "POST", path: "/children/{child_id}/enforce" },
  },
  {
    name: "list_enforcement_jobs",
    description: "List enforcement job history for a child.",
    input_schema: {
      type: "object",
      properties: { child_id: str("Child UUID") },
      required: ["child_id"],
    },
    http: { method: "GET", path: "/children/{child_id}/enforcement/jobs" },
  },
  {
    name: "get_enforcement_job",
    description: "Get status of a specific enforcement job.",
    input_schema: {
      type: "object",
      properties: { job_id: str("Enforcement job UUID") },
      required: ["job_id"],
    },
    http: { method: "GET", path: "/enforcement/jobs/{job_id}" },
  },
  {
    name: "get_enforcement_results",
    description:
      "Get per-platform results of an enforcement job: rules_applied, rules_skipped, rules_failed, and any error messages.",
    input_schema: {
      type: "object",
      properties: { job_id: str("Enforcement job UUID") },
      required: ["job_id"],
    },
    http: { method: "GET", path: "/enforcement/jobs/{job_id}/results" },
  },
  {
    name: "retry_enforcement",
    description: "Retry a failed enforcement job.",
    input_schema: {
      type: "object",
      properties: { job_id: str("Enforcement job UUID") },
      required: ["job_id"],
    },
    http: { method: "POST", path: "/enforcement/jobs/{job_id}/retry" },
  },

  // -- Ratings -----------------------------------------------
  {
    name: "list_rating_systems",
    description:
      "List all 5 content rating systems (MPAA, TV, ESRB, PEGI, CSM).",
    input_schema: { type: "object", properties: {}, required: [] },
    http: { method: "GET", path: "/ratings/systems" },
  },
  {
    name: "get_ratings_for_age",
    description:
      "Get recommended maximum ratings across all systems for a specific age.",
    input_schema: {
      type: "object",
      properties: { age: int("Child's age in years") },
      required: ["age"],
    },
    http: { method: "GET", path: "/ratings/by-age" },
  },
  {
    name: "convert_rating",
    description:
      "Get equivalent ratings in other systems for a given rating (cross-system mapping).",
    input_schema: {
      type: "object",
      properties: { rating_id: str("Rating UUID") },
      required: ["rating_id"],
    },
    http: { method: "GET", path: "/ratings/{rating_id}/convert" },
  },

  // -- Reports -----------------------------------------------
  {
    name: "family_overview_report",
    description:
      "Get a health dashboard for a family: children, active policies, sync status, recent enforcement jobs, and recommendations.",
    input_schema: {
      type: "object",
      properties: { family_id: str("Family UUID") },
      required: ["family_id"],
    },
    http: { method: "GET", path: "/families/{family_id}/reports/overview" },
  },

  // -- Webhooks ----------------------------------------------
  {
    name: "list_webhooks",
    description: "List webhook subscriptions for a family.",
    input_schema: {
      type: "object",
      properties: { family_id: str("Family UUID") },
      required: ["family_id"],
    },
    http: { method: "GET", path: "/families/{family_id}/webhooks" },
  },
  {
    name: "create_webhook",
    description:
      "Register a webhook endpoint to receive event notifications.",
    input_schema: {
      type: "object",
      properties: {
        family_id: str("Family UUID"),
        url: str("Webhook URL"),
        events: {
          type: "array",
          items: { type: "string" },
          description: "Events to subscribe to",
        },
      },
      required: ["family_id", "url", "events"],
    },
    http: { method: "POST", path: "/webhooks" },
  },
  {
    name: "test_webhook",
    description: "Send a test delivery to a webhook endpoint.",
    input_schema: {
      type: "object",
      properties: { webhook_id: str("Webhook UUID") },
      required: ["webhook_id"],
    },
    http: { method: "POST", path: "/webhooks/{webhook_id}/test" },
  },

  // -- Sources -----------------------------------------------
  {
    name: "list_available_sources",
    description:
      "List all available parental control source adapters that can be connected.",
    input_schema: { type: "object", properties: {}, required: [] },
    http: { method: "GET", path: "/sources/available" },
  },
  {
    name: "connect_source",
    description:
      "Connect a parental control app as a source for a child.",
    input_schema: {
      type: "object",
      properties: {
        child_id: str("Child ID"),
        family_id: str("Family ID"),
        source: str("Source slug (e.g., 'bark', 'qustodio')"),
        credentials: {
          type: "object",
          description: "Source credentials (for managed sources)",
        },
        auto_sync: {
          type: "boolean",
          description: "Enable automatic sync on policy changes",
        },
      },
      required: ["child_id", "family_id", "source"],
    },
    http: { method: "POST", path: "/sources" },
  },
  {
    name: "get_source",
    description: "Get details of a connected source.",
    input_schema: {
      type: "object",
      properties: { source_id: str("Source ID") },
      required: ["source_id"],
    },
    http: { method: "GET", path: "/sources/{source_id}" },
  },
  {
    name: "list_child_sources",
    description: "List all connected sources for a child.",
    input_schema: {
      type: "object",
      properties: { child_id: str("Child ID") },
      required: ["child_id"],
    },
    http: { method: "GET", path: "/children/{child_id}/sources" },
  },
  {
    name: "sync_source",
    description:
      "Push all active policy rules to a connected source.",
    input_schema: {
      type: "object",
      properties: {
        source_id: str("Source ID"),
        sync_mode: str("Sync mode: full or incremental (default: full)"),
      },
      required: ["source_id"],
    },
    http: { method: "POST", path: "/sources/{source_id}/sync" },
  },
  {
    name: "push_source_rule",
    description: "Push a single rule to a connected source.",
    input_schema: {
      type: "object",
      properties: {
        source_id: str("Source ID"),
        category: str("Rule category"),
        value: {
          type: "object",
          description: "Rule value/config",
        },
      },
      required: ["source_id", "category"],
    },
    http: { method: "POST", path: "/sources/{source_id}/rules" },
  },
  {
    name: "get_source_guided_steps",
    description:
      "Get manual setup instructions for a guided-tier source.",
    input_schema: {
      type: "object",
      properties: {
        source_id: str("Source ID"),
        category: str("Rule category for guided steps"),
      },
      required: ["source_id", "category"],
    },
    http: {
      method: "GET",
      path: "/sources/{source_id}/guide/{category}",
    },
  },
  {
    name: "list_source_sync_jobs",
    description: "List sync job history for a source.",
    input_schema: {
      type: "object",
      properties: {
        source_id: str("Source ID"),
        limit: int("Max jobs to return"),
      },
      required: ["source_id"],
    },
    http: { method: "GET", path: "/sources/{source_id}/jobs" },
  },
  {
    name: "get_source_sync_results",
    description: "Get per-rule results for a sync job.",
    input_schema: {
      type: "object",
      properties: {
        source_id: str("Source ID"),
        job_id: str("Sync job ID"),
      },
      required: ["source_id", "job_id"],
    },
    http: {
      method: "GET",
      path: "/sources/{source_id}/jobs/{job_id}/results",
    },
  },
  {
    name: "disconnect_source",
    description: "Disconnect a parental control source.",
    input_schema: {
      type: "object",
      properties: { source_id: str("Source ID") },
      required: ["source_id"],
    },
    http: { method: "DELETE", path: "/sources/{source_id}" },
  },
];

/**
 * Resolve a tool path with parameter substitution.
 *
 * Path parameters like {family_id} are extracted from input.
 * For GET requests, remaining params become query-string pairs.
 * For non-GET requests, remaining params become JSON body fields.
 */
export function resolveToolPath(
  tool: ToolDefinition,
  input: Record<string, unknown>
): {
  path: string;
  query: Record<string, string>;
  body: Record<string, unknown> | null;
} {
  let path = tool.http.path;
  const query: Record<string, string> = {};
  const bodyKeys: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    const placeholder = `{${key}}`;
    if (path.includes(placeholder)) {
      path = path.replace(placeholder, String(value));
    } else if (tool.http.method === "GET") {
      query[key] = String(value);
    } else {
      bodyKeys[key] = value;
    }
  }

  const body =
    tool.http.method === "GET" || Object.keys(bodyKeys).length === 0
      ? null
      : bodyKeys;

  return { path, query, body };
}
