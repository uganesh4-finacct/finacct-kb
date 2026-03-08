/**
 * Seed coa_template_accounts from lib/coa-templates-data.
 * Columns: account_number, account_name, qbo_account_type, qbo_detail_type, category, notes
 *
 * Usage: npm run seed:coa
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'
import { getAccountsForType, type RestaurantType } from '../lib/coa-templates-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const RESTAURANT_TYPES: RestaurantType[] = ['cafe', 'fsr', 'bar', 'qsr', 'fine-dining', 'multi-unit']

async function main() {
  let total = 0
  for (const restaurantType of RESTAURANT_TYPES) {
    const { error: deleteError } = await supabase
      .from('coa_template_accounts')
      .delete()
      .eq('restaurant_type', restaurantType)
    if (deleteError) {
      console.error(`Failed to clear ${restaurantType}:`, deleteError.message)
      process.exit(1)
    }
    const rows = getAccountsForType(restaurantType, 'full')
    const records = rows.map((r, i) => ({
      restaurant_type: restaurantType,
      account_number: r.number,
      account_name: r.name,
      qbo_account_type: r.qboType,
      qbo_detail_type: r.qboDetailType,
      category: r.category,
      notes: r.notes || null,
      order_index: i,
    }))

    const { error } = await supabase.from('coa_template_accounts').insert(records)
    if (error) {
      console.error(`Insert failed for ${restaurantType}:`, error.message)
      process.exit(1)
    }
    total += records.length
    console.log(`  ${restaurantType}: ${records.length} accounts`)
  }

  console.log(`Done. Inserted ${total} rows into coa_template_accounts.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
