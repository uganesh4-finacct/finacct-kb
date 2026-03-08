import { createClient } from '@/lib/supabase/server'
import { COATemplatesClient } from './COATemplatesClient'
import type { COATemplateAccountRow } from '@/components/templates/COATemplateCard'

const RESTAURANT_TYPES = ['cafe', 'fsr', 'bar', 'qsr', 'fine-dining', 'multi-unit'] as const

export default async function COATemplatesPage() {
  const supabase = await createClient()
  const accountsByType: Record<string, COATemplateAccountRow[]> = {}

  // Fetch each restaurant type separately so we always get all accounts (up to 300 per type).
  // A single query with .range(0, 1499) can hit limits; per-type queries guarantee full data.
  for (const restaurantType of RESTAURANT_TYPES) {
    const { data: rows } = await supabase
      .from('coa_template_accounts')
      .select('id, restaurant_type, account_number, account_name, qbo_account_type, qbo_detail_type, category, notes, order_index, parent_account_number, is_parent, account_level, kpi_mapping')
      .eq('restaurant_type', restaurantType)
      .order('order_index')
      .range(0, 299)

    accountsByType[restaurantType] = (rows ?? []) as COATemplateAccountRow[]
  }

  return <COATemplatesClient accountsByType={accountsByType} />
}
