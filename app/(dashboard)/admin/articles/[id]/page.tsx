'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import {
  getArticleById,
  getSectionsForSelect,
  saveArticle,
  getArticleVersions,
  restoreArticleVersion,
} from '@/app/(dashboard)/admin/actions'
import { ArrowLeft, History, RotateCcw } from 'lucide-react'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

type Article = {
  id: string
  section_id: string
  title: string
  slug: string
  content: unknown
  excerpt: string | null
  is_published: boolean
  order_index: number
  kb_sections: { id: string; title: string; slug: string } | null
}

type Version = { id: string; version: number; saved_at: string }

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [article, setArticle] = useState<Article | null>(null)
  const [sections, setSections] = useState<{ id: string; title: string; slug: string }[]>([])
  const [sectionId, setSectionId] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState<object | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [showVersions, setShowVersions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getArticleById(id).then((r) => {
      if (r.data) {
        const a = r.data as Article
        setArticle(a)
        setSectionId(a.section_id)
        setTitle(a.title)
        setSlug(a.slug)
        setExcerpt(a.excerpt || '')
        setContent((a.content as object) ?? null)
      }
    })
    getSectionsForSelect().then((r) => r.data && setSections(r.data))
    getArticleVersions(id).then((r) => r.data && setVersions(r.data as Version[]))
  }, [id])

  async function handleSave(asPublish: boolean) {
    if (!sectionId || !title.trim() || !slug.trim()) {
      setError('Title and slug are required.')
      return
    }
    setError(null)
    setSaving(true)
    const res = await saveArticle({
      id,
      section_id: sectionId,
      title: title.trim(),
      slug: slug.trim(),
      content: content ?? {},
      excerpt: excerpt.trim() || null,
      is_published: asPublish,
      order_index: article?.order_index ?? 0,
    })
    setSaving(false)
    if (res.ok) {
      const { data } = await getArticleById(id)
      if (data) setArticle(data as Article)
      const verRes = await getArticleVersions(id)
      if (verRes.data) setVersions(verRes.data as Version[])
    } else {
      setError(res.error ?? 'Save failed')
    }
  }

  async function handleRestore(versionId: string) {
    const res = await restoreArticleVersion(id, versionId)
    if (res.ok) {
      const { data } = await getArticleById(id)
      if (data) {
        const a = data as Article
        setContent((a.content as object) ?? null)
        setShowVersions(false)
      }
    }
  }

  if (!article) {
    return <div className="text-slate-400">Loading…</div>
  }

  return (
    <div className="max-w-4xl mx-auto flex gap-6">
      <div className="flex-1 min-w-0">
        <Link href="/admin/articles" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
        <h1 className="text-2xl font-bold text-white mb-6">Edit Article</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Section</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
          <RichTextEditor content={content} onChange={setContent} minHeight="320px" />
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-600 text-white hover:bg-slate-700 disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={() => setShowVersions(!showVersions)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <History className="w-4 h-4" />
            Version history
          </button>
        </div>
      </div>

      {showVersions && (
        <div className="w-64 shrink-0 rounded-xl border-slate-800/50 bg-slate-800/30 p-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-sm font-semibold text-white mb-3">Versions</h3>
          <ul className="space-y-2">
            {versions.length === 0 ? (
              <li className="text-slate-500 text-sm">No previous versions.</li>
            ) : (
              versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-400">v{v.version} · {new Date(v.saved_at).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => handleRestore(v.id)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    title="Restore"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
