import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get risk profile for a child (parent dashboard, real-time subscription).
 */
export const getByChild = query({
  args: { childId: v.string() },
  handler: async (ctx, { childId }) => {
    return await ctx.db
      .query("childRiskProfiles")
      .withIndex("by_child", (q) => q.eq("childId", childId))
      .first();
  },
});

/**
 * Get all risk profiles for a family.
 */
export const getByFamily = query({
  args: { familyId: v.string() },
  handler: async (ctx, { familyId }) => {
    return await ctx.db
      .query("childRiskProfiles")
      .withIndex("by_family", (q) => q.eq("familyId", familyId))
      .collect();
  },
});

/**
 * Update risk profile after batch analysis.
 */
export const updateFromBatch = internalMutation({
  args: {
    childId: v.string(),
    familyId: v.string(),
    batchScore: v.number(),
    patterns: v.array(v.string()),
    eventCount: v.number(),
  },
  handler: async (ctx, { childId, familyId, batchScore, patterns, eventCount }) => {
    const existing = await ctx.db
      .query("childRiskProfiles")
      .withIndex("by_child", (q) => q.eq("childId", childId))
      .first();

    if (existing) {
      // Rolling average: blend new batch score with existing
      const blended = Math.round(existing.currentDayScore * 0.7 + batchScore * 0.3);

      // Determine trend based on score movement
      const weeklyTrend =
        blended > existing.baselineScore + 20
          ? ("critical" as const)
          : blended > existing.baselineScore + 10
            ? ("concerning" as const)
            : blended < existing.baselineScore - 5
              ? ("improving" as const)
              : ("stable" as const);

      // Merge detected patterns (deduplicate)
      const allPatterns = [
        ...new Set([...existing.detectedPatterns, ...patterns]),
      ];

      await ctx.db.patch(existing._id, {
        currentDayScore: blended,
        weeklyTrend,
        detectedPatterns: allPatterns,
        totalEventsToday: existing.totalEventsToday + eventCount,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("childRiskProfiles", {
        childId,
        familyId,
        baselineScore: batchScore,
        currentDayScore: batchScore,
        weeklyTrend: "stable",
        detectedPatterns: patterns,
        lastUpdated: Date.now(),
        totalEventsToday: eventCount,
        alertsSentToday: 0,
      });
    }
  },
});
