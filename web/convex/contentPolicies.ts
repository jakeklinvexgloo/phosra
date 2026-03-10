import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const structuredPolicyValidator = v.object({
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
});

/** Get content policy for a child. */
export const getByChild = query({
  args: { childId: v.string() },
  handler: async (ctx, { childId }) => {
    return await ctx.db
      .query("contentPolicies")
      .withIndex("by_child", (q) => q.eq("childId", childId))
      .first();
  },
});

/** Get all content policies for a family. */
export const getByFamily = query({
  args: { familyId: v.string() },
  handler: async (ctx, { familyId }) => {
    return await ctx.db
      .query("contentPolicies")
      .withIndex("by_family", (q) => q.eq("familyId", familyId))
      .collect();
  },
});

/** Create a new content policy from agent interpretation. */
export const create = internalMutation({
  args: {
    childId: v.string(),
    familyId: v.string(),
    ageYears: v.number(),
    naturalLanguagePolicy: v.string(),
    structuredPolicy: structuredPolicyValidator,
    agentInterpretation: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("contentPolicies", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update an existing content policy after re-interpretation. */
export const update = internalMutation({
  args: {
    policyId: v.id("contentPolicies"),
    naturalLanguagePolicy: v.string(),
    structuredPolicy: structuredPolicyValidator,
    agentInterpretation: v.string(),
  },
  handler: async (ctx, { policyId, ...updates }) => {
    await ctx.db.patch(policyId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
