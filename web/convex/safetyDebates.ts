import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: { eventId: v.id("deviceEvents"), childId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("safetyDebates", {
      ...args,
      triggeredAt: Date.now(),
      debateCompleted: false,
      shownToParent: false,
    });
  },
});

export const complete = internalMutation({
  args: {
    debateId: v.id("safetyDebates"),
    strictAgentScore: v.number(),
    strictAgentReasoning: v.string(),
    liberalAgentScore: v.number(),
    liberalAgentReasoning: v.string(),
    contextAgentScore: v.number(),
    contextAgentFacts: v.string(),
    weightedScore: v.number(),
    finalDecision: v.string(),
  },
  handler: async (ctx, { debateId, ...fields }) => {
    await ctx.db.patch(debateId, { ...fields, debateCompleted: true });
  },
});

// Parent can see the full debate for transparency
export const getDebateForParent = query({
  args: { debateId: v.id("safetyDebates") },
  handler: async (ctx, { debateId }) => {
    return await ctx.db.get(debateId);
  },
});
