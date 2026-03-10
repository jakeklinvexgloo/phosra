import { query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Get streaming audit results for a child, most recent first.
 */
export const getForChild = query({
  args: { childId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { childId, limit }) => {
    return await ctx.db
      .query("streamingAudits")
      .withIndex("by_child", (q) => q.eq("childId", childId))
      .order("desc")
      .take(limit ?? 10)
  },
})
