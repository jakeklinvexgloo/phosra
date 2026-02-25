#!/usr/bin/env node

/**
 * platform-researcher.mjs
 *
 * Weekly worker (Thursday 6am UTC) that researches parental controls
 * on the stalest platforms that have both adapters and credentials configured.
 *
 * Runs via GitHub Actions or manual trigger from admin dashboard.
 * Selects stalest platforms, runs research sequentially with delays between.
 *
 * Environment:
 *   DATABASE_URL               — Postgres connection string
 *   SUPABASE_URL               — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — Supabase service role key
 *   RUN_ID                     — (optional) Existing run ID from API trigger
 *
 * CLI args:
 *   --limit N        — Number of platforms to research (default: 10)
 *   --platform <id>  — Research a single specific platform
 *   --dry-run        — Show what would be researched without actually running
 */

import { createClient } from "@supabase/supabase-js"
import { parseArgs } from "node:util"

// ── CLI Args ────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    limit: { type: "string", default: "10" },
    platform: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
  strict: false,
})

const PLATFORM_LIMIT = parseInt(args.limit || "10", 10)
const SINGLE_PLATFORM_ID = args.platform || null
const DRY_RUN = args["dry-run"] || false
const DELAY_BETWEEN_MS = 15_000 // 15s between platforms

// ── Logging ─────────────────────────────────────────────────────

function log(message) {
  const ts = new Date().toISOString().replace("T", " ").replace(/\.\d+Z/, "Z")
  console.log(`[${ts}] ${message}`)
}

function logError(message) {
  const ts = new Date().toISOString().replace("T", " ").replace(/\.\d+Z/, "Z")
  console.error(`[${ts}] ERROR: ${message}`)
}

// ── Supabase Client ─────────────────────────────────────────────

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    )
  }

  return createClient(url, key)
}

// ── Platform Selection ──────────────────────────────────────────

/**
 * Get all platform IDs that have both a research adapter AND credentials configured.
 * Uses dynamic imports from the web/src/lib modules.
 */
async function getResearchablePlatformIds() {
  const { getAdapterPlatformIds } = await import(
    "../../web/src/lib/platform-research/adapter-registry.ts"
  )
  const { getConfiguredPlatformIds } = await import(
    "../../web/src/lib/platform-research/credentials-loader.ts"
  )

  const adapterIds = getAdapterPlatformIds()
  const credentialIds = await getConfiguredPlatformIds()

  // Intersection: platforms that have BOTH adapter and credentials
  const credentialSet = new Set(credentialIds)
  return adapterIds.filter((id) => credentialSet.has(id))
}

/**
 * Query DB for the stalest platforms (oldest completed_at or never researched).
 * Returns platform objects with { id, name, lastResearchedAt }.
 */
async function getStalestPlatforms(supabase, researchableIds, limit) {
  // Import platform registry to look up names
  const { PLATFORM_REGISTRY } = await import(
    "../../web/src/lib/platforms/registry.ts"
  )

  const registryMap = new Map(
    PLATFORM_REGISTRY.map((p) => [p.id, p])
  )

  // Get last research date for each platform
  const { data: existingResults, error } = await supabase
    .from("platform_research_results")
    .select("platform_id, completed_at")
    .in("platform_id", researchableIds)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to query research results: ${error.message}`)
  }

  // Build a map of platform_id -> most recent completed_at
  const lastResearchedMap = new Map()
  for (const row of existingResults || []) {
    if (!lastResearchedMap.has(row.platform_id)) {
      lastResearchedMap.set(row.platform_id, row.completed_at)
    }
  }

  // Build platform list with staleness info
  const platforms = researchableIds.map((id) => ({
    id,
    name: registryMap.get(id)?.name || id,
    lastResearchedAt: lastResearchedMap.get(id) || null,
  }))

  // Sort: never researched first (null dates), then oldest first
  platforms.sort((a, b) => {
    if (!a.lastResearchedAt && !b.lastResearchedAt) return 0
    if (!a.lastResearchedAt) return -1
    if (!b.lastResearchedAt) return 1
    return new Date(a.lastResearchedAt).getTime() - new Date(b.lastResearchedAt).getTime()
  })

  return platforms.slice(0, limit)
}

// ── Research Execution ──────────────────────────────────────────

async function main() {
  log("Platform Researcher starting")
  log(`Config: limit=${PLATFORM_LIMIT}, dryRun=${DRY_RUN}, singlePlatform=${SINGLE_PLATFORM_ID || "none"}`)

  const supabase = getSupabaseClient()
  const runId = process.env.RUN_ID || crypto.randomUUID()
  const hasExistingRun = !!process.env.RUN_ID

  let completedCount = 0
  let failedCount = 0
  let skippedCount = 0

  try {
    // Step 1: Determine which platforms to research
    let platformsToResearch

    if (SINGLE_PLATFORM_ID) {
      // Single platform mode
      const { PLATFORM_REGISTRY } = await import(
        "../../web/src/lib/platforms/registry.ts"
      )
      const entry = PLATFORM_REGISTRY.find((p) => p.id === SINGLE_PLATFORM_ID)
      if (!entry) {
        throw new Error(`Platform "${SINGLE_PLATFORM_ID}" not found in registry`)
      }
      platformsToResearch = [{ id: entry.id, name: entry.name, lastResearchedAt: null }]
    } else {
      // Batch mode: find stalest platforms
      const researchableIds = await getResearchablePlatformIds()
      log(`Found ${researchableIds.length} platforms with adapters + credentials: ${researchableIds.join(", ")}`)

      if (researchableIds.length === 0) {
        log("No platforms have both adapters and credentials configured. Exiting.")
        process.exit(0)
      }

      platformsToResearch = await getStalestPlatforms(supabase, researchableIds, PLATFORM_LIMIT)
    }

    const totalCount = platformsToResearch.length
    log(`Selected ${totalCount} platforms to research:`)
    for (const p of platformsToResearch) {
      const staleness = p.lastResearchedAt
        ? `last researched ${p.lastResearchedAt}`
        : "never researched"
      log(`  - ${p.name} (${p.id}) — ${staleness}`)
    }

    // Dry run: just print what would happen
    if (DRY_RUN) {
      log("DRY RUN — no research will be executed. Exiting.")
      process.exit(0)
    }

    // Step 2: Create a research run record
    if (!hasExistingRun) {
      const { error: runError } = await supabase
        .from("platform_research_runs")
        .insert({
          id: runId,
          trigger_type: SINGLE_PLATFORM_ID ? "manual" : "scheduled",
          status: "running",
          platform_ids: platformsToResearch.map((p) => p.id),
          completed_count: 0,
          failed_count: 0,
          total_count: totalCount,
          started_at: new Date().toISOString(),
        })

      if (runError) {
        throw new Error(`Failed to create run record: ${runError.message}`)
      }
    }

    log(`Run ID: ${runId}`)

    // Step 3: Import the research runner
    const { researchPlatform } = await import(
      "../../web/src/lib/platform-research/runner.ts"
    )

    // Step 4: Research each platform sequentially
    for (let i = 0; i < platformsToResearch.length; i++) {
      const platform = platformsToResearch[i]
      const progress = `[${i + 1}/${totalCount}]`

      log(`${progress} Researching ${platform.name} (${platform.id})...`)

      try {
        const result = await researchPlatform(
          platform.id,
          platform.name,
          SINGLE_PLATFORM_ID ? "manual" : "scheduled",
          {
            onStatusChange: (pid, status, message) => {
              log(`${progress} ${platform.name}: ${status} — ${message || ""}`)
            },
          }
        )

        // Store result in platform_research_results
        const { error: resultError } = await supabase
          .from("platform_research_results")
          .insert({
            id: result.id,
            platform_id: result.platformId,
            platform_name: result.platformName,
            status: result.status,
            trigger_type: result.triggerType,
            screenshots: result.screenshots,
            notes: result.notes,
            error_message: result.errorMessage || null,
            started_at: result.startedAt,
            completed_at: result.completedAt || new Date().toISOString(),
            duration_ms: result.durationMs || null,
            run_id: runId,
          })

        if (resultError) {
          logError(`Failed to store result for ${platform.name}: ${resultError.message}`)
        }

        // Track counts
        if (result.status === "completed") {
          completedCount++
          const capCount = result.notes?.capabilities?.length || 0
          const ssCount = result.screenshots?.length || 0
          log(`${progress} ${platform.name}: COMPLETED — ${capCount} capabilities, ${ssCount} screenshots, ${result.durationMs}ms`)
        } else if (result.status === "skipped") {
          skippedCount++
          log(`${progress} ${platform.name}: SKIPPED — ${result.errorMessage}`)
        } else {
          failedCount++
          logError(`${progress} ${platform.name}: FAILED — ${result.errorMessage}`)
        }

        // Update run record with current progress
        const { error: updateError } = await supabase
          .from("platform_research_runs")
          .update({
            completed_count: completedCount,
            failed_count: failedCount + skippedCount,
          })
          .eq("id", runId)

        if (updateError) {
          logError(`Failed to update run progress: ${updateError.message}`)
        }
      } catch (err) {
        failedCount++
        logError(`${progress} ${platform.name}: EXCEPTION — ${err.message}`)

        // Store the failure
        const { error: failError } = await supabase
          .from("platform_research_results")
          .insert({
            id: crypto.randomUUID(),
            platform_id: platform.id,
            platform_name: platform.name,
            status: "failed",
            trigger_type: SINGLE_PLATFORM_ID ? "manual" : "scheduled",
            screenshots: [],
            notes: null,
            error_message: err.message,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            duration_ms: 0,
            run_id: runId,
          })

        if (failError) {
          logError(`Failed to store failure record: ${failError.message}`)
        }
      }

      // Delay between platforms (skip after last one)
      if (i < platformsToResearch.length - 1 && DELAY_BETWEEN_MS > 0) {
        log(`Waiting ${DELAY_BETWEEN_MS / 1000}s before next platform...`)
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_MS))
      }
    }

    // Step 5: Mark the run as completed
    const summary = [
      `Researched ${platformsToResearch.length} platforms.`,
      `  Completed: ${completedCount}`,
      `  Failed: ${failedCount}`,
      `  Skipped: ${skippedCount}`,
    ].join("\n")

    const { error: finalError } = await supabase
      .from("platform_research_runs")
      .update({
        status: failedCount === platformsToResearch.length ? "failed" : "completed",
        completed_count: completedCount,
        failed_count: failedCount + skippedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId)

    if (finalError) {
      logError(`Failed to finalize run record: ${finalError.message}`)
    }

    // Also update admin_worker_runs if that table is used
    try {
      if (!hasExistingRun) {
        await supabase.from("admin_worker_runs").insert({
          id: crypto.randomUUID(),
          worker_id: "platform-researcher",
          status: failedCount === platformsToResearch.length ? "failed" : "completed",
          trigger_type: SINGLE_PLATFORM_ID ? "manual" : "scheduled",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          output_summary: summary,
          items_processed: completedCount,
        })
      }
    } catch {
      // admin_worker_runs table may not exist — non-critical
    }

    log("")
    log("=== Research Run Complete ===")
    log(summary)

    if (failedCount === platformsToResearch.length) {
      process.exit(1)
    }
  } catch (err) {
    logError(`Platform researcher failed: ${err.message}`)
    logError(err.stack || "")

    // Try to mark the run as failed
    try {
      await supabase
        .from("platform_research_runs")
        .update({
          status: "failed",
          completed_count: completedCount,
          failed_count: failedCount,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId)
    } catch {
      // Best-effort
    }

    process.exit(1)
  }
}

main()
