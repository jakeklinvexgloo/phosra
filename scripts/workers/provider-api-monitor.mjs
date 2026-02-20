#!/usr/bin/env node

/**
 * provider-api-monitor.mjs
 *
 * Weekly worker that checks the health and documentation status of
 * live provider APIs (NextDNS, CleanBrowsing, Google, Microsoft, Apple).
 *
 * Environment:
 *   DATABASE_URL  — Postgres connection string
 *   RUN_ID        — (optional) Existing run ID from API trigger
 */

import pg from "pg"

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate"

// Provider endpoints to monitor
const PROVIDERS = [
  {
    name: "NextDNS",
    endpoints: [
      { url: "https://api.nextdns.io", label: "API Base" },
      { url: "https://nextdns.io/api", label: "Docs" },
    ],
  },
  {
    name: "CleanBrowsing",
    endpoints: [
      { url: "https://cleanbrowsing.org", label: "Homepage" },
      { url: "https://cleanbrowsing.org/filters/", label: "Filters" },
    ],
  },
  {
    name: "Google Family Link",
    endpoints: [
      { url: "https://families.google.com/familylink/", label: "Product Page" },
    ],
  },
  {
    name: "Microsoft Family Safety",
    endpoints: [
      { url: "https://www.microsoft.com/en-us/microsoft-365/family-safety", label: "Product Page" },
    ],
  },
  {
    name: "Apple Screen Time",
    endpoints: [
      { url: "https://support.apple.com/en-us/111767", label: "Support Doc" },
      { url: "https://developer.apple.com/documentation/devicemanagement", label: "MDM Docs" },
    ],
  },
  {
    name: "ControlD",
    endpoints: [
      { url: "https://api.controld.com/docs", label: "API Docs" },
    ],
  },
]

async function checkEndpoint(url, label) {
  const start = Date.now()
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "Phosra-ProviderMonitor/1.0" },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    })
    const latency = Date.now() - start
    return {
      url,
      label,
      status: res.status,
      ok: res.ok,
      latency,
      error: null,
    }
  } catch (err) {
    return {
      url,
      label,
      status: 0,
      ok: false,
      latency: Date.now() - start,
      error: err.message,
    }
  }
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  try {
    if (!hasExistingRun) {
      await pool.query(
        `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at)
         VALUES ($1, 'provider-api-monitor', 'running', 'manual', NOW())`,
        [runId]
      )
    }

    const summary = []
    let totalEndpoints = 0
    let healthyEndpoints = 0
    let failedEndpoints = 0

    for (const provider of PROVIDERS) {
      const results = []
      for (const ep of provider.endpoints) {
        const result = await checkEndpoint(ep.url, ep.label)
        results.push(result)
        totalEndpoints++
        if (result.ok) healthyEndpoints++
        else failedEndpoints++
      }

      const allOk = results.every((r) => r.ok)
      const status = allOk ? "OK" : "DEGRADED"
      const details = results
        .map((r) => {
          if (r.ok) return `  ${r.label}: ${r.status} (${r.latency}ms)`
          return `  ${r.label}: FAILED — ${r.error || `HTTP ${r.status}`} (${r.latency}ms)`
        })
        .join("\n")

      summary.push(`${provider.name}: ${status}`)
      summary.push(details)

      // Store degraded providers as news items for visibility
      if (!allOk) {
        const failedEps = results.filter((r) => !r.ok)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { rows } = await pool.query(
          `SELECT id FROM admin_news_items
           WHERE source = 'Provider Monitor' AND title LIKE $1 AND created_at > $2 LIMIT 1`,
          [`${provider.name}%`, weekAgo]
        )
        if (rows.length === 0) {
          await pool.query(
            `INSERT INTO admin_news_items (id, title, source, relevance_score, summary, tags)
             VALUES ($1, $2, 'Provider Monitor', 80, $3, $4)`,
            [
              crypto.randomUUID(),
              `${provider.name} — API Degraded`,
              failedEps.map((e) => `${e.label}: ${e.error || `HTTP ${e.status}`}`).join("; "),
              ["provider-health", provider.name.toLowerCase().replace(/\s+/g, "-")],
            ]
          )
        }
      }
    }

    const header = `Checked ${PROVIDERS.length} providers (${totalEndpoints} endpoints). ${healthyEndpoints} healthy, ${failedEndpoints} degraded.`
    const outputSummary = [header, "", ...summary].join("\n")

    await pool.query(
      `UPDATE admin_worker_runs
       SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2
       WHERE id = $3`,
      [outputSummary, totalEndpoints, runId]
    )

    console.log(outputSummary)
  } catch (err) {
    console.error("Provider API monitor failed:", err.message)
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
