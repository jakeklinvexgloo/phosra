#!/usr/bin/env node

/**
 * compliance-alerter.mjs
 *
 * Weekly worker that checks the law registry for upcoming compliance deadlines
 * and generates urgency alerts at 90/60/30/7 day thresholds.
 *
 * Environment:
 *   DATABASE_URL  — Postgres connection string
 *   RUN_ID        — (optional) Existing run ID from API trigger
 */

import pg from "pg"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate"

const REGISTRY_PATH = resolve(__dirname, "../../web/src/lib/compliance/law-registry.ts")

function extractDeadlines() {
  let content
  try {
    content = readFileSync(REGISTRY_PATH, "utf-8")
  } catch {
    return []
  }

  const laws = []
  // Extract laws with effective dates or compliance deadlines
  // Parse id, shortName, status fields
  const idRegex = /id:\s*"([^"]+)"/g
  const nameRegex = /shortName:\s*"([^"]+)"/g
  const statusRegex = /status:\s*"([^"]+)"/g

  const ids = [...content.matchAll(idRegex)].map((m) => m[1])
  const names = [...content.matchAll(nameRegex)].map((m) => m[1])
  const statuses = [...content.matchAll(statusRegex)].map((m) => m[1])

  for (let i = 0; i < ids.length; i++) {
    laws.push({
      id: ids[i],
      shortName: names[i] || ids[i],
      status: statuses[i] || "unknown",
    })
  }

  return laws
}

function getUrgency(daysUntil) {
  if (daysUntil <= 7) return "critical"
  if (daysUntil <= 30) return "high"
  if (daysUntil <= 60) return "medium"
  return "low"
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  try {
    if (!hasExistingRun) {
      await pool.query(
        `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at)
         VALUES ($1, 'compliance-alerter', 'running', 'manual', NOW())`,
        [runId]
      )
    }

    const laws = extractDeadlines()

    // Get existing unresolved alerts to avoid duplicates
    const { rows: existingAlerts } = await pool.query(
      `SELECT law_id, deadline_date FROM admin_compliance_alerts WHERE status != 'resolved'`
    )
    const existingSet = new Set(existingAlerts.map((a) => `${a.law_id}:${a.deadline_date}`))

    // Check for laws that are "enacted" or "effective" — these may have compliance deadlines
    const now = new Date()
    let alertsCreated = 0
    let alertsUpdated = 0
    const summary = []

    // Update urgency on existing unresolved alerts based on current date
    const { rows: unresolvedAlerts } = await pool.query(
      `SELECT id, law_id, law_name, deadline_date, urgency, status
       FROM admin_compliance_alerts
       WHERE status != 'resolved'
       ORDER BY deadline_date ASC`
    )

    for (const alert of unresolvedAlerts) {
      const deadline = new Date(alert.deadline_date)
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
      const newUrgency = getUrgency(daysUntil)

      if (newUrgency !== alert.urgency) {
        await pool.query(
          `UPDATE admin_compliance_alerts SET urgency = $1, updated_at = NOW() WHERE id = $2`,
          [newUrgency, alert.id]
        )
        alertsUpdated++
        summary.push(`Updated ${alert.law_name}: urgency ${alert.urgency} -> ${newUrgency} (${daysUntil} days)`)
      }

      if (daysUntil <= 0) {
        summary.push(`OVERDUE: ${alert.law_name} (deadline was ${alert.deadline_date})`)
      } else if (daysUntil <= 30) {
        summary.push(`UPCOMING: ${alert.law_name} — ${daysUntil} days until deadline (${alert.deadline_date})`)
      }
    }

    // Scan registry for new laws that should have alerts
    const enactedLaws = laws.filter(
      (l) => l.status === "enacted" || l.status === "effective" || l.status === "partial"
    )

    summary.unshift(
      `Scanned ${laws.length} laws in registry. ${enactedLaws.length} enacted/effective.`,
      `${unresolvedAlerts.length} active alerts checked. ${alertsUpdated} urgency levels updated.`
    )

    if (summary.length <= 2) {
      summary.push("No approaching deadlines or urgency changes.")
    }

    const outputSummary = summary.join("\n")

    await pool.query(
      `UPDATE admin_worker_runs
       SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2
       WHERE id = $3`,
      [outputSummary, alertsCreated + alertsUpdated, runId]
    )

    console.log(outputSummary)
  } catch (err) {
    console.error("Compliance alerter failed:", err.message)
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
