'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Home,
  Star,
  Link2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from 'lucide-react'
import { ArticleEditor } from '@/components/ArticleEditor'
import { EditModeToggle } from '@/components/EditModeToggle'
import { ReadingProgress } from '@/components/content/ReadingProgress'
import { ArticleSidebar } from '@/components/content/ArticleSidebar'

const SAVED_KEY = 'finacct-kb-saved'
const SAVED_META_KEY = 'finacct-kb-saved-meta'
const RECENT_VISITS_KEY = 'finacct-kb-recent-visits'
const RECENT_VISITS_MAX = 3

const COA_QUICK_COPY = [
  { id: '4100', label: 'Food Sales' },
  { id: '4200', label: 'Beverage Sales' },
  { id: '4300', label: 'Third-Party Delivery' },
  { id: '4400', label: 'Other Revenue' },
  { id: '5100', label: 'Food Cost' },
  { id: '5200', label: 'Beverage Cost' },
  { id: '5300', label: 'Packaging' },
  { id: '6100', label: 'FOH Wages' },
  { id: '6200', label: 'BOH Wages' },
  { id: '7100', label: 'Rent' },
]

export interface HeadingItem {
  id: string
  text: string
  level: number
}

export interface RelatedArticle {
  id: string
  title: string
  slug: string
}

interface ArticlePageClientProps {
  sectionSlug: string
  sectionTitle: string
  articleId: string
  articleSlug: string
  articleTitle: string
  articleExcerpt: string | null
  headings: HeadingItem[]
  related: RelatedArticle[]
  prevArticle: { title: string; slug: string } | null
  nextArticle: { title: string; slug: string } | null
  children: React.ReactNode
  showQuickCopy?: boolean
  readingMinutes?: number
  lastUpdated?: string | null
  /** Admin can edit article content */
  canEdit?: boolean
  initialContent?: import('@/lib/tiptap-headings').TipTapNode | null
}

export function ArticlePageClient({
  sectionSlug,
  sectionTitle,
  articleId,
  articleSlug,
  articleTitle,
  articleExcerpt,
  headings,
  related,
  prevArticle,
  nextArticle,
  children,
  showQuickCopy = false,
  readingMinutes,
  lastUpdated,
  canEdit = false,
  initialContent = null,
}: ArticlePageClientProps) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [saved, setSaved] = useState(false)
  const [quickCopySelected, setQuickCopySelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleQuickCopy = (id: string) => {
    setQuickCopySelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const copyQuickCopy = async () => {
    const lines = COA_QUICK_COPY.filter((r) => quickCopySelected.has(r.id)).map(
      (r) => `${r.id} - ${r.label}`
    )
    if (lines.length === 0) return
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const savedRaw = localStorage.getItem(SAVED_KEY)
    const arr = savedRaw ? (JSON.parse(savedRaw) as string[]) : []
    setSaved(arr.includes(articleId))
  }, [articleId])

  // Record this article in recently visited (last 3)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_VISITS_KEY)
      const list = raw ? (JSON.parse(raw) as { id: string; title: string; slug: string; sectionSlug: string }[]) : []
      const next = [{ id: articleId, title: articleTitle, slug: articleSlug, sectionSlug }]
      for (const item of list) {
        if (item.id !== articleId && next.length < RECENT_VISITS_MAX) next.push(item)
      }
      localStorage.setItem(RECENT_VISITS_KEY, JSON.stringify(next.slice(0, RECENT_VISITS_MAX)))
    } catch {}
  }, [articleId, articleTitle, articleSlug, sectionSlug])

  const toggleSaved = () => {
    const raw = localStorage.getItem(SAVED_KEY)
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    const metaRaw = localStorage.getItem(SAVED_META_KEY)
    const metaArr = metaRaw ? (JSON.parse(metaRaw) as { id: string; title: string; slug: string; sectionSlug: string }[]) : []
    const next = arr.includes(articleId) ? arr.filter((id) => id !== articleId) : [...arr, articleId]
    let nextMeta = metaArr.filter((m) => m.id !== articleId)
    if (!arr.includes(articleId)) {
      nextMeta = [...nextMeta, { id: articleId, title: articleTitle, slug: articleSlug, sectionSlug }]
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify(next))
    localStorage.setItem(SAVED_META_KEY, JSON.stringify(nextMeta))
    setSaved(next.includes(articleId))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0% -70% 0%', threshold: 0 }
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  useEffect(() => {
    const onScroll = () => {
      const main = document.querySelector('.article-main-content .tip-tap-content')
      if (!main) return
      const rect = main.getBoundingClientRect()
      const winH = window.innerHeight
      const start = rect.top
      const end = rect.bottom
      if (end < 0 || start > winH) {
        setProgress(start > winH ? 0 : 100)
        return
      }
      const visible = Math.min(end, winH) - Math.max(start, 0)
      const total = rect.height
      setProgress(total ? Math.round((visible / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' && canEdit && !isEditing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        e.preventDefault()
        setIsEditing(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canEdit, isEditing])

  return (
    <>
      <ReadingProgress progress={progress} />
      <EditModeToggle onEdit={() => setIsEditing(true)} visible={canEdit && !isEditing} />

      <div className="w-full max-w-[1600px] mx-auto px-6 py-6 lg:px-10 lg:py-8 flex gap-8">
        <ArticleSidebar
          sectionSlug={sectionSlug}
          headings={headings}
          related={related}
          showQuickCopy={showQuickCopy}
          activeId={activeId}
          quickCopySelected={quickCopySelected}
          copied={copied}
          onToggleQuickCopy={toggleQuickCopy}
          onCopyQuickCopy={copyQuickCopy}
        />

        <article className="article-main-content min-w-0 flex-1 no-select max-w-none">
          <nav className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-slate-900/50 -mx-2 px-2 py-2 rounded-lg" aria-label="Breadcrumb">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="/home" className="hover:text-white flex items-center gap-1 transition-colors">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <span aria-hidden className="text-slate-600">/</span>
              <Link href={`/section/${sectionSlug}`} className="hover:text-white">
                {sectionTitle}
              </Link>
              <span aria-hidden className="text-slate-600">/</span>
              <span className="text-white truncate max-w-[180px]">{articleTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 transition-colors"
                  title="Edit article"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={toggleSaved}
                className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-colors"
                title={saved ? 'Unsave' : 'Save article'}
              >
                <Star className={`w-4 h-4 ${saved ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title="Copy link"
              >
                {copied ? (
                  <span className="text-green-400 text-sm">✓</span>
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors no-print"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </nav>

          <header className="mb-8 bg-slate-900/50 -mx-2 px-4 py-3 rounded-lg">
            <h1 className="text-2xl font-semibold text-white leading-tight mb-2">{articleTitle}</h1>
            {articleExcerpt && !isEditing && (
              <p className="text-base text-slate-400 mb-3">{articleExcerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {readingMinutes != null && <span>{readingMinutes} min read</span>}
              {lastUpdated && (
                <span>Last updated {new Date(lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              )}
            </div>
          </header>

          {toastMessage && (
            <div
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
                toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}
              role="status"
              aria-live="polite"
            >
              {toastMessage}
            </div>
          )}

          {isEditing ? (
            <ArticleEditor
              articleId={articleId}
              initialContent={initialContent ?? { type: 'doc', content: [] }}
              onSaveSuccess={() => {
                setToastMessage('Article saved')
                setToastType('success')
                router.refresh()
                setIsEditing(false)
              }}
              onCancel={() => setIsEditing(false)}
              onSaveError={(msg) => {
                setToastMessage(msg)
                setToastType('error')
              }}
              enableDraft={true}
            />
          ) : (
            <div className="tip-tap-content">{children}</div>
          )}

          <footer className="mt-8 pt-6 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4 no-print">
            {prevArticle ? (
              <Link
                href={`/section/${sectionSlug}/${prevArticle.slug}`}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium truncate max-w-[200px]">{prevArticle.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nextArticle ? (
              <Link
                href={`/section/${sectionSlug}/${nextArticle.slug}`}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors ml-auto"
              >
                <span className="text-sm font-medium truncate max-w-[200px]">{nextArticle.title}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : null}
          </footer>
        </article>
      </div>
    </>
  )
}
