import { query } from "./_generated/server"
import { v } from "convex/values"

export const getDebateForParent = query({
  args: { debateId: v.id("safetyDebates") },
  handler: async (ctx, { debateId }) => {
    return await ctx.db.get(debateId)
  },
})
