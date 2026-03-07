'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, Copy, Zap, ExternalLink } from 'lucide-react'

export interface COAAccount {
  number: string
  name: string
}

export interface COACategory {
  category: string
  articleSlug: string
  accounts: COAAccount[]
}

const COA_CATEGORIES: COACategory[] = [
  {
    category: 'Assets (1000s)',
    articleSlug: 'assets-accounts-1000s',
    accounts: [
      { number: '1010', name: 'Operating Checking' },
      { number: '1020', name: 'Payroll Checking' },
      { number: '1030', name: 'Savings' },
      { number: '1040', name: 'Petty Cash' },
      { number: '1100', name: 'Accounts Receivable' },
      { number: '1110', name: 'AR - Catering' },
      { number: '1120', name: 'AR - Gift Cards' },
      { number: '1200', name: 'Inventory' },
      { number: '1210', name: 'Food Inventory' },
      { number: '1220', name: 'Beverage Inventory' },
      { number: '1300', name: 'Prepaid Expenses' },
      { number: '1500', name: 'Fixed Assets' },
      { number: '1510', name: 'Kitchen Equipment' },
      { number: '1520', name: 'Furniture & Fixtures' },
      { number: '1530', name: 'Leasehold Improvements' },
      { number: '1600', name: 'Accumulated Depreciation' },
    ],
  },
  {
    category: 'Liabilities (2000s)',
    articleSlug: 'liabilities-accounts-2000s',
    accounts: [
      { number: '2100', name: 'Accounts Payable' },
      { number: '2110', name: 'AP - Food Vendors' },
      { number: '2120', name: 'AP - Beverage Vendors' },
      { number: '2200', name: 'Credit Cards Payable' },
      { number: '2300', name: 'Accrued Expenses' },
      { number: '2310', name: 'Accrued Payroll' },
      { number: '2320', name: 'Accrued Taxes' },
      { number: '2400', name: 'Loans Payable' },
      { number: '2410', name: 'Line of Credit' },
      { number: '2420', name: 'Equipment Loans' },
      { number: '2430', name: 'SBA Loans' },
      { number: '2500', name: 'Deferred Revenue' },
      { number: '2510', name: 'Gift Card Liability' },
    ],
  },
  {
    category: 'Equity (3000s)',
    articleSlug: 'equity-accounts-3000s',
    accounts: [
      { number: '3100', name: "Owner's Equity / Capital" },
      { number: '3200', name: 'Retained Earnings' },
      { number: '3300', name: "Owner's Draws" },
      { number: '3900', name: 'Current Year Earnings' },
    ],
  },
  {
    category: 'Revenue (4000s)',
    articleSlug: 'revenue-accounts-4000s',
    accounts: [
      { number: '4100', name: 'Food Sales' },
      { number: '4110', name: 'Food Sales - Dine In' },
      { number: '4120', name: 'Food Sales - Takeout' },
      { number: '4130', name: 'Food Sales - Catering' },
      { number: '4210', name: 'Beer Sales' },
      { number: '4220', name: 'Wine Sales' },
      { number: '4230', name: 'Spirits Sales' },
      { number: '4240', name: 'NA Beverage Sales' },
      { number: '4310', name: 'DoorDash Sales' },
      { number: '4320', name: 'UberEats Sales' },
      { number: '4330', name: 'Grubhub Sales' },
      { number: '4340', name: 'Other Delivery Sales' },
      { number: '4410', name: 'Gift Card Sales' },
      { number: '4420', name: 'Merchandise Sales' },
      { number: '4430', name: 'Private Events' },
      { number: '4500', name: 'Discounts' },
      { number: '4510', name: 'Comps' },
      { number: '4520', name: 'Employee Meals' },
      { number: '4530', name: 'Promotions' },
    ],
  },
  {
    category: 'COGS (5000s)',
    articleSlug: 'cogs-accounts-5000s',
    accounts: [
      { number: '5100', name: 'Food Cost' },
      { number: '5110', name: 'Meat & Poultry' },
      { number: '5120', name: 'Seafood' },
      { number: '5130', name: 'Produce' },
      { number: '5140', name: 'Dairy' },
      { number: '5150', name: 'Dry Goods' },
      { number: '5160', name: 'Bakery' },
      { number: '5200', name: 'Beverage Cost' },
      { number: '5210', name: 'Beer Cost' },
      { number: '5220', name: 'Wine Cost' },
      { number: '5230', name: 'Spirits Cost' },
      { number: '5240', name: 'NA Beverage Cost' },
      { number: '5300', name: 'Packaging' },
      { number: '5310', name: 'Food Packaging' },
      { number: '5320', name: 'Beverage Packaging' },
    ],
  },
  {
    category: 'Labor (6000s)',
    articleSlug: 'labor-accounts-6000s',
    accounts: [
      { number: '6110', name: 'Server Wages' },
      { number: '6120', name: 'Bartender Wages' },
      { number: '6130', name: 'Host Wages' },
      { number: '6140', name: 'Busser Wages' },
      { number: '6150', name: 'Food Runner Wages' },
      { number: '6210', name: 'Kitchen Wages' },
      { number: '6220', name: 'Dishwasher Wages' },
      { number: '6310', name: 'GM Salary' },
      { number: '6320', name: 'AGM Salary' },
      { number: '6330', name: 'Kitchen Manager' },
      { number: '6410', name: 'Social Security' },
      { number: '6420', name: 'Medicare' },
      { number: '6430', name: 'FUTA' },
      { number: '6440', name: 'SUTA' },
      { number: '6510', name: 'Health Insurance' },
      { number: '6520', name: 'Workers Compensation' },
      { number: '6530', name: '401k Match' },
      { number: '6600', name: 'Overtime' },
    ],
  },
  {
    category: 'Operating Expenses (7000s)',
    articleSlug: 'operating-expenses-7000s',
    accounts: [
      { number: '7110', name: 'Base Rent' },
      { number: '7120', name: 'CAM Charges' },
      { number: '7130', name: 'Property Tax' },
      { number: '7140', name: 'Percentage Rent' },
      { number: '7210', name: 'Electric' },
      { number: '7220', name: 'Gas' },
      { number: '7230', name: 'Water' },
      { number: '7240', name: 'Trash' },
      { number: '7250', name: 'Internet/Phone' },
      { number: '7310', name: 'Digital Marketing' },
      { number: '7320', name: 'Print Marketing' },
      { number: '7330', name: 'Local Marketing' },
      { number: '7410', name: 'POS Fees' },
      { number: '7420', name: 'Software Subscriptions' },
      { number: '7510', name: 'Cleaning Supplies' },
      { number: '7520', name: 'Office Supplies' },
      { number: '7530', name: 'Smallwares' },
      { number: '7610', name: 'Equipment Repair' },
      { number: '7620', name: 'Building Maintenance' },
      { number: '7710', name: 'General Liability' },
      { number: '7720', name: 'Property Insurance' },
      { number: '7810', name: 'Accounting Fees' },
      { number: '7820', name: 'Legal Fees' },
      { number: '7830', name: 'Consulting' },
      { number: '7910', name: 'Liquor License' },
      { number: '7920', name: 'Health Permit' },
      { number: '7930', name: 'Business License' },
    ],
  },
  {
    category: 'Other Expenses (8000s)',
    articleSlug: 'other-expenses-8000s',
    accounts: [
      { number: '8110', name: 'Bank Fees' },
      { number: '8120', name: 'CC Processing' },
      { number: '8130', name: 'ACH Fees' },
      { number: '8210', name: 'DoorDash Fees' },
      { number: '8220', name: 'UberEats Fees' },
      { number: '8230', name: 'Grubhub Fees' },
      { number: '8300', name: 'Interest Expense' },
      { number: '8400', name: 'Depreciation' },
      { number: '8500', name: 'Amortization' },
      { number: '8900', name: 'Other Expenses' },
    ],
  },
]

export type CopyFormat = 'numbers' | 'numbersAndNames' | 'tabSeparated'

function formatAccountsForCopy(accounts: COAAccount[], format: CopyFormat): string {
  if (format === 'numbers') {
    return accounts.map((a) => a.number).join(', ')
  }
  if (format === 'tabSeparated') {
    return accounts.map((a) => `${a.number}\t${a.name}`).join('\n')
  }
  return accounts.map((a) => `${a.number} — ${a.name}`).join('\n')
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export interface COAQuickReferenceCardProps {
  sectionSlug: string
  title?: string
  subtitle?: string
}

const ALL_ACCOUNTS_ORDERED = COA_CATEGORIES.flatMap((c) => c.accounts)

export function COAQuickReferenceCard({
  sectionSlug,
  title = 'Account Number Quick Reference',
  subtitle = 'Click a category to open the full article. Copy account numbers for QuickBooks.',
}: COAQuickReferenceCardProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())
  const [copyFormat, setCopyFormat] = useState<CopyFormat>('numbersAndNames')
  const [toast, setToast] = useState<{ message: string } | null>(null)

  const showToast = useCallback((message: string) => {
    setToast({ message })
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [])

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }, [])

  const toggleAccount = useCallback((number: string) => {
    setSelectedAccounts((prev) => {
      const next = new Set(prev)
      if (next.has(number)) next.delete(number)
      else next.add(number)
      return next
    })
  }, [])

  const selectAllInSection = useCallback((accounts: COAAccount[]) => {
    setSelectedAccounts((prev) => {
      const next = new Set(prev)
      accounts.forEach((a) => next.add(a.number))
      return next
    })
  }, [])

  const clearSection = useCallback((accounts: COAAccount[]) => {
    setSelectedAccounts((prev) => {
      const next = new Set(prev)
      accounts.forEach((a) => next.delete(a.number))
      return next
    })
  }, [])

  const copySection = useCallback(
    async (accounts: COAAccount[]) => {
      const text = formatAccountsForCopy(accounts, copyFormat)
      const ok = await copyToClipboard(text)
      if (ok) showToast(`Copied ${accounts.length} account${accounts.length !== 1 ? 's' : ''} to clipboard!`)
    },
    [copyFormat, showToast]
  )

  const copySelected = useCallback(async () => {
    const accounts = ALL_ACCOUNTS_ORDERED.filter((a) => selectedAccounts.has(a.number))
    if (accounts.length === 0) return
    const text = formatAccountsForCopy(accounts, copyFormat)
    const ok = await copyToClipboard(text)
    if (ok) showToast(`Copied ${accounts.length} account${accounts.length !== 1 ? 's' : ''} to clipboard!`)
  }, [selectedAccounts, copyFormat, showToast])

  const handleCopySingle = useCallback(
    async (account: COAAccount, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const ok = await copyToClipboard(`${account.number} — ${account.name}`)
      if (ok) {
        setCopiedNumber(account.number)
        setTimeout(() => setCopiedNumber(null), 1500)
        showToast(`Copied ${account.number} to clipboard!`)
      }
    },
    [showToast]
  )

  const baseHref = `/section/${sectionSlug}`

  return (
    <>
    <div className="rounded-2xl bg-slate-800/30 border border-slate-800/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-700/50">
        {COA_CATEGORIES.map((cat) => {
          const isExpanded = expandedCategories.has(cat.category)
          const articleHref = `${baseHref}/${cat.articleSlug}`

          return (
            <div key={cat.category}>
              <Link
                href={articleHref}
                className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-slate-800/80 transition-colors text-left group"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[data-toggle-only]')) {
                    e.preventDefault()
                    toggleCategory(cat.category)
                  }
                }}
              >
                <span className="font-medium text-white group-hover:text-green-400 transition-colors">
                  {cat.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 hidden sm:inline">View article</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-green-400 shrink-0" />
                  <button
                    type="button"
                    data-toggle-only
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleCategory(cat.category)
                    }}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white shrink-0"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              </Link>

              {isExpanded && (
                <div className="px-5 pb-4 pt-0 bg-slate-900/30">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        selectAllInSection(cat.accounts)
                      }}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearSection(cat.accounts)
                      }}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        copySection(cat.accounts)
                      }}
                      className="text-xs text-slate-400 hover:text-green-400 transition-colors"
                    >
                      Copy Section
                    </button>
                  </div>
                  <ul className="space-y-0.5">
                    {cat.accounts.map((acc) => {
                      const isSelected = selectedAccounts.has(acc.number)
                      return (
                        <li key={acc.number}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleAccount(acc.number)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                toggleAccount(acc.number)
                              }
                            }}
                            className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-green-500/10 border border-green-500/30'
                                : 'hover:bg-slate-800/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAccount(acc.number)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-slate-600 text-green-500 focus:ring-green-500 focus:ring-offset-0 focus:ring-offset-slate-800"
                              aria-label={`Select ${acc.number}`}
                            />
                            <span className="flex-1 font-mono text-sm text-slate-200 min-w-0">
                              {acc.number} — {acc.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopySingle(acc, e)}
                              className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                              title={`Copy ${acc.number}`}
                              aria-label={`Copy ${acc.number}`}
                            >
                              {copiedNumber === acc.number ? (
                                <span className="text-green-400">Copied!</span>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  <Link
                    href={articleHref}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-green-400 hover:text-green-300 font-medium"
                  >
                    Full {cat.category} article
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>

    {selectedAccounts.size > 0 && (
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-3 bg-slate-800 border border-slate-800/50 rounded-xl shadow-xl"
        role="status"
        aria-live="polite"
      >
        <span className="text-sm text-slate-300">
          {selectedAccounts.size} account{selectedAccounts.size !== 1 ? 's' : ''} selected
        </span>
        <select
          value={copyFormat}
          onChange={(e) => setCopyFormat(e.target.value as CopyFormat)}
          className="text-sm rounded-lg border border-slate-600 bg-slate-700 text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
          aria-label="Copy format"
        >
          <option value="numbersAndNames">Numbers + Names</option>
          <option value="numbers">Just numbers</option>
          <option value="tabSeparated">Tab-separated (Excel)</option>
        </select>
        <button
          type="button"
          onClick={() => setSelectedAccounts(new Set())}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={copySelected}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors"
        >
          Copy Selected
        </button>
      </div>
    )}

    {toast && (
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg shadow-lg text-sm text-white bottom-24 lg:bottom-24"
        role="status"
        aria-live="polite"
      >
        {toast.message}
      </div>
    )}
    </>
  )
}
