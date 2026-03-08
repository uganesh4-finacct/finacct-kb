'use client'

import React, { useState } from 'react'
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

/** Display order for category sections (Assets 1000s → Multi-Unit 9000s) */
const CATEGORY_ORDER = [
  'Assets',
  'Liabilities',
  'Equity',
  'Revenue',
  'COGS',
  'Labor',
  'Operating',
  'Other',
  'Multi-Unit',
] as const

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

function copyRowToClipboard(row: COATemplateAccountRow): boolean {
  const line = [
    row.account_number,
    row.account_name,
    row.qbo_account_type,
    row.qbo_detail_type,
    row.category,
    row.notes ?? '',
  ].join('\t')
  if (typeof navigator?.clipboard?.writeText !== 'function') return false
  navigator.clipboard.writeText(line)
  return true
}

function groupByCategory(accounts: COATemplateAccountRow[]): { category: string; rows: COATemplateAccountRow[] }[] {
  const sorted = [...accounts].sort((a, b) => a.order_index - b.order_index)
  const byCat = new Map<string, COATemplateAccountRow[]>()
  for (const row of sorted) {
    const cat = row.category || 'Other'
    if (!byCat.has(cat)) byCat.set(cat, [])
    byCat.get(cat)!.push(row)
  }
  const result: { category: string; rows: COATemplateAccountRow[] }[] = []
  for (const cat of CATEGORY_ORDER) {
    const rows = byCat.get(cat)
    if (rows?.length) result.push({ category: cat, rows })
  }
  // Any category not in CATEGORY_ORDER (e.g. typo) at the end
  for (const [cat, rows] of byCat) {
    if (!CATEGORY_ORDER.includes(cat as (typeof CATEGORY_ORDER)[number])) {
      result.push({ category: cat, rows })
    }
  }
  return result
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

  const handleCopyRow = (row: COATemplateAccountRow) => {
    if (copyRowToClipboard(row)) {
      setToast('Copied 1 account')
      setTimeout(() => setToast(null), 2000)
    }
  }

  const grouped = groupByCategory(accounts)

  return (
    <div className="bg-slate-800/30 border border-slate-800/50 rounded-xl overflow-hidden hover:border-green-500/30 transition-colors flex flex-col">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <Icon size={32} className="text-slate-400 shrink-0" aria-hidden />
        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-base font-medium text-white">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{accounts.length} accounts</p>
        </div>
        <span className="inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-green-500">
          {expanded ? 'Collapse' : 'View Accounts'}
          {expanded ? <ChevronUp size={18} className="text-slate-400" aria-hidden /> : <ChevronDown size={18} className="text-slate-400" aria-hidden />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-800/50 px-5 pb-5 pt-2 flex-1 min-h-0">
          <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-green-600 text-green-500 bg-transparent hover:bg-green-600 hover:text-white transition-colors"
            >
              <Copy size={14} aria-hidden />
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
          <div className="overflow-x-auto rounded-lg border border-slate-800/50 max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-800/95 z-10">
                <tr className="border-b border-slate-800/50">
                  <th className="w-8 px-1 py-2 text-left" scope="col"><span className="sr-only">Copy</span></th>
                  {HEADERS.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-300 whitespace-nowrap" scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map(({ category, rows }) => (
                  <React.Fragment key={category}>
                    <tr className="bg-slate-700/50 border-b border-slate-600/50">
                      <td colSpan={HEADERS.length + 1} className="px-3 py-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        {category}
                      </td>
                    </tr>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30">
                        <td className="w-8 px-1 py-1.5 align-middle">
                          <button
                            type="button"
                            onClick={() => handleCopyRow(row)}
                            className="p-1 rounded text-slate-500 hover:text-green-400 hover:bg-slate-700/50 transition-colors"
                            title="Copy this account"
                            aria-label={`Copy account ${row.account_number}`}
                          >
                            <Copy size={14} aria-hidden />
                          </button>
                        </td>
                        <td className="px-3 py-2 text-slate-200 font-mono whitespace-nowrap">{row.account_number}</td>
                        <td className="px-3 py-2 text-slate-200">{row.account_name}</td>
                        <td className="px-3 py-2 text-slate-400">{row.qbo_account_type}</td>
                        <td className="px-3 py-2 text-slate-400">{row.qbo_detail_type}</td>
                        <td className="px-3 py-2 text-slate-400">{row.category}</td>
                        <td className="px-3 py-2 text-slate-500 max-w-[200px] truncate" title={row.notes ?? undefined}>
                          {row.notes ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
