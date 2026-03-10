import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const notifyParent = internalAction({
  args: {
    childId: v.string(),
    familyId: v.string(),
    eventId: v.id("deviceEvents"),
    debateId: v.id("safetyDebates"),
    severity: v.string(),
    score: v.number(),
    strictReasoning: v.string(),
    liberalReasoning: v.string(),
  },
  handler: async (ctx, args) => {
    const title = args.severity === "emergency"
      ? "Urgent: Immediate safety concern detected"
      : "Safety alert: Activity needs your attention";

    const summary = `Risk score: ${args.score}/100\n\nSafety concern: ${args.strictReasoning}\n\nContext: ${args.liberalReasoning}`;

    // Store alert in DB
    await ctx.runMutation(internal.safetyAlerts.createFromDebate, {
      debateId: args.debateId,
      eventId: args.eventId,
      childId: args.childId,
      familyId: args.familyId,
      score: args.score,
    });

    // TODO: Integrate with Phosra's existing push notification system
    // For now, log the alert
    console.log(`[SAFETY ALERT] Family ${args.familyId} | Child ${args.childId} | Score ${args.score}/100 | ${title}`);
  },
});
