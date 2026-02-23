import * as stytch from "stytch"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.INVESTOR_DB_URL,
  ssl: { rejectUnauthorized: false },
})

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID!,
  secret: process.env.STYTCH_SECRET!,
  env:
    process.env.STYTCH_PROJECT_ENV === "live"
      ? stytch.envs.live
      : stytch.envs.test,
})

interface ApprovedInvestor {
  phone_e164: string
  name: string
  company: string
  referred_by: string
}

function parseName(fullName: string): { first_name: string; last_name: string } {
  const trimmed = fullName.trim()
  if (!trimmed) return { first_name: "", last_name: "" }
  const spaceIndex = trimmed.indexOf(" ")
  if (spaceIndex === -1) return { first_name: trimmed, last_name: "" }
  return {
    first_name: trimmed.slice(0, spaceIndex),
    last_name: trimmed.slice(spaceIndex + 1),
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log("Starting investor migration to Stytch...")

  const { rows: investors } = await pool.query<ApprovedInvestor>(
    "SELECT phone_e164, name, company, referred_by FROM investor_approved_phones WHERE is_active = TRUE ORDER BY id",
  )

  console.log(`Found ${investors.length} active investors to migrate`)

  let created = 0
  let skipped = 0
  let errors = 0

  for (const investor of investors) {
    const { first_name, last_name } = parseName(investor.name)

    try {
      await client.users.create({
        phone_number: investor.phone_e164,
        trusted_metadata: {
          role: "investor",
          is_approved: true,
          company: investor.company,
          referred_by: investor.referred_by || null,
        },
        name: { first_name, last_name },
      })
      created++
      console.log(`[${created + skipped + errors}/${investors.length}] Created: ${investor.phone_e164} (${investor.name})`)
    } catch (err: any) {
      if (err?.status_code === 409 || err?.error_type === "duplicate_user") {
        skipped++
        console.log(`[${created + skipped + errors}/${investors.length}] Skipped (duplicate): ${investor.phone_e164}`)
      } else {
        errors++
        console.error(`[${created + skipped + errors}/${investors.length}] Error for ${investor.phone_e164}:`, err?.message || err)
      }
    }

    // Stay under 65 req/sec rate limit
    await delay(20)
  }

  console.log("\nMigration complete:")
  console.log(`  Created: ${created}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Errors:  ${errors}`)
  console.log(`  Total:   ${investors.length}`)

  await pool.end()
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
