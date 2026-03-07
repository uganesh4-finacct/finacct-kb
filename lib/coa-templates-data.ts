/**
 * COA template account data for download and preview.
 * CSV columns: Account Number, Account Name, QBO Account Type, QBO Detail Type, Category, Core/Extended, KPI Mapping, SCF Classification, Notes
 */

export type RestaurantType = 'cafe' | 'fsr' | 'bar' | 'qsr' | 'fine-dining' | 'multi-unit'

export interface COARow {
  number: string
  name: string
  qboType: string
  qboDetailType: string
  category: string
  coreExtended: 'Core' | 'Extended'
  kpiMapping: string
  scf: string
  notes: string
  /** Which restaurant types include this account. 'all' = every type */
  types: 'all' | RestaurantType[]
}

const row = (
  number: string,
  name: string,
  qboType: string,
  qboDetailType: string,
  category: string,
  coreExtended: 'Core' | 'Extended',
  kpiMapping: string,
  scf: string,
  notes: string,
  types: 'all' | RestaurantType[] = 'all'
): COARow => ({ number, name, qboType, qboDetailType, category, coreExtended, kpiMapping, scf, notes, types })

const ASSETS: COARow[] = [
  row('1010', 'Operating Checking', 'Bank', 'Checking', 'Assets', 'Core', 'bank_balance', 'Operating', 'Main operating account'),
  row('1020', 'Payroll Checking', 'Bank', 'Checking', 'Assets', 'Extended', '', 'Operating', 'Separate payroll account'),
  row('1030', 'Savings', 'Bank', 'Savings', 'Assets', 'Extended', '', 'Operating', 'Reserve account'),
  row('1040', 'Petty Cash', 'Bank', 'Cash on hand', 'Assets', 'Extended', '', 'Operating', 'On-site cash'),
  row('1100', 'Accounts Receivable', 'Accounts receivable', 'Accounts Receivable', 'Assets', 'Core', '', 'Operating', 'Money owed to restaurant'),
  row('1200', 'Inventory', 'Other Current Assets', 'Inventory', 'Assets', 'Extended', '', 'Operating', 'Food and beverage on hand'),
  row('1500', 'Fixed Assets', 'Fixed Assets', 'Furniture & Fixtures', 'Assets', 'Extended', '', 'Investing', 'Equipment and fixtures'),
  row('1600', 'Accumulated Depreciation', 'Fixed Assets', 'Accumulated Depreciation', 'Assets', 'Extended', '', 'Operating', 'Depreciation contra account'),
]

const LIABILITIES: COARow[] = [
  row('2100', 'Accounts Payable', 'Accounts payable', 'Accounts Payable', 'Liabilities', 'Core', '', 'Operating', 'Money owed to vendors'),
  row('2200', 'Credit Cards Payable', 'Credit Card', 'Credit Card', 'Liabilities', 'Core', '', 'Operating', 'Credit card balances'),
  row('2300', 'Accrued Expenses', 'Other Current Liabilities', 'Other Current Liabilities', 'Liabilities', 'Extended', '', 'Operating', 'Expenses incurred not paid'),
  row('2310', 'Accrued Payroll', 'Other Current Liabilities', 'Payroll Clearing', 'Liabilities', 'Core', '', 'Operating', 'Payroll owed'),
  row('2400', 'Loans Payable', 'Long Term Liabilities', 'Notes Payable', 'Liabilities', 'Extended', '', 'Financing', 'Bank loans'),
  row('2500', 'Deferred Revenue', 'Other Current Liabilities', 'Deferred Revenue', 'Liabilities', 'Extended', '', 'Operating', 'Prepaid gift cards'),
]

const EQUITY: COARow[] = [
  row('3100', "Owner's Equity", 'Equity', "Owner's Equity", 'Equity', 'Core', '', 'Financing', 'Owner investment'),
  row('3200', 'Retained Earnings', 'Equity', 'Retained Earnings', 'Equity', 'Core', '', '—', 'Prior year profits'),
  row('3300', "Owner's Draws", 'Equity', "Owner's Equity", 'Equity', 'Core', '', 'Financing', 'Owner withdrawals'),
]

const REVENUE_CAFE: COARow[] = [
  row('4100', 'Food Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'food_sales', 'Operating', 'Primary food revenue'),
  row('4240', 'NA Beverage Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'na_bev_sales', 'Operating', 'Coffee tea soft drinks'),
  row('4300', 'Third-Party Delivery', 'Income', 'Sales of Product Income', 'Revenue', 'Extended', 'third_party_sales', 'Operating', 'DoorDash UberEats'),
  row('4500', 'Discounts', 'Income', 'Discounts/Refunds Given', 'Revenue', 'Core', 'discounts', 'Operating', 'Negative - reduces revenue'),
  row('4510', 'Comps', 'Income', 'Discounts/Refunds Given', 'Revenue', 'Extended', 'discounts', 'Operating', 'Complimentary items'),
]

const REVENUE_FSR_BAR_FINE: COARow[] = [
  row('4100', 'Food Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'food_sales', 'Operating', 'Primary food revenue'),
  row('4200', 'Beverage Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'bev_sales', 'Operating', 'All alcoholic beverages'),
  row('4210', 'Beer Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'beer_sales', 'Operating', 'Draft and bottled beer'),
  row('4220', 'Wine Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'wine_sales', 'Operating', 'Wine by glass and bottle'),
  row('4230', 'Spirits Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'spirits_sales', 'Operating', 'Liquor and cocktails'),
  row('4240', 'NA Beverage Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'na_bev_sales', 'Operating', 'Soft drinks coffee tea'),
  row('4500', 'Discounts', 'Income', 'Discounts/Refunds Given', 'Revenue', 'Core', 'discounts', 'Operating', 'Negative - reduces revenue'),
  row('4510', 'Comps', 'Income', 'Discounts/Refunds Given', 'Revenue', 'Extended', 'discounts', 'Operating', 'Complimentary items'),
]

const REVENUE_QSR: COARow[] = [
  row('4100', 'Food Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'food_sales', 'Operating', 'Primary food revenue'),
  row('4240', 'NA Beverage Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'na_bev_sales', 'Operating', 'Fountain drinks'),
  row('4300', 'Third-Party Delivery', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'third_party_sales', 'Operating', 'DoorDash UberEats Grubhub'),
  row('4310', 'DoorDash Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'doordash_sales', 'Operating', 'DoorDash orders'),
  row('4320', 'UberEats Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'ubereats_sales', 'Operating', 'UberEats orders'),
  row('4330', 'Grubhub Sales', 'Income', 'Sales of Product Income', 'Revenue', 'Core', 'grubhub_sales', 'Operating', 'Grubhub orders'),
  row('4500', 'Discounts', 'Income', 'Discounts/Refunds Given', 'Revenue', 'Core', 'discounts', 'Operating', 'Negative - reduces revenue'),
  row('4510', 'Comps', 'Income', 'Discounts/Refunds Given', 'Revenue', 'Extended', 'discounts', 'Operating', 'Complimentary items'),
]

const COGS_CAFE: COARow[] = [
  row('5100', 'Food Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'food_cogs', 'Operating', 'All food purchases'),
  row('5240', 'NA Beverage Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'na_bev_cogs', 'Operating', 'Coffee beans milk syrups'),
  row('5300', 'Packaging', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'packaging', 'Operating', 'Cups lids to-go containers'),
]

const COGS_FSR_BAR_FINE: COARow[] = [
  row('5100', 'Food Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'food_cogs', 'Operating', 'All food purchases'),
  row('5200', 'Beverage Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'bev_cogs', 'Operating', 'All alcohol purchases'),
  row('5210', 'Beer Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'beer_cogs', 'Operating', 'Beer inventory'),
  row('5220', 'Wine Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'wine_cogs', 'Operating', 'Wine inventory'),
  row('5230', 'Spirits Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'spirits_cogs', 'Operating', 'Liquor inventory'),
  row('5240', 'NA Beverage Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Extended', 'na_bev_cogs', 'Operating', 'Soft drinks coffee'),
]

const COGS_QSR: COARow[] = [
  row('5100', 'Food Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'food_cogs', 'Operating', 'All food purchases'),
  row('5240', 'NA Beverage Cost', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'na_bev_cogs', 'Operating', 'Fountain syrup'),
  row('5300', 'Packaging', 'Cost of Goods Sold', 'Supplies & Materials - COGS', 'COGS', 'Core', 'packaging', 'Operating', 'To-go containers bags'),
]

const LABOR: COARow[] = [
  row('6100', 'FOH Labor', 'Expenses', 'Payroll Expenses', 'Labor', 'Core', 'foh_labor', 'Operating', 'Front of house wages'),
  row('6110', 'Server Wages', 'Expenses', 'Payroll Expenses', 'Labor', 'Extended', 'foh_labor', 'Operating', 'Servers waitstaff'),
  row('6120', 'Bartender Wages', 'Expenses', 'Payroll Expenses', 'Labor', 'Extended', 'foh_labor', 'Operating', 'Bartenders (FSR/Bar/Fine only)'),
  row('6130', 'Host Wages', 'Expenses', 'Payroll Expenses', 'Labor', 'Extended', 'foh_labor', 'Operating', 'Hosts hostesses'),
  row('6200', 'BOH Labor', 'Expenses', 'Payroll Expenses', 'Labor', 'Core', 'boh_labor', 'Operating', 'Back of house wages'),
  row('6210', 'Kitchen Wages', 'Expenses', 'Payroll Expenses', 'Labor', 'Extended', 'boh_labor', 'Operating', 'Line cooks prep'),
  row('6220', 'Dishwasher Wages', 'Expenses', 'Payroll Expenses', 'Labor', 'Extended', 'boh_labor', 'Operating', 'Dishwashers'),
  row('6300', 'Management Labor', 'Expenses', 'Payroll Expenses', 'Labor', 'Core', 'mgmt_labor', 'Operating', 'Salaried managers'),
  row('6400', 'Payroll Taxes', 'Expenses', 'Payroll Expenses', 'Labor', 'Core', '', 'Operating', 'Employer portion FICA FUTA SUTA'),
  row('6500', 'Benefits', 'Expenses', 'Payroll Expenses', 'Labor', 'Extended', '', 'Operating', 'Health insurance 401k'),
  row('6600', 'Overtime', 'Expenses', 'Payroll Expenses', 'Labor', 'Extended', 'overtime_cost', 'Operating', 'OT premium only'),
]

const OPEX: COARow[] = [
  row('7100', 'Rent & Occupancy', 'Expenses', 'Rent or Lease of Buildings', 'Operating', 'Core', 'rent', 'Operating', 'Base rent CAM'),
  row('7200', 'Utilities', 'Expenses', 'Utilities', 'Operating', 'Core', 'utilities', 'Operating', 'Electric gas water trash'),
  row('7300', 'Marketing', 'Expenses', 'Advertising/Promotional', 'Operating', 'Core', 'marketing', 'Operating', 'Ads promotions'),
  row('7400', 'Technology', 'Expenses', 'Office/General Administrative Expenses', 'Operating', 'Core', '', 'Operating', 'POS fees software'),
  row('7500', 'Supplies', 'Expenses', 'Supplies & Materials', 'Operating', 'Core', '', 'Operating', 'Cleaning office smallwares'),
  row('7600', 'Repairs & Maintenance', 'Expenses', 'Repair & Maintenance', 'Operating', 'Extended', '', 'Operating', 'Equipment building repair'),
  row('7700', 'Insurance', 'Expenses', 'Insurance', 'Operating', 'Core', '', 'Operating', 'Liability property'),
  row('7800', 'Professional Services', 'Expenses', 'Legal & Professional Fees', 'Operating', 'Extended', '', 'Operating', 'Accounting legal'),
  row('7900', 'Licenses & Permits', 'Expenses', 'Licenses', 'Operating', 'Extended', '', 'Operating', 'Liquor license health permit'),
]

const OTHER: COARow[] = [
  row('8100', 'Bank & CC Fees', 'Expenses', 'Bank Charges', 'Other', 'Core', '', 'Operating', 'Bank fees CC processing'),
  row('8120', 'CC Processing', 'Expenses', 'Bank Charges', 'Other', 'Core', '', 'Operating', 'Credit card fees 2.5-3.5%'),
  row('8200', 'Third-Party Fees', 'Expenses', 'Other Miscellaneous Expense', 'Other', 'Core', 'third_party_fees', 'Operating', 'DoorDash UberEats commission'),
  row('8210', 'DoorDash Fees', 'Expenses', 'Other Miscellaneous Expense', 'Other', 'Extended', 'doordash_fees', 'Operating', 'DoorDash commission'),
  row('8220', 'UberEats Fees', 'Expenses', 'Other Miscellaneous Expense', 'Other', 'Extended', 'ubereats_fees', 'Operating', 'UberEats commission'),
  row('8230', 'Grubhub Fees', 'Expenses', 'Other Miscellaneous Expense', 'Other', 'Extended', 'grubhub_fees', 'Operating', 'Grubhub commission'),
  row('8400', 'Depreciation', 'Expenses', 'Depreciation', 'Other', 'Extended', '', 'Operating', 'Asset depreciation'),
  row('8300', 'Interest Expense', 'Expenses', 'Interest Paid', 'Other', 'Extended', '', 'Operating', 'Loan interest'),
]

const MULTI_UNIT: COARow[] = [
  row('9100', 'Intercompany Revenue', 'Income', 'Sales of Product Income', 'Multi-Unit', 'Core', '', 'Operating', 'Revenue between units'),
  row('9200', 'Intercompany Expense', 'Expenses', 'Other Miscellaneous Expense', 'Multi-Unit', 'Core', '', 'Operating', 'Expenses between units'),
  row('9300', 'Management Fees', 'Expenses', 'Management Compensation', 'Multi-Unit', 'Core', '', 'Operating', 'Corporate management allocation'),
  row('9400', 'Shared Services', 'Expenses', 'Other Miscellaneous Expense', 'Multi-Unit', 'Extended', '', 'Operating', 'Shared accounting HR marketing'),
  row('9500', 'Consolidated Adjustments', 'Expenses', 'Other Miscellaneous Expense', 'Multi-Unit', 'Extended', '', 'Operating', 'Elimination entries'),
]

function includesType(row: COARow, type: RestaurantType): boolean {
  if (row.types === 'all') return true
  return row.types.includes(type)
}

export function getAccountsForType(
  restaurantType: RestaurantType,
  variant: 'core' | 'full'
): COARow[] {
  const base = [...ASSETS, ...LIABILITIES, ...EQUITY, ...LABOR, ...OPEX, ...OTHER]
  let revenue: COARow[] = []
  let cogs: COARow[] = []
  switch (restaurantType) {
    case 'cafe':
      revenue = REVENUE_CAFE
      cogs = COGS_CAFE
      break
    case 'fsr':
    case 'bar':
    case 'fine-dining':
      revenue = REVENUE_FSR_BAR_FINE
      cogs = COGS_FSR_BAR_FINE
      break
    case 'qsr':
      revenue = REVENUE_QSR
      cogs = COGS_QSR
      break
    case 'multi-unit':
      revenue = REVENUE_FSR_BAR_FINE
      cogs = COGS_FSR_BAR_FINE
      break
    default:
      revenue = REVENUE_FSR_BAR_FINE
      cogs = COGS_FSR_BAR_FINE
  }
  const typeSpecific = [...revenue, ...cogs]
    .filter((r) => includesType(r, restaurantType))
  const multiUnitRows = restaurantType === 'multi-unit' ? MULTI_UNIT : []
  const all = [...base, ...typeSpecific, ...multiUnitRows]
  if (variant === 'core') {
    return all.filter((r) => r.coreExtended === 'Core')
  }
  return all
}

export function getMasterCOA(): COARow[] {
  const all = [
    ...ASSETS,
    ...LIABILITIES,
    ...EQUITY,
    ...REVENUE_CAFE,
    ...REVENUE_FSR_BAR_FINE,
    ...REVENUE_QSR,
    ...COGS_CAFE,
    ...COGS_FSR_BAR_FINE,
    ...COGS_QSR,
    ...LABOR,
    ...OPEX,
    ...OTHER,
    ...MULTI_UNIT,
  ]
  const byNumber = new Map<string, COARow>()
  for (const r of all) {
    if (!byNumber.has(r.number)) byNumber.set(r.number, r)
  }
  return Array.from(byNumber.values()).sort((a, b) => a.number.localeCompare(b.number))
}

export const CSV_HEADERS = ['Account Number', 'Account Name', 'QBO Account Type', 'QBO Detail Type', 'Category', 'Core/Extended', 'KPI Mapping', 'SCF Classification', 'Notes'] as const

export function toCSVRow(r: COARow): string[] {
  return [r.number, r.name, r.qboType, r.qboDetailType, r.category, r.coreExtended, r.kpiMapping, r.scf, r.notes]
}

export function toCSV(rows: COARow[]): string {
  const header = CSV_HEADERS.join(',')
  const body = rows.map((r) => toCSVRow(r).map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
  return [header, ...body].join('\n')
}

export const RESTAURANT_TYPES: { id: RestaurantType; label: string; icon: string; accountCount: string }[] = [
  { id: 'cafe', label: 'Cafe / Coffee Shop', icon: 'Coffee', accountCount: '~40 accounts' },
  { id: 'fsr', label: 'Full Service Restaurant', icon: 'ForkKnife', accountCount: '~60 accounts' },
  { id: 'bar', label: 'Bar & Grill', icon: 'BeerStein', accountCount: '~55 accounts' },
  { id: 'qsr', label: 'Fast Casual / QSR', icon: 'Hamburger', accountCount: '~50 accounts' },
  { id: 'fine-dining', label: 'Fine Dining', icon: 'Wine', accountCount: '~65 accounts' },
  { id: 'multi-unit', label: 'Multi-Unit / Chain', icon: 'Buildings', accountCount: '~75 accounts' },
]
