import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.INVESTOR_DB_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // 1. Rename table
    await client.query(
      `ALTER TABLE admin_fundraise_state RENAME TO admin_dashboard_state`
    )
    console.log("Renamed admin_fundraise_state → admin_dashboard_state")

    // 2. Clear existing rows (shared, no user_id)
    await client.query(`DELETE FROM admin_dashboard_state`)
    console.log("Cleared existing rows")

    // 3. Add user_id column
    await client.query(
      `ALTER TABLE admin_dashboard_state ADD COLUMN user_id TEXT NOT NULL`
    )
    console.log("Added user_id column")

    // 4. Drop old primary key and add composite PK
    await client.query(
      `ALTER TABLE admin_dashboard_state DROP CONSTRAINT admin_fundraise_state_pkey`
    )
    await client.query(
      `ALTER TABLE admin_dashboard_state ADD PRIMARY KEY (user_id, key)`
    )
    console.log("Changed primary key to (user_id, key)")

    await client.query("COMMIT")
    console.log("Migration complete!")
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Migration failed, rolled back:", err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
