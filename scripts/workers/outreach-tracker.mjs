#!/usr/bin/env node

/**
 * outreach-tracker.mjs
 *
 * Daily worker that identifies contacts needing follow-up and generates
 * a summary of overdue outreach items. Optionally uses Claude API to
 * draft follow-up messages.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/workers/outreach-tracker.mjs
 *
 * Environment:
 *   DATABASE_URL       — Postgres connection string
 *   ANTHROPIC_API_KEY  — (optional) for Claude-powered follow-up drafts
 */

import pg from "pg"

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate"

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const runId = crypto.randomUUID()

  try {
    // Record worker run start
    await pool.query(
      `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type)
       VALUES ($1, 'outreach-tracker', 'running', $2)`,
      [runId, process.env.GITHUB_ACTIONS ? "cron" : "manual"]
    )

    // Find contacts past their follow-up date
    const { rows: overdue } = await pool.query(
      `SELECT id, name, org, status, next_followup_at, last_contact_at
       FROM admin_outreach_contacts
       WHERE next_followup_at IS NOT NULL AND next_followup_at < NOW()
       ORDER BY next_followup_at ASC`
    )

    // Find contacts in active pipeline (reached_out, in_conversation) with no recent activity
    const { rows: stale } = await pool.query(
      `SELECT id, name, org, status, last_contact_at
       FROM admin_outreach_contacts
       WHERE status IN ('reached_out', 'in_conversation')
       AND (last_contact_at IS NULL OR last_contact_at < NOW() - INTERVAL '14 days')
       ORDER BY last_contact_at ASC NULLS FIRST`
    )

    // Generate summary
    const summary = []
    if (overdue.length > 0) {
      summary.push(`${overdue.length} contacts past follow-up date:`)
      for (const c of overdue.slice(0, 10)) {
        summary.push(`  - ${c.name} (${c.org || "no org"}) — overdue since ${new Date(c.next_followup_at).toLocaleDateString()}`)
      }
      if (overdue.length > 10) summary.push(`  ... and ${overdue.length - 10} more`)
    }
    if (stale.length > 0) {
      summary.push(`${stale.length} active contacts with no activity in 14+ days:`)
      for (const c of stale.slice(0, 10)) {
        summary.push(`  - ${c.name} (${c.org || "no org"}) — last contact: ${c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString() : "never"}`)
      }
    }
    if (summary.length === 0) {
      summary.push("All outreach contacts are up to date. No follow-ups needed.")
    }

    const outputSummary = summary.join("\n")
    console.log("\n📋 Outreach Tracker Report\n")
    console.log(outputSummary)

    // Complete worker run
    await pool.query(
      `UPDATE admin_worker_runs
       SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2
       WHERE id = $3`,
      [outputSummary, overdue.length + stale.length, runId]
    )

    console.log(`\n✅ Outreach tracker complete. ${overdue.length} overdue, ${stale.length} stale.`)
  } catch (err) {
    console.error("❌ Outreach tracker failed:", err)

    // Record failure
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
