'use client'

const SUGGESTED_KEYWORDS = [
  'COA',
  'Weekly Close',
  'QBO',
  'Prime Cost',
  'Square',
  'Payroll',
  'DoorDash',
  'Messy Books',
  'Third-Party Fees',
  'Bank Reconciliation',
  'Onboarding',
  'P&L',
]

interface SuggestedKeywordsProps {
  onSearch: (keyword: string) => void
}

export function SuggestedKeywords({ onSearch }: SuggestedKeywordsProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">Suggested</h3>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_KEYWORDS.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => onSearch(keyword)}
            className="px-3 py-1.5 text-sm bg-slate-800/30 border border-slate-800/50 rounded-full hover:border-green-500/50 hover:text-green-400 text-slate-300 transition-colors"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  )
}
