import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Ingest a device event from the Go API bridge.
 *
 * Routes to the appropriate analysis path based on on-device score:
 *   >80 → fast-path to 3-agent debate (dangerous)
 *   <20 → mark cleared (safe)
 *   20-80 or no score → queue for batch analysis
 */
export const ingestEvent = mutation({
  args: {
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
    onDeviceScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("deviceEvents", {
      ...args,
      analysisStage: "pending",
      parentNotified: false,
    });

    // Route based on on-device ML score
    if (args.onDeviceScore !== undefined && args.onDeviceScore > 80) {
      // High risk — fast-path directly to debate
      await ctx.scheduler.runAfter(
        0,
        internal.safetyAgent.triggerDebate,
        { eventId }
      );
    } else if (args.onDeviceScore !== undefined && args.onDeviceScore < 20) {
      // Clearly safe — mark cleared, skip further analysis
      await ctx.db.patch(eventId, { analysisStage: "on_device_cleared" });
    } else {
      // Ambiguous or no on-device score — queue for batch analysis
      await ctx.scheduler.runAfter(
        0,
        internal.safetyAgent.addToBatch,
        { eventId, childId: args.childId, familyId: args.familyId }
      );
    }

    return eventId;
  },
});

/**
 * Get recent events for a child (parent dashboard).
 * Returns newest first, up to `limit` events.
 */
export const getChildEvents = query({
  args: {
    childId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { childId, limit }) => {
    return await ctx.db
      .query("deviceEvents")
      .withIndex("by_child_timestamp", (q) => q.eq("childId", childId))
      .order("desc")
      .take(limit ?? 50);
  },
});

/**
 * Get events pending analysis (for batch processor cron).
 */
export const getPendingEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("deviceEvents")
      .withIndex("by_stage", (q) => q.eq("analysisStage", "pending"))
      .take(limit ?? 100);
  },
});

/**
 * Internal: update analysis results on an event.
 */
export const updateAnalysis = internalMutation({
  args: {
    eventId: v.id("deviceEvents"),
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
    parentNotified: v.optional(v.boolean()),
  },
  handler: async (ctx, { eventId, ...updates }) => {
    await ctx.db.patch(eventId, updates);
  },
});
