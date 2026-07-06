/**
 * Apply pending SQL migrations to the connected Supabase Postgres database.
 * Requires DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local
 *
 * Usage: npx tsx scripts/run-migrations.ts [migration-file...]
 * With no args, applies the July 2025 deploy migration set in order.
 */

import dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import pg from 'pg'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

const { Client } = pg

async function applyViaManagementApi(filename: string, sql: string) {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  const projectRef =
    process.env.SUPABASE_PROJECT_REF ??
    (process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
      : null)

  if (!token || !projectRef) {
    throw new Error('SUPABASE_ACCESS_TOKEN required for Management API fallback')
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Management API ${res.status}: ${body}`)
  }
}

const DEFAULT_MIGRATIONS = [
  '20250705100000_editor_article_rls.sql',
  '20250705120000_publish_client_education.sql',
  '20250705200000_certification_gates.sql',
  '20250705210000_training_tracks_payroll.sql',
  '20250705220000_training_track_pos.sql',
  '20250705230000_training_tracks_all_five.sql',
]

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const password = process.env.SUPABASE_DB_PASSWORD
  const projectRef = process.env.SUPABASE_PROJECT_REF
    ?? (process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
      : null)

  if (!password || !projectRef) {
    console.error(
      'Missing DATABASE_URL or SUPABASE_DB_PASSWORD (+ NEXT_PUBLIC_SUPABASE_URL for project ref).'
    )
    process.exit(1)
  }

  const host = process.env.SUPABASE_DB_HOST ?? `db.${projectRef}.supabase.co`
  const port = process.env.SUPABASE_DB_PORT ?? '5432'
  const user = process.env.SUPABASE_DB_USER ?? 'postgres'
  const database = process.env.SUPABASE_DB_NAME ?? 'postgres'

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
}

function projectHost(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return '(unknown)'
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

async function applyMigrationPg(client: pg.Client, filename: string) {
  const path = resolve(process.cwd(), 'supabase/migrations', filename)
  const sql = readFileSync(path, 'utf8')
  console.log(`\n▶ ${filename}`)
  await client.query(sql)
  console.log(`✓ ${filename}`)
}

function canUsePg(): boolean {
  if (process.env.DATABASE_URL) return true
  return Boolean(process.env.SUPABASE_DB_PASSWORD && process.env.NEXT_PUBLIC_SUPABASE_URL)
}

function canUseManagementApi(): boolean {
  return Boolean(process.env.SUPABASE_ACCESS_TOKEN && process.env.NEXT_PUBLIC_SUPABASE_URL)
}

async function main() {
  const files = process.argv.slice(2)
  const migrations = files.length > 0 ? files : DEFAULT_MIGRATIONS

  console.log('FinAcct360 Academy — apply migrations')
  console.log(`Target: ${projectHost()}`)
  console.log('Pending migrations:')
  for (const file of migrations) console.log(`  - ${file}`)

  if (!canUsePg() && !canUseManagementApi()) {
    console.error(
      '\nMissing credentials. Set DATABASE_URL or SUPABASE_DB_PASSWORD, or SUPABASE_ACCESS_TOKEN.'
    )
    process.exit(1)
  }

  let client: pg.Client | null = null

  try {
    if (canUsePg()) {
      client = new Client({
        connectionString: getDatabaseUrl(),
        ssl: { rejectUnauthorized: false },
      })
      await client.connect()
      console.log('\nConnected to Postgres (direct).')

      for (const file of migrations) {
        await applyMigrationPg(client, file)
      }
    } else {
      console.log('\nUsing Supabase Management API.')
      for (const file of migrations) {
        const path = resolve(process.cwd(), 'supabase/migrations', file)
        const sql = readFileSync(path, 'utf8')
        console.log(`\n▶ ${file}`)
        await applyViaManagementApi(file, sql)
        console.log(`✓ ${file}`)
      }
    }

    console.log('\nAll migrations applied successfully.')
  } catch (err) {
    console.error('\n✗ Migration failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  } finally {
    if (client) await client.end()
  }
}

main()
