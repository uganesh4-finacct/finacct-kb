'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getArticlesAdmin, getSectionsForSelect } from '../actions'
import { Plus } from 'lucide-react'

type ArticleRow = {
  id: string
  title: string
  slug: string
  is_published: boolean
  updated_at: string
  author: string
  section_id: string
  kb_sections: { id: string; title: string; slug: string } | null
}

export default function AdminArticlesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sectionFilter = searchParams.get('section') ?? ''
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [sections, setSections] = useState<{ id: string; title: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [artRes, secRes] = await Promise.all([
        getArticlesAdmin(sectionFilter || undefined),
        getSectionsForSelect(),
      ])
      if (artRes.data) setArticles(artRes.data as ArticleRow[])
      if (secRes.data) setSections(secRes.data)
      setLoading(false)
    }
    load()
  }, [sectionFilter])

  const filtered = sectionFilter ? articles : articles

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Articles</h1>
        <div className="flex items-center gap-3">
          <select
            value={sectionFilter}
            onChange={(e) => {
              const v = e.target.value
              router.push(v ? `/admin/articles?section=${v}` : '/admin/articles')
            }}
            className="rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            <Plus className="w-5 h-5" />
            New Article
          </Link>
        </div>
      </div>

      <div className="rounded-xl border-slate-800/50 bg-slate-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Title</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Section</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Last updated</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Author</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-slate-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-slate-400">No articles.</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-slate-800/50/50 hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <Link href={`/admin/articles/${a.id}`} className="text-white font-medium hover:text-indigo-300">
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{a.kb_sections?.title ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={a.is_published ? 'text-green-400' : 'text-slate-500'}>{a.is_published ? 'Published' : 'Draft'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{new Date(a.updated_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400">{a.author}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
