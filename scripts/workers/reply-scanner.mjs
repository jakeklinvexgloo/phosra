#!/usr/bin/env node

/**
 * reply-scanner.mjs
 *
 * Runs every 2 hours. Scans for replies to outreach emails, classifies intent
 * using Claude, and updates contact/sequence status accordingly.
 *
 * Environment:
 *   API_URL        — Backend API URL (default: http://localhost:8080)
 *   WORKER_API_KEY — Shared secret for worker API auth
 *   ANTHROPIC_API_KEY — For Claude intent classification
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

async function classifyIntent(emailBody, contactName) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: "Classify the intent of this email reply. Return JSON with intent and confidence.\n\nValid intents:\n- interested: wants to learn more, take a call, or discuss\n- maybe_later: not now but open to future contact\n- not_interested: clear decline or unsubscribe request\n- out_of_office: auto-reply, vacation, or OOO message\n- bounced: delivery failure, invalid address\n\nReturn: { \"intent\": \"...\", \"confidence\": 0.0-1.0, \"reason\": \"brief explanation\" }",
      messages: [{ role: "user", content: `Reply from ${contactName}:\n\n${emailBody}` }],
    }),
  })
  if (!res.ok) throw new Error(`Claude API ${res.status}`)
  const data = await res.json()
  const text = data.content?.[0]?.text || ""
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { intent: "interested", confidence: 0.5, reason: "could not parse" }
  return JSON.parse(jsonMatch[0])
}

// Maps intent to contact/sequence status updates
const INTENT_ACTIONS = {
  interested: { email_status: "replied", status: "in_conversation", seq_status: "completed" },
  maybe_later: { email_status: "replied", status: null, seq_status: "paused" },
  not_interested: { email_status: "replied", status: "declined", seq_status: "completed" },
  out_of_office: { email_status: null, status: null, seq_status: null },
  bounced: { email_status: "bounced", status: null, seq_status: "cancelled" },
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  try {
    if (!hasExistingRun) {
      await pool.query(
        `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at)
         VALUES ($1, 'reply-scanner', 'running', $2, NOW())`,
        [runId, process.env.GITHUB_ACTIONS ? "cron" : "manual"]
      )
    }

    if (!WORKER_KEY) throw new Error("WORKER_API_KEY not set")
    if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set")

    // Find contacts awaiting replies
    const { rows: contacts } = await pool.query(
      `SELECT id, name, org, email, last_contact_at
       FROM admin_outreach_contacts
       WHERE email_status = 'awaiting_reply' AND email IS NOT NULL
       ORDER BY last_contact_at ASC`
    )

    if (contacts.length === 0) {
      const summary = "No contacts awaiting replies."
      await pool.query(
        `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = 0 WHERE id = $2`,
        [summary, runId]
      )
      console.log(summary)
      await pool.end()
      return
    }

    const results = { scanned: 0, replies_found: 0, errors: 0 }

    for (const contact of contacts) {
      try {
        // Search for replies from this contact's email
        const searchResult = await apiFetch(`/gmail/search?q=from:${encodeURIComponent(contact.email)}`)
        const messages = searchResult?.messages || []

        if (messages.length === 0) {
          results.scanned++
          continue
        }

        // Check for new messages since last contact
        const lastContactTime = contact.last_contact_at ? new Date(contact.last_contact_at).getTime() : 0
        const newMessages = messages.filter((m) => {
          const msgDate = new Date(m.date).getTime()
          return msgDate > lastContactTime
        })

        if (newMessages.length === 0) {
          results.scanned++
          continue
        }

        // Get the most recent reply body
        const latestMsg = newMessages[0]
        let fullMsg = latestMsg
        if (!latestMsg.body_text) {
          fullMsg = await apiFetch(`/gmail/messages/${latestMsg.id}`)
        }

        const body = fullMsg.body_text || fullMsg.snippet || ""

        // Classify intent
        const classification = await classifyIntent(body, contact.name)
        const intent = classification.intent || "interested"
        const confidence = classification.confidence || 0.5
        const action = INTENT_ACTIONS[intent] || INTENT_ACTIONS.interested

        // Log activity
        await apiFetch(`/outreach/${contact.id}/activity`, {
          method: "POST",
          body: JSON.stringify({
            activity_type: "intent_classified",
            subject: `Reply classified: ${intent} (${Math.round(confidence * 100)}%)`,
            body: classification.reason || "",
            intent_classification: intent,
            confidence_score: confidence,
          }),
        })

        // Log the received email
        await apiFetch(`/outreach/${contact.id}/activity`, {
          method: "POST",
          body: JSON.stringify({
            activity_type: "email_received",
            subject: fullMsg.subject || "Re: outreach",
            body: body.slice(0, 1000),
          }),
        })

        // Update contact
        const contactUpdate = {}
        if (action.email_status) contactUpdate.email_status = action.email_status
        if (action.status) contactUpdate.status = action.status
        contactUpdate.last_contact_at = new Date().toISOString()

        if (Object.keys(contactUpdate).length > 0) {
          await apiFetch(`/outreach/${contact.id}`, {
            method: "PATCH",
            body: JSON.stringify(contactUpdate),
          })
        }

        // Update sequence if exists
        if (action.seq_status) {
          const { rows: seqs } = await pool.query(
            `SELECT id FROM admin_outreach_sequences WHERE contact_id = $1 AND status = 'active' LIMIT 1`,
            [contact.id]
          )
          if (seqs.length > 0) {
            await pool.query(
              `UPDATE admin_outreach_sequences SET status = $1, updated_at = NOW() WHERE id = $2`,
              [action.seq_status, seqs[0].id]
            )
          }
        }

        results.replies_found++
        results.scanned++
      } catch (err) {
        console.error(`Error scanning replies for ${contact.name}:`, err.message)
        results.errors++
        results.scanned++
      }
    }

    const summary = `Scanned ${results.scanned} contacts: ${results.replies_found} replies found and classified, ${results.errors} errors.`
    await pool.query(
      `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2 WHERE id = $3`,
      [summary, results.replies_found, runId]
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
