'use client'

import type { Editor } from '@tiptap/react'

interface EditorToolbarProps {
  editor: Editor | null
}

function toolbarBtn(
  onClick: () => void,
  active: boolean,
  label: string,
  icon?: string
) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1.5 rounded text-sm font-medium transition ${
        active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }`}
      title={label}
    >
      {icon ?? label}
    </button>
  )
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  const addImageUrl = () => {
    const url = window.prompt('Image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    const url = window.prompt('URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const inTable = editor.isActive('table')

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-b border-slate-800/50 bg-slate-800">
      {toolbarBtn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold', 'B')}
      {toolbarBtn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic', 'I')}
      {toolbarBtn(() => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), 'Strike', 'S')}
      {toolbarBtn(() => editor.chain().focus().toggleHighlight().run(), editor.isActive('highlight'), 'Highlight', 'H')}
      <span className="w-px h-5 bg-slate-600 mx-1" />
      {toolbarBtn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), 'H1')}
      {toolbarBtn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'H2')}
      {toolbarBtn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'H3')}
      <span className="w-px h-5 bg-slate-600 mx-1" />
      {toolbarBtn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'List')}
      {toolbarBtn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Num')}
      {toolbarBtn(() => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Quote')}
      {toolbarBtn(() => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'), 'Code')}
      {toolbarBtn(addTable, editor.isActive('table'), 'Table')}
      {inTable && (
        <>
          <span className="w-px h-5 bg-slate-600 mx-1" />
          <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-700 hover:text-white" title="Add row above">+ Row ↑</button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-700 hover:text-white" title="Add row below">+ Row ↓</button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-700 hover:text-white" title="Delete row">− Row</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-700 hover:text-white" title="Add column left">+ Col ←</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-700 hover:text-white" title="Add column right">+ Col →</button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-700 hover:text-white" title="Delete column">− Col</button>
        </>
      )}
      <span className="w-px h-5 bg-slate-600 mx-1" />
      <button type="button" onClick={addImageUrl} className="px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-700 hover:text-white" title="Image">
        Img
      </button>
      {toolbarBtn(setLink, editor.isActive('link'), 'Link')}
    </div>
  )
}
