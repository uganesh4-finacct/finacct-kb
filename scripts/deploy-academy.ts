/**
 * Full Academy deploy: migrations → seeds → track assignment → verify → report.
 * Stops on first error.
 *
 * Usage: npx tsx scripts/deploy-academy.ts
 */

import { spawnSync } from 'child_process'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'

function run(label: string, command: string, args: string[]) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(label)
  console.log(`${'='.repeat(60)}`)
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: process.cwd(),
  })
  if (result.status !== 0) {
    console.error(`\n✗ FAILED: ${label} (exit ${result.status})`)
    process.exit(result.status ?? 1)
  }
  console.log(`✓ ${label}`)
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

async function finalReport() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  console.log(`\n${'='.repeat(60)}`)
  console.log('STEP 5 — Final state report')
  console.log(`${'='.repeat(60)}`)
  console.log(`Project: ${projectHost()}`)

  const { data: sections } = await supabase
    .from('kb_sections')
    .select('id, slug, title, is_published')
    .order('order_index')

  console.log('\nKB sections:')
  let totalArticles = 0
  for (const section of sections ?? []) {
    const { count } = await supabase
      .from('kb_articles')
      .select('*', { count: 'exact', head: true })
      .eq('section_id', section.id)
    const n = count ?? 0
    totalArticles += n
    console.log(`  ${section.slug}: ${n} articles (section published: ${section.is_published})`)
  }
  console.log(`  TOTAL articles: ${totalArticles}`)

  const ce = sections?.find((s) => s.slug === 'client-education')
  console.log(`\nClient Education published: ${ce?.is_published ?? 'N/A'}`)

  const gates = await supabase.from('certification_gates').select('gate').limit(1)
  console.log(`certification_gates table: ${gates.error ? 'MISSING' : 'exists'}`)

  const { data: tracks } = await supabase
    .from('training_tracks')
    .select('id, slug, title, order_index')
    .order('order_index')

  console.log('\nModules per track:')
  for (const track of tracks ?? []) {
    const { count } = await supabase
      .from('training_modules')
      .select('*', { count: 'exact', head: true })
      .eq('track_id', track.id)
    console.log(`  ${track.slug}: ${count ?? 0}`)
  }

  const { count: grandfathered } = await supabase
    .from('certification_gates')
    .select('*', { count: 'exact', head: true })
    .ilike('notes', '%Grandfathered%')

  console.log(`\nGrandfathered accountants (gate notes): ${grandfathered ?? 0}`)
}

async function main() {
  console.log('FinAcct360 Academy — production deploy')
  console.log(`Target: ${projectHost()}`)
  console.log('\nPre-flight migration list (chronological):')
  const migrations = [
    '20250705100000_editor_article_rls.sql',
    '20250705120000_publish_client_education.sql',
    '20250705200000_certification_gates.sql',
    '20250705210000_training_tracks_payroll.sql',
    '20250705220000_training_track_pos.sql',
    '20250705230000_training_tracks_all_five.sql',
  ]
  for (const m of migrations) console.log(`  - ${m}`)

  run('STEP 1 — Migrations', 'npx', ['tsx', 'scripts/run-migrations.ts'])
  run('STEP 2a — seed:kb', 'npm', ['run', 'seed:kb'])
  run('STEP 2b — seed:payroll', 'npm', ['run', 'seed:payroll'])
  run('STEP 2c — seed:tech-stack', 'npm', ['run', 'seed:tech-stack'])
  run('STEP 3 — assign tracks', 'npx', ['tsx', 'scripts/assign-training-tracks.ts'])
  run('STEP 4 — verify:kb', 'npm', ['run', 'verify:kb'])
  await finalReport()
  console.log('\nDeploy completed successfully.')
}

main()
