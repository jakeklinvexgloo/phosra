#!/usr/bin/env node

/**
 * news-monitor.mjs
 *
 * Daily worker that scans child safety and parental controls industry news.
 * Checks RSS feeds and stores new items in admin_news_items.
 *
 * Environment:
 *   DATABASE_URL  — Postgres connection string
 *   RUN_ID        — (optional) Existing run ID from API trigger
 */

import pg from "pg"

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate"

// RSS/Atom feeds focused on child safety, digital wellbeing, and parental controls
const FEEDS = [
  { url: "https://www.commonsensemedia.org/rss/news.xml", source: "Common Sense Media" },
  { url: "https://www.ftc.gov/rss/press-releases.xml", source: "FTC Press Releases" },
  { url: "https://www.eff.org/rss/updates.xml", source: "EFF Updates" },
  { url: "https://ico.org.uk/feeds/all-news.xml", source: "UK ICO" },
]

// Keywords for relevance scoring
const KEYWORDS = [
  "child safety", "children", "kids", "parental controls", "age verification",
  "COPPA", "KOSA", "online safety", "screen time", "digital wellbeing",
  "minors", "youth", "teenager", "social media", "privacy", "data protection",
  "harmful content", "child protection", "age-appropriate", "CIPA",
]

function scoreRelevance(title, summary) {
  const text = `${title} ${summary}`.toLowerCase()
  let score = 0
  for (const kw of KEYWORDS) {
    if (text.includes(kw.toLowerCase())) score += 15
  }
  return Math.min(score, 100)
}

async function fetchFeed(feedUrl) {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "Phosra-NewsMonitor/1.0" },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const text = await res.text()
    return parseItems(text)
  } catch {
    return []
  }
}

function parseItems(xml) {
  const items = []

  // Simple RSS item extraction (works for RSS 2.0)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractTag(block, "title")
    const link = extractTag(block, "link")
    const pubDate = extractTag(block, "pubDate")
    const description = extractTag(block, "description")
    if (title) {
      items.push({ title, url: link, published_at: pubDate, summary: cleanHtml(description || "") })
    }
  }

  // Also try Atom entries
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractTag(block, "title")
    const linkMatch = block.match(/<link[^>]*href="([^"]*)"/)
    const updated = extractTag(block, "updated") || extractTag(block, "published")
    const summary = extractTag(block, "summary") || extractTag(block, "content")
    if (title) {
      items.push({ title, url: linkMatch?.[1], published_at: updated, summary: cleanHtml(summary || "") })
    }
  }

  return items.slice(0, 20) // cap per feed
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, "i"))
  return match ? match[1].trim() : null
}

function cleanHtml(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').substring(0, 500)
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  try {
    if (!hasExistingRun) {
      await pool.query(
        `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at)
         VALUES ($1, 'news-monitor', 'running', 'manual', NOW())`,
        [runId]
      )
    }

    let totalNew = 0
    let totalSkipped = 0
    const feedResults = []

    for (const feed of FEEDS) {
      const items = await fetchFeed(feed.url)
      let newCount = 0

      for (const item of items) {
        const score = scoreRelevance(item.title, item.summary)
        if (score < 15) continue // skip irrelevant items

        // Check if we already have this URL
        if (item.url) {
          const { rows } = await pool.query(
            `SELECT id FROM admin_news_items WHERE url = $1 LIMIT 1`,
            [item.url]
          )
          if (rows.length > 0) {
            totalSkipped++
            continue
          }
        }

        // Parse date
        let publishedAt = null
        if (item.published_at) {
          const d = new Date(item.published_at)
          if (!isNaN(d.getTime())) publishedAt = d.toISOString()
        }

        // Determine tags
        const tags = []
        const text = `${item.title} ${item.summary}`.toLowerCase()
        if (text.includes("coppa") || text.includes("children's online privacy")) tags.push("COPPA")
        if (text.includes("kosa") || text.includes("kids online safety")) tags.push("KOSA")
        if (text.includes("age verification")) tags.push("age-verification")
        if (text.includes("social media")) tags.push("social-media")
        if (text.includes("screen time")) tags.push("screen-time")

        await pool.query(
          `INSERT INTO admin_news_items (id, title, source, url, published_at, relevance_score, summary, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [crypto.randomUUID(), item.title, feed.source, item.url, publishedAt, score, item.summary.substring(0, 500), tags]
        )
        newCount++
        totalNew++
      }

      feedResults.push(`${feed.source}: ${items.length} items found, ${newCount} new`)
    }

    const summary = [
      `Scanned ${FEEDS.length} feeds. ${totalNew} new items added, ${totalSkipped} duplicates skipped.`,
      "",
      ...feedResults,
    ].join("\n")

    await pool.query(
      `UPDATE admin_worker_runs
       SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2
       WHERE id = $3`,
      [summary, totalNew, runId]
    )

    console.log(summary)
  } catch (err) {
    console.error("News monitor failed:", err.message)
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
