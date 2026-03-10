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

/** Filter options for Chart of Accounts – the 5 cards (1.1–1.5) */
const COA_FILTER_OPTIONS = [
  { value: 'all', label: 'All (1.1–1.5)', color: 'bg-slate-400' },
  { value: '1-1-master-coa-framework', label: '1.1 Master COA Framework', color: 'bg-blue-400' },
  { value: '1-2-coa-by-restaurant-type', label: '1.2 COA by Restaurant Type', color: 'bg-emerald-400' },
  { value: '1-3-balance-sheet-accounts', label: '1.3 Balance Sheet Accounts', color: 'bg-amber-400' },
  { value: '1-4-cash-flow-classification', label: '1.4 Cash Flow Classification', color: 'bg-purple-400' },
  { value: '1-5-quickbooks-online-mapping-guide', label: '1.5 QBO Mapping Guide', color: 'bg-cyan-400' },
]

/** Slug set for COA filter: when a specific card is selected, show only that article */
const COA_CARD_SLUGS = new Set(COA_FILTER_OPTIONS.filter((o) => o.value !== 'all').map((o) => o.value))

/** Filter options for Standard Operating Procedures – the 5 cards (2.1–2.5) */
const SOP_FILTER_OPTIONS = [
  { value: 'all', label: 'All (2.1–2.5)', color: 'bg-slate-400' },
  { value: '2-1-client-onboarding-procedure', label: '2.1 Client Onboarding', color: 'bg-blue-400' },
  { value: '2-2-books-health-check-procedure', label: '2.2 Books Health Check', color: 'bg-emerald-400' },
  { value: '2-3-weekly-close-process', label: '2.3 Weekly Close', color: 'bg-amber-400' },
  { value: '2-4-monthly-close-process', label: '2.4 Monthly Close', color: 'bg-purple-400' },
  { value: '2-5-qbo-export-guides', label: '2.5 QBO Export Guides', color: 'bg-cyan-400' },
]

/** Slug set for SOP filter */
const SOP_CARD_SLUGS = new Set(SOP_FILTER_OPTIONS.filter((o) => o.value !== 'all').map((o) => o.value))

/** Filter options for Exception Handling – the 8 cards (3.1–3.8) */
const EXCEPTION_FILTER_OPTIONS = [
  { value: 'all', label: 'All (3.1–3.8)', color: 'bg-slate-400' },
  { value: '3-1-client-refuses-coa-change', label: '3.1 Client Refuses COA', color: 'bg-blue-400' },
  { value: '3-2-messy-books-protocol', label: '3.2 Messy Books', color: 'bg-emerald-400' },
  { value: '3-3-missing-data-handling', label: '3.3 Missing Data', color: 'bg-amber-400' },
  { value: '3-4-qbo-technical-issues', label: '3.4 QBO Technical', color: 'bg-purple-400' },
  { value: '3-5-business-model-exceptions', label: '3.5 Business Model', color: 'bg-cyan-400' },
  { value: '3-6-bank-feed-errors', label: '3.6 Bank Feed', color: 'bg-rose-400' },
  { value: '3-7-payroll-discrepancies', label: '3.7 Payroll', color: 'bg-indigo-400' },
  { value: '3-8-third-party-delivery-issues', label: '3.8 Third-Party Delivery', color: 'bg-teal-400' },
]

/** Slug set for Exception filter */
const EXCEPTION_CARD_SLUGS = new Set(EXCEPTION_FILTER_OPTIONS.filter((o) => o.value !== 'all').map((o) => o.value))

/** Filter options for POS & Software Guides – the 8 cards (5.1–5.8) */
const POS_FILTER_OPTIONS = [
  { value: 'all', label: 'All (5.1–5.8)', color: 'bg-slate-400' },
  { value: '5-1-square-pos-export-guide', label: '5.1 Square', color: 'bg-blue-400' },
  { value: '5-2-toast-pos-export-guide', label: '5.2 Toast', color: 'bg-emerald-400' },
  { value: '5-3-clover-pos-export-guide', label: '5.3 Clover', color: 'bg-amber-400' },
  { value: '5-4-spoton-pos-export-guide', label: '5.4 SpotOn', color: 'bg-purple-400' },
  { value: '5-5-quickbooks-online-pl-export', label: '5.5 QBO P&L', color: 'bg-cyan-400' },
  { value: '5-6-quickbooks-online-balance-sheet-export', label: '5.6 QBO Balance Sheet', color: 'bg-rose-400' },
  { value: '5-7-payroll-register-export-guide', label: '5.7 Payroll', color: 'bg-indigo-400' },
  { value: '5-8-third-party-delivery-platform-exports', label: '5.8 Third-Party Delivery', color: 'bg-teal-400' },
]

/** Slug set for POS filter */
const POS_CARD_SLUGS = new Set(POS_FILTER_OPTIONS.filter((o) => o.value !== 'all').map((o) => o.value))

/** Filter options for Sample Financials – the 5 cards (4.1–4.5) */
const SAMPLE_FINANCIALS_FILTER_OPTIONS = [
  { value: 'all', label: 'All (4.1–4.5)', color: 'bg-slate-400' },
  { value: '4-1-cafe-coffee-shop-pl', label: '4.1 Cafe P&L', color: 'bg-blue-400' },
  { value: '4-2-full-service-restaurant-pl', label: '4.2 FSR P&L', color: 'bg-emerald-400' },
  { value: '4-3-bar-grill-pl', label: '4.3 Bar & Grill P&L', color: 'bg-amber-400' },
  { value: '4-4-fast-casual-qsr-pl', label: '4.4 Fast Casual P&L', color: 'bg-purple-400' },
  { value: '4-5-sample-balance-sheet', label: '4.5 Balance Sheet', color: 'bg-cyan-400' },
]

/** Slug set for Sample Financials filter */
const SAMPLE_FINANCIALS_CARD_SLUGS = new Set(SAMPLE_FINANCIALS_FILTER_OPTIONS.filter((o) => o.value !== 'all').map((o) => o.value))

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
      if (filterType !== 'all' && COA_CARD_SLUGS.has(filterType)) {
        list = list.filter((a) => a.slug === filterType)
      }
    } else if (sectionSlug === 'standard-operating-procedures') {
      if (filterType !== 'all' && SOP_CARD_SLUGS.has(filterType)) {
        list = list.filter((a) => a.slug === filterType)
      }
    } else if (sectionSlug === 'exception-handling') {
      if (filterType !== 'all' && EXCEPTION_CARD_SLUGS.has(filterType)) {
        list = list.filter((a) => a.slug === filterType)
      }
    } else if (sectionSlug === 'pos-guides') {
      if (filterType !== 'all' && POS_CARD_SLUGS.has(filterType)) {
        list = list.filter((a) => a.slug === filterType)
      }
    } else if (sectionSlug === 'sample-financials') {
      if (filterType !== 'all' && SAMPLE_FINANCIALS_CARD_SLUGS.has(filterType)) {
        list = list.filter((a) => a.slug === filterType)
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
              placeholder={sectionSlug === 'chart-of-accounts' ? 'Search 1.1–1.5...' : sectionSlug === 'standard-operating-procedures' ? 'Search 2.1–2.5...' : sectionSlug === 'exception-handling' ? 'Search 3.1–3.8...' : sectionSlug === 'pos-guides' ? 'Search 5.1–5.8...' : sectionSlug === 'sample-financials' ? 'Search 4.1–4.5...' : `Search in ${sectionTitle}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            />
          </div>
          <FilterDropdown
            selectedFilter={filterType}
            onSelect={setFilterType}
            filters={sectionSlug === 'chart-of-accounts' ? COA_FILTER_OPTIONS : sectionSlug === 'standard-operating-procedures' ? SOP_FILTER_OPTIONS : sectionSlug === 'exception-handling' ? EXCEPTION_FILTER_OPTIONS : sectionSlug === 'pos-guides' ? POS_FILTER_OPTIONS : sectionSlug === 'sample-financials' ? SAMPLE_FINANCIALS_FILTER_OPTIONS : undefined}
          />
        </div>
      </header>

      {/* Pinned / Quick access */}
      <PinnedArticles
        articles={pinnedArticles}
        sectionSlug={sectionSlug}
        onManagePins={() => {}}
      />

      {/* Articles: single segment for COA (1.1–1.5), by category for other sections */}
      <section>
        {sectionSlug === 'chart-of-accounts' || sectionSlug === 'standard-operating-procedures' || sectionSlug === 'exception-handling' || sectionSlug === 'pos-guides' || sectionSlug === 'sample-financials' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles
              .sort((a, b) => a.order_index - b.order_index)
              .map((article) => (
                <ArticleCard
                  key={article.id}
                  type="reference"
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
        ) : (
          CONTENT_TYPE_ORDER.map((type) => {
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
          })
        )}
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
