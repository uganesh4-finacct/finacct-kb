'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { tiptapExtensions } from '@/components/editor/tiptap-extensions'
import { updateArticle } from '@/app/actions/articles'

const DRAFT_KEY_PREFIX = 'kb-article-draft-'
const DRAFT_INTERVAL_MS = 30_000

export interface ArticleEditorProps {
  articleId: string
  initialContent: object
  onSaveSuccess: () => void
  onCancel: () => void
  /** Called when save fails (e.g. for error toast) */
  onSaveError?: (message: string) => void
  /** Auto-save draft to localStorage every 30s and restore on mount */
  enableDraft?: boolean
}

/**
 * TipTap editor for inline article editing. Toolbar (Bold, Italic, H1–H3, lists, table, code block, link),
 * auto-save draft every 30s, Save (green) / Cancel (gray). Calls updateArticle server action.
 */
export function ArticleEditor({
  articleId,
  initialContent,
  onSaveSuccess,
  onCancel,
  onSaveError,
  enableDraft = true,
}: ArticleEditorProps) {
  const [content, setContent] = useState<object>(() => {
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

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: content ?? undefined,
    editable: true,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.indexOf('image') !== -1) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file && editor) {
              const reader = new FileReader()
              reader.onload = () => {
                const src = reader.result as string
                editor.chain().focus().setImage({ src }).run()
              }
              reader.readAsDataURL(file)
            }
            return true
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (!editor || content === undefined) return
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content ?? {}, false)
    }
  }, [content, editor])

  const emitChange = useCallback(() => {
    if (editor) setContent(editor.getJSON())
  }, [editor])

  useEffect(() => {
    if (!editor) return
    editor.on('update', emitChange)
    return () => { editor.off('update', emitChange) }
  }, [editor, emitChange])

  // Auto-save draft to localStorage every 30s
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

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey)
    } catch {
      // ignore
    }
    lastSavedDraft.current = null
  }, [draftKey])

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    const payload = content ?? { type: 'doc', content: [] }
    const res = await updateArticle(articleId, payload)
    setSaving(false)
    if (res.ok) {
      clearDraft()
      onSaveSuccess()
    } else {
      const msg = res.error ?? 'Save failed'
      setError(msg)
      onSaveError?.(msg)
    }
  }

  const handleCancel = () => {
    clearDraft()
    onCancel()
  }

  if (!editor) {
    return <div className="animate-pulse rounded-lg bg-slate-700/50 h-48" />
  }

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-800/90 overflow-hidden transition-all article-editor-root">
      <EditorToolbar editor={editor} />
      <div className="min-h-[320px]">
        <EditorContent editor={editor} />
      </div>
      {error && (
        <p className="px-4 py-2 text-sm text-red-400 bg-red-500/10 border-t border-slate-800/50" role="alert">
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
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  )
}
