'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getSectionsAdmin,
  getSectionArticleCounts,
  createSection,
  updateSection,
  deleteSection,
} from '../actions'
import { SECTION_ICONS } from '@/lib/constants'
import type { Section } from '@/lib/types'
import { FolderPlus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

export default function AdminSectionsPage() {
  const searchParams = useSearchParams()
  const [sections, setSections] = useState<Section[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    const open = searchParams.get('add') === '1'
    setAddOpen(open)
  }, [searchParams])

  useEffect(() => {
    async function load() {
      const [secRes, countRes] = await Promise.all([getSectionsAdmin(), getSectionArticleCounts()])
      if (secRes.data) setSections(secRes.data)
      if (countRes.data) setCounts(countRes.data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setSubmitLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await createSection(formData)
    setSubmitLoading(false)
    if (res.ok) {
      setAddOpen(false)
      const { data } = await getSectionsAdmin()
      const { data: countData } = await getSectionArticleCounts()
      if (data) setSections(data)
      if (countData) setCounts(countData)
    } else {
      setFormError(res.error ?? 'Failed')
    }
  }

  async function handleTogglePublish(s: Section) {
    const res = await updateSection(s.id, { is_published: !s.is_published })
    if (res.ok) {
      setSections((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_published: !x.is_published } : x)))
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteSection(id)
    setDeleteConfirm(null)
    if (res.ok) {
      setSections((prev) => prev.filter((x) => x.id !== id))
    } else {
      alert(res.error)
    }
  }

  async function handleUpdate(id: string, updates: Partial<Section>) {
    const res = await updateSection(id, updates)
    if (res.ok) {
      setSections((prev) => prev.map((x) => (x.id === id ? { ...x, ...updates } : x)))
      setEditingId(null)
    } else {
      setFormError(res.error ?? 'Failed')
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading sections…</div>
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sections</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          <FolderPlus className="w-5 h-5" />
          Add Section
        </button>
      </div>

      <div className="rounded-xl border border-slate-800/50 bg-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Title</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Icon</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Articles</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-b border-slate-800/50/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    {editingId === s.id ? (
                      <input
                        defaultValue={s.title}
                        onBlur={(e) => {
                          const v = e.target.value.trim()
                          if (v && v !== s.title) handleUpdate(s.id, { title: v })
                          setEditingId(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                        className="w-full max-w-xs px-2 py-1 rounded bg-slate-700 text-white text-sm"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{s.title}</span>
                        {s.is_training_section && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Training</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <i className={`fa ${s.icon} text-sm`} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{counts[s.id] ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(s)}
                      className="flex items-center gap-1.5 text-sm"
                    >
                      {s.is_published ? (
                        <>
                          <Eye className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-500">Draft</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Link
                      href={`/admin/articles?section=${s.id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm"
                    >
                      Articles
                    </Link>
                    <button type="button" onClick={() => setEditingId(s.id)} className="text-slate-400 hover:text-white" title="Edit title">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {deleteConfirm === s.id ? (
                      <>
                        <button type="button" onClick={() => handleDelete(s.id)} className="text-red-400 text-sm">Confirm</button>
                        <button type="button" onClick={() => setDeleteConfirm(null)} className="text-slate-400 text-sm">Cancel</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setDeleteConfirm(s.id)} className="text-slate-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setAddOpen(false)}>
          <div className="rounded-xl bg-slate-800 border border-slate-800/50 w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Add Section</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input name="title" required className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" placeholder="Section title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Slug (auto from title if empty)</label>
                <input name="slug" className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" placeholder="section-slug" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea name="description" rows={2} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Icon</label>
                <select name="icon" className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white">
                  {SECTION_ICONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Color</label>
                  <input name="color" defaultValue="blue" className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Gradient</label>
                  <input name="gradient" defaultValue="from-blue-500 to-blue-600" className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_training_section" value="true" id="training_sec" className="rounded border-slate-600 bg-slate-700" />
                <label htmlFor="training_sec" className="text-sm text-slate-300">Training section</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Order index</label>
                <input name="order_index" type="number" defaultValue={sections.length} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" />
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitLoading} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60">
                  {submitLoading ? 'Creating…' : 'Create'}
                </button>
                <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
