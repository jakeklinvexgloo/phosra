import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BATCH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// =====================================================
// AGENT PROMPTS (3 agents with different biases)
// =====================================================

const STRICT_AGENT_PROMPT = `You are a child safety expert with a strong bias toward protecting children.
Your role: Evaluate potential risks in a child's device activity.
When in doubt, flag it. False positives are acceptable; missed threats are not.
You care about: grooming patterns, predatory contact, self-harm, dangerous content, cyberbullying.
Return JSON: {"score": 0-100, "reasoning": "2-3 sentences", "key_concerns": ["concern1"]}`;

const LIBERAL_AGENT_PROMPT = `You are a child development expert and digital rights advocate.
Your role: Evaluate if flagged content is actually concerning, or if it's normal teen/child behavior being over-monitored.
You care about: age-appropriate exploration, privacy, avoiding over-restriction that damages trust.
Context matters: "how to pick a lock" could be curiosity, a game, or a problem.
Return JSON: {"score": 0-100, "reasoning": "2-3 sentences", "context_factors": ["factor1"]}`;

const CONTEXT_AGENT_PROMPT = `You are a neutral fact extractor. No normative judgment — only facts.
Your role: Extract objective information about this activity.
Answer factually: What platform? What topic category? What is the child's apparent intent?
Is this a single event or part of a pattern? What's the most likely innocent explanation?
Return JSON: {"score": 0-100, "facts": ["fact1", "fact2"], "likely_intent": "description", "pattern_type": "isolated|recurring|escalating"}`;

// =====================================================
// BATCH MANAGEMENT
// =====================================================

/**
 * Add an event to the current 15-minute batch for a child.
 * Creates a new batch if none exists for the current window.
 */
export const addToBatch = internalMutation({
  args: {
    eventId: v.id("deviceEvents"),
    childId: v.string(),
    familyId: v.string(),
  },
  handler: async (ctx, { eventId, childId, familyId }) => {
    const now = Date.now();
    const windowStart = Math.floor(now / BATCH_WINDOW_MS) * BATCH_WINDOW_MS;
    const windowEnd = windowStart + BATCH_WINDOW_MS;

    // Mark event as batch-queued
    await ctx.db.patch(eventId, { analysisStage: "batch_queued" });

    // Find or create batch for this child + window
    const existingBatch = await ctx.db
      .query("activityBatches")
      .withIndex("by_child_window", (q) =>
        q.eq("childId", childId).eq("windowStart", windowStart)
      )
      .first();

    if (existingBatch) {
      await ctx.db.patch(existingBatch._id, {
        eventIds: [...existingBatch.eventIds, eventId],
        eventCount: existingBatch.eventCount + 1,
      });
    } else {
      await ctx.db.insert("activityBatches", {
        childId,
        familyId,
        windowStart,
        windowEnd,
        eventIds: [eventId],
        eventCount: 1,
        patternsDetected: [],
        analyzed: false,
      });
    }
  },
});

// =====================================================
// TRIGGER 3-AGENT DEBATE
// =====================================================

/**
 * Trigger a 3-agent safety debate for a borderline event.
 *
 * Creates the debate record and schedules three parallel agent actions:
 *   1. Strict Agent (protective, weights risk higher)
 *   2. Liberal Agent (privacy-respecting, weights autonomy)
 *   3. Context Agent (factual, checks child age/history/platform norms)
 *
 * After all three complete, updateDebateAgent produces the verdict.
 */
export const triggerDebate = internalMutation({
  args: {
    eventId: v.id("deviceEvents"),
  },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) return;

    // Mark event as debate-queued
    await ctx.db.patch(eventId, { analysisStage: "debate_queued" });

    // Create debate record
    const debateId = await ctx.db.insert("safetyDebates", {
      eventId,
      childId: event.childId,
      triggeredAt: Date.now(),
      debateCompleted: false,
      shownToParent: false,
    });

    // Schedule the three agent evaluations in parallel
    await ctx.scheduler.runAfter(
      0,
      internal.safetyAgent.runStrictAgent,
      { debateId, eventId }
    );
    await ctx.scheduler.runAfter(
      0,
      internal.safetyAgent.runLiberalAgent,
      { debateId, eventId }
    );
    await ctx.scheduler.runAfter(
      0,
      internal.safetyAgent.runContextAgent,
      { debateId, eventId }
    );
  },
});

// =====================================================
// STRICT AGENT — weights child protection heavily
// =====================================================

export const runStrictAgent = internalAction({
  args: {
    debateId: v.id("safetyDebates"),
    eventId: v.id("deviceEvents"),
  },
  handler: async (ctx, { debateId, eventId }) => {
    const event = await ctx.runQuery(internal.safetyAgent.getEvent, { eventId });
    if (!event) return;

    const recentEvents = await ctx.runQuery(internal.safetyAgent.getRecentForChild, {
      childId: event.childId,
      limit: 10,
    });
    const contextSummary = recentEvents
      .map((e: any) => `[${e.eventType}] ${e.content.slice(0, 100)}`)
      .join("\n");

    const result = await runAgent("strict", STRICT_AGENT_PROMPT, buildEventDescription(event, contextSummary));

    await ctx.runMutation(internal.safetyAgent.updateDebateAgent, {
      debateId,
      agent: "strict",
      score: result.score,
      reasoning: result.reasoning,
    });
  },
});

// =====================================================
// LIBERAL AGENT — weights child privacy and autonomy
// =====================================================

export const runLiberalAgent = internalAction({
  args: {
    debateId: v.id("safetyDebates"),
    eventId: v.id("deviceEvents"),
  },
  handler: async (ctx, { debateId, eventId }) => {
    const event = await ctx.runQuery(internal.safetyAgent.getEvent, { eventId });
    if (!event) return;

    const recentEvents = await ctx.runQuery(internal.safetyAgent.getRecentForChild, {
      childId: event.childId,
      limit: 10,
    });
    const contextSummary = recentEvents
      .map((e: any) => `[${e.eventType}] ${e.content.slice(0, 100)}`)
      .join("\n");

    const result = await runAgent("liberal", LIBERAL_AGENT_PROMPT, buildEventDescription(event, contextSummary));

    await ctx.runMutation(internal.safetyAgent.updateDebateAgent, {
      debateId,
      agent: "liberal",
      score: result.score,
      reasoning: result.reasoning,
    });
  },
});

// =====================================================
// CONTEXT AGENT — factual analysis, no position
// =====================================================

export const runContextAgent = internalAction({
  args: {
    debateId: v.id("safetyDebates"),
    eventId: v.id("deviceEvents"),
  },
  handler: async (ctx, { debateId, eventId }) => {
    const event = await ctx.runQuery(internal.safetyAgent.getEvent, { eventId });
    if (!event) return;

    const recentEvents = await ctx.runQuery(internal.safetyAgent.getRecentForChild, {
      childId: event.childId,
      limit: 10,
    });
    const contextSummary = recentEvents
      .map((e: any) => `[${e.eventType}] ${e.content.slice(0, 100)}`)
      .join("\n");

    const result = await runAgent("context", CONTEXT_AGENT_PROMPT, buildEventDescription(event, contextSummary));

    await ctx.runMutation(internal.safetyAgent.updateDebateAgent, {
      debateId,
      agent: "context",
      score: result.score,
      facts: result.reasoning,
    });
  },
});

// =====================================================
// BATCH ANALYSIS (15-minute windows)
// =====================================================

export const analyzeBatch = internalAction({
  args: { batchId: v.id("activityBatches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.runQuery(internal.safetyAgent.getBatch, { batchId });
    if (!batch || batch.analyzed) return;

    const profile = await ctx.runQuery(internal.childRiskProfiles.getByChild, {
      childId: batch.childId,
    });

    // Fetch all events in this batch
    const events: any[] = [];
    for (const eid of batch.eventIds) {
      const e = await ctx.runQuery(internal.safetyAgent.getEvent, { eventId: eid });
      if (e) events.push(e);
    }

    const eventsText = events
      .map((e) => `[${e.eventType}] ${e.content.slice(0, 150)}`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: `Analyze this 15-minute window of a child's device activity for safety patterns.
Child's baseline risk: ${profile?.baselineScore ?? 20}/100
Known patterns: ${profile?.detectedPatterns?.join(", ") || "none"}

Activity (${events.length} events):
${eventsText}

Detect: grooming sequences, self-harm escalation, bullying, inappropriate content patterns.
JSON: {"batchScore": 0-100, "patterns": [], "alertRequired": false, "alertReason": "", "highRiskEventIndices": []}`
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    let result: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { batchScore: 0, patterns: [] };
    } catch {
      result = { batchScore: 0, patterns: [], alertRequired: false };
    }

    await ctx.runMutation(internal.safetyAgent.markBatchAnalyzed, {
      batchId,
      batchScore: result.batchScore ?? 0,
      patternsDetected: result.patterns ?? [],
    });

    // Update child risk profile
    await ctx.runMutation(internal.childRiskProfiles.updateFromBatch, {
      childId: batch.childId,
      familyId: batch.familyId,
      batchScore: result.batchScore ?? 0,
      patterns: result.patterns ?? [],
      eventCount: events.length,
    });

    // If batch has high-risk events, trigger debates on them
    if (result.alertRequired && result.highRiskEventIndices?.length > 0) {
      for (const idx of result.highRiskEventIndices.slice(0, 3)) {
        const event = events[idx];
        if (event) {
          await ctx.runMutation(internal.safetyAgent.triggerDebate, { eventId: event._id });
        }
      }
    }
  },
});

// =====================================================
// INTERNAL QUERIES & MUTATIONS
// =====================================================

/** Read a single event (used by agent actions). */
export const getEvent = internalMutation({
  args: { eventId: v.id("deviceEvents") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

/** Get recent events for a child (context for agents). */
export const getRecentForChild = internalMutation({
  args: {
    childId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, { childId, limit }) => {
    return await ctx.db
      .query("deviceEvents")
      .withIndex("by_child_timestamp", (q) => q.eq("childId", childId))
      .order("desc")
      .take(limit);
  },
});

/** Get a batch record. */
export const getBatch = internalMutation({
  args: { batchId: v.id("activityBatches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db.get(batchId);
  },
});

/** Mark a batch as analyzed with results. */
export const markBatchAnalyzed = internalMutation({
  args: {
    batchId: v.id("activityBatches"),
    batchScore: v.number(),
    patternsDetected: v.array(v.string()),
  },
  handler: async (ctx, { batchId, batchScore, patternsDetected }) => {
    await ctx.db.patch(batchId, {
      batchScore,
      patternsDetected,
      analyzed: true,
    });
  },
});

/** Update a single agent's score in a debate, then check if all three are done. */
export const updateDebateAgent = internalMutation({
  args: {
    debateId: v.id("safetyDebates"),
    agent: v.union(
      v.literal("strict"),
      v.literal("liberal"),
      v.literal("context")
    ),
    score: v.number(),
    reasoning: v.optional(v.string()),
    facts: v.optional(v.string()),
  },
  handler: async (ctx, { debateId, agent, score, reasoning, facts }) => {
    const updates: Record<string, unknown> = {};

    if (agent === "strict") {
      updates.strictAgentScore = score;
      updates.strictAgentReasoning = reasoning;
    } else if (agent === "liberal") {
      updates.liberalAgentScore = score;
      updates.liberalAgentReasoning = reasoning;
    } else if (agent === "context") {
      updates.contextAgentScore = score;
      updates.contextAgentFacts = facts;
    }

    await ctx.db.patch(debateId, updates);

    // Check if all three agents have reported
    const debate = await ctx.db.get(debateId);
    if (!debate) return;

    const allDone =
      debate.strictAgentScore !== undefined &&
      debate.liberalAgentScore !== undefined &&
      debate.contextAgentScore !== undefined;

    if (allDone) {
      // Weighted vote: strict 40%, liberal 30%, context 30%
      const weighted =
        debate.strictAgentScore! * 0.4 +
        debate.liberalAgentScore! * 0.3 +
        debate.contextAgentScore! * 0.3;

      const decision = weighted > 65 ? "alert" : "monitor";

      await ctx.db.patch(debateId, {
        weightedScore: Math.round(weighted),
        finalDecision: decision,
        debateCompleted: true,
      });

      // Update the original event
      await ctx.db.patch(debate.eventId, {
        analysisStage: "completed",
        finalScore: Math.round(weighted),
        finalDecision: weighted > 80 ? "emergency" : decision,
      });

      // If alert-worthy, notify parent
      if (weighted > 65) {
        const event = await ctx.db.get(debate.eventId);
        if (event) {
          await ctx.scheduler.runAfter(
            0,
            internal.notifications.notifyParent,
            {
              childId: debate.childId,
              familyId: event.familyId,
              eventId: debate.eventId,
              debateId,
              severity: weighted > 80 ? "emergency" : "alert",
              score: Math.round(weighted),
              strictReasoning: debate.strictAgentReasoning ?? "",
              liberalReasoning: debate.liberalAgentReasoning ?? "",
            }
          );
        }
      }
    }
  },
});

// =====================================================
// HELPER: Call a single Claude agent
// =====================================================

function buildEventDescription(event: any, contextSummary: string): string {
  return `Event type: ${event.eventType}
Content: ${event.content}
App: ${event.appName ?? "unknown"}
Platform: ${event.platform ?? "unknown"}
Time: ${new Date(event.timestamp).toISOString()}

Recent activity context (last 10 events):
${contextSummary}`;
}

async function runAgent(
  role: "strict" | "liberal" | "context",
  systemPrompt: string,
  eventDescription: string
): Promise<{ score: number; reasoning: string }> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: "user", content: eventDescription }],
  });

  try {
    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50, reasoning: text };
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 50)),
      reasoning: String(parsed.reasoning || "").slice(0, 500),
    };
  } catch {
    return { score: 50, reasoning: `${role} agent failed to parse response.` };
  }
}
