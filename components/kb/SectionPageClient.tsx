'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { ArticleCard, type ArticleType } from '@/components/kb/ArticleCard'
import { PinnedArticles } from '@/components/kb/PinnedArticles'
import { COAQuickReferenceCard } from '@/components/kb/COAQuickReferenceCard'
import { CategorySection, type CategoryKind } from '@/components/kb/CategorySection'
import { FilterDropdown } from '@/components/kb/FilterDropdown'
import { FileText } from 'lucide-react'

/** Filter options when section is Chart of Accounts */
const COA_FILTER_OPTIONS = [
  { value: 'all', label: 'All Types', color: 'bg-slate-400' },
  { value: 'p-l', label: 'P&L Accounts', color: 'bg-blue-400' },
  { value: 'balance-sheet', label: 'Balance Sheet', color: 'bg-emerald-400' },
  { value: 'multi-unit', label: 'Multi-Unit', color: 'bg-purple-400' },
]

const COA_PL_SLUGS = new Set([
  'revenue-accounts-4000s',
  'cogs-accounts-5000s',
  'labor-accounts-6000s',
  'operating-expenses-7000s',
  'other-expenses-8000s',
])
const COA_BALANCE_SHEET_SLUGS = new Set([
  'assets-accounts-1000s',
  'liabilities-accounts-2000s',
  'equity-accounts-3000s',
])

const PINNED_KEY = 'finacct-kb-pinned'
const CONTENT_TYPE_ORDER: (ArticleType | 'troubleshoot')[] = ['reference', 'guide', 'checklist', 'template', 'troubleshoot']

const CATEGORY_LABELS: Record<string, string> = {
  reference: 'Reference Guides',
  guide: 'How-To Guides',
  checklist: 'Checklists',
  template: 'Templates',
  troubleshoot: 'Troubleshoot',
}

function getContentType(slug: string, title: string): ArticleType | 'troubleshoot' {
  const s = `${slug} ${title}`.toLowerCase()
  if (s.includes('troubleshoot') || s.includes('troubleshooting')) return 'troubleshoot'
  if (s.includes('checklist')) return 'checklist'
  if (s.includes('template') || s.includes('pl-template')) return 'template'
  if (s.includes('lookup') || s.includes('mapping') || s.includes('reference') || s.includes('coa') || s.includes('account')) return 'reference'
  return 'guide'
}

function estimateReadMinutes(article: ArticleForSection): number {
  return article.reading_minutes ?? 5
}

export interface ArticleForSection {
  id: string
  title: string
  slug: string
  excerpt: string | null
  order_index: number
  updated_at: string
  reading_minutes?: number
}

export interface RecentRead {
  article_id: string
  article_title: string
  article_slug: string
  section_slug: string
  read_at: string
}

interface SectionPageClientProps {
  sectionSlug: string
  sectionTitle: string
  sectionDescription: string | null
  sectionIcon: string
  articles: ArticleForSection[]
  recentReads: RecentRead[]
  /** Admin can create/edit articles */
  canEdit?: boolean
}

/** Section-specific quick reference cards. Add more sections as needed. */
function SectionQuickRef({ sectionSlug }: { sectionSlug: string }) {
  if (sectionSlug === 'chart-of-accounts') {
    return (
      <div className="mt-10 mb-8">
        <COAQuickReferenceCard sectionSlug={sectionSlug} />
      </div>
    )
  }
  return null
}

export function SectionPageClient({
  sectionSlug,
  sectionTitle,
  sectionDescription,
  sectionIcon,
  articles,
  recentReads,
  canEdit = false,
}: SectionPageClientProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = localStorage.getItem(PINNED_KEY)
      const data = raw ? (JSON.parse(raw) as Record<string, string[]>) : {}
      const arr = data[sectionSlug] ?? []
      return new Set(arr)
    } catch {
      return new Set()
    }
  })

  const togglePinned = (articleId: string) => {
    const next = new Set(pinnedIds)
    if (next.has(articleId)) next.delete(articleId)
    else next.add(articleId)
    setPinnedIds(next)
    try {
      const raw = localStorage.getItem(PINNED_KEY)
      const data = raw ? (JSON.parse(raw) as Record<string, string[]>) : {}
      data[sectionSlug] = Array.from(next)
      localStorage.setItem(PINNED_KEY, JSON.stringify(data))
    } catch {}
  }

  const filteredArticles = useMemo(() => {
    let list = articles
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
          a.slug.toLowerCase().includes(q)
      )
    }
    if (sectionSlug === 'chart-of-accounts') {
      if (filterType === 'p-l') {
        list = list.filter((a) => COA_PL_SLUGS.has(a.slug))
      } else if (filterType === 'balance-sheet') {
        list = list.filter((a) => COA_BALANCE_SHEET_SLUGS.has(a.slug))
      } else if (filterType === 'multi-unit') {
        list = list.filter(
          (a) => a.slug === 'multi-unit-pl' || a.title.toLowerCase().includes('multi-unit')
        )
      }
    } else {
      if (filterType !== 'all') {
        list = list.filter((a) => getContentType(a.slug, a.title) === filterType)
      }
    }
    return list
  }, [articles, search, filterType, sectionSlug])

  const grouped = useMemo(() => {
    const groups: Record<string, ArticleForSection[]> = {
      reference: [],
      guide: [],
      checklist: [],
      template: [],
      troubleshoot: [],
    }
    for (const a of filteredArticles) {
      if (pinnedIds.has(a.id)) continue
      const type = getContentType(a.slug, a.title)
      groups[type].push(a)
    }
    return groups
  }, [filteredArticles, pinnedIds])

  const pinnedArticles = useMemo(
    () =>
      articles
        .filter((a) => pinnedIds.has(a.id))
        .map((a) => ({
          id: a.id,
          title: a.title,
          url: `/section/${sectionSlug}/${a.slug}`,
        })),
    [articles, pinnedIds, sectionSlug]
  )

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-5 lg:px-10 lg:py-6 page-content">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4" aria-label="Breadcrumb">
        <Link href="/home" className="hover:text-white flex items-center gap-1 transition-colors">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <span aria-hidden className="text-slate-600">/</span>
        <span className="text-white">{sectionTitle}</span>
      </nav>

      {/* Header: title, description, search, filter */}
      <header className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800/50 shrink-0">
            <i className={`fa ${sectionIcon || 'fa-folder'} text-xl text-green-400`} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-white tracking-tight leading-tight mb-2">
              {sectionTitle}
            </h1>
            {sectionDescription && (
              <p className="text-base text-slate-400 max-w-2xl">{sectionDescription}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder={`Search in ${sectionTitle}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            />
          </div>
          <FilterDropdown
            selectedFilter={filterType}
            onSelect={setFilterType}
            filters={sectionSlug === 'chart-of-accounts' ? COA_FILTER_OPTIONS : undefined}
          />
        </div>
      </header>

      {/* Pinned / Quick access */}
      <PinnedArticles
        articles={pinnedArticles}
        sectionSlug={sectionSlug}
        onManagePins={() => {}}
      />

      {/* Articles by category */}
      <section>
        {(sectionSlug === 'chart-of-accounts'
          ? CONTENT_TYPE_ORDER.filter((t) => t !== 'troubleshoot')
          : CONTENT_TYPE_ORDER
        ).map((type) => {
          const list = grouped[type]
          const categoryKind = (type === 'troubleshoot' ? 'troubleshoot' : type) as CategoryKind
          const label = CATEGORY_LABELS[type] ?? type
          if (list.length === 0) return null
          return (
            <CategorySection
              key={type}
              categoryName={label}
              categoryKind={categoryKind}
              count={list.length}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((article) => (
                  <ArticleCard
                    key={article.id}
                    type={type as ArticleType}
                    title={article.title}
                    description={article.excerpt}
                    readTime={estimateReadMinutes(article)}
                    saves={0}
                    href={`/section/${sectionSlug}/${article.slug}`}
                    isPinned={pinnedIds.has(article.id)}
                    onBookmarkClick={() => togglePinned(article.id)}
                  />
                ))}
              </div>
            </CategorySection>
          )
        })}
      </section>

      {/* Empty state */}
      {filteredArticles.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-400 mb-2">No articles yet</h3>
          <p className="text-sm text-slate-500 mb-4">
            {search || filterType !== 'all'
              ? 'No articles match your filters.'
              : 'This section is being prepared'}
          </p>
          {canEdit && (
            <Link
              href="/admin/articles/new"
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-all"
            >
              Create first article
            </Link>
          )}
        </div>
      )}

      {/* Section-specific quick reference (e.g. COA: below cards) */}
      <SectionQuickRef sectionSlug={sectionSlug} />
    </div>
  )
}
