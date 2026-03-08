const pg = require('pg');

async function run() {
  const client = new pg.Client({
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.jsotyddqomlmgfvumrle',
    password: 'ax1t3ezqZYQ3ofQX',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  // Jake's user ID
  const userID = '516afd17-2d54-481e-b4ca-ebde5eecc813';

  const fams = await client.query(
    `SELECT f.id, f.name FROM families f JOIN family_members fm ON fm.family_id = f.id WHERE fm.user_id = $1`,
    [userID]
  );
  console.log('Families:', JSON.stringify(fams.rows, null, 2));

  for (const f of fams.rows) {
    const kids = await client.query('SELECT id, name, birth_date FROM children WHERE family_id = $1', [f.id]);
    console.log(`\nChildren in "${f.name}":`, JSON.stringify(kids.rows, null, 2));
  }

  await client.end();
}

run().catch(e => console.error(e));
