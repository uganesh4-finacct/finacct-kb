'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement>
  progress?: number
  /** Tailwind class for sticky top offset (e.g. top-24 or top-[13rem] for pages with tall sticky headers) */
  stickyTop?: string
}

export function TableOfContents({ contentRef, progress: progressProp, stickyTop = 'top-24' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [progress, setProgress] = useState(progressProp ?? 0)

  useEffect(() => {
    if (progressProp !== undefined) setProgress(progressProp)
  }, [progressProp])

  useEffect(() => {
    if (!contentRef.current) return

    const elements = contentRef.current.querySelectorAll('h2, h3')
    const items: TOCItem[] = Array.from(elements).map((el, i) => {
      const id = `heading-${i}`
      el.id = id
      return {
        id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3
      }
    })
    setHeadings(items)
  }, [contentRef])

  useEffect(() => {
    const handleScroll = () => {
      if (progressProp === undefined) {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        setProgress(Math.min((scrollTop / docHeight) * 100, 100))
      }

      const headingElements = headings.map(h => document.getElementById(h.id))
      const current = [...headingElements].reverse().find(el => {
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.top <= 100
      })
      if (current) setActiveId(current.id)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings, progressProp])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (headings.length === 0) return null

  return (
    <aside className={`w-72 flex-shrink-0 hidden lg:block self-start sticky ${stickyTop} z-10`}>
      <div className={`sidebar-sticky rounded-2xl border-slate-800/50 bg-slate-800/30 p-6 overflow-hidden ${stickyTop !== 'top-24' ? 'max-h-[calc(100vh-16rem)]' : ''}`}>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          In this module
        </h4>
        <nav className="space-y-1">
          {headings.map((h) => {
            const isActive = activeId === h.id
            return (
              <button
                key={h.id}
                onClick={() => scrollTo(h.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  h.level === 3 ? 'pl-5' : 'pl-3'
                } ${
                  isActive
                    ? 'bg-green-500/10 text-green-400 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                style={{ paddingLeft: h.level === 3 ? '1.25rem' : '0.75rem' }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-green-400' : 'bg-slate-600'
                  }`}
                  aria-hidden
                />
                <span className="truncate">{h.text}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="text-green-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
