'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { getSectionsForSelect, saveArticle } from '../../actions'
import { ArrowLeft } from 'lucide-react'

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function NewArticlePage() {
  const router = useRouter()
  const [sections, setSections] = useState<{ id: string; title: string; slug: string }[]>([])
  const [sectionId, setSectionId] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState<object | null>(null)
  const [saving, setSaving] = useState(false)
  const [publish, setPublish] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSectionsForSelect().then((r) => {
      if (r.data?.length) {
        setSections(r.data)
        setSectionId(r.data[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (title && !slug) setSlug(slugify(title))
  }, [title])

  async function handleSave(asPublish: boolean) {
    if (!sectionId || !title.trim() || !slug.trim()) {
      setError('Title and slug are required.')
      return
    }
    setError(null)
    setSaving(true)
    const res = await saveArticle({
      section_id: sectionId,
      title: title.trim(),
      slug: slug.trim(),
      content: content ?? {},
      excerpt: excerpt.trim() || null,
      is_published: asPublish,
      order_index: 0,
    })
    setSaving(false)
    if (res.ok && res.id) {
      router.push(`/admin/articles/${res.id}`)
      router.refresh()
    } else {
      setError(res.error ?? 'Save failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/articles" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Articles
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">New Article</h1>

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
            placeholder="Article title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            placeholder="article-slug"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            placeholder="Short summary"
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
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
        >
          {saving ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </div>
  )
}
