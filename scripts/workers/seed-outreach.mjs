#!/usr/bin/env node

/**
 * seed-outreach.mjs
 *
 * One-time script to parse outreach-contacts.md and outreach-tech-companies.md
 * and insert structured contact records into the admin_outreach_contacts table.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/workers/seed-outreach.mjs
 *
 * Or with local defaults:
 *   node scripts/workers/seed-outreach.mjs
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import pg from "pg"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../..")

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://guardiangate:guardiangate_dev@localhost:5432/guardiangate"

// ── Parse outreach-contacts.md ──────────────────────────────────

function parseOutreachContacts(filePath) {
  let content
  try {
    content = readFileSync(filePath, "utf-8")
  } catch {
    console.warn(`⚠ Could not read ${filePath}, skipping.`)
    return []
  }

  const contacts = []
  const lines = content.split("\n")
  let currentSection = "other"

  for (const line of lines) {
    // Detect section headers to categorize contacts
    const sectionMatch = line.match(/^#{1,3}\s+(.+)/)
    if (sectionMatch) {
      const header = sectionMatch[1].toLowerCase()
      if (header.includes("think tank") || header.includes("advocacy") || header.includes("organization")) {
        currentSection = "advocacy"
      } else if (header.includes("legislat") || header.includes("congress") || header.includes("senator") || header.includes("federal") || header.includes("state")) {
        currentSection = "legislator"
      } else if (header.includes("academic") || header.includes("research") || header.includes("universit")) {
        currentSection = "academic"
      } else if (header.includes("tech") || header.includes("compan") || header.includes("platform")) {
        currentSection = "tech_company"
      }
      continue
    }

    // Match contact entries like "**Name** — Title at Org" or "- **Name** ..."
    const contactMatch = line.match(/\*\*([^*]+)\*\*\s*[—–-]\s*(.+)/)
    if (contactMatch) {
      const name = contactMatch[1].trim()
      const rest = contactMatch[2].trim()

      // Try to extract title and org from "Title at/of/for Org"
      const titleOrgMatch = rest.match(/^(.+?)\s+(?:at|of|for|@)\s+(.+?)(?:\s*\(|$)/)
      let title = rest
      let org = ""
      if (titleOrgMatch) {
        title = titleOrgMatch[1].trim().replace(/,$/, "")
        org = titleOrgMatch[2].trim().replace(/,$/, "")
      }

      // Extract Twitter handle
      const twitterMatch = rest.match(/@(\w{1,15})/)
      const twitter = twitterMatch ? twitterMatch[1] : ""

      // Extract relevance score if present
      const scoreMatch = rest.match(/(\d{1,3})\/100/)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null

      contacts.push({
        name,
        org,
        title: title.substring(0, 250),
        contact_type: currentSection,
        twitter_handle: twitter,
        relevance_score: score,
      })
    }
  }

  return contacts
}

// ── Parse outreach-tech-companies.md ────────────────────────────

function parseTechCompanies(filePath) {
  let content
  try {
    content = readFileSync(filePath, "utf-8")
  } catch {
    console.warn(`⚠ Could not read ${filePath}, skipping.`)
    return []
  }

  const contacts = []
  const lines = content.split("\n")
  let currentOrg = ""

  for (const line of lines) {
    // Section headers often contain company names
    const orgMatch = line.match(/^#{2,4}\s+(.+)/)
    if (orgMatch) {
      currentOrg = orgMatch[1].trim()
      continue
    }

    const contactMatch = line.match(/\*\*([^*]+)\*\*\s*[—–-]\s*(.+)/)
    if (contactMatch) {
      const name = contactMatch[1].trim()
      const rest = contactMatch[2].trim()

      const titleOrgMatch = rest.match(/^(.+?)\s+(?:at|of|for|@)\s+(.+?)(?:\s*\(|$)/)
      let title = rest
      let org = currentOrg
      if (titleOrgMatch) {
        title = titleOrgMatch[1].trim().replace(/,$/, "")
        org = titleOrgMatch[2].trim().replace(/,$/, "") || currentOrg
      }

      const twitterMatch = rest.match(/@(\w{1,15})/)
      const twitter = twitterMatch ? twitterMatch[1] : ""

      const scoreMatch = rest.match(/(\d{1,3})\/100/)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null

      contacts.push({
        name,
        org,
        title: title.substring(0, 250),
        contact_type: "tech_company",
        twitter_handle: twitter,
        relevance_score: score,
      })
    }
  }

  return contacts
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding outreach contacts...")

  const contactsFile = resolve(ROOT, "outreach-contacts.md")
  const techFile = resolve(ROOT, "outreach-tech-companies.md")

  const policyContacts = parseOutreachContacts(contactsFile)
  const techContacts = parseTechCompanies(techFile)

  const allContacts = [...policyContacts, ...techContacts]

  console.log(`  Parsed ${policyContacts.length} from outreach-contacts.md`)
  console.log(`  Parsed ${techContacts.length} from outreach-tech-companies.md`)
  console.log(`  Total: ${allContacts.length} contacts`)

  if (allContacts.length === 0) {
    console.log("  No contacts parsed. Check the markdown files exist and have expected format.")
    process.exit(0)
  }

  // Deduplicate by name
  const seen = new Set()
  const unique = allContacts.filter((c) => {
    const key = c.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`  Unique after dedup: ${unique.length}`)

  // Connect to Postgres
  const pool = new pg.Pool({ connectionString: DATABASE_URL })

  try {
    // Check if there are existing contacts
    const { rows } = await pool.query("SELECT COUNT(*) FROM admin_outreach_contacts")
    const existing = parseInt(rows[0].count)
    if (existing > 0) {
      console.log(`  ⚠ Table already has ${existing} contacts. Skipping insert to avoid duplicates.`)
      console.log(`  To re-seed, run: DELETE FROM admin_outreach_contacts;`)
      return
    }

    // Insert contacts
    let inserted = 0
    for (const c of unique) {
      try {
        await pool.query(
          `INSERT INTO admin_outreach_contacts (name, org, title, contact_type, twitter_handle, relevance_score, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'not_contacted')`,
          [c.name, c.org, c.title, c.contact_type, c.twitter_handle || null, c.relevance_score]
        )
        inserted++
      } catch (err) {
        console.warn(`  ⚠ Failed to insert "${c.name}": ${err.message}`)
      }
    }

    console.log(`\n✅ Inserted ${inserted} outreach contacts.`)
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
