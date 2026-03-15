#!/usr/bin/env node

/**
 * gmail-history-import.mjs
 *
 * Runs every 4 hours. Imports sent email history from connected Gmail accounts
 * into the outreach CRM, creating contacts and activity records.
 *
 * Environment:
 *   API_URL      — Backend API URL (default: https://api.phosra.com)
 *   WORKER_API_KEY — Shared secret for worker API auth (X-Worker-Key header)
 *   DATABASE_URL — Postgres connection string (for run record)
 *   MAX_PAGES    — Max pagination pages per account (default: 20)
 *   DELAY_MS     — Delay between page fetches in ms (default: 500)
 *   SKIP_DOMAINS — Comma-separated domains to ignore (default: phosra.com,guardiangate.com)
 *   RUN_ID       — (optional) Existing run ID from API trigger
 */

import pg from "pg"

const API_URL = process.env.API_URL || "https://api.phosra.com"
const WORKER_KEY = process.env.WORKER_API_KEY || ""
const DATABASE_URL = process.env.DATABASE_URL || ""
const MAX_PAGES = parseInt(process.env.MAX_PAGES || "20", 10)
const DELAY_MS = parseInt(process.env.DELAY_MS || "500", 10)
const SKIP_DOMAINS = (process.env.SKIP_DOMAINS || "phosra.com,guardiangate.com")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean)

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

function parseEmailAddress(raw) {
  const match = raw.match(/<([^>]+)>/)
  const email = match ? match[1] : raw.trim()
  const name = match
    ? raw
        .replace(/<[^>]+>/, "")
        .trim()
        .replace(/^["']|["']$/g, "")
    : ""
  return { email: email.toLowerCase(), name }
}

function shouldSkipEmail(email) {
  if (!email) return true
  const lower = email.toLowerCase()
  if (lower.startsWith("noreply@") || lower.startsWith("mailer-daemon@"))
    return true
  const domain = lower.split("@")[1]
  if (!domain) return true
  return SKIP_DOMAINS.includes(domain)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const pool = DATABASE_URL
    ? new pg.Pool({ connectionString: DATABASE_URL })
    : null
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  if (!pool) {
    console.warn("DATABASE_URL not set — run tracking will be skipped")
  }

  try {
    if (pool && !hasExistingRun) {
      await pool.query(
        `INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at)
         VALUES ($1, 'gmail-history-import', 'running', $2, NOW())`,
        [runId, process.env.GITHUB_ACTIONS ? "cron" : "manual"]
      )
    }

    if (!WORKER_KEY) throw new Error("WORKER_API_KEY not set")

    // Get all connected Google accounts
    const accounts = await apiFetch("/google/accounts")
    const accountKeys = Array.isArray(accounts)
      ? accounts
      : accounts?.accounts || []

    if (accountKeys.length === 0) {
      const summary = "No connected Google accounts found."
      if (pool) {
        await pool.query(
          `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = 0 WHERE id = $2`,
          [summary, runId]
        )
      }
      console.log(summary)
      return
    }

    const totals = {
      accounts_processed: 0,
      messages_imported: 0,
      contacts_created: 0,
      messages_skipped: 0,
      errors: 0,
    }

    for (const key of accountKeys) {
      try {
        console.log(`Processing account: ${key}`)

        // Get sync state for this account
        let syncState
        try {
          syncState = await apiFetch(`/gmail/sync-state/${encodeURIComponent(key)}`)
        } catch {
          syncState = null
        }
        const lastEpochMs = syncState?.last_message_epoch_ms || 0

        // Build search query
        let query = "in:sent"
        if (lastEpochMs > 0) {
          const epochSeconds = Math.floor(lastEpochMs / 1000)
          query += ` after:${epochSeconds}`
        }

        let pageToken = null
        let pageCount = 0
        let maxEpochMs = lastEpochMs
        let accountImported = 0
        let accountContactsCreated = 0

        // Page through search results
        do {
          let url = `/gmail/search?account_key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&maxResults=20`
          if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`

          const searchResult = await apiFetch(url)
          const messages = searchResult?.messages || []
          pageToken = searchResult?.next_page_token || searchResult?.nextPageToken || null

          for (const msg of messages) {
            // Track max epoch for ALL messages (including skipped) to advance watermark correctly
            if (msg.internal_date) {
              const msgEpoch = parseInt(msg.internal_date)
              if (msgEpoch > maxEpochMs) maxEpochMs = msgEpoch
            }

            try {
              // Dedup: check if activity already exists for this message
              const exists = await apiFetch(
                `/outreach/activity-exists/${encodeURIComponent(msg.id)}`
              )
              if (exists?.exists) {
                totals.messages_skipped++
                continue
              }

              // Parse recipients from To + Cc
              const recipients = []
              const toList = Array.isArray(msg.to) ? msg.to : msg.to ? [msg.to] : []
              const ccList = Array.isArray(msg.cc) ? msg.cc : msg.cc ? [msg.cc] : []

              for (const raw of [...toList, ...ccList]) {
                const parsed = parseEmailAddress(raw)
                if (!shouldSkipEmail(parsed.email)) {
                  recipients.push(parsed)
                }
              }

              if (recipients.length === 0) {
                totals.messages_skipped++
                continue
              }

              for (const recipient of recipients) {
                // Upsert contact
                const contactResult = await apiFetch(
                  "/outreach/contacts/upsert-by-email",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      email: recipient.email,
                      name: recipient.name,
                      organization: "",
                      title: "",
                    }),
                  }
                )
                const contactId = contactResult?.id || contactResult?.contact_id
                if (contactResult?.created) accountContactsCreated++

                // Create activity record
                const occurredAt = msg.internal_date
                  ? new Date(parseInt(msg.internal_date)).toISOString()
                  : new Date().toISOString()

                await apiFetch(`/outreach/${contactId}/activity`, {
                  method: "POST",
                  body: JSON.stringify({
                    type: "history_import",
                    direction: "outbound",
                    subject: msg.subject || "(no subject)",
                    body: msg.snippet || "",
                    gmail_message_id: msg.id,
                    gmail_thread_id: msg.threadId,
                    occurred_at: occurredAt,
                  }),
                })
              }

              accountImported++
              // Small delay between messages to avoid rate limits
              await sleep(100)
            } catch (err) {
              console.error(`  Error processing message ${msg.id}:`, err.message)
              totals.errors++
              // Back off on rate limit errors
              if (err.message.includes("429")) await sleep(5000)
            }
          }

          pageCount++
          if (pageToken && pageCount < MAX_PAGES) {
            await sleep(DELAY_MS)
          }
        } while (pageToken && pageCount < MAX_PAGES)

        // Only update watermark if we finished all pages (no remaining pageToken)
        // Otherwise we'd skip older emails on the next run since Gmail returns newest-first
        const completedAllPages = !pageToken
        await apiFetch(`/gmail/sync-state/${encodeURIComponent(key)}`, {
          method: "PUT",
          body: JSON.stringify({
            last_message_epoch_ms: completedAllPages ? maxEpochMs : lastEpochMs,
            messages_imported: accountImported,
            contacts_created: accountContactsCreated,
          }),
        })
        if (!completedAllPages) {
          console.log(`  Account ${key}: stopped at page ${pageCount}/${MAX_PAGES}, watermark NOT advanced (will rescan older emails next run)`)
        }

        totals.accounts_processed++
        totals.messages_imported += accountImported
        totals.contacts_created += accountContactsCreated

        console.log(
          `  Account ${key}: ${accountImported} messages imported, ${accountContactsCreated} contacts created`
        )
      } catch (err) {
        console.error(`Error processing account ${key}:`, err.message)
        totals.errors++
      }
    }

    const summary = `Processed ${totals.accounts_processed} accounts: ${totals.messages_imported} messages imported, ${totals.contacts_created} contacts created, ${totals.messages_skipped} skipped, ${totals.errors} errors.`
    if (pool) {
      await pool.query(
        `UPDATE admin_worker_runs SET status = 'completed', completed_at = NOW(), output_summary = $1, items_processed = $2 WHERE id = $3`,
        [summary, totals.messages_imported, runId]
      )
    }

    console.log(summary)
  } catch (err) {
    console.error("Worker failed:", err.message)
    if (pool) {
      await pool
        .query(
          `UPDATE admin_worker_runs SET status = 'failed', completed_at = NOW(), error_message = $1 WHERE id = $2`,
          [err.message, runId]
        )
        .catch(() => {})
    }
    process.exit(1)
  } finally {
    if (pool) await pool.end()
  }
}

main()
