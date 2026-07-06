/**
 * Step 3: Assign training_modules to tracks using track_id + order_index.
 * Run after migrations and seed:kb / seed:payroll / seed:tech-stack.
 *
 * Usage: npx tsx scripts/assign-training-tracks.ts
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

/** Global order_index blocks; contiguous for flat unlock sequence. */
const TRACK_ASSIGNMENTS: Record<string, { slug: string; order_index: number }[]> = {
  foundations: [
    { slug: 'us-restaurant-industry', order_index: 1 },
    { slug: 'restaurant-roles-operations', order_index: 2 },
    { slug: 'restaurant-finances-taxes', order_index: 3 },
    { slug: 'kpi-fundamentals', order_index: 4 },
  ],
  qbo: [
    { slug: 'restaurant-accounting-basics', order_index: 5 },
    { slug: 'chart-of-accounts', order_index: 6 },
    { slug: 'reading-restaurant-pl', order_index: 7 },
    { slug: 'qbo-essentials', order_index: 8 },
  ],
  pos: [
    { slug: 'pos-square', order_index: 9 },
    { slug: 'pos-toast', order_index: 10 },
    { slug: 'pos-clover', order_index: 11 },
    { slug: 'restaurant-tech-stack', order_index: 12 },
  ],
  payroll: [
    { slug: 'payroll-restaurant-anatomy', order_index: 13 },
    { slug: 'payroll-tips-liability', order_index: 14 },
    { slug: 'payroll-overtime-labor-analysis', order_index: 15 },
    { slug: 'payroll-reading-register', order_index: 16 },
    { slug: 'payroll-weekly-close', order_index: 17 },
  ],
  platform: [
    { slug: 'weekly-close-process', order_index: 18 },
    { slug: 'common-mistakes', order_index: 19 },
  ],
}

async function getTrackIds(): Promise<Map<string, string>> {
  const slugs = Object.keys(TRACK_ASSIGNMENTS)
  const { data, error } = await supabase
    .from('training_tracks')
    .select('id, slug')
    .in('slug', slugs)

  if (error) throw error

  const map = new Map<string, string>()
  for (const row of data ?? []) {
    map.set(row.slug, row.id)
  }

  for (const slug of slugs) {
    if (!map.has(slug)) {
      throw new Error(`Track not found: ${slug}. Run migrations first.`)
    }
  }

  return map
}

async function assignTracks() {
  const trackIds = await getTrackIds()

  for (const [trackSlug, modules] of Object.entries(TRACK_ASSIGNMENTS)) {
    const trackId = trackIds.get(trackSlug)!
    for (const { slug, order_index } of modules) {
      const { data, error } = await supabase
        .from('training_modules')
        .update({ track_id: trackId, order_index })
        .eq('slug', slug)
        .select('slug, title, track_id, order_index')

      if (error) throw error
      if (!data?.length) {
        throw new Error(`Module not found: ${slug}`)
      }
      console.log(`  ✓ ${trackSlug} / ${slug} → order_index ${order_index}`)
    }
  }
}

async function printMappingTable() {
  const { data: tracks } = await supabase
    .from('training_tracks')
    .select('id, slug, title, order_index')
    .order('order_index')

  const trackById = new Map((tracks ?? []).map((t) => [t.id, t]))

  const { data: modules, error } = await supabase
    .from('training_modules')
    .select('slug, title, track_id, order_index, is_published')
    .order('order_index')

  if (error) throw error

  console.log('\nModule → track mapping:')
  console.log('track_slug | order_index | slug | title | published')
  console.log('-'.repeat(90))

  for (const m of modules ?? []) {
    const track = m.track_id ? trackById.get(m.track_id) : null
    console.log(
      `${track?.slug ?? '(none)'.padEnd(12)} | ${String(m.order_index).padStart(11)} | ${m.slug} | ${m.title} | ${m.is_published}`
    )
  }

  const orphaned = (modules ?? []).filter((m) => !m.track_id)
  if (orphaned.length > 0) {
    console.error(`\n✗ ${orphaned.length} module(s) still missing track_id`)
    process.exit(1)
  }

  const { count: trackCount } = await supabase
    .from('training_tracks')
    .select('*', { count: 'exact', head: true })

  console.log(`\nTracks: ${trackCount ?? 0} | Modules: ${modules?.length ?? 0} | Orphaned: 0`)
}

async function main() {
  console.log('FinAcct360 — Step 3: assign modules to tracks\n')
  try {
    await assignTracks()
    await printMappingTable()
    console.log('\nTrack assignment completed.')
  } catch (err) {
    console.error('Track assignment failed:', err)
    process.exit(1)
  }
}

main()
