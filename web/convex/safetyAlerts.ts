import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a safety alert from a completed debate.
 */
export const createFromDebate = internalMutation({
  args: {
    debateId: v.id("safetyDebates"),
    eventId: v.id("deviceEvents"),
    childId: v.string(),
    familyId: v.string(),
    score: v.number(),
  },
  handler: async (ctx, { debateId, eventId, childId, familyId, score }) => {
    const event = await ctx.db.get(eventId);
    if (!event) return;

    const severity =
      score >= 80
        ? ("emergency" as const)
        : score >= 65
          ? ("alert" as const)
          : score >= 40
            ? ("warning" as const)
            : ("info" as const);

    const title = `${severity === "emergency" ? "URGENT: " : ""}Safety concern detected on ${event.platform ?? "device"}`;
    const summary = `${event.eventType} event scored ${score}/100 after 3-agent review. Content: "${event.content.slice(0, 120)}${event.content.length > 120 ? "..." : ""}"`;

    await ctx.db.insert("safetyAlerts", {
      familyId,
      childId,
      eventId,
      debateId,
      severity,
      title,
      summary,
      score,
      sentAt: Date.now(),
      channel: severity === "emergency" ? "sms" : "push",
    });

    // Mark event as parent-notified
    await ctx.db.patch(eventId, { parentNotified: true });

    // Update risk profile
    const profile = await ctx.db
      .query("childRiskProfiles")
      .withIndex("by_child", (q) => q.eq("childId", childId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        currentDayScore: Math.max(profile.currentDayScore, score),
        alertsSentToday: profile.alertsSentToday + 1,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("childRiskProfiles", {
        childId,
        familyId,
        baselineScore: 0,
        currentDayScore: score,
        weeklyTrend: "stable",
        detectedPatterns: [],
        lastUpdated: Date.now(),
        totalEventsToday: 1,
        alertsSentToday: 1,
      });
    }
  },
});

/**
 * Get alerts for a specific child (parent dashboard).
 */
export const getForChild = query({
  args: {
    childId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { childId, limit }) => {
    return await ctx.db
      .query("safetyAlerts")
      .withIndex("by_child", (q) => q.eq("childId", childId))
      .order("desc")
      .take(limit ?? 20);
  },
});

/**
 * Get alerts for a family (parent dashboard).
 */
export const getByFamily = query({
  args: {
    familyId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { familyId, limit }) => {
    return await ctx.db
      .query("safetyAlerts")
      .withIndex("by_family", (q) => q.eq("familyId", familyId))
      .order("desc")
      .take(limit ?? 20);
  },
});

/**
 * Acknowledge an alert (parent marks as read).
 */
export const acknowledge = internalMutation({
  args: {
    alertId: v.id("safetyAlerts"),
  },
  handler: async (ctx, { alertId }) => {
    await ctx.db.patch(alertId, {
      acknowledgedAt: Date.now(),
    });
  },
});
