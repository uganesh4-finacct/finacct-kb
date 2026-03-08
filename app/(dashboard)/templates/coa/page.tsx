import { createClient } from '@/lib/supabase/server'
import { COATemplatesClient } from './COATemplatesClient'
import type { COATemplateAccountRow } from '@/components/templates/COATemplateCard'

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

  const accountsByType: Record<string, COATemplateAccountRow[]> = {}
  for (const [type, list] of byType) {
    accountsByType[type] = list
  }

  return <COATemplatesClient accountsByType={accountsByType} />
}
