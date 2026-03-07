import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Home } from 'lucide-react'
import { SearchPageClient, type SearchResultItem } from '@/components/search/SearchPageClient'
import type { CategorySection } from '@/components/search/CategoryBrowser'

export const dynamic = 'force-dynamic'

function highlight(text: string, term: string): string {
  if (!term.trim()) return escapeHtml(text)
  const escaped = escapeHtml(text)
  const re = new RegExp(`(${escapeRe(term)})`, 'gi')
  return escaped.replace(re, '<mark class="bg-amber-500/30 text-amber-200 rounded px-0.5">$1</mark>')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? '').trim().slice(0, 200)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle()
  const rawRole = (profile?.role as string | undefined)?.toLowerCase()
  const isTrainee = rawRole === 'trainee'

  // Sections for Browse by Category (published, non-training)
  const { data: sectionsRaw } = await supabase
    .from('kb_sections')
    .select('id, title, slug')
    .eq('is_published', true)
    .eq('is_training_section', false)
    .order('order_index', { ascending: true })

  const sectionIds = (sectionsRaw ?? []).map((s: { id: string }) => s.id)
  const { data: countRows } = await supabase
    .from('kb_articles')
    .select('section_id')
    .eq('is_published', true)
    .in('section_id', sectionIds.length ? sectionIds : [''])

  const countBySection: Record<string, number> = {}
  for (const row of countRows ?? []) {
    countBySection[row.section_id] = (countBySection[row.section_id] ?? 0) + 1
  }

  // Sections for Browse by Category (published, non-training). Hide for trainees (no section access).
  const sections: CategorySection[] = isTrainee
    ? []
    : (sectionsRaw ?? []).map((s: { id: string; title: string; slug: string }) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        articleCount: countBySection[s.id] ?? 0,
      }))

  let results: SearchResultItem[] = []

  if (query.length >= 2) {
    if (isTrainee) {
      const { data: modules } = await supabase
        .from('training_modules')
        .select('id, title, slug, description')
        .eq('is_published', true)
        .limit(200)
      const lower = query.toLowerCase()
      const list = (modules ?? []).filter((m: { title: string | null; description: string | null }) => {
        const title = (m.title ?? '').toLowerCase()
        const desc = (m.description ?? '').toLowerCase()
        return title.includes(lower) || desc.includes(lower)
      }).slice(0, 50)
      results = list.map((m: { id: string; title: string; slug: string; description: string | null }) => ({
        type: 'module' as const,
        id: m.id,
        href: `/training/${m.slug}`,
        title: m.title,
        subtitle: 'Training module',
        highlightedTitle: highlight(m.title, query),
        highlightedDescription: m.description ? highlight(m.description, query) : null,
      }))
    } else {
      const { data } = await supabase
        .from('kb_articles')
        .select(`
          id, title, slug, excerpt,
          kb_sections ( slug, title )
        `)
        .eq('is_published', true)
        .limit(200)
      const lower = query.toLowerCase()
      const list = (data ?? [])
        .filter((a: { title: string; excerpt: string | null; kb_sections: unknown }) => {
          const title = (a.title ?? '').toLowerCase()
          const excerpt = (a.excerpt ?? '').toLowerCase()
          return title.includes(lower) || excerpt.includes(lower)
        })
        .filter((a: { kb_sections: unknown }) => a.kb_sections != null)
        .slice(0, 50)
      results = list.map((a: { id: string; title: string; slug: string; excerpt: string | null; kb_sections: unknown }) => {
        const secRaw = a.kb_sections
        const sec = Array.isArray(secRaw) ? secRaw[0] : secRaw
        const section = sec && typeof sec === 'object' && sec !== null && 'slug' in sec && 'title' in sec
          ? { slug: String((sec as { slug: string }).slug), title: String((sec as { title: string }).title) }
          : { slug: '', title: '' }
        return {
          type: 'article' as const,
          id: a.id,
          href: `/section/${section.slug}/${a.slug}`,
          title: a.title,
          subtitle: section.title,
          highlightedTitle: highlight(a.title, query),
          highlightedDescription: a.excerpt ? highlight(a.excerpt, query) : null,
        }
      })
    }
  }

  return (
    <div className="py-4">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/home" className="hover:text-white flex items-center gap-1">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <span>/</span>
        <span className="text-white">Search</span>
      </nav>

      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

      <SearchPageClient
        initialQuery={query}
        results={results}
        sections={sections}
      />
    </div>
  )
}
