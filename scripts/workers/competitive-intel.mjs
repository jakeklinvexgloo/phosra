#!/usr/bin/env node

/**
 * competitive-intel.mjs
 *
 * Weekly worker that tracks competitor activity in the parental controls space.
 * Checks known competitor product pages and changelogs for updates.
 *
 * Environment:
 *   DATABASE_URL  — Postgres connection string
 *   RUN_ID        — (optional) Existing run ID from API trigger
 */

import pg from "pg"

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate"

// Key competitors and their public changelog/product URLs
const COMPETITORS = [
  {
    name: "Bark",
    urls: ["https://www.bark.us/blog"],
    tags: ["bark", "monitoring"],
  },
  {
    name: "Qustodio",
    urls: ["https://www.qustodio.com/en/blog/"],
    tags: ["qustodio", "parental-controls"],
  },
  {
    name: "Net Nanny",
    urls: ["https://www.netnanny.com/blog/"],
    tags: ["net-nanny", "content-filtering"],
  },
  {
    name: "Circle (Disney)",
    urls: ["https://meetcircle.com/blogs/stories"],
    tags: ["circle", "screen-time"],
  },
  {
    name: "Google Family Link",
    urls: ["https://blog.google/products/android/"],
    tags: ["google", "family-link"],
  },
  {
    name: "Apple Screen Time",
    urls: ["https://support.apple.com/en-us/111767"],
    tags: ["apple", "screen-time"],
  },
]

async function checkCompetitor(competitor) {
  const findings = []

  for (const url of competitor.urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Phosra-CompetitiveIntel/1.0" },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) {
        findings.push(`${competitor.name}: ${url} returned ${res.status}`)
        continue
      }
      const html = await res.text()

      // Extract page title and look for recent date references
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "No title"

      // Count article/post entries as a rough freshness signal
      const articleCount = (html.match(/<article/gi) || []).length
      const postCount = (html.match(/class="[^"]*post[^"]*"/gi) || []).length

      findings.push(`${competitor.name}: accessible (${articleCount + postCount} entries found)`)
    } catch (err) {
      findings.push(`${competitor.name}: ${url} — ${err.message}`)
    }
  }

  return findings
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  try {
    if (!hasExistingRun) {
      await pool.query(
        `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at)
         VALUES ($1, 'competitive-intel', 'running', 'manual', NOW())`,
        [runId]
      )
    }

    const allFindings = []
    let competitorsChecked = 0

    for (const competitor of COMPETITORS) {
      const findings = await checkCompetitor(competitor)
      allFindings.push(...findings)
      competitorsChecked++

      // Store interesting findings as news items
      for (const finding of findings) {
        if (finding.includes("returned 4") || finding.includes("returned 5")) continue

        // Check for duplicate
        const { rows } = await pool.query(
          `SELECT id FROM admin_news_items WHERE source = $1 AND title = $2 LIMIT 1`,
          ["Competitive Intel", `${competitor.name} - Weekly Check`]
        )

        // Only add one entry per competitor per week
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { rows: recentRows } = await pool.query(
          `SELECT id FROM admin_news_items
           WHERE source = 'Competitive Intel' AND title LIKE $1 AND created_at > $2 LIMIT 1`,
          [`${competitor.name}%`, weekAgo]
        )
        if (recentRows.length > 0) continue

        await pool.query(
          `INSERT INTO admin_news_items (id, title, source, url, relevance_score, summary, tags)
           VALUES ($1, $2, 'Competitive Intel', $3, $4, $5, $6)`,
          [
            crypto.randomUUID(),
            `${competitor.name} - Weekly Check`,
            competitor.urls[0],
            50,
            finding,
            competitor.tags,
          ]
        )
      }
    }

    const summary = [
      `Checked ${competitorsChecked} competitors.`,
      "",
      ...allFindings,
    ].join("\n")

    await pool.query(
      `UPDATE admin_worker_runs
       SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2
       WHERE id = $3`,
      [summary, competitorsChecked, runId]
    )

    console.log(summary)
  } catch (err) {
    console.error("Competitive intel failed:", err.message)
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
