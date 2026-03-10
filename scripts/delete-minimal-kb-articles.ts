/**
 * Delete KB articles that have minimal content (header-only or placeholder).
 * Use this to remove old/empty cards from the Chart of Accounts (or any) section.
 *
 * Usage:
 *   npx ts-node scripts/delete-minimal-kb-articles.ts
 *   npx ts-node scripts/delete-minimal-kb-articles.ts --section chart-of-accounts
 *   npx ts-node scripts/delete-minimal-kb-articles.ts --section standard-operating-procedures --all
 *
 * Use --all to delete ALL articles in the section (e.g. before re-seeding with new 2.1–2.5 or 3.1–3.8 structure).
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const MIN_WORDS = 100
/** COA section: require more content to count as "full" (keep only these, remove rest) */
const COA_MIN_WORDS = 150
const sectionSlug = process.argv.includes('--section')
  ? process.argv[process.argv.indexOf('--section') + 1] ?? 'chart-of-accounts'
  : 'chart-of-accounts'

/** If set, delete only these slugs (in the section above). Example: --slugs coa-master-framework,assets-accounts-1000s */
const slugsArg = process.argv.includes('--slugs') ? process.argv[process.argv.indexOf('--slugs') + 1] : null
const slugsToDelete = slugsArg ? slugsArg.split(',').map((s) => s.trim()).filter(Boolean) : null
/** If true, delete ALL articles in the section (use before re-seeding with new structure). */
const deleteAllInSection = process.argv.includes('--all')

function wordCount(content: unknown): number {
  if (content == null) return 0
  return JSON.stringify(content).split(/\s+/).length
}

async function main() {
  const bySlugs = slugsToDelete ? ` (slugs: ${slugsToDelete.join(', ')})` : ''
  const byAll = deleteAllInSection ? ' (all articles)' : ''
  const byWords = !deleteAllInSection && !slugsToDelete ? ` (< ${sectionSlug === 'chart-of-accounts' ? COA_MIN_WORDS : MIN_WORDS} words)` : ''
  console.log(`\n🗑️  Deleting KB articles from section: ${sectionSlug}${byAll}${bySlugs}${byWords}\n`)

  const { data: section } = await supabase
    .from('kb_sections')
    .select('id, title')
    .eq('slug', sectionSlug)
    .single()

  if (!section) {
    console.error(`Section not found: ${sectionSlug}`)
    process.exit(1)
  }

  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, title, slug, content')
    .eq('section_id', section.id)

  if (!articles?.length) {
    console.log('No articles in this section.')
    return
  }

  const toDelete = deleteAllInSection
    ? articles
    : slugsToDelete
      ? articles.filter((a) => slugsToDelete.includes(a.slug))
      : articles.filter((a) => {
          const c = a.content
          if (c == null || typeof c !== 'object') return true
          if ((c as { type?: string }).type !== 'doc') return true
          const nodes = (c as { content?: unknown[] }).content
          if (!Array.isArray(nodes) || nodes.length === 0) return true
          const minWords = sectionSlug === 'chart-of-accounts' ? COA_MIN_WORDS : MIN_WORDS
          return wordCount(c) < minWords
        })

  if (toDelete.length === 0) {
    console.log('No minimal-content articles to delete.')
    return
  }

  console.log(`Deleting ${toDelete.length} article(s):`)
  toDelete.forEach((a) => console.log(`  - ${a.title} (${a.slug})`))

  for (const a of toDelete) {
    const { error } = await supabase.from('kb_articles').delete().eq('id', a.id)
    if (error) {
      console.error(`  ❌ ${a.title}: ${error.message}`)
    } else {
      console.log(`  ✓ Deleted: ${a.title}`)
    }
  }

  console.log(`\n✅ Done. ${toDelete.length} old/minimal card(s) removed.\n`)
}

main().catch(console.error)
