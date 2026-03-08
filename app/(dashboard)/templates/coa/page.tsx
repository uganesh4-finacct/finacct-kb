import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen } from 'lucide-react'
import { COATemplateCard } from '@/components/templates/COATemplateCard'
import type { COATemplateAccountRow } from '@/components/templates/COATemplateCard'

const RESTAURANT_CONFIG: { type: string; title: string; icon: string }[] = [
  { type: 'cafe', title: 'Cafe / Coffee Shop', icon: 'Coffee' },
  { type: 'fsr', title: 'Full Service Restaurant', icon: 'ForkKnife' },
  { type: 'bar', title: 'Bar & Grill', icon: 'BeerStein' },
  { type: 'qsr', title: 'Fast Casual / QSR', icon: 'Hamburger' },
  { type: 'fine-dining', title: 'Fine Dining', icon: 'Wine' },
  { type: 'multi-unit', title: 'Multi-Unit / Chain', icon: 'Buildings' },
]

export default async function COATemplatesPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('coa_template_accounts')
    .select('id, restaurant_type, account_number, account_name, qbo_account_type, qbo_detail_type, category, notes, order_index')
    .order('restaurant_type')
    .order('order_index')

  const byType = new Map<string, COATemplateAccountRow[]>()
  for (const row of rows ?? []) {
    const list = byType.get(row.restaurant_type) ?? []
    list.push(row as COATemplateAccountRow)
    byType.set(row.restaurant_type, list)
  }

  return (
    <div className="px-4 py-4 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          COA Templates
        </h1>
        <p className="text-slate-400 mt-1 text-base">
          Chart of Accounts by restaurant type — expand to view or copy all.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {RESTAURANT_CONFIG.map((config) => {
          const accounts = byType.get(config.type) ?? []
          return (
            <COATemplateCard
              key={config.type}
              type={config.type}
              title={config.title}
              iconName={config.icon}
              accounts={accounts}
            />
          )
        })}
      </div>

      <div className="pt-6 border-t border-slate-800/50">
        <Link
          href="/section/pos-guides/qbo-mapping-guide"
          className="inline-flex items-center gap-2.5 py-2.5 pr-3 pl-2.5 rounded-lg bg-slate-800/30 border border-slate-800/50 hover:border-green-500/30 hover:bg-slate-800/60 transition-colors text-slate-200"
        >
          <BookOpen size={18} className="text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-white">Need help importing?</span>
          <span className="text-slate-500 text-sm">→ QBO Import Guide</span>
        </Link>
      </div>
    </div>
  )
}
