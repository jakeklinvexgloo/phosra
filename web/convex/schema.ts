import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Raw device events from children's devices ──────────────────
  deviceEvents: defineTable({
    childId: v.string(),
    familyId: v.string(),
    eventType: v.union(
      v.literal("url_visit"),
      v.literal("app_open"),
      v.literal("message_sent"),
      v.literal("search_query"),
      v.literal("media_viewed"),
      v.literal("location_update")
    ),
    content: v.string(),
    appName: v.optional(v.string()),
    platform: v.optional(v.string()),
    timestamp: v.number(),
    // Analysis results (filled in by agents)
    onDeviceScore: v.optional(v.number()),
    analysisStage: v.union(
      v.literal("pending"),
      v.literal("on_device_cleared"),
      v.literal("batch_queued"),
      v.literal("debate_queued"),
      v.literal("completed")
    ),
    finalScore: v.optional(v.number()),
    finalDecision: v.optional(
      v.union(
        v.literal("safe"),
        v.literal("monitor"),
        v.literal("alert"),
        v.literal("emergency")
      )
    ),
    parentNotified: v.boolean(),
  })
    .index("by_child", ["childId"])
    .index("by_family", ["familyId"])
    .index("by_stage", ["analysisStage"])
    .index("by_child_timestamp", ["childId", "timestamp"]),

  // ── Batch analysis windows (15-min buckets per child) ──────────
  activityBatches: defineTable({
    childId: v.string(),
    familyId: v.string(),
    windowStart: v.number(),
    windowEnd: v.number(),
    eventIds: v.array(v.id("deviceEvents")),
    eventCount: v.number(),
    batchScore: v.optional(v.number()),
    patternsDetected: v.array(v.string()),
    analyzed: v.boolean(),
  })
    .index("by_child", ["childId"])
    .index("by_child_window", ["childId", "windowStart"]),

  // ── 3-agent debate results for borderline events ───────────────
  safetyDebates: defineTable({
    eventId: v.id("deviceEvents"),
    childId: v.string(),
    triggeredAt: v.number(),
    // Agent positions
    strictAgentScore: v.optional(v.number()),
    strictAgentReasoning: v.optional(v.string()),
    liberalAgentScore: v.optional(v.number()),
    liberalAgentReasoning: v.optional(v.string()),
    contextAgentScore: v.optional(v.number()),
    contextAgentFacts: v.optional(v.string()),
    // Final verdict
    weightedScore: v.optional(v.number()),
    finalDecision: v.optional(v.string()),
    debateCompleted: v.boolean(),
    // Parent transparency
    shownToParent: v.boolean(),
  })
    .index("by_event", ["eventId"])
    .index("by_child", ["childId"]),

  // ── Per-child risk profiles (rolling) ──────────────────────────
  childRiskProfiles: defineTable({
    childId: v.string(),
    familyId: v.string(),
    baselineScore: v.number(),
    currentDayScore: v.number(),
    weeklyTrend: v.union(
      v.literal("improving"),
      v.literal("stable"),
      v.literal("concerning"),
      v.literal("critical")
    ),
    detectedPatterns: v.array(v.string()),
    lastUpdated: v.number(),
    totalEventsToday: v.number(),
    alertsSentToday: v.number(),
  })
    .index("by_child", ["childId"])
    .index("by_family", ["familyId"]),

  // ── Parent safety alerts ───────────────────────────────────────
  safetyAlerts: defineTable({
    familyId: v.string(),
    childId: v.string(),
    eventId: v.optional(v.id("deviceEvents")),
    debateId: v.optional(v.id("safetyDebates")),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("alert"),
      v.literal("emergency")
    ),
    title: v.string(),
    summary: v.string(),
    score: v.number(),
    sentAt: v.number(),
    acknowledgedAt: v.optional(v.number()),
    channel: v.string(),
  })
    .index("by_family", ["familyId"])
    .index("by_child", ["childId"]),

  // ── Streaming platform connections per family ────────────────
  streamingAccounts: defineTable({
    familyId: v.string(),
    platform: v.union(
      v.literal("netflix"), v.literal("peacock"), v.literal("disney_plus"),
      v.literal("prime_video"), v.literal("apple_tv"), v.literal("hulu")
    ),
    // Credentials stored encrypted — NEVER plaintext
    credentialRef: v.string(),  // reference to encrypted store, not actual creds
    childProfileName: v.optional(v.string()),
    lastAuditAt: v.optional(v.number()),
    lastAuditScore: v.optional(v.number()),
    connected: v.boolean(),
  })
    .index("by_family", ["familyId"])
    .index("by_family_platform", ["familyId", "platform"]),

  // ── Content metadata cache (from TMDB/CSM) ──────────────────
  contentMetadata: defineTable({
    tmdbId: v.optional(v.string()),
    imdbId: v.optional(v.string()),
    title: v.string(),
    contentType: v.union(v.literal("movie"), v.literal("tv_show"), v.literal("episode")),
    mpaaRating: v.optional(v.string()),
    tvRating: v.optional(v.string()),
    commonSenseAge: v.optional(v.number()),
    commonSenseScore: v.optional(v.number()),
    genres: v.array(v.string()),
    violenceScore: v.optional(v.number()),
    sexualityScore: v.optional(v.number()),
    languageScore: v.optional(v.number()),
    substanceScore: v.optional(v.number()),
    educationalValue: v.optional(v.number()),
    description: v.optional(v.string()),
    cachedAt: v.number(),
    platforms: v.array(v.string()),
  })
    .index("by_tmdb", ["tmdbId"])
    .index("by_title", ["title"]),

  // ── Per-child content policy (natural language → structured) ─
  contentPolicies: defineTable({
    childId: v.string(),
    familyId: v.string(),
    ageYears: v.number(),
    naturalLanguagePolicy: v.string(),
    structuredPolicy: v.object({
      maxMpaaRating: v.string(),
      maxTvRating: v.string(),
      maxCommonSenseAge: v.number(),
      maxViolenceScore: v.number(),
      maxSexualityScore: v.number(),
      maxLanguageScore: v.number(),
      maxSubstanceScore: v.number(),
      requireEducational: v.boolean(),
      blockedGenres: v.array(v.string()),
      allowedGenres: v.array(v.string()),
      notes: v.string(),
    }),
    agentInterpretation: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_child", ["childId"])
    .index("by_family", ["familyId"]),

  // ── Audit results — what's accessible in child's streaming profile
  streamingAudits: defineTable({
    familyId: v.string(),
    childId: v.string(),
    accountId: v.id("streamingAccounts"),
    auditedAt: v.number(),
    totalTitlesChecked: v.number(),
    flaggedTitles: v.array(v.object({
      title: v.string(),
      reason: v.string(),
      severity: v.union(v.literal("info"), v.literal("warning"), v.literal("concern")),
      contentId: v.optional(v.string()),
    })),
    overallScore: v.number(),
    recommendedActions: v.array(v.string()),
    agentReport: v.string(),
  })
    .index("by_family", ["familyId"])
    .index("by_child", ["childId"])
    .index("by_account", ["accountId"]),

  // ── Watch history (from platform monitoring) ─────────────────
  watchHistory: defineTable({
    childId: v.string(),
    familyId: v.string(),
    platform: v.string(),
    contentTitle: v.string(),
    contentId: v.optional(v.string()),
    watchedAt: v.number(),
    durationMinutes: v.optional(v.number()),
    policyCompliant: v.optional(v.boolean()),
    flaggedAt: v.optional(v.number()),
  })
    .index("by_child", ["childId"])
    .index("by_child_platform", ["childId", "platform"])
    .index("by_family", ["familyId"]),
});
