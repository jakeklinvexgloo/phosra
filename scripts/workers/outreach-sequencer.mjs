#!/usr/bin/env node

/**
 * outreach-sequencer.mjs
 *
 * Daily worker that generates personalized cold emails for active sequences.
 * Step 0 (initial): creates pending emails for human review.
 * Steps 1-3 (follow-ups): sends directly via outreach Gmail.
 *
 * Environment:
 *   API_URL        — Backend API URL (default: http://localhost:8080)
 *   WORKER_API_KEY — Shared secret for worker API auth
 *   ANTHROPIC_API_KEY — For Claude email generation
 *   DATABASE_URL   — Postgres connection string (for run record)
 *   RUN_ID         — (optional) Existing run ID from API trigger
 */

import pg from "pg"

const API_URL = process.env.API_URL || "http://localhost:8080"
const WORKER_KEY = process.env.WORKER_API_KEY || ""
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ""
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514"
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

async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Claude API ${res.status}: ${body}`)
  }
  const data = await res.json()
  const text = data.content?.[0]?.text || ""
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON in Claude response: " + text.slice(0, 200))
  return JSON.parse(jsonMatch[0])
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  try {
    if (!hasExistingRun) {
      await pool.query(
        `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at)
         VALUES ($1, 'outreach-sequencer', 'running', $2, NOW())`,
        [runId, process.env.GITHUB_ACTIONS ? "cron" : "manual"]
      )
    }

    if (!WORKER_KEY) throw new Error("WORKER_API_KEY not set")
    if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set")

    // Get config
    const config = await apiFetch("/outreach/config")

    // Get active sequences ready for action
    const sequences = await apiFetch("/outreach/sequences/active")
    if (!sequences || sequences.length === 0) {
      const summary = "No active sequences needing action."
      await pool.query(
        `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = 0 WHERE id = $2`,
        [summary, runId]
      )
      console.log(summary)
      await pool.end()
      return
    }

    // Check daily send limit
    const { count: sentToday } = await apiFetch("/outreach/sent-today")
    let remaining = config.max_emails_per_day - sentToday

    // DRAFT_LIMIT: process at most N sequences per run (default: unlimited)
    const draftLimit = parseInt(process.env.DRAFT_LIMIT || "0", 10)

    const results = { generated: 0, sent: 0, skipped: 0, errors: 0 }

    for (const seq of sequences) {
      if (remaining <= 0) {
        results.skipped++
        continue
      }

      // Stop after reaching draft limit (if set)
      if (draftLimit > 0 && (results.generated + results.sent) >= draftLimit) {
        results.skipped++
        continue
      }

      try {
        // Get full contact details
        const contact = await apiFetch(`/outreach/${seq.contact_id}`)
        if (!contact || !contact.email) {
          results.skipped++
          continue
        }

        // Require review for initial emails AND all follow-ups to P1 contacts
        const needsReview = seq.current_step === 0 || contact.priority_tier === 1

        if (needsReview) {
          // Generate and queue for human review
          const isInitial = seq.current_step === 0
          const stepLabels = { 1: "gentle bump", 2: "different angle/value prop", 3: "final outreach, leave door open" }
          const systemPrompt = isInitial
            ? `You are ${config.sender_name}, ${config.sender_title} at Phosra. Write concise cold outreach emails.\n\nAbout Phosra: ${config.company_brief}\n\nRules:\n- Under 150 words\n- Specific to the recipient's role and organization\n- Soft ask (15-minute call)\n- No buzzwords, no hyperbole\n- Professional but warm tone\n- End with the signature: ${config.email_signature}`
            : `You are ${config.sender_name}, ${config.sender_title} at Phosra. Write follow-up emails.\n\nAbout Phosra: ${config.company_brief}\n\nRules:\n- Under 100 words\n- Reference the initial outreach naturally\n- ${stepLabels[seq.current_step] || "brief follow-up"}\n- Professional but warm\n- End with the signature: ${config.email_signature}`
          const userPrompt = isInitial
            ? `Write a cold outreach email to ${contact.name}, ${contact.title} at ${contact.org}.\nContact type: ${contact.contact_type}\nTags: ${(contact.tags || []).join(", ")}\nNotes: ${contact.notes || "none"}\n\nReturn JSON: { "subject": "...", "body": "..." }`
            : `Follow-up #${seq.current_step} to ${contact.name} at ${contact.org}.\nDays since last email: ${seq.last_sent_at ? Math.round((Date.now() - new Date(seq.last_sent_at).getTime()) / 86400000) : "unknown"}\n\nReturn JSON: { "subject": "Re: ...", "body": "..." }`

          const email = await callClaude(systemPrompt, userPrompt)

          await apiFetch("/outreach/pending-emails", {
            method: "POST",
            body: JSON.stringify({
              contact_id: seq.contact_id,
              sequence_id: seq.id,
              step_number: seq.current_step,
              to_email: contact.email,
              subject: email.subject,
              body: email.body,
              status: "pending_review",
              generation_model: "claude-sonnet-4-20250514",
            }),
          })
          results.generated++
        } else {
          // Follow-up for non-P1 — generate and send directly
          const stepLabels = { 1: "gentle bump", 2: "different angle/value prop", 3: "final outreach, leave door open" }
          const email = await callClaude(
            `You are ${config.sender_name}, ${config.sender_title} at Phosra. Write follow-up emails.\n\nAbout Phosra: ${config.company_brief}\n\nRules:\n- Under 100 words\n- Reference the initial outreach naturally\n- ${stepLabels[seq.current_step] || "brief follow-up"}\n- Professional but warm\n- End with the signature: ${config.email_signature}`,
            `Follow-up #${seq.current_step} to ${contact.name} at ${contact.org}.\nDays since last email: ${seq.last_sent_at ? Math.round((Date.now() - new Date(seq.last_sent_at).getTime()) / 86400000) : "unknown"}\n\nReturn JSON: { "subject": "Re: ...", "body": "..." }`
          )

          // Send via outreach Gmail
          const sent = await apiFetch("/gmail/send", {
            method: "POST",
            body: JSON.stringify({
              to: contact.email,
              subject: email.subject,
              body: email.body,
            }),
          })

          // Advance sequence
          await apiFetch(`/outreach/sequences/${seq.id}/advance`, {
            method: "POST",
            body: JSON.stringify({ gmail_thread_id: sent.thread_id }),
          })

          // Update contact status
          await apiFetch(`/outreach/${seq.contact_id}`, {
            method: "PATCH",
            body: JSON.stringify({
              email_status: "awaiting_reply",
              last_contact_at: new Date().toISOString(),
            }),
          })

          // Log activity
          await apiFetch(`/outreach/${seq.contact_id}/activity`, {
            method: "POST",
            body: JSON.stringify({
              activity_type: "auto_followup_sent",
              subject: email.subject,
              body: email.body,
            }),
          })

          results.sent++
          remaining--
        }
      } catch (err) {
        console.error(`Error processing sequence ${seq.id}:`, err.message)
        results.errors++
      }
    }

    const summary = `Processed ${sequences.length} sequences: ${results.generated} generated for review, ${results.sent} follow-ups sent, ${results.skipped} skipped, ${results.errors} errors.`
    const itemCount = results.generated + results.sent

    await pool.query(
      `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2 WHERE id = $3`,
      [summary, itemCount, runId]
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
