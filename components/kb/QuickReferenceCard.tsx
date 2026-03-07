'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, Copy, Zap } from 'lucide-react'

export interface QuickRefItem {
  name: string
  value: string
}

const DEFAULT_ACCOUNT_RANGES: QuickRefItem[] = [
  { name: 'Revenue', value: '4000-4999' },
  { name: 'COGS', value: '5000-5999' },
  { name: 'Labor', value: '6000-6999' },
  { name: 'Operating', value: '7000-7999' },
  { name: 'Other', value: '8000-8999' },
  { name: 'Assets', value: '1000-1999' },
  { name: 'Liabilities', value: '2000-2999' },
  { name: 'Equity', value: '3000-3999' },
]

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export interface QuickReferenceCardProps {
  title?: string
  subtitle?: string
  items?: QuickRefItem[]
}

export function QuickReferenceCard({
  title = 'Account Number Quick Reference',
  subtitle = 'Copy-paste ready account ranges',
  items = DEFAULT_ACCOUNT_RANGES,
}: QuickReferenceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = useCallback(async (item: QuickRefItem) => {
    const ok = await copyToClipboard(item.value)
    if (ok) {
      setCopiedId(item.name)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }, [])

  return (
    <div className="rounded-2xl bg-slate-800/30 border border-slate-800/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-800/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mt-4">
            {items.map((range) => (
              <div
                key={range.name}
                className="relative group p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-green-500/30 transition-all"
              >
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  {range.name}
                </div>
                <div className="text-lg font-mono font-semibold text-white">{range.value}</div>
                <button
                  type="button"
                  onClick={() => handleCopy(range)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-green-600 transition-all opacity-0 group-hover:opacity-100"
                  title="Copy"
                  aria-label={`Copy ${range.value}`}
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                </button>
                {copiedId === range.name && (
                  <span className="absolute bottom-2 left-2 text-xs text-green-400 font-medium">
                    Copied!
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
