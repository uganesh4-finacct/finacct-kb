'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FullEditor } from '@/components/editor/FullEditor'
import { updateArticle } from '@/lib/api/articles'

const DRAFT_KEY_PREFIX = 'kb-article-draft-'
const DRAFT_INTERVAL_MS = 30_000

export interface InlineEditorProps {
  articleId: string
  initialContent: object | null
  onSaveSuccess: () => void
  onCancel: () => void
  /** If true, auto-save draft to localStorage every 30s and restore on mount */
  enableDraft?: boolean
}

export function InlineEditor({
  articleId,
  initialContent,
  onSaveSuccess,
  onCancel,
  enableDraft = true,
}: InlineEditorProps) {
  const [content, setContent] = useState<object | null>(() => {
    if (!enableDraft || typeof window === 'undefined') return initialContent
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY_PREFIX}${articleId}`)
      if (raw) {
        const parsed = JSON.parse(raw) as object
        if (parsed && typeof parsed === 'object' && 'type' in parsed) return parsed
      }
    } catch {
      // ignore
    }
    return initialContent
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSavedDraft = useRef<string | null>(null)
  const draftTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const draftKey = `${DRAFT_KEY_PREFIX}${articleId}`

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey)
    } catch {
      // ignore
    }
    lastSavedDraft.current = null
  }, [draftKey])

  useEffect(() => {
    if (!enableDraft) return
    draftTimer.current = setInterval(() => {
      if (!content) return
      const str = JSON.stringify(content)
      if (str === lastSavedDraft.current) return
      try {
        localStorage.setItem(draftKey, str)
        lastSavedDraft.current = str
      } catch {
        // ignore
      }
    }, DRAFT_INTERVAL_MS)
    return () => {
      if (draftTimer.current) {
        clearInterval(draftTimer.current)
        draftTimer.current = null
      }
    }
  }, [enableDraft, draftKey, content])

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    const res = await updateArticle(articleId, content ?? { type: 'doc', content: [] })
    setSaving(false)
    if (res.ok) {
      clearDraft()
      onSaveSuccess()
    } else {
      setError(res.error ?? 'Save failed')
    }
  }

  const handleCancel = () => {
    clearDraft()
    onCancel()
  }

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-800/90 overflow-hidden">
      <FullEditor
        content={content}
        onChange={setContent}
        minHeight="320px"
        className="border-0"
      />
      {error && (
        <p className="px-4 py-2 text-sm text-red-400 bg-red-500/10 border-t border-slate-800/50">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800/50 bg-slate-800/80">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
