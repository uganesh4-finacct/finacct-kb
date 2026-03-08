'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import type { COATemplateAccountRow } from './COATemplateCard'

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
  for (const [cat, rows] of Array.from(byCat)) {
    if (!CATEGORY_ORDER.includes(cat as (typeof CATEGORY_ORDER)[number])) {
      result.push({ category: cat, rows })
    }
  }
  return result
}

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

interface COADrawerProps {
  isOpen: boolean
  onClose: () => void
  restaurantTitle: string
  accounts: COATemplateAccountRow[]
}

export function COADrawer({ isOpen, onClose, restaurantTitle, accounts }: COADrawerProps) {
  const [copied, setCopied] = useState(false)
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null)

  const handleCopyAll = () => {
    if (copyAllToClipboard(accounts)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyRow = (row: COATemplateAccountRow) => {
    if (copyRowToClipboard(row)) {
      setCopiedRowId(row.id)
      setTimeout(() => setCopiedRowId(null), 2000)
    }
  }

  if (!isOpen) return null

  const grouped = groupByCategory(accounts)

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coa-drawer-title"
      >
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between z-10">
          <div>
            <h2 id="coa-drawer-title" className="text-lg font-semibold text-white">
              {restaurantTitle}
            </h2>
            <p className="text-sm text-slate-400">{accounts.length} accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {grouped.map((group) => (
            <div key={group.category} className="mb-6">
              <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-2 font-medium">
                {group.category}
              </h3>
              <div className="space-y-0.5">
                {group.rows.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between py-2 px-3 hover:bg-slate-800/50 rounded-lg group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-slate-400 font-mono text-sm w-14 shrink-0">
                        {account.account_number}
                      </span>
                      <span className="text-slate-200 text-sm truncate">{account.account_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyRow(account)}
                      className="shrink-0 p-1.5 rounded text-slate-500 hover:text-green-400 hover:bg-slate-700/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Copy this account"
                      aria-label={`Copy account ${account.account_number}`}
                    >
                      {copiedRowId === account.id ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
