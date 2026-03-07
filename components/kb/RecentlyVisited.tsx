'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'

const RECENT_VISITS_KEY = 'finacct-kb-recent-visits'

interface RecentVisit {
  id: string
  title: string
  slug: string
  sectionSlug: string
}

export function RecentlyVisited() {
  const [visits, setVisits] = useState<RecentVisit[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_VISITS_KEY)
      const list = raw ? (JSON.parse(raw) as RecentVisit[]) : []
      setVisits(list.slice(0, 3))
    } catch {
      setVisits([])
    }
  }, [])

  if (visits.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">
        Recently visited
      </h2>
      <ul className="rounded-xl border-slate-800/50 bg-slate-800/30 divide-y divide-slate-700 overflow-hidden">
        {visits.map((v) => (
          <li key={v.id}>
            <Link
              href={`/section/${v.sectionSlug}/${v.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left"
            >
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-base font-normal text-white truncate">{v.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
