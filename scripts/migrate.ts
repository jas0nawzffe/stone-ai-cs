import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Pool } = pg;

const DB_PASSWORD = process.env.DB_PASSWORD;
const PROJECT_REF = 'aynwgsdsaezbaojzlmhp';

if (!DB_PASSWORD) {
  console.error('Usage: DB_PASSWORD=xxx npx tsx scripts/migrate.ts');
  process.exit(1);
}

async function main() {
  const pool = new Pool({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query('SELECT 1');
    console.log('✓ Connected to database');

    const sql = readFileSync(
      join(__dirname, '..', 'supabase', 'migrations', '00001_initial_schema.sql'),
      'utf-8'
    );

    await pool.query(sql);
    console.log('✓ Migration executed successfully');

    // Also run seed data
    const seedSql = readFileSync(
      join(__dirname, '..', 'supabase', 'seed.sql'),
      'utf-8'
    );

    await pool.query(seedSql);
    console.log('✓ Seed data inserted');
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
