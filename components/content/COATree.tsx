'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Copy, Search, Check } from 'lucide-react'

export interface COATreeItem {
  id: string
  label: string
  children?: COATreeItem[]
}

const RANGE_COLORS: Record<string, string> = {
  '4': 'border-l-emerald-500/80 bg-emerald-500/5',   // Revenue
  '5': 'border-l-rose-500/80 bg-rose-500/5',        // COGS
  '6': 'border-l-blue-500/80 bg-blue-500/5',        // Labor
  '7': 'border-l-amber-500/80 bg-amber-500/5',      // Operating
  '8': 'border-l-slate-500/80 bg-slate-500/5',     // Other
}

function getRangeColor(id: string): string {
  const first = id.charAt(0)
  return RANGE_COLORS[first] ?? 'border-l-slate-600 bg-slate-800/30'
}

function CopyButton({
  text,
  label,
  onCopy,
}: {
  text: string
  label: string
  onCopy: () => void
}) {
  const [copied, setCopied] = useState(false)
  const handleClick = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    onCopy()
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-600/50 transition-opacity"
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

function TreeNode({
  item,
  depth,
  searchTerm,
  onCopy,
  defaultExpanded,
}: {
  item: COATreeItem
  depth: number
  searchTerm: string
  onCopy: () => void
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? depth < 2)
  const hasChildren = item.children && item.children.length > 0
  const matchesSearch = !searchTerm || item.label.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.includes(searchTerm)
  const childMatches = hasChildren && item.children!.some((c) =>
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.includes(searchTerm)
  )
  const show = matchesSearch || childMatches

  const copyText = `${item.id} - ${item.label}`

  if (!show && searchTerm) return null

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-1 py-1.5 px-2 rounded-md group border-l-2 ${getRangeColor(item.id)}
          hover:bg-slate-700/40 transition-colors
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className="p-0.5 rounded text-slate-400 hover:text-white"
          aria-expanded={expanded}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <span className="w-4 inline-block" />
          )}
        </button>
        <span className="flex-1 text-sm text-slate-200 truncate" title={item.label}>
          {item.id} — {item.label}
        </span>
        <CopyButton text={copyText} label={item.label} onCopy={onCopy} />
      </div>
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              searchTerm={searchTerm}
              onCopy={onCopy}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export interface COATreeProps {
  items: COATreeItem[]
  title?: string
  onCopy?: (text: string) => void
  className?: string
}

export function COATree({ items, title = 'Chart of Accounts', onCopy, className = '' }: COATreeProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const handleCopy = (text?: string) => {
    if (text) onCopy?.(text)
    setToast('Copied to clipboard!')
    setTimeout(() => setToast(null), 2000)
  }

  const copyAll = () => {
    const lines = items.flatMap((item) => {
      const line = `${item.id} - ${item.label}`
      const childLines = (item.children ?? []).map((c) => `  ${c.id} - ${c.label}`)
      return [line, ...childLines]
    })
    navigator.clipboard.writeText(lines.join('\n'))
    handleCopy()
  }

  return (
    <div className={`relative rounded-xl border-slate-800/50 bg-slate-800/30 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-2 p-3 border-b border-slate-800/50 bg-slate-800/80">
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-32 pl-8 pr-2 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={copyAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy All
          </button>
        </div>
      </div>
      <div className="p-2 max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <TreeNode
            key={item.id}
            item={item}
            depth={0}
            searchTerm={searchTerm}
            onCopy={() => handleCopy()}
          />
        ))}
      </div>
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
