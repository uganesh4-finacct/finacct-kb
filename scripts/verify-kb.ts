/**
 * FinAcct360 Academy — KB seed verification
 *
 * Prints per-section article counts, unpublished articles/sections, and total.
 * Expect 45 articles after full seed (40 published + 5 POS ecosystem drafts).
 *
 * Usage: npm run verify:kb
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars. Ensure .env.local has:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const EXPECTED_TOTAL = 45
const EXPECTED_PUBLISHED = 40
const EXPECTED_DRAFTS = 5

async function verify() {
  console.log('FinAcct360 Academy — KB Verification')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  const { data: sections, error: sectionsError } = await supabase
    .from('kb_sections')
    .select('id, title, slug, is_published, order_index')
    .order('order_index', { ascending: true })

  if (sectionsError) {
    console.error('Failed to fetch sections:', sectionsError.message)
    process.exit(1)
  }

  const { data: articles, error: articlesError } = await supabase
    .from('kb_articles')
    .select('id, title, slug, is_published, section_id')
    .order('title', { ascending: true })

  if (articlesError) {
    console.error('Failed to fetch articles:', articlesError.message)
    process.exit(1)
  }

  const sectionList = sections ?? []
  const articleList = articles ?? []

  const unpublishedSections = sectionList.filter((s) => !s.is_published)
  const unpublishedArticles = articleList.filter((a) => !a.is_published)

  console.log('Per-section article counts:')
  console.log('')

  for (const section of sectionList) {
    const count = articleList.filter((a) => a.section_id === section.id).length
    const pubFlag = section.is_published ? '' : ' [SECTION UNPUBLISHED]'
    console.log(`  ${section.title} (${section.slug}): ${count} articles${pubFlag}`)
  }

  const publishedArticles = articleList.filter((a) => a.is_published)

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Total articles: ${articleList.length} (expected: ${EXPECTED_TOTAL})`)
  console.log(`Published: ${publishedArticles.length} (expected: ${EXPECTED_PUBLISHED})`)
  console.log(`Drafts: ${unpublishedArticles.length} (expected: ${EXPECTED_DRAFTS})`)

  if (articleList.length === EXPECTED_TOTAL) {
    console.log('✓ Article count matches expected total')
  } else {
    console.log(`✗ Article count mismatch — run: npm run seed:kb`)
  }

  if (publishedArticles.length === EXPECTED_PUBLISHED) {
    console.log('✓ Published article count matches expected')
  } else {
    console.log(`✗ Published count mismatch (expected ${EXPECTED_PUBLISHED})`)
  }

  console.log('')

  if (unpublishedSections.length === 0) {
    console.log('✓ All sections published')
  } else {
    console.log(`Unpublished sections (${unpublishedSections.length}):`)
    for (const s of unpublishedSections) {
      console.log(`  - ${s.title} (${s.slug})`)
    }
  }

  if (unpublishedArticles.length === EXPECTED_DRAFTS) {
    console.log(`✓ Draft article count matches expected (${EXPECTED_DRAFTS} POS ecosystem drafts)`)
  } else if (unpublishedArticles.length === 0) {
    console.log('✓ All articles published')
  } else {
    console.log(`Unpublished articles (${unpublishedArticles.length}, expected ${EXPECTED_DRAFTS} drafts):`)
    for (const a of unpublishedArticles) {
      console.log(`  - ${a.title} (${a.slug})`)
    }
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const ok =
    articleList.length === EXPECTED_TOTAL &&
    publishedArticles.length === EXPECTED_PUBLISHED &&
    unpublishedArticles.length === EXPECTED_DRAFTS &&
    unpublishedSections.length === 0

  if (ok) {
    console.log('🎉 KB verification passed')
  } else {
    console.log('⚠️  KB verification found issues — review output above')
    process.exit(1)
  }
}

verify().catch((err) => {
  console.error(err)
  process.exit(1)
})
