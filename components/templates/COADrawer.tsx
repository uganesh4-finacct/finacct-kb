'use client'

import { useState, useMemo } from 'react'
import { X, Copy, Check } from 'lucide-react'
import type { COATemplateAccountRow } from './COATemplateCard'

type StatementTab = 'all' | 'pnl' | 'bs' | 'scf'

const STATEMENT_CATEGORIES: Record<StatementTab, string[]> = {
  all: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'COGS', 'Labor', 'Operating', 'Other', 'Multi-Unit'],
  pnl: ['Revenue', 'COGS', 'Labor', 'Operating', 'Other'],
  bs: ['Assets', 'Liabilities', 'Equity'],
  scf: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'COGS', 'Labor', 'Operating', 'Other', 'Multi-Unit'],
}

const CATEGORY_ORDER_BY_TAB: Record<StatementTab, readonly string[]> = {
  all: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'COGS', 'Labor', 'Operating', 'Other', 'Multi-Unit'],
  pnl: ['Revenue', 'COGS', 'Labor', 'Operating', 'Other'],
  bs: ['Assets', 'Liabilities', 'Equity'],
  scf: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'COGS', 'Labor', 'Operating', 'Other', 'Multi-Unit'],
}

const COPY_BUTTON_LABEL: Record<StatementTab, string> = {
  all: 'Copy All',
  pnl: 'Copy P&L',
  bs: 'Copy BS',
  scf: 'Copy SCF',
}

const HEADER_LABEL: Record<StatementTab, string> = {
  all: 'All',
  pnl: 'Profit & Loss',
  bs: 'Balance Sheet',
  scf: 'Cash Flow',
}

const TABS: { key: StatementTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pnl', label: 'Profit & Loss' },
  { key: 'bs', label: 'Balance Sheet' },
  { key: 'scf', label: 'Cash Flow' },
]

interface COADrawerProps {
  isOpen: boolean
  onClose: () => void
  restaurantTitle: string
  accounts: COATemplateAccountRow[]
}

export function COADrawer({ isOpen, onClose, restaurantTitle, accounts }: COADrawerProps) {
  const [activeTab, setActiveTab] = useState<StatementTab>('all')
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null)

  const filteredAccounts = useMemo(() => {
    const allowed = STATEMENT_CATEGORIES[activeTab]
    return accounts.filter((acc) => allowed.includes(acc.category || 'Other'))
  }, [accounts, activeTab])

  const groupedAccounts = useMemo(() => {
    const groups: Record<string, COATemplateAccountRow[]> = {}
    const sorted = [...filteredAccounts].sort((a, b) => a.order_index - b.order_index)
    sorted.forEach((acc) => {
      const cat = acc.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(acc)
    })
    return groups
  }, [filteredAccounts])

  const orderedCategories = useMemo(() => {
    const order = CATEGORY_ORDER_BY_TAB[activeTab]
    const withData = order.filter((cat) => (groupedAccounts[cat]?.length ?? 0) > 0)
    const other = Object.keys(groupedAccounts).filter((cat) => !order.includes(cat))
    return [...withData, ...other]
  }, [activeTab, groupedAccounts])

  const handleCopyFiltered = () => {
    const text = filteredAccounts
      .sort((a, b) => a.order_index - b.order_index)
      .map((a) => `${a.account_number}\t${a.account_name}${a.kpi_mapping ? `\t${a.kpi_mapping}` : ''}`)
      .join('\n')
    if (typeof navigator?.clipboard?.writeText === 'function') {
      navigator.clipboard.writeText(text)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    }
  }

  const handleCopyCategory = (category: string) => {
    const categoryAccounts = groupedAccounts[category] ?? []
    const text = categoryAccounts
      .map((a) => `${a.account_number}\t${a.account_name}${a.kpi_mapping ? `\t${a.kpi_mapping}` : ''}`)
      .join('\n')
    if (typeof navigator?.clipboard?.writeText === 'function') {
      navigator.clipboard.writeText(text)
      setCopiedCategory(category)
      setTimeout(() => setCopiedCategory(null), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-900 border-l border-slate-700 z-50 flex flex-col shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coa-drawer-title"
      >
        <div className="border-b border-slate-700 p-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id="coa-drawer-title" className="text-lg font-semibold text-white">
                {restaurantTitle}
              </h2>
              <p className="text-sm text-slate-400">
                {HEADER_LABEL[activeTab]} · {filteredAccounts.length} accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFiltered}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 transition-colors"
              >
                {copiedAll ? <Check size={16} /> : <Copy size={16} />}
                {copiedAll ? 'Copied!' : COPY_BUTTON_LABEL[activeTab]}
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

          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-0 px-2 py-2 text-xs font-medium leading-tight rounded-md transition-colors text-center ${
                  activeTab === tab.key
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {orderedCategories.map((category) => {
            const categoryAccounts = groupedAccounts[category] ?? []
            return (
              <div key={category} className="mb-6">
                <div className="flex items-center justify-between mb-2 sticky top-0 bg-slate-900 py-1 z-10">
                  <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    {category}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopyCategory(category)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-400 transition-colors"
                  >
                    {copiedCategory === category ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy {categoryAccounts.length}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-0.5">
                  {categoryAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`flex items-center gap-3 py-1.5 px-2 rounded hover:bg-slate-800 ${
                        account.is_parent ? 'font-medium' : 'pl-6 text-slate-400'
                      }`}
                    >
                      <span className="font-mono text-sm w-12 text-slate-500 shrink-0">
                        {account.account_number}
                      </span>
                      <span className={account.is_parent ? 'text-white' : 'text-slate-300'}>
                        {account.account_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
