'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'

interface COAAccount {
  account_number: string
  account_name: string
  parent_account_number: string | null
  is_parent: boolean
  account_level: number
  kpi_mapping: string | null
  qbo_account_type: string
  qbo_detail_type: string
  order_index: number
}

interface COAAccountListProps {
  category: string
  restaurantType?: string
}

export function COAAccountList({ category, restaurantType = 'fsr' }: COAAccountListProps) {
  const [accounts, setAccounts] = useState<COAAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchAccounts() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('coa_template_accounts')
        .select('account_number, account_name, parent_account_number, is_parent, account_level, kpi_mapping, qbo_account_type, qbo_detail_type, order_index')
        .eq('restaurant_type', restaurantType)
        .eq('category', category)
        .order('order_index')
        .range(0, 299)

      if (!error && data) {
        setAccounts(data as COAAccount[])
        const parents = new Set(
          (data as COAAccount[]).filter((a) => a.is_parent).map((a) => a.account_number)
        )
        setExpandedParents(parents)
      }
      setLoading(false)
    }
    fetchAccounts()
  }, [category, restaurantType])

  const toggleParent = (accountNumber: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev)
      if (next.has(accountNumber)) next.delete(accountNumber)
      else next.add(accountNumber)
      return next
    })
  }

  const handleCopy = () => {
    const text = accounts
      .sort((a, b) => a.order_index - b.order_index)
      .map((a) => `${a.account_number}\t${a.account_name}\t${a.qbo_account_type}\t${a.qbo_detail_type}`)
      .join('\n')
    if (typeof navigator?.clipboard?.writeText === 'function') {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <div className="my-6 animate-pulse bg-slate-800 h-40 rounded-lg" />
  }

  const roots = accounts.filter((a) => !a.parent_account_number)
  const childrenByParent = accounts.reduce<Record<string, COAAccount[]>>((acc, account) => {
    if (account.parent_account_number) {
      if (!acc[account.parent_account_number]) acc[account.parent_account_number] = []
      acc[account.parent_account_number].push(account)
    }
    return acc
  }, {})

  return (
    <div className="my-6 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h3 className="font-semibold text-white">{category} Accounts</h3>
          <p className="text-sm text-slate-400">{accounts.length} accounts</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy All'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-800 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-700">
        <div className="col-span-2">Account #</div>
        <div className="col-span-4">Account Name</div>
        <div className="col-span-3">QBO Type</div>
        <div className="col-span-3">QBO Detail</div>
      </div>

      <div className="divide-y divide-slate-700/50">
        {roots.map((parent) => (
          <div key={parent.account_number}>
            <div
              role={parent.is_parent ? 'button' : undefined}
              tabIndex={parent.is_parent ? 0 : undefined}
              onKeyDown={
                parent.is_parent
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleParent(parent.account_number)
                      }
                    }
                  : undefined
              }
              className="grid grid-cols-12 gap-2 px-4 py-2 hover:bg-slate-800/50 cursor-pointer"
              onClick={() => parent.is_parent && toggleParent(parent.account_number)}
            >
              <div className="col-span-2 flex items-center gap-2 font-mono text-sm text-slate-300">
                {parent.is_parent ? (
                  expandedParents.has(parent.account_number) ? (
                    <ChevronDown size={14} className="text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-500 shrink-0" />
                  )
                ) : null}
                <span>{parent.account_number}</span>
              </div>
              <div className="col-span-4 font-medium text-white flex items-center gap-2 flex-wrap">
                {parent.account_name}
                {parent.kpi_mapping ? (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                    KPI
                  </span>
                ) : null}
              </div>
              <div className="col-span-3 text-sm text-slate-400">{parent.qbo_account_type}</div>
              <div className="col-span-3 text-sm text-slate-400">{parent.qbo_detail_type}</div>
            </div>

            {parent.is_parent && expandedParents.has(parent.account_number) && (
              <div className="bg-slate-900/50">
                {(childrenByParent[parent.account_number] ?? [])
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((child) => (
                    <div
                      key={child.account_number}
                      className="grid grid-cols-12 gap-2 px-4 py-1.5 pl-10 hover:bg-slate-800/30"
                    >
                      <div className="col-span-2 font-mono text-sm text-slate-500">
                        {child.account_number}
                      </div>
                      <div className="col-span-4 text-slate-300 flex items-center gap-2 flex-wrap">
                        {child.account_name}
                        {child.kpi_mapping ? (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                            {child.kpi_mapping}
                          </span>
                        ) : null}
                      </div>
                      <div className="col-span-3 text-sm text-slate-500">{child.qbo_account_type}</div>
                      <div className="col-span-3 text-sm text-slate-500">{child.qbo_detail_type}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
