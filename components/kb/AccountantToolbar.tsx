'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Bookmark, Search } from 'lucide-react'

const SAVED_KEY = 'finacct-kb-saved'

interface SavedArticle {
  id: string
  title: string
  slug: string
  sectionSlug: string
}

export function AccountantToolbar() {
  const pathname = usePathname()
  const [saved, setSaved] = useState<SavedArticle[]>([])
  const [clipboardCount, setClipboardCount] = useState(0)
  const [showSaved, setShowSaved] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(SAVED_KEY)
    const ids = raw ? (JSON.parse(raw) as string[]) : []
    if (ids.length === 0) {
      setSaved([])
      return
    }
    const stored = localStorage.getItem('finacct-kb-saved-meta')
    if (stored) {
      try {
        const meta = JSON.parse(stored) as SavedArticle[]
        setSaved(meta.filter((m) => ids.includes(m.id)))
      } catch {
        setSaved(ids.map((id) => ({ id, title: 'Saved article', slug: '', sectionSlug: '' })))
      }
    } else {
      setSaved(ids.map((id) => ({ id, title: 'Saved article', slug: '', sectionSlug: '' })))
    }
  }, [typeof window !== 'undefined' ? window.location.pathname : ''])

  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem('finacct-kb-clipboard-count')
      setClipboardCount(raw ? parseInt(raw, 10) : 0)
    }
    onStorage()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isTrainingModulePage = pathname?.match(/^\/training\/[^/]+$/) && !pathname?.endsWith('/quiz')
  const isSectionPage = pathname?.match(/^\/section\/[^/]+(\/[^/]+)?$/)
  if (isTrainingModulePage || isSectionPage) return null

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 no-print flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-600 bg-slate-800/95 shadow-xl shadow-slate-900/50 backdrop-blur" data-accountant-toolbar>
        <button
          type="button"
          onClick={() => setShowSaved(!showSaved)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Saved articles"
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Saved</span>
          {saved.length > 0 && (
            <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
              {saved.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Quick search (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Search</span>
          <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 text-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {showSaved && saved.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setShowSaved(false)}
          />
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm rounded-xl border border-slate-600 bg-slate-800 shadow-xl overflow-hidden">
            <div className="p-3 border-b border-slate-800/50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Saved articles
              </p>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {saved.map((a) => (
                <li key={a.id}>
                  <Link
                    href={a.sectionSlug && a.slug ? `/section/${a.sectionSlug}/${a.slug}` : '#'}
                    onClick={() => setShowSaved(false)}
                    className="block px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/50 truncate"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {showSearch && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm"
            aria-hidden
            onClick={() => setShowSearch(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <div
              className="w-full max-w-xl rounded-xl border border-slate-600 bg-slate-800 shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 p-3 border-b border-slate-800/50">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="p-4 text-sm text-slate-400">
                <p>Search is available from the home page. Go to Home and use the section search, or browse sections above.</p>
                <Link
                  href="/home"
                  onClick={() => setShowSearch(false)}
                  className="mt-3 inline-block text-blue-400 hover:text-blue-300 font-medium"
                >
                  Go to Home →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
