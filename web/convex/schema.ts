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
});
