'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Coffee,
  Wine,
  Building2,
  UtensilsCrossed,
  Beef,
  Sandwich,
} from 'lucide-react'

export interface COATemplateAccountRow {
  id: string
  account_number: string
  account_name: string
  qbo_account_type: string
  qbo_detail_type: string
  category: string
  notes: string | null
  order_index: number
}

interface COATemplateCardProps {
  type: string
  title: string
  iconName: string
  accounts: COATemplateAccountRow[]
}

const ICON_MAP: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Coffee,
  ForkKnife: UtensilsCrossed,
  BeerStein: Beef,
  Hamburger: Sandwich,
  Wine,
  Buildings: Building2,
}

const HEADERS = ['Account Number', 'Account Name', 'QBO Account Type', 'QBO Detail Type', 'Category', 'Notes']

function copyAllToClipboard(accounts: COATemplateAccountRow[]): boolean {
  const headerRow = HEADERS.join('\t')
  const dataRows = accounts
    .sort((a, b) => a.order_index - b.order_index)
    .map((a) =>
      [
        a.account_number,
        a.account_name,
        a.qbo_account_type,
        a.qbo_detail_type,
        a.category,
        a.notes ?? '',
      ].join('\t')
    )
  const text = [headerRow, ...dataRows].join('\n')
  if (typeof navigator?.clipboard?.writeText !== 'function') return false
  navigator.clipboard.writeText(text)
  return true
}

export function COATemplateCard({ type, title, iconName, accounts }: COATemplateCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const Icon = ICON_MAP[iconName] ?? Building2

  const handleCopyAll = () => {
    if (copyAllToClipboard(accounts)) {
      setToast(`Copied ${accounts.length} accounts to clipboard!`)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const sorted = [...accounts].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="bg-slate-800/30 border border-slate-800/50 rounded-xl overflow-hidden hover:border-green-500/30 transition-colors">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <Icon size={32} className="text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-white">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{accounts.length} accounts</p>
        </div>
        <span className="text-sm font-medium text-green-500 shrink-0">
          {expanded ? 'Collapse' : 'View Accounts'}
        </span>
        {expanded ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-800/50 px-5 pb-5 pt-2">
          <div className="flex justify-end gap-2 mb-3">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-green-600 text-green-500 bg-transparent hover:bg-green-600 hover:text-white transition-colors"
            >
              <Copy size={14} />
              Copy All
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors"
            >
              Collapse
            </button>
          </div>
          {toast && (
            <p className="text-sm text-green-400 mb-2" role="status">
              {toast}
            </p>
          )}
          <div className="overflow-x-auto rounded-lg border border-slate-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-800/50">
                  {HEADERS.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-300 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30">
                    <td className="px-3 py-2 text-slate-200 font-mono">{row.account_number}</td>
                    <td className="px-3 py-2 text-slate-200">{row.account_name}</td>
                    <td className="px-3 py-2 text-slate-400">{row.qbo_account_type}</td>
                    <td className="px-3 py-2 text-slate-400">{row.qbo_detail_type}</td>
                    <td className="px-3 py-2 text-slate-400">{row.category}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-[200px] truncate" title={row.notes ?? undefined}>
                      {row.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
