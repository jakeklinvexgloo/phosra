import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Interpret a parent's natural language content policy into structured rules.
 *
 * Example input: "She's 8, no violence, educational preferred"
 * Output: structured policy with rating limits, genre blocks, score thresholds
 */
export const interpretPolicy = internalAction({
  args: {
    childId: v.string(),
    familyId: v.string(),
    naturalLanguagePolicy: v.string(),
    childAge: v.number(),
  },
  handler: async (ctx, { childId, familyId, naturalLanguagePolicy, childAge }) => {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `You translate parental content policies into structured rules for streaming platforms.
Return JSON only, no explanation.`,
      messages: [{
        role: "user",
        content: `Child age: ${childAge}
Parent policy: "${naturalLanguagePolicy}"

Translate to structured rules:
{
  "maxMpaaRating": "G|PG|PG-13|R",
  "maxTvRating": "TV-Y|TV-Y7|TV-G|TV-PG|TV-14|TV-MA",
  "maxCommonSenseAge": <number>,
  "maxViolenceScore": 0-5,
  "maxSexualityScore": 0-5,
  "maxLanguageScore": 0-5,
  "maxSubstanceScore": 0-5,
  "requireEducational": true|false,
  "blockedGenres": [],
  "allowedGenres": [],
  "notes": "brief interpretation"
}`
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const policy = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

    // Store the interpreted policy
    const existingPolicy = await ctx.runQuery(internal.contentPolicies.getByChild, { childId });
    if (existingPolicy) {
      await ctx.runMutation(internal.contentPolicies.update, {
        policyId: existingPolicy._id,
        naturalLanguagePolicy,
        structuredPolicy: policy,
        agentInterpretation: policy.notes ?? "",
      });
    } else {
      await ctx.runMutation(internal.contentPolicies.create, {
        childId,
        familyId,
        ageYears: childAge,
        naturalLanguagePolicy,
        structuredPolicy: policy,
        agentInterpretation: policy.notes ?? "",
      });
    }

    return policy;
  },
});

/**
 * Audit a child's streaming profile against their content policy.
 *
 * Fetches the child's watch history and checks each title against
 * the structured policy for violations.
 */
export const auditStreamingProfile = internalAction({
  args: {
    childId: v.string(),
    familyId: v.string(),
    accountId: v.id("streamingAccounts"),
  },
  handler: async (ctx, { childId, familyId, accountId }) => {
    const account = await ctx.runQuery(internal.streamingAgent.getAccount, { accountId });
    if (!account) return;

    const policy = await ctx.runQuery(internal.contentPolicies.getByChild, { childId });
    if (!policy) return;

    // Get recent watch history for this child on this platform
    const history = await ctx.runQuery(internal.streamingAgent.getWatchHistory, {
      childId,
      platform: account.platform,
      limit: 50,
    });

    if (history.length === 0) return;

    const historyText = history
      .map((h: any) => `- "${h.contentTitle}" (watched ${new Date(h.watchedAt).toLocaleDateString()})`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are a streaming content auditor for child safety. Analyze watch history against a parent's content policy. Be factual and specific.`,
      messages: [{
        role: "user",
        content: `Child age: ${policy.ageYears}
Platform: ${account.platform}
Content policy: ${JSON.stringify(policy.structuredPolicy)}

Watch history (${history.length} titles):
${historyText}

For each title, assess if it likely violates the policy. Return JSON:
{
  "flaggedTitles": [{"title": "...", "reason": "...", "severity": "info|warning|concern"}],
  "overallScore": 0-100,
  "recommendedActions": ["action1"],
  "summary": "brief overall assessment"
}`
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    let result: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { flaggedTitles: [], overallScore: 100, recommendedActions: [], summary: "Analysis failed" };
    } catch {
      result = { flaggedTitles: [], overallScore: 100, recommendedActions: [], summary: "Parse error" };
    }

    // Store audit result
    await ctx.runMutation(internal.streamingAgent.storeAudit, {
      familyId,
      childId,
      accountId,
      totalTitlesChecked: history.length,
      flaggedTitles: (result.flaggedTitles ?? []).map((f: any) => ({
        title: String(f.title ?? ""),
        reason: String(f.reason ?? ""),
        severity: ["info", "warning", "concern"].includes(f.severity) ? f.severity : "info",
      })),
      overallScore: Math.max(0, Math.min(100, Number(result.overallScore) || 100)),
      recommendedActions: (result.recommendedActions ?? []).map(String),
      agentReport: String(result.summary ?? "").slice(0, 1000),
    });

    // Update account's last audit timestamp
    await ctx.runMutation(internal.streamingAgent.updateAccountAudit, {
      accountId,
      score: Math.max(0, Math.min(100, Number(result.overallScore) || 100)),
    });

    return result;
  },
});

// ── Internal queries/mutations ──────────────────────────────────

export const getAccount = internalAction({
  args: { accountId: v.id("streamingAccounts") },
  handler: async (ctx, { accountId }) => {
    return await ctx.runQuery(internal.streamingAgent.getAccountQuery, { accountId });
  },
});

export const getAccountQuery = internalAction({
  args: { accountId: v.id("streamingAccounts") },
  handler: async () => {
    // This should be a query — placeholder for proper Convex codegen
    return null;
  },
});

export const getWatchHistory = internalAction({
  args: {
    childId: v.string(),
    platform: v.string(),
    limit: v.number(),
  },
  handler: async () => {
    // This should be a query — placeholder for proper Convex codegen
    return [];
  },
});

export const storeAudit = internalAction({
  args: {
    familyId: v.string(),
    childId: v.string(),
    accountId: v.id("streamingAccounts"),
    totalTitlesChecked: v.number(),
    flaggedTitles: v.array(v.object({
      title: v.string(),
      reason: v.string(),
      severity: v.union(v.literal("info"), v.literal("warning"), v.literal("concern")),
    })),
    overallScore: v.number(),
    recommendedActions: v.array(v.string()),
    agentReport: v.string(),
  },
  handler: async () => {
    // Placeholder — proper implementation after Convex codegen
  },
});

export const updateAccountAudit = internalAction({
  args: {
    accountId: v.id("streamingAccounts"),
    score: v.number(),
  },
  handler: async () => {
    // Placeholder — proper implementation after Convex codegen
  },
});
