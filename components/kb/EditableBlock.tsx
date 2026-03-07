'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { TipTapContent } from '@/components/TipTapContent'
import {
  getBlockText,
  isBlockEditable,
  buildUpdatedBlock,
  type TipTapNode,
} from '@/lib/tiptap-blocks'

interface EditableBlockProps {
  node: TipTapNode
  blockIndex: number
  isAdmin: boolean
  onSave: (blockIndex: number, updatedNode: TipTapNode) => Promise<void>
}

export function EditableBlock({
  node,
  blockIndex,
  isAdmin,
  onSave,
}: EditableBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(() => getBlockText(node))
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const editable = isAdmin && isBlockEditable(node)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    if (!editable) return
    setValue(getBlockText(node))
    setIsEditing(true)
    setSaveStatus('idle')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setValue(getBlockText(node))
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    const updatedNode = buildUpdatedBlock(node, value)
    setSaving(true)
    setSaveStatus('saving')
    try {
      await onSave(blockIndex, updatedNode)
      setSaveStatus('saved')
      setIsEditing(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
    if (e.key === 'Enter' && !e.shiftKey && node.type !== 'codeBlock') {
      e.preventDefault()
      handleSave()
    }
  }

  if (isEditing) {
    return (
      <div className="relative my-2 rounded-lg border border-green-500/50 bg-slate-800/30 p-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[80px] bg-transparent text-slate-200 resize-none focus:outline-none text-base leading-relaxed"
          placeholder="Enter content..."
          rows={node.type === 'paragraph' || node.type === 'blockquote' ? 3 : 1}
        />
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-xs text-slate-500">
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved ✓'}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-60 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  const docWithSingleBlock: TipTapNode = { type: 'doc', content: [node] }

  return (
    <div
      className={`group relative rounded-lg transition-colors ${
        editable ? 'hover:bg-slate-800/30 cursor-pointer border-l-2 border-transparent hover:border-slate-600' : ''
      }`}
      onClick={editable ? handleStartEdit : undefined}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleStartEdit()
              }
            }
          : undefined
      }
    >
      <div className="tip-tap-content">
        <TipTapContent content={docWithSingleBlock} />
      </div>
      {editable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleStartEdit()
          }}
          className="absolute top-1 right-1 p-1.5 rounded-md text-slate-500 opacity-0 group-hover:opacity-100 hover:text-green-400 hover:bg-slate-700/80 transition-all"
          aria-label="Edit block"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
