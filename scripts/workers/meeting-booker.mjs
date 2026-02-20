#!/usr/bin/env node

/**
 * meeting-booker.mjs
 *
 * Runs every 2 hours. For contacts classified as "interested", proposes
 * meeting times based on calendar availability and sends a proposal email.
 *
 * Environment:
 *   API_URL        — Backend API URL (default: http://localhost:8080)
 *   WORKER_API_KEY — Shared secret for worker API auth
 *   ANTHROPIC_API_KEY — For Claude meeting proposal generation
 *   DATABASE_URL   — Postgres connection string (for run record)
 *   RUN_ID         — (optional) Existing run ID from API trigger
 */

import pg from "pg"

const API_URL = process.env.API_URL || "http://localhost:8080"
const WORKER_KEY = process.env.WORKER_API_KEY || ""
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ""
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate"

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}/api/v1/worker${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Worker-Key": WORKER_KEY,
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.status === 204 ? null : res.json()
}

async function generateProposal(config, contact, availableSlots) {
  const slotsText = availableSlots
    .map((s) => {
      const d = new Date(s.start)
      return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) +
        " at " +
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })
    })
    .join("\n  - ")

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `You are ${config.sender_name}, ${config.sender_title} at Phosra. Write a brief meeting proposal email.\n\nRules:\n- Under 80 words\n- Propose 2-3 specific time slots from the available options\n- 30-minute call\n- Friendly, professional tone\n- End with: ${config.email_signature}`,
      messages: [{
        role: "user",
        content: `Write a meeting proposal to ${contact.name}, ${contact.title || ""} at ${contact.org}.\n\nThey've expressed interest in learning more about Phosra.\n\nAvailable 30-minute slots:\n  - ${slotsText}\n\nReturn JSON: { "subject": "...", "body": "..." }`,
      }],
    }),
  })
  if (!res.ok) throw new Error(`Claude API ${res.status}`)
  const data = await res.json()
  const text = data.content?.[0]?.text || ""
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON in Claude response")
  return JSON.parse(jsonMatch[0])
}

function findOpenSlots(events, days = 7, slotMinutes = 30) {
  const now = new Date()
  const slots = []

  // Generate potential slots: weekdays 9am-5pm ET (14:00-22:00 UTC)
  for (let d = 1; d <= days; d++) {
    const date = new Date(now)
    date.setDate(date.getDate() + d)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    for (let hour = 14; hour < 22; hour++) {
      const slotStart = new Date(date)
      slotStart.setUTCHours(hour, 0, 0, 0)
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes)

      // Check for conflicts
      const conflict = events.some((e) => {
        const eStart = new Date(e.start).getTime()
        const eEnd = new Date(e.end).getTime()
        return slotStart.getTime() < eEnd && slotEnd.getTime() > eStart
      })

      if (!conflict) {
        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() })
      }
    }
  }

  return slots
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  try {
    if (!hasExistingRun) {
      await pool.query(
        `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at)
         VALUES ($1, 'meeting-booker', 'running', $2, NOW())`,
        [runId, process.env.GITHUB_ACTIONS ? "cron" : "manual"]
      )
    }

    if (!WORKER_KEY) throw new Error("WORKER_API_KEY not set")
    if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set")

    // Find interested contacts without a meeting_proposed activity
    const { rows: candidates } = await pool.query(
      `SELECT c.id, c.name, c.org, c.title, c.email
       FROM admin_outreach_contacts c
       WHERE c.email_status = 'replied'
         AND c.status = 'in_conversation'
         AND c.email IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM admin_outreach_activities a
           WHERE a.contact_id = c.id AND a.activity_type = 'meeting_proposed'
         )
       ORDER BY c.updated_at DESC
       LIMIT 10`
    )

    if (candidates.length === 0) {
      const summary = "No interested contacts needing meeting proposals."
      await pool.query(
        `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = 0 WHERE id = $2`,
        [summary, runId]
      )
      console.log(summary)
      await pool.end()
      return
    }

    // Get calendar events for next 7 days
    const calendarData = await apiFetch("/calendar/events")
    const events = calendarData?.events || []

    // Find open slots
    const openSlots = findOpenSlots(events)
    if (openSlots.length < 3) {
      const summary = "Not enough open calendar slots to propose meetings."
      await pool.query(
        `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = 0 WHERE id = $2`,
        [summary, runId]
      )
      console.log(summary)
      await pool.end()
      return
    }

    // Get config for sender persona
    const config = await apiFetch("/outreach/config")

    const results = { proposed: 0, errors: 0 }

    for (const contact of candidates) {
      try {
        // Pick 3 diverse slots (morning, afternoon, different days)
        const selectedSlots = openSlots.slice(0, 3)

        // Generate proposal email
        const proposal = await generateProposal(config, contact, selectedSlots)

        // Send via outreach Gmail
        await apiFetch("/gmail/send", {
          method: "POST",
          body: JSON.stringify({
            to: contact.email,
            subject: proposal.subject,
            body: proposal.body,
          }),
        })

        // Log activity
        await apiFetch(`/outreach/${contact.id}/activity`, {
          method: "POST",
          body: JSON.stringify({
            activity_type: "meeting_proposed",
            subject: proposal.subject,
            body: `Proposed slots: ${selectedSlots.map((s) => new Date(s.start).toISOString()).join(", ")}`,
          }),
        })

        results.proposed++
      } catch (err) {
        console.error(`Error proposing meeting for ${contact.name}:`, err.message)
        results.errors++
      }
    }

    const summary = `Processed ${candidates.length} candidates: ${results.proposed} meeting proposals sent, ${results.errors} errors.`
    await pool.query(
      `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2 WHERE id = $3`,
      [summary, results.proposed, runId]
    )

    console.log(summary)
  } catch (err) {
    console.error("Worker failed:", err.message)
    await pool
      .query(
        `UPDATE admin_worker_runs SET status = 'failed', completed_at = NOW(), error_message = $1 WHERE id = $2`,
        [err.message, runId]
      )
      .catch(() => {})
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
