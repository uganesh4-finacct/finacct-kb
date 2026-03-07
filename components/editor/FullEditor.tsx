'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useCallback, useEffect } from 'react'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { tiptapExtensions } from '@/components/editor/tiptap-extensions'

export interface FullEditorProps {
  /** Initial or controlled content (TipTap JSON). */
  content?: object | null
  /** Called when content changes. */
  onChange?: (json: object) => void
  className?: string
  minHeight?: string
  /** When true, user can edit. When false, read-only. */
  editable?: boolean
}

/**
 * Full TipTap editor for article editing: tables (add/delete rows and columns),
 * headings, lists, blockquote, code blocks, images, links. Table toolbar appears
 * when cursor is inside a table.
 */
export function FullEditor({
  content,
  onChange,
  className = '',
  minHeight = '320px',
  editable = true,
}: FullEditorProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: content ?? undefined,
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
              const reader = new FileReader()
              reader.onload = () => {
                const src = reader.result as string
                editor?.chain().focus().setImage({ src }).run()
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
    if (editor && onChange) {
      onChange(editor.getJSON())
    }
  }, [editor, onChange])

  useEffect(() => {
    if (!editor) return
    editor.on('update', emitChange)
    return () => editor.off('update', emitChange)
  }, [editor, emitChange])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  if (!editor) {
    return <div className="animate-pulse rounded-lg bg-slate-700/50 h-48" />
  }

  return (
    <div
      className={`rounded-xl border border-slate-800/50 bg-slate-800/30 overflow-hidden ${className}`}
    >
      <EditorToolbar editor={editor} />
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
