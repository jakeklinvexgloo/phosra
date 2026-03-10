import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"

/**
 * Demo endpoint: POST /demo/inject-events
 *
 * Injects a sequence of test events that escalate in severity to demonstrate
 * the Safe Agent pipeline (on-device scoring -> debate tribunal -> alerts).
 */
export const injectDemoEvents = httpAction(async (ctx, request) => {
  const demoEvents = [
    // Clearly safe events (score < 40 — no cloud processing needed)
    {
      eventType: "url_visit",
      content: "www.youtube.com/watch?v=minecraft",
      appName: "Chrome",
      onDeviceScore: 5,
    },
    {
      eventType: "search_query",
      content: "math homework fractions help",
      appName: "Google",
      onDeviceScore: 8,
    },
    {
      eventType: "app_open",
      content: "Roblox",
      appName: "Roblox",
      onDeviceScore: 12,
    },

    // Slightly concerning but still below debate threshold
    {
      eventType: "search_query",
      content: "how to make a prank at school",
      appName: "Google",
      onDeviceScore: 35,
    },

    // Borderline (40-80) — should trigger 3-agent debate tribunal
    {
      eventType: "message_sent",
      content: "I just feel like nobody likes me at school anymore",
      appName: "iMessage",
      onDeviceScore: 55,
    },

    // High risk (>80) — should trigger immediate alert + debate
    {
      eventType: "message_sent",
      content:
        "this person keeps asking me to meet them and not tell my parents",
      appName: "Instagram",
      onDeviceScore: 88,
    },
  ]

  const childId = "demo-child-1"
  const familyId = "demo-family-1"
  const now = Date.now()

  for (let i = 0; i < demoEvents.length; i++) {
    const event = demoEvents[i]
    await ctx.runMutation(internal.deviceEvents.ingestEvent, {
      childId,
      familyId,
      eventType: event.eventType as any,
      content: event.content,
      appName: event.appName,
      platform: "ios",
      timestamp: now - (demoEvents.length - i) * 60000, // spread over last 6 minutes
      onDeviceScore: event.onDeviceScore,
    })
  }

  return new Response(
    JSON.stringify({ ok: true, injected: demoEvents.length }),
    {
      headers: { "Content-Type": "application/json" },
    }
  )
})
