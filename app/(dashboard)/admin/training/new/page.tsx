'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { saveTrainingModule } from '../../actions'
import { ArrowLeft } from 'lucide-react'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function NewTrainingModulePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState<object | null>(null)
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (title && !slug) setSlug(slugify(title))
  }, [title])

  async function handleSave() {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required.')
      return
    }
    setError(null)
    setSaving(true)
    const res = await saveTrainingModule({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      content: content ?? {},
      order_index: 0,
      estimated_minutes: estimatedMinutes,
      is_published: isPublished,
    })
    setSaving(false)
    if (res.ok && res.id) {
      router.push(`/admin/training/${res.id}`)
      router.refresh()
    } else {
      setError(res.error ?? 'Save failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/training" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Training
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">New Training Module</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            placeholder="Module title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            placeholder="module-slug"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Estimated time (minutes)</label>
          <input
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 30)}
            className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pub"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-slate-600 bg-slate-700"
          />
          <label htmlFor="pub" className="text-sm text-slate-300">Published</label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
        <RichTextEditor content={content} onChange={setContent} minHeight="280px" />
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        type="button"
        onClick={() => handleSave()}
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Module'}
      </button>
    </div>
  )
}
