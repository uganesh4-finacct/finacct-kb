/**
 * FinAcct360 Knowledge Base — Seed script
 * Run: npm run seed
 * Clear and reseed: npm run seed -- --clear
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * (Uses .env.local if present.)
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config() // .env as fallback

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ——— TipTap JSON helpers ———
type TipTapNode = { type: string; content?: TipTapNode[]; text?: string; attrs?: Record<string, unknown>; marks?: { type: string }[] }

function p(text: string): TipTapNode {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}

function h(level: 1 | 2 | 3, text: string): TipTapNode {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text }] }
}

function doc(...nodes: TipTapNode[]): { type: 'doc'; content: TipTapNode[] } {
  return { type: 'doc', content: nodes }
}

// Custom content block helpers (for TipTapRenderer)
function scenario(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'scenario', attrs: { title }, content }
}
function insight(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'insight', attrs: { title }, content }
}
function warning(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'warning', attrs: { title }, content }
}
function checkpoint(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'checkpoint', attrs: { title }, content }
}
function example(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'example', attrs: { title }, content }
}
function protip(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'protip', attrs: { title }, content }
}
function comparisonTable(
  leftHeader: string,
  rightHeader: string,
  rows: { wrong: string; right: string }[]
): TipTapNode {
  return { type: 'comparison_table', attrs: { leftHeader, rightHeader, rows }, content: [] }
}
function kpiCard(attrs: {
  label: string
  value: string
  subtext?: string
  targetRange?: string
  status?: 'good' | 'warning' | 'bad' | 'neutral'
  icon?: string
}): TipTapNode {
  return { type: 'kpi_card', attrs, content: [] }
}
function processFlow(steps: string[]): TipTapNode {
  return { type: 'process_flow', attrs: { steps }, content: [] }
}
function accountTree(
  items: { id: string; label: string; children?: { id: string; label: string }[] }[]
): TipTapNode {
  return { type: 'account_tree', attrs: { items }, content: [] }
}

function table(rows: { cells: string[]; header?: boolean }[]): TipTapNode {
  const tableRows: TipTapNode[] = rows.map((row) => ({
    type: 'tableRow',
    content: row.cells.map((text) => ({
      type: row.header ? 'tableHeader' : 'tableCell',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    })),
  }))
  return { type: 'table', content: tableRows }
}

// CamelCase block types (for TipTapRenderer)
function scenarioBox(...content: TipTapNode[]): TipTapNode {
  return { type: 'scenarioBox', attrs: {}, content }
}
function insightBox(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'insightBox', attrs: { title }, content }
}
function warningBox(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'warningBox', attrs: { title }, content }
}
function exampleBox(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'exampleBox', attrs: { title }, content }
}
function proTipBox(title: string, ...content: TipTapNode[]): TipTapNode {
  return { type: 'proTipBox', attrs: { title }, content }
}
function checkpointBoxItems(items: string[]): TipTapNode {
  return { type: 'checkpointBox', attrs: { items }, content: [] }
}
function stepFlowSteps(steps: { title: string; description?: string }[]): TipTapNode {
  return { type: 'stepFlow', attrs: { steps }, content: [] }
}
function kpiCards(cards: { value: string; label: string; sublabel?: string; status?: 'good' | 'warning' | 'bad' | 'neutral' }[]): TipTapNode {
  return { type: 'kpiCard', attrs: { cards }, content: [] }
}
function textBold(text: string): TipTapNode {
  return { type: 'text', marks: [{ type: 'bold' }], text }
}
function pContent(...content: TipTapNode[]): TipTapNode {
  return { type: 'paragraph', content }
}
function li(...content: TipTapNode[]): TipTapNode {
  return { type: 'listItem', content }
}
function bulletList(...items: TipTapNode[][]): TipTapNode {
  return { type: 'bulletList', content: items.map((c) => ({ type: 'listItem', content: c })) }
}

// ——— Clear (optional) ———
const clearFlag = process.argv.includes('--clear')

async function clearData() {
  console.log('Clearing existing data…')
  const order = [
    'quiz_questions',
    'training_progress',
    'quiz_attempts',
    'training_modules',
    'kb_articles',
    'kb_sections',
  ] as const
  for (const table of order) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      console.error(`  Error clearing ${table}:`, error.message)
      throw error
    }
    console.log(`  Cleared ${table}`)
  }
  console.log('Clear complete.\n')
}

// ——— Sections ———
const SECTION_GRADIENTS: Record<string, string> = {
  amber: 'from-amber-500 to-amber-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  rose: 'from-rose-500 to-rose-600',
}

const SECTIONS = [
  {
    title: 'Training',
    slug: 'training',
    description: 'Complete all modules to unlock the Knowledge Base',
    icon: 'fa-graduation-cap',
    color: 'amber',
    order_index: 0,
    is_training_section: true,
    requires_training: false,
  },
  {
    title: 'Chart of Accounts',
    slug: 'chart-of-accounts',
    description: 'Master COA framework for all restaurant types',
    icon: 'fa-sitemap',
    color: 'blue',
    order_index: 1,
    is_training_section: false,
    requires_training: true,
  },
  {
    title: 'Standard Operating Procedures',
    slug: 'sops',
    description: 'Step-by-step processes for consistency',
    icon: 'fa-clipboard-check',
    color: 'green',
    order_index: 2,
    is_training_section: false,
    requires_training: true,
  },
  {
    title: 'Exception Handling',
    slug: 'exception-handling',
    description: 'Handle edge cases and client issues',
    icon: 'fa-exclamation-triangle',
    color: 'amber',
    order_index: 3,
    is_training_section: false,
    requires_training: true,
  },
  {
    title: 'Sample Financials',
    slug: 'sample-financials',
    description: 'P&L templates by restaurant type',
    icon: 'fa-file-invoice-dollar',
    color: 'purple',
    order_index: 4,
    is_training_section: false,
    requires_training: true,
  },
  {
    title: 'POS & Software Guides',
    slug: 'pos-guides',
    description: 'Export guides for QBO, Square, Toast, Clover',
    icon: 'fa-cash-register',
    color: 'rose',
    order_index: 5,
    is_training_section: false,
    requires_training: true,
  },
]

async function seedSections(): Promise<Map<string, string>> {
  console.log('Inserting sections…')
  for (const s of SECTIONS) {
    const row = {
      ...s,
      gradient: SECTION_GRADIENTS[s.color] ?? 'from-blue-500 to-blue-600',
      is_published: true,
    }
    const { error } = await supabase.from('kb_sections').upsert(row, { onConflict: 'slug' })
    if (error) throw error
    console.log(`  ✓ ${s.title}`)
  }
  const { data: sections } = await supabase.from('kb_sections').select('id, slug')
  const slugToId = new Map<string, string>()
  for (const row of sections ?? []) {
    slugToId.set((row as { slug: string }).slug, (row as { id: string }).id)
  }
  console.log('Sections done.\n')
  return slugToId
}

// ——— Training module content (TipTap JSON) ———
function module1Content() {
  return doc(
    h(1, 'Restaurant Accounting Basics'),
    p('Understand accrual vs cash accounting, the accounting equation, the general ledger, and the monthly close process.'),
    h(2, 'Accrual vs Cash Accounting'),
    p('Cash Basis: Record revenue when cash is received; record expenses when cash is paid. Simpler but less accurate picture.'),
    exampleBox(
      'Cash vs Accrual Example',
      p('Morning Buzz receives a $500 food delivery on January 30 but doesn\'t pay until February 15. Cash basis: Expense recorded in February (when paid). Accrual basis: Expense recorded in January (when received); Accounts Payable increases until paid in February.')
    ),
    insightBox(
      'FinAcct360 Uses Accrual',
      p('FinAcct360 uses accrual accounting because it provides a more accurate financial picture. When Olive & Vine sells $5,000 in gift cards in December, we don\'t recognize that as revenue until the cards are redeemed.')
    ),
    h(2, 'The Accounting Equation'),
    p('Assets = Liabilities + Equity. This must always balance. Every transaction affects at least two accounts.'),
    table([
      { cells: ['Example', 'Effect'], header: true },
      { cells: ['Morning Buzz buys $1,000 espresso machine with cash', 'Assets (Equipment) +$1,000; Assets (Cash) -$1,000'] },
      { cells: ['Olive & Vine receives $2,000 food delivery on credit', 'Assets (Inventory) +$2,000; Liabilities (AP) +$2,000'] },
    ]),
    h(2, 'The General Ledger'),
    p('The general ledger (GL) is the master record of all financial transactions. Key concepts: Debits (left side — increase assets/expenses); Credits (right side — increase liabilities/equity/revenue); Journal Entry; Trial Balance (must balance!).'),
    exampleBox(
      'Double-Entry: Smokey\'s pays $3,000 rent',
      p('Debit 7010 Rent Expense $3,000; Credit 1010 Operating Checking $3,000. The debit increases the expense, the credit decreases cash. Both sides equal $3,000.')
    ),
    h(2, 'Bank Reconciliation'),
    p('Every month, we reconcile bank statements to our books. This catches: Outstanding checks, deposits in transit, bank fees not yet recorded, errors. At FinAcct360, bank reconciliation is a critical part of the weekly close process.'),
    h(2, 'Accounts Receivable vs Accounts Payable'),
    p('AR (1100s): Money owed TO the restaurant — house accounts, catering invoices, gift card company settlements. AP (2000s): Money the restaurant OWES — food vendor invoices, utility bills, rent, equipment on credit.'),
    h(2, 'The Monthly Close Process'),
    stepFlowSteps([
      { title: 'Weekly Close', description: 'Reconcile sales, enter AP, review labor' },
      { title: 'Month-End Adjustments', description: 'Accruals, prepaid expenses, depreciation' },
      { title: 'Reconciliations', description: 'Bank accounts, credit cards, loans' },
      { title: 'Review', description: 'Compare to budget and prior periods' },
      { title: 'Financial Statements', description: 'Generate P&L, Balance Sheet' },
      { title: 'Delivery', description: 'Send to client with KPI dashboard' },
    ]),
    proTipBox(
      'Key terms for the quiz',
      p('Accrual vs cash accounting • Accounting equation: Assets = Liabilities + Equity • Debits increase assets/expenses; credits increase liabilities/equity/revenue • Bank reconciliation: match bank statement to books')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I understand the difference between accrual and cash accounting',
      'I can explain the accounting equation',
      'I know what debits and credits do to different account types',
      'I understand the purpose of bank reconciliation',
    ])
  )
}

function module2Content() {
  return doc(
    h(1, 'Chart of Accounts'),
    p('Master the FinAcct360 COA structure, account number ranges, parent and sub-accounts, and QBO account type mapping.'),
    h(2, 'Why Chart of Accounts Matters'),
    p('The Chart of Accounts (COA) is the foundation of restaurant accounting. At FinAcct360, we use a standardized COA across all clients, which allows us to: Compare performance across restaurants; Generate consistent KPI dashboards; Train accountants efficiently; Identify issues quickly.'),
    h(2, 'FinAcct360 Account Number Ranges'),
    table([
      { cells: ['Range', 'Category', 'Purpose'], header: true },
      { cells: ['1000-1999', 'Assets', 'What the restaurant owns'] },
      { cells: ['2000-2999', 'Liabilities', 'What the restaurant owes'] },
      { cells: ['3000-3999', 'Equity', 'Owner\'s investment and retained earnings'] },
      { cells: ['4000-4999', 'Revenue', 'Income from sales'] },
      { cells: ['5000-5999', 'COGS', 'Direct cost of goods sold'] },
      { cells: ['6000-6999', 'Labor', 'All employee-related costs'] },
      { cells: ['7000-7999', 'Operating', 'Overhead and operating expenses'] },
      { cells: ['8000-8999', 'Other', 'Non-operating items'] },
      { cells: ['9000-9999', 'Multi-Unit', 'Inter-company and allocations'] },
    ]),
    h(2, 'Parent and Sub-Account Structure'),
    p('We use a hierarchical structure for detailed tracking. Example — Revenue: 4000 Food Sales (Parent) with 4010 Dine-In, 4020 Takeout, 4030 Delivery, 4040 Catering, 4050 Lunch, 4060 Dinner. 4100 Beverage Sales (Parent) with 4110 NA Beverage, 4120 Beer, 4130 Wine, 4140 Liquor, 4150 Coffee.'),
    exampleBox(
      'Morning Buzz Breakdown',
      p('This structure lets Morning Buzz Cafe see total food sales ($50,000) AND the breakdown: dine-in ($30,000), takeout ($15,000), delivery ($5,000).')
    ),
    h(2, 'Key Account Ranges for KPIs'),
    p('Revenue KPIs: Total Sales = Sum of 4000-4299; Food Sales = 4000-4099; Beverage Sales = 4100-4150; Delivery Sales = 4030.'),
    p('Cost KPIs: Food Cost % = 5000-5099 / Food Sales; Beverage Cost % = 5100-5150 / Beverage Sales; Labor Cost % = 6000-6370 / Total Sales; Prime Cost = (5000-5299) + (6000-6370). Expense KPIs: Third Party Fees = 8200-8250; Occupancy = 7000-7040.'),
    h(2, 'QBO Account Type Mapping'),
    table([
      { cells: ['Our Account', 'QBO Type', 'QBO Detail Type'], header: true },
      { cells: ['1010 Operating Checking', 'Bank', 'Checking'] },
      { cells: ['2000 Accounts Payable', 'Accounts Payable', 'Accounts Payable'] },
      { cells: ['4000 Food Sales', 'Income', 'Sales of Product Income'] },
      { cells: ['5000 Food Cost', 'Cost of Goods Sold', 'Supplies & Materials COGS'] },
      { cells: ['6010 Server Wages', 'Expense', 'Payroll Expenses'] },
      { cells: ['7010 Rent', 'Expense', 'Rent or Lease of Buildings'] },
    ]),
    exampleBox(
      'Recording a Week at Olive & Vine',
      p('Trace $10,000 in sales: Revenue entries (4010 $7,500, 4020 $1,200, 4030 $800, 4120 $300, 4130 $200). COGS entries (5010 $1,200, 5030 $800, 5040 $400, 5130 $60). Labor (6010 $1,800, 6110 $1,200, 6120 $600). Food Cost % = $2,400 / $9,500 = 25.3% ✓. Labor Cost % = $3,600 / $10,000 = 36% (needs attention).')
    ),
    proTipBox(
      'Key terms for the quiz',
      p('Account ranges: 4000s Revenue, 5000s COGS, 6000s Labor, 7000s Operating • Parent vs sub-accounts • KPIs from COA totals (food cost %, labor %) • QBO account type mapping')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I know the account number ranges for all categories',
      'I understand parent vs sub-account structure',
      'I can identify which accounts feed which KPIs',
      'I know how to map FinAcct360 accounts to QBO types',
    ])
  )
}

function module3Content() {
  return doc(
    h(1, 'Reading a Restaurant P&L'),
    p('Understand P&L structure and flow, calculate and interpret key line items, know restaurant industry benchmarks, and identify red flags.'),
    h(2, 'P&L Structure Overview'),
    p('The Profit & Loss statement shows financial performance over a period. At FinAcct360, we generate P&Ls weekly and monthly. Structure: REVENUE (Food Sales, Beverage Sales, Other Revenue, Less Discounts & Comps) → NET REVENUE. COST OF GOODS SOLD (Food, Beverage, Paper & Packaging) → TOTAL COGS. GROSS PROFIT. LABOR (FOH, BOH, Management, Payroll Taxes & Benefits) → TOTAL LABOR. PRIME COST (COGS + Labor). OPERATING EXPENSES (Occupancy, Utilities, Marketing, Repairs, Supplies, Technology, Insurance, Other) → OPERATING PROFIT. OTHER INCOME/EXPENSES (Interest, Depreciation) → NET PROFIT.'),
    h(2, 'Reading the Numbers: Morning Buzz Cafe Example'),
    table([
      { cells: ['Line Item', 'Amount', '% of Sales'], header: true },
      { cells: ['Food Sales', '$42,000', '84%'] },
      { cells: ['Beverage Sales', '$8,000', '16%'] },
      { cells: ['Net Revenue', '$50,000', '100%'] },
      { cells: ['Food Cost', '$12,600', '25.2%'] },
      { cells: ['Beverage Cost', '$1,600', '3.2%'] },
      { cells: ['Total COGS', '$14,200', '28.4%'] },
      { cells: ['Gross Profit', '$35,800', '71.6%'] },
      { cells: ['Total Labor', '$20,000', '40%'] },
      { cells: ['Prime Cost', '$34,200', '68.4%'] },
      { cells: ['Operating Profit', '$6,800', '13.6%'] },
      { cells: ['Net Profit', '$5,300', '10.6%'] },
    ]),
    h(2, 'Industry Benchmarks'),
    table([
      { cells: ['Metric', 'Morning Buzz', 'Target', 'Status'], header: true },
      { cells: ['Food Cost %', '25.2%', '28-32%', '✓ Great'] },
      { cells: ['Labor %', '40%', '28-35%', '⚠️ High'] },
      { cells: ['Prime Cost', '68.4%', '<60%', '❌ Problem'] },
      { cells: ['Occupancy', '9%', '<10%', '✓ OK'] },
      { cells: ['Net Profit', '10.6%', '5-10%', '✓ Good'] },
    ]),
    h(2, 'Red Flags to Watch'),
    bulletList(
      [p('Labor over 35% — Morning Buzz is at 40%. Investigate overstaffing or overtime.')],
      [p('Food Cost swings — A jump from 28% to 34% month-over-month: waste, theft, price increases, or menu changes.')],
      [p('Prime Cost over 65% — When COGS + Labor exceed 65%, there\'s little room for profit.')],
      [p('Occupancy over 10% — Rent should be under 10%.')],
      [p('Negative trends — Three months of declining sales or increasing costs signals problems.')]
    ),
    insightBox(
      'Variance Analysis',
      p('We compare P&L to Budget, Prior Month, and Prior Year. If Morning Buzz budgeted 32% labor but hit 40%, that\'s an 8-point variance representing $4,000 in unplanned expense. On $50,000 revenue, that\'s the difference between 10% profit and 2% profit!')
    ),
    proTipBox(
      'Key terms for the quiz',
      p('P&L sections: Revenue → COGS → Gross Profit → Labor → Prime Cost → Operating Expenses → Net Profit • Cost % = (Cost ÷ Revenue) × 100 • Benchmarks: Prime Cost <60%, Labor 28–35%, Food Cost 28–35% • Red flags: labor >35%, prime cost >65%')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I can identify all major sections of a P&L',
      'I know how to calculate cost percentages',
      'I understand industry benchmarks for key metrics',
      'I can identify red flags that need investigation',
    ])
  )
}

function module4Content() {
  return doc(
    h(1, 'KPI Fundamentals'),
    p('Understand what KPIs are and why they matter, master the key restaurant KPIs, know how to calculate each metric, and learn to interpret KPI trends.'),
    h(2, 'What Are KPIs?'),
    p('Key Performance Indicators (KPIs) are specific metrics that measure business health. For restaurants, KPIs translate complex financial data into actionable numbers. At FinAcct360, our KPI dashboard gives owners a quick snapshot of performance.'),
    h(2, 'The Essential Restaurant KPIs'),
    h(3, '1. Prime Cost'),
    p('Formula: (Food Cost + Beverage Cost + Labor Cost) / Total Revenue. Target: Under 60% (typically 55–65%). Example — Olive & Vine: Food $28,000 + Beverage $7,000 + Labor $25,000 = $60,000 / $100,000 = 60% ✓'),
    h(3, '2. Food Cost Percentage'),
    p('Formula: Food Cost / Food Sales × 100. Target: 28-35%. Morning Buzz: $12,600 / $42,000 = 30% ✓'),
    h(3, '3. Beverage Cost Percentage'),
    p('Target: 18-24% overall. Beer 20-25%, Wine 30-35%, Liquor 15-20%, NA Beverages 10-15%. Smokey\'s: Beer Cost $3,000 / Beer Sales $12,000 = 25%; Liquor $2,000 / $15,000 = 13% ✓'),
    h(3, '4. Labor Cost Percentage'),
    p('Formula: Total Labor / Total Revenue × 100. Target: 28–35%. Breakdown: FOH 12-18%, BOH 10-14%, Management 5-8%.'),
    h(3, '5. Gross Profit Margin'),
    p('Formula: (Revenue - COGS) / Revenue × 100. Target: 65-75%.'),
    h(3, '6. Net Profit Margin'),
    p('Formula: Net Profit / Revenue × 100. Target: 5-10%.'),
    h(3, '7. Sales Per Labor Hour (SPLH)'),
    p('Formula: Total Sales / Total Labor Hours. QSR $35-45, FSR $25-35, Fine Dining $40-50. Brij Foods: $25,000 / 600 = $41.67 ✓'),
    h(3, '8. Average Check'),
    p('Formula: Total Sales / Number of Guests (or Transactions). Coffee Shop $8-12, Fast Casual $12-18, FSR $25-45, Fine Dining $75-150+.'),
    h(3, '9. Table Turnover'),
    p('Formula: Guests Served / Number of Seats. Lunch 1.5-2.0 turns, Dinner 1.5-2.5 turns.'),
    h(3, '10. Third-Party Delivery Fees %'),
    p('Formula: Delivery Fees / Delivery Sales × 100. Target: Under 25%. If Morning Buzz pays $400 in DoorDash fees on $1,500 delivery sales, that\'s 26.7% — the delivery channel is barely profitable!'),
    h(2, 'Reading KPI Trends'),
    p('Watch for: Week-over-week changes; Month-over-month trends; Year-over-year comparison; Day-of-week patterns.'),
    insightBox(
      'The FinAcct360 Dashboard',
      p('Our dashboard shows all these KPIs at a glance with current period values, comparison to target, comparison to prior period, and traffic light indicators (green/yellow/red).')
    ),
    proTipBox(
      'Key terms for the quiz',
      p('Prime Cost = Food + Beverage + Labor (target under 60%, typically 55–65%) • Food Cost % = Food COGS ÷ Food Sales × 100 (target 28–35%) • Labor % = Total Labor ÷ Revenue × 100 (target 28–35%) • SPLH = Total Sales ÷ Labor Hours • Beverage cost target 18–24%')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I can calculate Prime Cost',
      'I know the target ranges for major KPIs',
      'I understand Food Cost % vs Beverage Cost %',
      'I can explain why SPLH matters for staffing decisions',
    ])
  )
}

function module5Content() {
  return doc(
    h(1, 'QBO Essentials'),
    p('Navigate the QuickBooks Online interface, understand key QBO features for restaurants, know how to run essential reports, and learn FinAcct360 QBO best practices.'),
    h(2, 'QBO Overview'),
    p('QuickBooks Online is our primary accounting software at FinAcct360. Every client uses QBO, and you\'ll spend significant time in this platform.'),
    h(2, 'Key Navigation Areas'),
    bulletList(
      [p('Dashboard — Quick snapshot of income, expenses, profit; bank account balances; invoice status; sales trends')],
      [p('Banking — Bank feed connections; transaction matching; rule creation for recurring transactions')],
      [p('Sales — Invoices (catering, house accounts); Sales receipts; Credit memos')],
      [p('Expenses — Bills (AP); Expense tracking; Bill payments; Vendor management')],
      [p('Reports — P&L; Balance Sheet; Cash Flow; Custom reports')]
    ),
    h(2, 'QBO for Restaurants: Key Features'),
    p('Bank Feeds: QBO connects directly to bank accounts and credit cards. Review each transaction, categorize to correct account, create rules (e.g. "SYSCO" → 5010 Food Cost).'),
    p('Classes: For multi-unit restaurants, classes track locations (e.g. Morning Buzz Downtown, Uptown, Airport). Each transaction gets a class for per-location P&Ls.'),
    p('Vendor Management: Set up vendors for food distributors, beverage vendors, utilities, landlords, payroll. Recurring Transactions: Set up monthly rent, loan payments, insurance.'),
    h(2, 'Essential Reports'),
    bulletList(
      [p('P&L (Profit and Loss) — Standard P&L, P&L by Month, P&L by Class')],
      [p('Balance Sheet — Assets, liabilities, equity for loan compliance and owner reporting')],
      [p('A/P Aging — Unpaid bills, critical for cash flow')],
      [p('A/R Aging — Unpaid invoices, catering receivables')],
      [p('Bank Reconciliation — Match QBO to bank statement; complete monthly')]
    ),
    h(2, 'FinAcct360 QBO Best Practices'),
    stepFlowSteps([
      { title: 'Daily', description: 'Review and categorize bank feed transactions' },
      { title: 'Weekly', description: 'Enter all AP bills, reconcile sales to POS' },
      { title: 'Monthly', description: 'Complete bank reconciliation, review GL' },
      { title: 'Always', description: 'Use memo field for transaction details' },
    ]),
    h(2, 'Common QBO Tasks'),
    p('Creating a Bill: Expenses > Bills > Select Vendor > Enter bill date and due date > Add line items with correct accounts > Save.'),
    p('Running P&L: Reports > Profit and Loss > Set date range > Select comparison (prior period/year) > Export or print.'),
    p('Reconciling Bank: Banking > Reconcile > Select account > Enter statement ending balance > Match transactions > Difference should be $0.00.'),
    proTipBox(
      'Key terms for the quiz',
      p('QBO areas: Dashboard, Banking, Sales, Expenses, Reports • Creating a bill: Expenses > Bills > Add bill • P&L: Reports > Profit and Loss • Bank reconciliation: match statement to books')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I can navigate the main QBO areas',
      'I know how to enter a bill',
      'I understand how to run a P&L report',
      'I can explain the bank reconciliation process',
    ])
  )
}

function module6Content() {
  return doc(
    h(1, 'POS Systems — Square'),
    p('Understand Square\'s role in restaurant operations, learn to export sales data, know how to reconcile Square to QBO, and identify common Square issues.'),
    h(2, 'What is Square?'),
    p('Square is a popular point-of-sale (POS) system used by many small to mid-size restaurants, especially cafes and QSRs like Morning Buzz. It handles: Order entry and payments; Menu management; Basic inventory; Employee management; Reporting.'),
    h(2, 'Square Dashboard'),
    p('Access at squareup.com/dashboard or the Square app. Key sections: Sales Summary (daily/weekly/monthly totals); Transactions (individual sale details); Items (menu items sold); Payments (credit cards, cash, gift cards).'),
    h(2, 'Exporting Sales Data'),
    p('To reconcile with QBO: Log into Square Dashboard, Reports, Sales, Select date range (typically weekly), Export, CSV. The export includes: Gross sales, Discounts, Refunds, Net sales, Tips, Taxes collected, Payment method breakdown.'),
    h(2, 'Sales Categories in Square'),
    p('Square organizes sales by category. Ensure client menu is set up to match our COA: Food (maps to 4000s), Beverages (maps to 4100s), Merchandise (maps to 4220).'),
    h(2, 'Reconciling Square to QBO'),
    stepFlowSteps([
      { title: 'Export Square sales report', description: 'For the week' },
      { title: 'Compare totals', description: 'Square Net Sales = QBO Revenue; Square Tips = QBO Tips Payable; Square Fees = QBO CC Processing Fees' },
      { title: 'Reconcile deposits', description: 'Square deposits to bank (usually next day); Match bank deposits to Square payout report' },
      { title: 'Document variances', description: 'If any' },
    ]),
    exampleBox(
      'Example Reconciliation',
      p('Square Weekly: Gross 12,500, Discounts 250, Net 12,250, Tips 1,800, Tax 980, Square Fees 338, Total Deposits 13,712. QBO: Revenue 12,250, Tips Payable 1,800, Sales Tax 980, CC Processing 338, Bank 13,712.')
    ),
    h(2, 'Common Square Issues'),
    bulletList(
      [p('Deposit timing - Monday sales may not hit bank until Tuesday or Wednesday')],
      [p('Fee structure - Square charges 2.6 pct + 0.10 per transaction')],
      [p('Offline transactions - Batched later if internet goes down')],
      [p('Category mapping - If items are not categorized, we cannot break out food vs beverage')],
      [p('Voided transactions - Track voids and refunds separately; high void rates may indicate problems')]
    ),
    insightBox(
      'Square vs QBO Integration',
      p('FinAcct360 typically prefers manual entry because it gives more control over coding, catches errors before posting, and keeps a cleaner GL.')
    ),
    proTipBox(
      'Key terms for the quiz',
      p('Square Dashboard: Reports/Analytics for Sales Summary • Net sales = gross minus discounts/refunds/comps • Export CSV for close • Reconcile: Square Net Sales = QBO Revenue; verify date range and totals')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I know how to access the Square Dashboard',
      'I can export sales reports from Square',
      'I understand the reconciliation process',
      'I can identify common Square issues',
    ])
  )
}

function module7Content() {
  return doc(
    h(1, 'POS Exports — Toast'),
    p('Pull and use Toast sales reports for accurate books.'),
    h(2, 'Logging Into Toast'),
    p('Use the client’s Toast credentials. Ensure Reports or Export permissions.'),
    h(2, 'Navigating to Reports'),
    p('Find Reports in the Toast dashboard. Sales and operational reports are typically under a Reports or Analytics section.'),
    h(2, 'Pulling Sales Summary'),
    p('Select Sales Summary for the period. Toast provides daily and custom date ranges.'),
    h(2, 'Toast-Specific Fields'),
    p('Toast may include service areas, dayparts, and tip reporting that differ from other POS. Map these to your COA.'),
    h(2, 'Menu Mix Reports'),
    p('Menu mix reports show sales by item or category. Useful for food cost and mix analysis.'),
    h(2, 'Exporting Data'),
    p('Export to CSV or Excel. Confirm column headers and date format before importing.'),
    h(2, 'Common Toast Issues'),
    p('Watch for: multi-location data combined vs by location, gift card and tip handling, and time-zone settings.')
  )
}

function module8Content() {
  return doc(
    h(1, 'POS Exports — Clover'),
    p('Pull and understand Clover transaction data for weekly close.'),
    h(2, 'Logging Into Clover Dashboard'),
    p('Access the Clover web dashboard with the merchant’s credentials.'),
    h(2, 'Navigating to Reports'),
    p('Reports are usually under a Reports or Analytics tab. Transaction and summary reports are available.'),
    h(2, 'Pulling Transaction Reports'),
    p('Transaction reports list individual sales. Summary reports aggregate by day or period. Use the one that matches your process.'),
    h(2, 'Understanding Clover Data Format'),
    p('Clover exports include amount, date, payment type, and often category. Map to your revenue and discount accounts.'),
    h(2, 'Exporting to CSV'),
    p('Export to CSV. Check that totals match the dashboard and that refunds are clearly marked.'),
    h(2, 'Clover-Specific Considerations'),
    p('Tip handling, multi-device or multi-location setups, and Clover’s fee reporting may require extra mapping.')
  )
}

function module9Content() {
  return doc(
    h(1, 'Weekly Close Process'),
    p('A repeatable weekly close ensures nothing is missed and issues are caught early.'),
    h(2, 'The 5 Source Files Needed'),
    p('Typically: (1) POS sales summary, (2) payroll summary, (3) bank/credit activity, (4) invoices or bills for the period, (5) any adjustment notes.'),
    h(2, 'Step 1: Collect POS Data'),
    p('Pull POS export for the close week. Verify date range and totals.'),
    h(2, 'Step 2: Collect Payroll Data'),
    p('Get payroll register or summary for the same period. Match pay dates to the period where labor was earned.'),
    h(2, 'Step 3: Pull QBO Reports'),
    p('Run P&L and any other reports for the period. Ensure bank feeds are up to date.'),
    h(2, 'Step 4: Reconcile and Verify'),
    p('Reconcile POS revenue to QBO revenue. Reconcile payroll to labor accounts. Investigate variances.'),
    h(2, 'Step 5: Flag Issues'),
    p('Document missing data, uncategorized transactions, or unusual amounts for follow-up.'),
    h(2, 'Step 6: Submit for Review'),
    p('Once reconciled and flagged, submit the close package for review per your firm’s process.'),
    h(2, 'Common Weekly Close Mistakes'),
    p('Wrong date ranges, mixing cash and accrual, forgetting payroll, and not saving a backup are common. Use a checklist.')
  )
}

function module10Content() {
  return doc(
    h(1, 'Common Mistakes'),
    p('Avoid these top errors that trip up new restaurant accountants—and learn how to catch and fix them.'),
    scenarioBox(
      p('A new team member closes Morning Buzz for the first time. Revenue in QBO is $52,000 for the month—but Sarah says they did $45,000. You discover POS was imported twice. That\'s one of the mistakes below. Each one has a scenario, how to catch it, and how to prevent it.')
    ),
    h(2, 'Mistake 1: Wrong Date Ranges'),
    p('POS and QBO periods must align. A week that\'s Mon–Sun in POS but Thu–Wed in QBO distorts revenue and KPIs.'),
    comparisonTable('Wrong', 'Right', [
      { wrong: 'POS: calendar month; QBO: same month but different cut-off time', right: 'Use identical period (e.g., week Sun–Sat) in both' },
      { wrong: 'Payroll by pay date not aligned to close week', right: 'Match labor to the period when it was earned' },
    ]),
    h(2, 'Mistake 2: Mixing Cash and Accrual'),
    p('Keep reporting basis consistent. Mixing cash and accrual in the same P&L leads to wrong margins and confused owners.'),
    h(2, 'Mistake 3: Missing or Late Payroll'),
    p('Labor is the largest cost after COGS. Missing payroll makes the close incomplete and prime cost wrong.'),
    h(2, 'Mistake 4: Uncategorized Transactions'),
    p('Uncategorized items distort the P&L. Reconcile the bank feed and clear uncategorized before closing.'),
    h(2, 'Mistake 5: Duplicate Revenue'),
    warningBox(
      'Duplicate Entries',
      p('Importing POS and also entering manually—or importing twice—inflates revenue. Use one source of truth. Before close, compare POS total to QBO revenue; if QBO is higher, look for duplicates.')
    ),
    h(2, 'Mistake 6: Wrong Account Mapping'),
    p('Mapping to the wrong COA account skews KPIs (e.g., food cost in 5200). Use a mapping guide and review before posting.'),
    h(2, 'Mistake 7: Not Verifying Totals'),
    p('Always tie POS totals to QBO and to bank deposits. Verification catches import and mapping errors before they become \"facts.\"'),
    h(2, 'Mistake 8: Ignoring Flags'),
    p('If the system or reviewer flags an issue, resolve it before finalizing. Pushing through with open flags leads to rework and lost trust.'),
    h(2, 'Mistake 9: No Backup'),
    p('Save a copy of exports and the close file before making changes. You may need to re-run or audit later.'),
    h(2, 'Mistake 10: Poor Communication'),
    p('Communicate missing data, delays, or assumptions to the client or reviewer. Document in the file so the next person knows what was done.'),
    insightBox(
      'Prevention Checklist',
      p('Use a close checklist every time. Reconcile every step (POS → QBO, payroll → labor, bank). Have a second pair of eyes if possible. When in doubt, flag it.')
    ),
    proTipBox(
      'First Close on a New Client',
      p('Don\'t assume the prior process was correct. Reconcile from scratch: POS total, payroll total, bank activity. Build your own verification habit from day one.')
    )
  )
}

// ——— New modules (order_index 0, 1, 2) ———
function usRestaurantIndustryContent() {
  return doc(
    h(1, 'US Restaurant Industry'),
    p('Understand the size and scope of the US restaurant industry, the six main restaurant types, why restaurants succeed and fail, and basic restaurant economics.'),
    h(2, 'The US Restaurant Industry'),
    p('The US restaurant industry is a massive economic force, generating over $1 trillion in annual sales. With more than 1 million restaurant locations and 15 million employees, it\'s one of the largest private-sector employers in the country. As a FinAcct360 accountant, you\'ll work with clients across this diverse industry, so understanding the landscape is essential.'),
    h(2, 'The 6 Restaurant Types'),
    p('Every restaurant falls into one of these categories, each with unique financial characteristics:'),
    p('1. Cafe / Coffee Shop — Morning Buzz Cafe is a perfect example. These establishments focus on coffee, pastries, and light fare. They typically have high morning traffic, lower evening sales, and relatively low food costs (25-30%). Labor is often the biggest expense as skilled baristas command premium wages.'),
    p('2. Full Service Restaurant (FSR) — Think Olive & Vine, where guests are seated, served by waitstaff, and have a complete dining experience. These restaurants have higher labor costs due to servers, hosts, and bussers, but can command higher check averages. Food costs typically run 28-35%.'),
    p('3. Bar & Grill / Sports Bar — Smokey\'s and Tailgators represent this category. Beverage sales (especially alcohol) drive profitability here. Beer and liquor have much better margins than food, often 75-85% gross margin compared to 65-70% for food.'),
    p('4. Fast Casual / QSR — Brij Foods and Spitz operate in this space. Limited service, faster turnover, and lower labor costs define this segment. These restaurants rely on volume and efficiency. Food costs are typically 28-32%, but labor is lower at 20-25% of sales.'),
    p('5. Fine Dining — High-end restaurants with premium pricing, extensive wine programs, and elevated service. Food costs can be higher (32-38%) due to premium ingredients, but check averages of $100+ per person compensate. Labor is intensive with sommeliers, captains, and extensive kitchen brigades.'),
    p('6. Multi-Unit / Chain — Restaurant groups operating multiple locations. These benefit from economies of scale in purchasing but face complexity in consolidated reporting, inter-company transactions, and management overhead allocation.'),
    h(2, 'Why Restaurants Fail'),
    p('The sobering reality: 60% of restaurants fail in their first year, and 80% close within five years. The primary reasons are:'),
    bulletList(
      [pContent(textBold('Undercapitalization'), { type: 'text', text: ' — Running out of cash before becoming profitable' } as TipTapNode)],
      [pContent(textBold('Poor cost control'), { type: 'text', text: ' — Not managing food cost, labor, or overhead' } as TipTapNode)],
      [pContent(textBold('Bad location'), { type: 'text', text: ' — Insufficient foot traffic or wrong demographics' } as TipTapNode)],
      [pContent(textBold('Lack of financial visibility'), { type: 'text', text: ' — Not knowing their numbers until it\'s too late' } as TipTapNode)]
    ),
    insightBox(
      'Why FinAcct360 Exists',
      p('This is exactly why FinAcct360 exists. We give restaurant owners the financial clarity they need to make better decisions and beat the odds.')
    ),
    h(2, 'Restaurant Economics 101'),
    p('Understanding the basic math of restaurants:'),
    bulletList(
      [pContent(textBold('Average restaurant profit margin'), { type: 'text', text: ': 3-5% (very thin!)' } as TipTapNode)],
      [pContent(textBold('Prime Cost target'), { type: 'text', text: ': Under 60% of revenue (typically 55–65%)' } as TipTapNode)],
      [pContent(textBold('Occupancy costs'), { type: 'text', text: ': Should be under 10% of revenue' } as TipTapNode)],
      [pContent(textBold('Break-even'), { type: 'text', text: ': Most restaurants need 60-70% capacity to break even' } as TipTapNode)]
    ),
    warningBox(
      'The Thin Margin Reality',
      p('When a restaurant makes $1 million in annual sales and earns a 5% profit, that\'s only $50,000 for the owner. One bad month of food waste or labor overages can wipe out an entire quarter\'s profit.')
    ),
    h(2, 'Ownership Structures'),
    p('You\'ll encounter various business structures:'),
    bulletList(
      [pContent(textBold('Sole Proprietorship'), { type: 'text', text: ' — One owner, simplest structure, personal liability' } as TipTapNode)],
      [pContent(textBold('LLC'), { type: 'text', text: ' — Most common, separates business and personal assets' } as TipTapNode)],
      [pContent(textBold('S-Corp'), { type: 'text', text: ' — Tax advantages for profitable restaurants' } as TipTapNode)],
      [pContent(textBold('Partnership'), { type: 'text', text: ' — Multiple owners sharing profits and responsibilities' } as TipTapNode)],
      [pContent(textBold('Franchise'), { type: 'text', text: ' — Pays fees to use established brand (McDonald\'s, Subway)' } as TipTapNode)]
    ),
    proTipBox(
      'Key terms for the quiz',
      p('Six types: Cafe, FSR, Bar & Grill, Fast Casual/QSR, Fine Dining, Multi-Unit • Typical net profit 3–5% • 60% fail year 1 • Prime cost target under 60% • Ownership: Sole prop, LLC, S-Corp, Partnership, Franchise')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I can name the 6 restaurant types and their differences',
      'I understand why restaurant margins are thin (5% typical)',
      'I know why 60% of restaurants fail in year 1',
      'I understand the different ownership structures',
    ])
  )
}

function restaurantRolesOperationsContent() {
  return doc(
    h(1, 'Restaurant Roles & Operations'),
    p('Understand Front of House (FOH) vs Back of House (BOH), key roles in restaurant operations, how operations impact finances, and payroll categories for labor tracking.'),
    h(2, 'Front of House (FOH) vs Back of House (BOH)'),
    p('Every restaurant is divided into two operational areas, and understanding this division is critical for proper labor cost tracking and payroll coding.'),
    h(3, 'Front of House (FOH) — Everything the guest sees and interacts with'),
    p('The FOH is responsible for the guest experience. These positions are often tipped, which creates unique payroll considerations.'),
    table([
      { cells: ['Role', 'What They Do', 'Account Code'], header: true },
      { cells: ['Servers', 'Take orders, deliver food, handle payments. At Olive & Vine, servers average $15-25/hour including tips.', '6010 Server Wages'] },
      { cells: ['Hosts/Hostesses', 'Manage reservations, greet guests, control seating flow.', '6020 Host Wages'] },
      { cells: ['Bartenders', 'Mix drinks, manage bar inventory, often handle bar food service.', '6030 Bartender Wages'] },
      { cells: ['Bussers', 'Clear tables, reset for next guests, support servers. Usually receive tip-out from servers.', '6040 Busser Wages'] },
      { cells: ['Food Runners', 'Deliver food from kitchen to tables, ensuring accuracy and temperature.', 'Common in busy FSRs'] },
    ]),
    h(3, 'Back of House (BOH) — Everything behind the kitchen doors'),
    p('BOH staff rarely interact with guests but are essential to operations. These positions are typically hourly with no tips.'),
    table([
      { cells: ['Role', 'What They Do', 'Account Code'], header: true },
      { cells: ['Executive Chef / Head Chef', 'Creates menus, manages kitchen staff, controls food costs.', '6230 Kitchen Manager'] },
      { cells: ['Line Cooks', 'Work specific stations (grill, sauté, fry). The backbone of kitchen operations.', '6110 Line Cook Wages'] },
      { cells: ['Prep Cooks', 'Arrive early to prepare ingredients for service. Chopping, marinating, portioning.', '6120 Prep Cook Wages'] },
      { cells: ['Dishwashers', 'Keep plates, glasses, and equipment clean.', '6130 Dishwasher Wages'] },
      { cells: ['Expeditor (Expo)', 'Coordinates orders coming out of the kitchen, ensures accuracy and timing.', 'Often a chef or manager role'] },
    ]),
    h(2, 'Management Positions'),
    p('These are typically salaried employees coded to the 6200 series:'),
    table([
      { cells: ['Role', 'Account Code'], header: true },
      { cells: ['General Manager (GM) — Oversees entire operation, responsible for P&L', '6210'] },
      { cells: ['Assistant Manager (AGM) — Supports GM, often handles scheduling and inventory', '6220'] },
      { cells: ['Kitchen Manager — Manages BOH operations, food costs, kitchen staff', '6230'] },
      { cells: ['Bar Manager — At beverage-focused establishments, manages bar operations and inventory', '6240'] },
    ]),
    h(2, 'Daily Operations Flow'),
    p('Understanding the daily rhythm helps you understand the financials:'),
    stepFlowSteps([
      { title: 'Morning (6am-11am)', description: 'Prep cooks arrive, begin prep work. Deliveries received, invoices generated. Opening manager counts cash drawers. Morning Buzz sees 70% of daily sales here.' },
      { title: 'Midday (11am-3pm)', description: 'Lunch rush (critical for QSR and fast casual). Shift changes begin. Afternoon inventory checks.' },
      { title: 'Evening (4pm-Close)', description: 'Dinner service (highest revenue for FSR/Fine Dining). Bar sales peak at sports bars during games. Closing duties, cash reconciliation. End-of-day reports generated.' },
    ]),
    h(2, 'Why This Matters for Accounting'),
    p('Labor is typically 28–35% of restaurant revenue. Accurate coding by position allows owners to see:'),
    bulletList(
      [p('FOH vs BOH labor split')],
      [p('Overtime by department')],
      [p('Labor cost per revenue dollar')],
      [p('Staffing efficiency by daypart')]
    ),
    exampleBox(
      'Morning Buzz Labor Drill-Down',
      p('When Morning Buzz sees labor at 38%, we can drill down: is it prep cook overtime? Too many baristas scheduled? This detail drives decisions.')
    ),
    proTipBox(
      'Key terms for the quiz',
      p('FOH: servers, hosts, bartenders, bussers (6010–6040) • BOH: line cooks, prep, dishwashers (6110–6130) • Management: GM 6210, AGM 6220, KM 6230 • Labor by role supports labor % and staffing decisions')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I can distinguish FOH from BOH roles',
      'I know which account codes apply to each position type',
      'I understand how management positions are classified',
      'I can explain why labor tracking by role matters',
    ])
  )
}

function restaurantFinancesTaxesContent() {
  return doc(
    h(1, 'Restaurant Finances & Taxes'),
    p('Understand restaurant revenue streams, major expense categories, restaurant-specific taxes, and tip reporting requirements.'),
    h(2, 'Restaurant Revenue Streams'),
    p('Revenue isn\'t just "food sales." Understanding the components helps with proper coding and KPI tracking.'),
    h(3, 'Food Revenue (4000-4099)'),
    bulletList(
      [p('Dine-In Food Sales (4010) — Guests eating in the restaurant')],
      [p('Takeout Food Sales (4020) — Orders picked up by customers')],
      [p('Delivery Food Sales (4030) — Third-party delivery (DoorDash, UberEats)')],
      [p('Catering Food Sales (4040) — Large orders for events')]
    ),
    exampleBox(
      'Revenue Mix by Client',
      p('At Morning Buzz Cafe, 60% of food sales are dine-in, 30% takeout, and 10% delivery. Olive & Vine is 85% dine-in, 10% takeout, 5% delivery. This mix matters because delivery orders have associated fees (account 8200s).')
    ),
    h(3, 'Beverage Revenue (4100-4150)'),
    bulletList(
      [p('NA Beverages (4110) — Soft drinks, coffee, tea, juice')],
      [p('Beer Sales (4120) — Draft and bottled beer')],
      [p('Wine Sales (4130) — By the glass and bottle')],
      [p('Liquor/Spirits Sales (4140) — Cocktails and shots')]
    ),
    p('For Smokey\'s Sports Bar, beverage sales are 45% of total revenue. Alcohol margins are excellent (75-85%), making this crucial to track separately.'),
    h(3, 'Other Revenue (4200s)'),
    p('Gift Card Sales (4210) — Liability until redeemed. Merchandise (4220). Service Charges (4230) — Auto-gratuity, catering fees.'),
    h(2, 'Major Expense Categories'),
    h(3, 'Cost of Goods Sold (COGS) — 5000s'),
    p('The direct cost of what you sell. Food Cost (5000-5099), Beverage Cost (5100-5150), Paper/Packaging (5200s). Target: Food Cost 28-35%, Beverage Cost 18-24%.'),
    h(3, 'Labor Costs — 6000s'),
    p('FOH Labor (6000-6060), BOH Labor (6100-6150), Management (6200-6240), Payroll Taxes & Benefits (6300-6370). Target: Total Labor 28–35% of revenue.'),
    h(3, 'Operating Expenses — 7000s'),
    p('Occupancy/Rent (7000-7040) — Target under 10%. Utilities (7100s), Marketing (7200s), Repairs (7300s), Supplies (7500s).'),
    h(2, 'Restaurant-Specific Taxes'),
    p('Sales Tax — Restaurants collect sales tax on food and beverage sales. Rates vary by state and locality. Track in account 2300 (Sales Tax Payable).'),
    h(3, 'Tip Reporting'),
    p('The IRS requires reporting of all tip income. Restaurants must: Report employee tips to IRS; Pay employer\'s share of FICA on tips; File Form 8027 if annual receipts exceed $250,000.'),
    insightBox(
      'FinAcct360 Tip Tracking',
      p('At FinAcct360, we ensure clients track tips properly in account 2440 (Tips Payable) until distributed.')
    ),
    p('Payroll Taxes: Federal and State Withholding (2410, 2420), FICA (2430), FUTA/SUTA (6320, 6330), Workers Compensation (6340). Liquor License fees tracked in 7810.'),
    h(2, 'The Prime Cost Formula'),
    p('The most important metric in restaurant finance:'),
    insightBox(
      'Prime Cost = Food Cost + Beverage Cost + Total Labor. Target: Under 60% of total revenue (typically 55–65%).',
      p('If Olive & Vine has: Food Cost $28,000 (28%), Beverage Cost $6,000 (6%), Labor $30,000 (30%), Total Revenue $100,000 — then Prime Cost = $64,000 / $100,000 = 64% (NEEDS ATTENTION!)')
    ),
    proTipBox(
      'Key terms for the quiz',
      p('Revenue categories: Food, Beverage, Other • COGS = direct cost of what you sell (5000s); Operating expenses = rent, utilities, etc. (7000s+) • Prime Cost = COGS + Labor, target under 60% • Tips: taxable to employees, track in 2440')
    ),
    h(2, 'Checkpoints'),
    checkpointBoxItems([
      'I can identify the main revenue categories',
      'I understand what makes up COGS vs Operating Expenses',
      'I know the Prime Cost formula and target',
      'I understand restaurant tip reporting requirements',
    ])
  )
}

const MODULE_CONTENT_FNS: (() => ReturnType<typeof doc>)[] = [
  usRestaurantIndustryContent,
  restaurantRolesOperationsContent,
  restaurantFinancesTaxesContent,
  module1Content,
  module2Content,
  module3Content,
  module4Content,
  module5Content,
  module6Content,
  module7Content,
  module8Content,
  module9Content,
  module10Content,
]

const TRAINING_MODULES = [
  { title: 'US Restaurant Industry', slug: 'us-restaurant-industry', description: 'Understand restaurant types, business models, and economics', estimated_minutes: 30, order_index: 0 },
  { title: 'Restaurant Roles & Operations', slug: 'restaurant-roles-operations', description: 'Who works in restaurants and how daily operations flow', estimated_minutes: 25, order_index: 1 },
  { title: 'Restaurant Finances & Taxes', slug: 'restaurant-finances-taxes', description: 'How money flows, US taxes, tips, and payment processing', estimated_minutes: 30, order_index: 2 },
  { title: 'Restaurant Accounting Basics', slug: 'restaurant-accounting-basics', description: 'Learn how restaurant accounting differs from other industries', estimated_minutes: 45, order_index: 3 },
  { title: 'Chart of Accounts', slug: 'chart-of-accounts', description: 'Understand account ranges and their purpose', estimated_minutes: 50, order_index: 4 },
  { title: 'Reading a Restaurant P&L', slug: 'reading-restaurant-pl', description: 'Line-by-line breakdown of a restaurant P&L', estimated_minutes: 60, order_index: 5 },
  { title: 'KPI Fundamentals', slug: 'kpi-fundamentals', description: 'Key performance indicators every accountant must know', estimated_minutes: 50, order_index: 6 },
  { title: 'QBO Essentials', slug: 'qbo-essentials', description: 'Navigate QuickBooks Online for restaurant clients', estimated_minutes: 45, order_index: 7 },
  { title: 'POS Systems — Square', slug: 'pos-square', description: 'Pull and understand Square sales reports', estimated_minutes: 30, order_index: 8 },
  { title: 'POS Systems — Toast', slug: 'pos-toast', description: 'Pull and understand Toast sales reports', estimated_minutes: 30, order_index: 9 },
  { title: 'POS Systems — Clover', slug: 'pos-clover', description: 'Pull and understand Clover sales reports', estimated_minutes: 30, order_index: 10 },
  { title: 'Weekly Close Process', slug: 'weekly-close-process', description: 'Step-by-step weekly close procedure', estimated_minutes: 40, order_index: 11 },
  { title: 'Common Mistakes', slug: 'common-mistakes', description: 'Avoid the top errors new accountants make', estimated_minutes: 35, order_index: 12 },
]

async function seedTrainingModules(): Promise<Map<string, string>> {
  console.log('Inserting training modules…')
  const slugToId = new Map<string, string>()
  for (let i = 0; i < TRAINING_MODULES.length; i++) {
    const m = TRAINING_MODULES[i]
    const content = MODULE_CONTENT_FNS[i]()
    const row = {
      ...m,
      content,
      is_published: true,
    }
    const { data, error } = await supabase.from('training_modules').upsert(row, { onConflict: 'slug' }).select('id').single()
    if (error) throw error
    const id = data?.id
    if (id) slugToId.set(m.slug, id)
    console.log(`  ✓ ${m.title}`)
  }
  console.log('Training modules done.\n')
  return slugToId
}

// ——— KB Articles (23) ———
type KBArticle = { section_slug: string; title: string; slug: string; excerpt: string; getContent?: () => ReturnType<typeof doc> }

function abbreviationsGlossaryContent(): ReturnType<typeof doc> {
  return doc(
    h(1, 'Abbreviations & Glossary'),
    p('Quick reference for all abbreviations and terminology you\'ll encounter in restaurant accounting. Bookmark this page for easy access.'),
    h(2, 'Restaurant Operations'),
    table([
      { cells: ['Abbreviation', 'Full Term', 'Definition', 'Example'], header: true },
      { cells: ['FOH', 'Front of House', 'Customer-facing areas and staff', '"FOH labor was 15% this week"'] },
      { cells: ['BOH', 'Back of House', 'Kitchen areas and staff', '"BOH needs more prep cooks"'] },
      { cells: ['POS', 'Point of Sale', 'Register/ordering system', '"Pull the POS sales report"'] },
      { cells: ['QSR', 'Quick Service Restaurant', 'Fast food, counter service', '"Chipotle is a QSR concept"'] },
      { cells: ['FSR', 'Full Service Restaurant', 'Sit-down with table service', '"Olive & Vine is an FSR"'] },
      { cells: ['GM', 'General Manager', 'Runs daily operations', '"The GM approved the schedule"'] },
      { cells: ['AGM', 'Assistant General Manager', 'Supports GM', '"AGM handles morning shifts"'] },
      { cells: ['KM', 'Kitchen Manager', 'Manages BOH', '"KM orders food inventory"'] },
      { cells: ['F&B', 'Food & Beverage', 'Food and drink combined', '"F&B revenue was $120K"'] },
      { cells: ['CoGS / COGS', 'Cost of Goods Sold', 'Direct cost of items sold', '"COGS ran 31% this month"'] },
    ]),
    h(2, 'Financial & Accounting'),
    table([
      { cells: ['Abbreviation', 'Full Term', 'Definition', 'Example'], header: true },
      { cells: ['P&L', 'Profit & Loss Statement', 'Income statement', '"Review the weekly P&L"'] },
      { cells: ['BS', 'Balance Sheet', 'Assets, liabilities, equity', '"BS shows $50K in AR"'] },
      { cells: ['CF', 'Cash Flow', 'Money in and out', '"CF is tight this month"'] },
      { cells: ['KPI', 'Key Performance Indicator', 'Performance metric', '"Food cost KPI is 30%"'] },
      { cells: ['EBITDA', 'Earnings Before Interest, Taxes, Depreciation, Amortization', 'Operating profit measure', '"EBITDA margin is 12%"'] },
      { cells: ['NP', 'Net Profit', 'Bottom line profit', '"NP was 5% this quarter"'] },
      { cells: ['GP', 'Gross Profit', 'Revenue minus COGS', '"GP margin is 68%"'] },
      { cells: ['AR', 'Accounts Receivable', 'Money owed TO business', '"AR aging report"'] },
      { cells: ['AP', 'Accounts Payable', 'Money business OWES', '"AP is due Friday"'] },
      { cells: ['COA', 'Chart of Accounts', 'Account structure', '"Set up the COA in QBO"'] },
      { cells: ['GL', 'General Ledger', 'All transactions', '"Post to the GL"'] },
      { cells: ['JE', 'Journal Entry', 'Manual transaction', '"Create a JE for the accrual"'] },
      { cells: ['YTD', 'Year to Date', 'Jan 1 to today', '"YTD revenue is $1.2M"'] },
      { cells: ['MTD', 'Month to Date', '1st of month to today', '"MTD labor is 32%"'] },
      { cells: ['WTD', 'Week to Date', 'Start of week to today', '"WTD sales are up 8%"'] },
      { cells: ['QoQ', 'Quarter over Quarter', 'This quarter vs last', '"QoQ growth is 5%"'] },
      { cells: ['YoY', 'Year over Year', 'This year vs last', '"YoY sales down 3%"'] },
      { cells: ['Recon', 'Reconciliation', 'Matching records', '"Bank recon is done"'] },
      { cells: ['Accrual', 'Accrued Expense', 'Expense recorded before paid', '"Accrue the rent"'] },
    ]),
    h(2, 'Tax & Payroll'),
    table([
      { cells: ['Abbreviation', 'Full Term', 'Definition', 'Example'], header: true },
      { cells: ['FICA', 'Federal Insurance Contributions Act', 'SS + Medicare taxes', '"FICA is 7.65% each side"'] },
      { cells: ['SS', 'Social Security', 'Retirement tax (6.2%)', '"SS tax is capped annually"'] },
      { cells: ['W-2', 'Wage & Tax Statement', 'Employee annual form', '"W-2s due by Jan 31"'] },
      { cells: ['W-4', 'Employee Withholding Certificate', 'Tax withholding form', '"New hire needs W-4"'] },
      { cells: ['1099', 'Miscellaneous Income', 'Contractor annual form', '"Send 1099 to vendors"'] },
      { cells: ['1099-NEC', 'Nonemployee Compensation', 'Contractor pay form', '"1099-NEC for DJs"'] },
      { cells: ['FUTA', 'Federal Unemployment Tax', 'Federal unemployment', '"FUTA rate is 0.6%"'] },
      { cells: ['SUTA', 'State Unemployment Tax', 'State unemployment', '"SUTA varies by state"'] },
      { cells: ['EIN', 'Employer Identification Number', 'Business tax ID', '"EIN is on the W-9"'] },
      { cells: ['SSN', 'Social Security Number', 'Personal tax ID', '"Never share full SSN"'] },
      { cells: ['OT', 'Overtime', 'Hours over 40/week', '"OT paid at 1.5x"'] },
      { cells: ['PTO', 'Paid Time Off', 'Vacation/sick time', '"PTO accrued monthly"'] },
      { cells: ['DOL', 'Department of Labor', 'Labor law agency', '"DOL requires OT pay"'] },
      { cells: ['IRS', 'Internal Revenue Service', 'Federal tax agency', '"IRS deadline is April 15"'] },
    ]),
    h(2, 'Software & Systems'),
    table([
      { cells: ['Abbreviation', 'Full Term', 'Definition', 'Example'], header: true },
      { cells: ['QBO', 'QuickBooks Online', 'Accounting software', '"Log into QBO"'] },
      { cells: ['QBD', 'QuickBooks Desktop', 'Desktop version', '"Client uses QBD"'] },
      { cells: ['POS', 'Point of Sale', 'Register system', '"Square is their POS"'] },
      { cells: ['CRM', 'Customer Relationship Management', 'Customer database', '"Check the CRM"'] },
      { cells: ['ERP', 'Enterprise Resource Planning', 'Business software', '"R365 is an ERP"'] },
      { cells: ['ACH', 'Automated Clearing House', 'Bank transfer', '"Pay via ACH"'] },
      { cells: ['EFT', 'Electronic Funds Transfer', 'Digital payment', '"EFT pending"'] },
      { cells: ['CC', 'Credit Card', 'Card payment', '"CC fees are 2.9%"'] },
      { cells: ['API', 'Application Programming Interface', 'Software connection', '"API syncs data"'] },
      { cells: ['CSV', 'Comma Separated Values', 'Spreadsheet format', '"Export to CSV"'] },
      { cells: ['PDF', 'Portable Document Format', 'Document format', '"Send PDF of P&L"'] },
      { cells: ['SaaS', 'Software as a Service', 'Cloud software', '"QBO is SaaS"'] },
    ]),
    h(2, 'Time & Communication'),
    table([
      { cells: ['Abbreviation', 'Full Term', 'Definition', 'Example'], header: true },
      { cells: ['ET / EST / EDT', 'Eastern Time', 'NYC, Miami (UTC-5/-4)', '"2 PM ET"'] },
      { cells: ['CT / CST / CDT', 'Central Time', 'Texas, Chicago (UTC-6/-5)', '"Call at 10 AM CT"'] },
      { cells: ['MT / MST / MDT', 'Mountain Time', 'Denver, Phoenix (UTC-7/-6)', '"Meeting at 3 PM MT"'] },
      { cells: ['PT / PST / PDT', 'Pacific Time', 'California (UTC-8/-7)', '"EOD PT"'] },
      { cells: ['IST', 'India Standard Time', 'India (UTC+5:30)', '"9 AM ET = 6:30 PM IST"'] },
      { cells: ['UTC', 'Coordinated Universal Time', 'Global standard', '"Server time is UTC"'] },
      { cells: ['EOD', 'End of Day', 'Close of business', '"Submit by EOD"'] },
      { cells: ['COB', 'Close of Business', 'Same as EOD', '"Reply by COB"'] },
      { cells: ['EOM', 'End of Month', 'Last day of month', '"EOM close process"'] },
      { cells: ['EOW', 'End of Week', 'Friday', '"Due EOW"'] },
      { cells: ['EOQ', 'End of Quarter', 'Last day of quarter', '"EOQ review"'] },
      { cells: ['EOY', 'End of Year', 'December 31', '"EOY financials"'] },
      { cells: ['ASAP', 'As Soon As Possible', 'Urgent', '"Need this ASAP"'] },
      { cells: ['FYI', 'For Your Information', 'Informational', '"FYI, client emailed"'] },
      { cells: ['TBD', 'To Be Determined', 'Not yet decided', '"Date TBD"'] },
      { cells: ['TBC', 'To Be Confirmed', 'Pending confirmation', '"Amount TBC"'] },
      { cells: ['N/A', 'Not Applicable', 'Does not apply', '"N/A for this client"'] },
      { cells: ['RE', 'Regarding', 'About', '"RE: Weekly Close"'] },
      { cells: ['CC', 'Carbon Copy', 'Email copy', '"CC your manager"'] },
      { cells: ['BCC', 'Blind Carbon Copy', 'Hidden email copy', '"BCC compliance"'] },
    ]),
    h(2, 'Restaurant-Specific Terms'),
    table([
      { cells: ['Term', 'Definition', 'Example'], header: true },
      { cells: ['86\'d', 'Out of stock', '"86 the salmon"'] },
      { cells: ['Cover', 'One guest served', '"200 covers tonight"'] },
      { cells: ['Turn', 'Table reset cycle', '"3 turns at dinner"'] },
      { cells: ['Comp', 'Complimentary item', '"Comp the dessert"'] },
      { cells: ['Void', 'Cancelled order', '"Void the appetizer"'] },
      { cells: ['Ticket', 'Order/check', '"Fire ticket 42"'] },
      { cells: ['Daypart', 'Time period', '"Lunch daypart"'] },
      { cells: ['Check Average', 'Revenue per guest', '"$28 check average"'] },
      { cells: ['PPA', 'Per Person Average', 'Same as check average', ''] },
      { cells: ['RevPASH', 'Revenue Per Available Seat Hour', 'Efficiency metric', ''] },
      { cells: ['Prime Cost', 'COGS + Labor', '"Prime cost at 58%"'] },
      { cells: ['Pour Cost', 'Beverage cost %', '"Pour cost is 22%"'] },
      { cells: ['Food Cost', 'Food COGS %', '"Food cost is 31%"'] },
      { cells: ['Labor Cost', 'Labor % of revenue', '"Labor at 29%"'] },
      { cells: ['Controllables', 'Costs you can manage', '"COGS and labor"'] },
      { cells: ['Non-controllables', 'Fixed costs', '"Rent is fixed"'] },
    ]),
    h(2, 'Quick Time Zone Reference'),
    table([
      { cells: ['When it\'s 2 PM ET...', 'Other zones'], header: true },
      { cells: ['Eastern (ET)', '2:00 PM'] },
      { cells: ['Central (CT)', '1:00 PM'] },
      { cells: ['Mountain (MT)', '12:00 PM'] },
      { cells: ['Pacific (PT)', '11:00 AM'] },
      { cells: ['India (IST)', '11:30 PM (same day)'] },
    ]),
    insightBox(
      'Bookmark This Page',
      p('You\'ll refer back to this glossary often, especially in your first few months. When in doubt, look it up!')
    ),
    proTipBox(
      'When You Don\'t Know',
      p('If you see an abbreviation not on this list, ASK your senior. It\'s better to ask than assume. Every industry has jargon—restaurant accounting has a lot!')
    )
  )
}

const KB_ARTICLES: KBArticle[] = [
  { section_slug: 'chart-of-accounts', title: 'COA Overview', slug: 'coa-overview', excerpt: 'Master the FinAcct360 Chart of Accounts structure and account ranges.' },
  { section_slug: 'chart-of-accounts', title: 'Revenue Accounts (4000s)', slug: 'revenue-accounts', excerpt: 'How to set up and use food, beverage, third-party, and other revenue accounts.' },
  { section_slug: 'chart-of-accounts', title: 'COGS Accounts (5000s)', slug: 'cogs-accounts', excerpt: 'Food cost, beverage cost, packaging, and what does not belong in COGS.' },
  { section_slug: 'chart-of-accounts', title: 'Labor Accounts (6000s)', slug: 'labor-accounts', excerpt: 'FOH, BOH, management, benefits, and payroll tax classification.' },
  { section_slug: 'chart-of-accounts', title: 'Operating & Other Expenses', slug: 'operating-expenses', excerpt: '7000s operating and 8000s other expenses.' },
  { section_slug: 'sops', title: 'Weekly Close Checklist', slug: 'weekly-close-checklist', excerpt: 'Step-by-step checklist for the weekly close process.' },
  { section_slug: 'sops', title: 'Bank Reconciliation', slug: 'bank-reconciliation', excerpt: 'How to reconcile bank and credit card feeds in QBO.' },
  { section_slug: 'sops', title: 'POS Reconciliation', slug: 'pos-reconciliation', excerpt: 'Reconciling POS sales to QBO revenue.' },
  { section_slug: 'sops', title: 'Payroll Review', slug: 'payroll-review', excerpt: 'Verifying payroll data and labor accounts.' },
  { section_slug: 'sops', title: 'Issue Escalation', slug: 'issue-escalation', excerpt: 'When and how to flag issues for review.' },
  { section_slug: 'exception-handling', title: 'Handling Missing Data', slug: 'handling-missing-data', excerpt: 'What to do when POS or payroll is missing.' },
  { section_slug: 'exception-handling', title: 'Disputed Transactions', slug: 'disputed-transactions', excerpt: 'How to handle disputed or unclear transactions.' },
  { section_slug: 'exception-handling', title: 'Refunds and Comps', slug: 'refunds-and-comps', excerpt: 'Recording refunds and comps correctly.' },
  { section_slug: 'exception-handling', title: 'Multi-Location', slug: 'multi-location', excerpt: 'Closing and reporting for multi-location restaurants.' },
  { section_slug: 'sample-financials', title: 'Cafe P&L Template', slug: 'cafe-pl-template', excerpt: 'P&L structure for cafes like Morning Buzz.' },
  { section_slug: 'sample-financials', title: 'Full-Service Restaurant P&L', slug: 'fsr-pl-template', excerpt: 'P&L structure for full-service like Olive & Vine.' },
  { section_slug: 'sample-financials', title: 'Bar & Grill P&L', slug: 'bar-pl-template', excerpt: 'P&L for bars like Smokey\'s.' },
  { section_slug: 'sample-financials', title: 'Fast Casual P&L', slug: 'fast-casual-pl-template', excerpt: 'P&L for fast casual like Spitz.' },
  { section_slug: 'pos-guides', title: 'Abbreviations & Glossary', slug: 'abbreviations-glossary', excerpt: 'Complete reference guide for all abbreviations and terms used in restaurant accounting', getContent: abbreviationsGlossaryContent },
  { section_slug: 'pos-guides', title: 'Square Export Guide', slug: 'square-export-guide', excerpt: 'Step-by-step Square sales export for close.' },
  { section_slug: 'pos-guides', title: 'Toast Export Guide', slug: 'toast-export-guide', excerpt: 'Step-by-step Toast sales export.' },
  { section_slug: 'pos-guides', title: 'Clover Export Guide', slug: 'clover-export-guide', excerpt: 'Step-by-step Clover transaction export.' },
  { section_slug: 'pos-guides', title: 'QBO Setup for Restaurants', slug: 'qbo-setup-restaurants', excerpt: 'Setting up QuickBooks Online for restaurant clients.' },
]

async function seedArticles(sectionSlugToId: Map<string, string>) {
  console.log('Inserting KB articles…')
  for (const a of KB_ARTICLES) {
    const sectionId = sectionSlugToId.get(a.section_slug)
    if (!sectionId) {
      console.warn(`  ⚠ Section not found: ${a.section_slug}, skipping ${a.title}`)
      continue
    }
    const content = a.getContent ? a.getContent() : doc(h(1, a.title), p(a.excerpt))
    const { error } = await supabase.from('kb_articles').upsert(
      {
        section_id: sectionId,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content,
        is_published: true,
      },
      { onConflict: 'section_id,slug' }
    )
    if (error) throw error
    console.log(`  ✓ ${a.section_slug}/${a.slug}`)
  }
  console.log('KB articles done.\n')
}

// ——— Quiz questions (7 per module) ———
interface QuizQ {
  question: string
  options: { id: string; text: string }[]
  correct_option_id: string
  explanation: string
  order_index: number
}

// Module 1: Restaurant Accounting Basics
const QUIZ_1: QuizQ[] = [
  { question: 'Why is restaurant accounting considered unique compared to other industries?', options: [{ id: 'a', text: 'Restaurants have no inventory' }, { id: 'b', text: 'High volume, low margin, and perishable inventory create tight controls' }, { id: 'c', text: 'Restaurants only use cash accounting' }, { id: 'd', text: 'Revenue is always recorded annually' }], correct_option_id: 'b', explanation: 'Restaurants operate with high transaction volume, thin margins, and perishable inventory, requiring careful costing and tracking.', order_index: 0 },
  { question: 'The accounting equation is:', options: [{ id: 'a', text: 'Revenue = Expenses + Profit' }, { id: 'b', text: 'Assets = Liabilities + Equity' }, { id: 'c', text: 'Debits = Credits' }, { id: 'd', text: 'Cash = Bank Balance' }], correct_option_id: 'b', explanation: 'In this module we learned that Assets = Liabilities + Equity; this must always balance.', order_index: 1 },
  { question: 'For accurate period reporting, which accounting basis is preferred?', options: [{ id: 'a', text: 'Cash only' }, { id: 'b', text: 'Accrual' }, { id: 'c', text: 'Hybrid with no rules' }, { id: 'd', text: 'Tax basis only' }], correct_option_id: 'b', explanation: 'Accrual accounting matches revenue and expenses to the period earned or incurred, giving a clearer P&L.', order_index: 2 },
  { question: 'A debit to an expense account:', options: [{ id: 'a', text: 'Decreases the expense' }, { id: 'b', text: 'Increases the expense' }, { id: 'c', text: 'Has no effect' }, { id: 'd', text: 'Increases revenue' }], correct_option_id: 'b', explanation: 'Debits increase assets and expenses; credits increase liabilities, equity, and revenue.', order_index: 3 },
  { question: 'The main purpose of bank reconciliation is to:', options: [{ id: 'a', text: 'Delete old transactions' }, { id: 'b', text: 'Match the bank statement to the books and find errors or missing items' }, { id: 'c', text: 'Close the period' }, { id: 'd', text: 'Export reports' }], correct_option_id: 'b', explanation: 'Bank reconciliation ensures your QBO balance matches the bank and catches missing or duplicate transactions.', order_index: 4 },
  { question: 'What is "prime cost" in a restaurant P&L?', options: [{ id: 'a', text: 'Revenue minus comps' }, { id: 'b', text: 'COGS plus labor' }, { id: 'c', text: 'Gross profit minus rent' }, { id: 'd', text: 'Net profit before tax' }], correct_option_id: 'b', explanation: 'Prime cost is the sum of COGS and labor—the two largest controllable costs.', order_index: 5 },
  { question: 'What are "comps" in restaurant reporting?', options: [{ id: 'a', text: 'Competitor analysis' }, { id: 'b', text: 'Complimentary items given to guests that reduce revenue' }, { id: 'c', text: 'Computer system costs' }, { id: 'd', text: 'Compensation expense' }], correct_option_id: 'b', explanation: 'Comps are complimentary items (e.g., free dessert) that reduce revenue and are often tracked separately.', order_index: 6 },
]

// Module 2: Chart of Accounts
const QUIZ_2: QuizQ[] = [
  { question: 'What is the primary purpose of a Chart of Accounts?', options: [{ id: 'a', text: 'To list employee names' }, { id: 'b', text: 'To categorize all financial transactions for reporting' }, { id: 'c', text: 'To track inventory only' }, { id: 'd', text: 'To store passwords' }], correct_option_id: 'b', explanation: 'The COA is the list of accounts used to record and categorize every transaction for accurate financial statements.', order_index: 0 },
  { question: 'Which account range is typically used for revenue?', options: [{ id: 'a', text: '1000s' }, { id: 'b', text: '2000s' }, { id: 'c', text: '4000s' }, { id: 'd', text: '6000s' }], correct_option_id: 'c', explanation: 'Revenue accounts are typically in the 4000s; 1000s are assets, 2000s liabilities, 6000s labor.', order_index: 1 },
  { question: 'Where would you expect to find "Cost of Goods Sold" in a standard COA?', options: [{ id: 'a', text: '1000s' }, { id: 'b', text: '3000s' }, { id: 'c', text: '5000s' }, { id: 'd', text: '7000s' }], correct_option_id: 'c', explanation: 'COGS is typically in the 5000s; 7000s are operating expenses.', order_index: 2 },
  { question: 'Why use sub-accounts within a range?', options: [{ id: 'a', text: 'To hide transactions' }, { id: 'b', text: 'To add detail (e.g., food vs beverage revenue) for reporting' }, { id: 'c', text: 'To reduce the number of accounts' }, { id: 'd', text: 'Sub-accounts are not recommended' }], correct_option_id: 'b', explanation: 'Sub-accounts allow breakdowns like food vs beverage revenue or FOH vs BOH labor for better analysis.', order_index: 3 },
  { question: 'How does the COA support KPI calculation?', options: [{ id: 'a', text: 'KPIs are unrelated to the COA' }, { id: 'b', text: 'Consistent account mapping ensures correct totals for food cost %, labor %, etc.' }, { id: 'c', text: 'Only revenue accounts matter' }, { id: 'd', text: 'COA is only for balance sheet' }], correct_option_id: 'b', explanation: 'Food cost %, labor %, and other KPIs are computed from COA totals; correct mapping is essential.', order_index: 4 },
  { question: 'Which of these is a restaurant-specific account type?', options: [{ id: 'a', text: 'Common stock' }, { id: 'b', text: 'Comps and discounts' }, { id: 'c', text: 'Patent amortization' }, { id: 'd', text: 'Dividends paid' }], correct_option_id: 'b', explanation: 'Comps, discounts, tips, and gift card liability are examples of restaurant-specific accounts.', order_index: 5 },
  { question: 'What do the 6000s typically represent?', options: [{ id: 'a', text: 'Revenue' }, { id: 'b', text: 'Labor costs' }, { id: 'c', text: 'Assets' }, { id: 'd', text: 'Liabilities' }], correct_option_id: 'b', explanation: 'The 6000s are typically used for labor-related expenses (wages, payroll taxes, benefits).', order_index: 6 },
  { question: 'When setting up a new restaurant client in QBO, FinAcct360 account numbers should be:', options: [{ id: 'a', text: 'Ignored' }, { id: 'b', text: 'Mapped to the correct QBO account types so reports match our COA' }, { id: 'c', text: 'Used only for labor' }, { id: 'd', text: 'Entered only at year-end' }], correct_option_id: 'b', explanation: 'Mapping FinAcct360 accounts to QBO types ensures P&L and KPIs match our standard structure.', order_index: 7 },
]

// Module 3: Reading a Restaurant P&L
const QUIZ_3: QuizQ[] = [
  { question: 'How is Gross Profit calculated?', options: [{ id: 'a', text: 'Revenue minus labor' }, { id: 'b', text: 'Revenue minus COGS' }, { id: 'c', text: 'Revenue minus rent' }, { id: 'd', text: 'Net profit plus taxes' }], correct_option_id: 'b', explanation: 'Gross Profit = Revenue − COGS. It is the margin after direct product cost.', order_index: 0 },
  { question: "Morning Buzz's P&L shows Labor at 40% and Prime Cost at 68.4%. What should you do?", options: [{ id: 'a', text: 'Ignore it; both are fine' }, { id: 'b', text: 'Flag it—labor is above the 28–35% target and prime cost is over 65%' }, { id: 'c', text: 'Increase revenue only' }, { id: 'd', text: 'Move labor to COGS' }], correct_option_id: 'b', explanation: 'As we saw in this module, labor over 35% and prime cost over 65% are red flags; investigate overstaffing, overtime, or COGS.', order_index: 1 },
  { question: 'What is included in "labor" on a typical restaurant P&L?', options: [{ id: 'a', text: 'Only server wages' }, { id: 'b', text: 'Wages, payroll taxes, and benefits for FOH, BOH, and management' }, { id: 'c', text: 'Only management salaries' }, { id: 'd', text: 'Contractor payments only' }], correct_option_id: 'b', explanation: 'Labor typically includes all wages, taxes, and benefits for front and back of house and management.', order_index: 2 },
  { question: 'What is the target range for prime cost % of revenue?', options: [{ id: 'a', text: '20–30%' }, { id: 'b', text: '40–50%' }, { id: 'c', text: '55–65%' }, { id: 'd', text: '80–90%' }], correct_option_id: 'c', explanation: 'In this module we learned that prime cost is typically targeted at 55–65%; under 60% is the common rule of thumb.', order_index: 3 },
  { question: 'What does EBITDA represent?', options: [{ id: 'a', text: 'Revenue minus COGS only' }, { id: 'b', text: 'Earnings before interest, taxes, depreciation, and amortization' }, { id: 'c', text: 'Total assets minus liabilities' }, { id: 'd', text: 'Net profit after tax' }], correct_option_id: 'b', explanation: 'EBITDA is a measure of operating profitability before financing and non-cash charges.', order_index: 4 },
  { question: 'Which section of the P&L appears first?', options: [{ id: 'a', text: 'Operating expenses' }, { id: 'b', text: 'Revenue' }, { id: 'c', text: 'Labor' }, { id: 'd', text: 'Net profit' }], correct_option_id: 'b', explanation: 'Revenue is the top line; then COGS, labor, and other expenses are deducted to get to net profit.', order_index: 5 },
  { question: 'A rising food cost % with flat sales might indicate:', options: [{ id: 'a', text: 'Nothing important' }, { id: 'b', text: 'Portion creep, waste, or pricing issues' }, { id: 'c', text: 'Lower labor cost' }, { id: 'd', text: 'Higher profit' }], correct_option_id: 'b', explanation: 'Rising food cost % often points to over-portioning, waste, or cost increases not passed to menu prices.', order_index: 6 },
  { question: 'Net profit on a P&L is:', options: [{ id: 'a', text: 'Revenue only' }, { id: 'b', text: 'The bottom line after all revenue and expenses' }, { id: 'c', text: 'Same as gross profit' }, { id: 'd', text: 'Prime cost minus COGS' }], correct_option_id: 'b', explanation: 'Net profit is the final line after all revenue and expenses have been accounted for.', order_index: 7 },
]

// Module 4: KPI Fundamentals
const QUIZ_4: QuizQ[] = [
  { question: "You're reviewing Morning Buzz Cafe's P&L. They show $4,590 food cost on $15,300 food sales. What's their food cost % and is it healthy?", options: [{ id: 'a', text: '30% — this is exactly on target for a cafe' }, { id: 'b', text: '30% — this is high; cafes should be under 25%' }, { id: 'c', text: '15% — this is too low; something is miscoded' }, { id: 'd', text: '45% — this is dangerously high' }], correct_option_id: 'a', explanation: 'Food cost % = Food COGS ÷ Food sales × 100 = 4,590 ÷ 15,300 = 30%. For a cafe, 28–32% is on target.', order_index: 0 },
  { question: "Olive & Vine has Food Cost $28,000, Beverage Cost $7,000, Labor $25,000, and Total Revenue $100,000. What is their Prime Cost %?", options: [{ id: 'a', text: '35%' }, { id: 'b', text: '60%' }, { id: 'c', text: '72%' }, { id: 'd', text: '100%' }], correct_option_id: 'b', explanation: 'Prime Cost = Food + Beverage + Labor = $28,000 + $7,000 + $25,000 = $60,000. Prime Cost % = $60,000 ÷ $100,000 = 60%, which is on target (under 60%, typically 55–65%).', order_index: 1 },
  { question: 'Beverage cost % is often lower than food cost % because:', options: [{ id: 'a', text: 'Beverages are not important' }, { id: 'b', text: 'Alcohol and drinks typically have higher margins' }, { id: 'c', text: 'It is never lower' }, { id: 'd', text: 'Labor is included in beverage cost' }], correct_option_id: 'b', explanation: 'Beverage, especially alcohol, often has higher margins, so beverage cost % targets are commonly 18–24%.', order_index: 2 },
  { question: 'Labor cost % target is typically in what range?', options: [{ id: 'a', text: '10–15%' }, { id: 'b', text: '28–35%' }, { id: 'c', text: '50–55%' }, { id: 'd', text: '70–80%' }], correct_option_id: 'b', explanation: 'Labor cost as a percentage of revenue is often targeted at 28–35% depending on concept.', order_index: 3 },
  { question: 'Why is prime cost % considered a critical KPI?', options: [{ id: 'a', text: 'It is the only metric that matters' }, { id: 'b', text: 'COGS + labor are the two largest controllable costs; above 65% leaves little for rent and other expenses' }, { id: 'c', text: 'It replaces the need for a P&L' }, { id: 'd', text: 'It measures revenue only' }], correct_option_id: 'b', explanation: 'Prime cost is the sum of the two biggest controllable costs; keeping it under 60% (typically 55–65%) is key to profitability.', order_index: 4 },
  { question: 'Sales per labor hour (SPLH) is primarily used to:', options: [{ id: 'a', text: 'Measure food cost' }, { id: 'b', text: 'Evaluate staffing efficiency and make staffing decisions' }, { id: 'c', text: 'Calculate rent' }, { id: 'd', text: 'Track beverage sales' }], correct_option_id: 'b', explanation: 'In this module we learned that SPLH (Total Sales ÷ Labor Hours) helps owners see if they are over- or under-staffed for the volume.', order_index: 5 },
  { question: 'How do you calculate food cost %?', options: [{ id: 'a', text: 'Food COGS ÷ Total revenue' }, { id: 'b', text: '(Food COGS ÷ Food revenue) × 100' }, { id: 'c', text: 'Food revenue ÷ Labor' }, { id: 'd', text: 'Total COGS × 100' }], correct_option_id: 'b', explanation: 'Food cost % = (Food COGS ÷ Food Revenue) × 100, so it measures food margin on food sales only.', order_index: 6 },
  { question: 'A prime cost % of 70% suggests:', options: [{ id: 'a', text: 'Excellent performance' }, { id: 'b', text: 'Only 30% left for rent, utilities, and other expenses—a red flag' }, { id: 'c', text: 'Revenue is too high' }, { id: 'd', text: 'Labor is not included' }], correct_option_id: 'b', explanation: 'Prime cost above 65% (or over the under-60% target) leaves very little for occupancy and operating expenses; investigate COGS and labor.', order_index: 7 },
]

// Module 5: QBO Essentials
const QUIZ_5: QuizQ[] = [
  { question: 'What is the first step after connecting a bank feed in QBO?', options: [{ id: 'a', text: 'Delete old transactions' }, { id: 'b', text: 'Categorize transactions to the correct COA accounts' }, { id: 'c', text: 'Close the account' }, { id: 'd', text: 'Ignore uncategorized items' }], correct_option_id: 'b', explanation: 'Transactions must be categorized to the correct accounts so the P&L and balance sheet are accurate.', order_index: 0 },
  { question: 'Where do you run a Profit and Loss report in QBO?', options: [{ id: 'a', text: 'Banking' }, { id: 'b', text: 'Reports → Profit and Loss' }, { id: 'c', text: 'Settings only' }, { id: 'd', text: 'Invoice screen' }], correct_option_id: 'b', explanation: 'Reports → Profit and Loss (or P&L) is where you run the income statement.', order_index: 1 },
  { question: 'Why is the report date range important?', options: [{ id: 'a', text: 'It does not matter' }, { id: 'b', text: 'It must match the period you are closing (e.g., week or month)' }, { id: 'c', text: 'Only the start date matters' }, { id: 'd', text: 'QBO ignores the range' }], correct_option_id: 'b', explanation: 'The date range determines which transactions are included; it should match your close period.', order_index: 2 },
  { question: 'What can cause duplicate transactions in QBO?', options: [{ id: 'a', text: 'Nothing' }, { id: 'b', text: 'Importing POS data and also entering manually, or importing twice' }, { id: 'c', text: 'Reconciling the account' }, { id: 'd', text: 'Using accrual basis' }], correct_option_id: 'b', explanation: 'Duplicate entries often come from multiple sources for the same sales or from double imports.', order_index: 3 },
  { question: 'Which report shows assets, liabilities, and equity at a point in time?', options: [{ id: 'a', text: 'P&L' }, { id: 'b', text: 'Balance Sheet' }, { id: 'c', text: 'Sales by Customer' }, { id: 'd', text: 'Aged Receivables' }], correct_option_id: 'b', explanation: 'The Balance Sheet report shows the balance sheet equation at a given date.', order_index: 4 },
  { question: 'Before closing a period, you should:', options: [{ id: 'a', text: 'Skip reconciliation' }, { id: 'b', text: 'Reconcile bank feeds and clear uncategorized transactions' }, { id: 'c', text: 'Delete old reports' }, { id: 'd', text: 'Only check revenue' }], correct_option_id: 'b', explanation: 'Reconciling and clearing uncategorized items ensures the books are complete and consistent.', order_index: 5 },
  { question: 'To record a vendor bill in QBO, you typically:', options: [{ id: 'a', text: 'Use Banking only' }, { id: 'b', text: 'Go to Expenses > Bills > Add bill (or Bills > Add bill)' }, { id: 'c', text: 'Enter it in Reports' }, { id: 'd', text: 'Create an invoice' }], correct_option_id: 'b', explanation: 'In this module we learned: Creating a Bill is done via Expenses > Bills > Select Vendor > Enter dates and line items > Save.', order_index: 6 },
  { question: 'Exporting a report to Excel is useful for:', options: [{ id: 'a', text: 'Deleting data' }, { id: 'b', text: 'Sharing, analysis, and client deliverables' }, { id: 'c', text: 'Changing QBO data' }, { id: 'd', text: 'Backing up the entire company' }], correct_option_id: 'b', explanation: 'Export to Excel or PDF for further analysis and to send to clients or reviewers.', order_index: 7 },
]

// Module 6–10 quiz arrays (abbreviated for length; full set in file)
const QUIZ_6: QuizQ[] = [
  { question: 'Where do you find the Sales Summary in Square?', options: [{ id: 'a', text: 'Only in the mobile app' }, { id: 'b', text: 'Reports or Analytics section of the Square Dashboard' }, { id: 'c', text: 'In QuickBooks only' }, { id: 'd', text: 'Square does not have reports' }], correct_option_id: 'b', explanation: 'Sales Summary and other reports are in the Reports/Analytics area of the Square dashboard.', order_index: 0 },
  { question: "Morning Buzz uses Square. Their weekly export shows Net Sales $12,250 and Tips $1,800. Where should the $12,250 post in QBO?", options: [{ id: 'a', text: 'Labor expense' }, { id: 'b', text: 'Food and beverage revenue (4000s)' }, { id: 'c', text: 'Rent' }, { id: 'd', text: 'Cost of goods sold' }], correct_option_id: 'b', explanation: 'As we learned in this module, Square Net Sales = QBO Revenue; map to 4000s (food/beverage) per your COA. Tips go to tip liability or labor.', order_index: 1 },
  { question: 'Before importing Square data, you should verify:', options: [{ id: 'a', text: 'Nothing' }, { id: 'b', text: 'Totals tie to the dashboard, date range is correct, and refunds/comps are handled consistently' }, { id: 'c', text: 'Only the start date' }, { id: 'd', text: 'Only gross sales' }], correct_option_id: 'b', explanation: 'Verifying totals, dates, and treatment of refunds/comps prevents errors in the books.', order_index: 2 },
  { question: 'What does "net sales" in Square typically represent?', options: [{ id: 'a', text: 'Only tips' }, { id: 'b', text: 'Gross sales minus discounts, refunds, and comps' }, { id: 'c', text: 'Tax collected' }, { id: 'd', text: 'Fees paid to Square' }], correct_option_id: 'b', explanation: 'Net sales is usually gross sales less discounts, refunds, and comps—the amount to recognize as revenue.', order_index: 3 },
  { question: 'Why match the Square export date range to your close period?', options: [{ id: 'a', text: 'It is not important' }, { id: 'b', text: 'So revenue and period match and KPIs are correct' }, { id: 'c', text: 'Only for annual closes' }, { id: 'd', text: 'Square requires it' }], correct_option_id: 'b', explanation: 'Matching the date range ensures the right sales are in the right period for the P&L and KPIs.', order_index: 4 },
  { question: 'Square export format commonly used for bookkeeping is:', options: [{ id: 'a', text: 'PDF only' }, { id: 'b', text: 'CSV' }, { id: 'c', text: 'Image file' }, { id: 'd', text: 'Word document' }], correct_option_id: 'b', explanation: 'CSV is the standard format for importing into QBO or spreadsheets.', order_index: 5 },
  { question: 'What could cause a mismatch between Square and QBO revenue?', options: [{ id: 'a', text: 'Nothing' }, { id: 'b', text: 'Wrong date range, duplicate import, or different treatment of refunds' }, { id: 'c', text: 'Using accrual in QBO' }, { id: 'd', text: 'Having more than one location' }], correct_option_id: 'b', explanation: 'Date range, duplicate entries, and refund/comps handling are common causes of variance.', order_index: 6 },
  { question: 'Tips in Square reports should be:', options: [{ id: 'a', text: 'Ignored' }, { id: 'b', text: 'Understood and mapped correctly (e.g., to labor or tip liability)' }, { id: 'c', text: 'Added to food revenue' }, { id: 'd', text: 'Deleted from export' }], correct_option_id: 'b', explanation: 'Tips affect labor reporting and tip liability; they should be mapped according to your COA and policy.', order_index: 7 },
]

const QUIZ_7: QuizQ[] = [
  { question: 'Toast Reports are typically found:', options: [{ id: 'a', text: 'Only in the POS device' }, { id: 'b', text: 'In the Toast dashboard under Reports or Analytics' }, { id: 'c', text: 'Only after export to QBO' }, { id: 'd', text: 'Toast does not offer reports' }], correct_option_id: 'b', explanation: 'The Toast web dashboard has a Reports or Analytics section for sales and other reports.', order_index: 0 },
  { question: 'What are "menu mix" reports used for?', options: [{ id: 'a', text: 'Employee schedules' }, { id: 'b', text: 'Sales by item or category for food cost and mix analysis' }, { id: 'c', text: 'Tax filing only' }, { id: 'd', text: 'Marketing only' }], correct_option_id: 'b', explanation: 'Menu mix reports show what sold, supporting food cost and menu engineering.', order_index: 1 },
  { question: 'When pulling Toast data for a multi-location client, you should:', options: [{ id: 'a', text: 'Always combine all locations' }, { id: 'b', text: 'Confirm whether you need by-location or combined and match to the client’s books' }, { id: 'c', text: 'Use only the first location' }, { id: 'd', text: 'Ignore location' }], correct_option_id: 'b', explanation: 'Multi-location data may be combined or by location; ensure it matches how the client tracks revenue.', order_index: 2 },
  { question: 'Toast-specific fields might include:', options: [{ id: 'a', text: 'Only generic "sales"' }, { id: 'b', text: 'Service areas, dayparts, and tip reporting' }, { id: 'c', text: 'Only labor hours' }, { id: 'd', text: 'Nothing different from other POS' }], correct_option_id: 'b', explanation: 'Toast often has service area, daypart, and tip fields that need to be mapped to your COA.', order_index: 3 },
  { question: 'Before importing a Toast export, you should:', options: [{ id: 'a', text: 'Import without checking' }, { id: 'b', text: 'Confirm column headers, date format, and totals' }, { id: 'c', text: 'Delete previous imports' }, { id: 'd', text: 'Only check the first row' }], correct_option_id: 'b', explanation: 'Checking headers, date format, and totals reduces import and mapping errors.', order_index: 4 },
  { question: 'A common Toast issue is:', options: [{ id: 'a', text: 'No issues exist' }, { id: 'b', text: 'Multi-location data combined vs by location, or time-zone settings' }, { id: 'c', text: 'Toast cannot export' }, { id: 'd', text: 'Reports are only in PDF' }], correct_option_id: 'b', explanation: 'Location aggregation and time zones can cause mismatches; verify before importing.', order_index: 5 },
  { question: 'Toast Sales Summary is best used for:', options: [{ id: 'a', text: 'Scheduling only' }, { id: 'b', text: 'Reconciling revenue for the close period' }, { id: 'c', text: 'Marketing campaigns only' }, { id: 'd', text: 'Inventory only' }], correct_option_id: 'b', explanation: 'Sales Summary provides the revenue totals needed to reconcile to the P&L for the period.', order_index: 6 },
]

const QUIZ_8: QuizQ[] = [
  { question: 'Where do you pull transaction or summary reports in Clover?', options: [{ id: 'a', text: 'Only from the device' }, { id: 'b', text: 'From the Clover web dashboard Reports or Analytics section' }, { id: 'c', text: 'Only in QBO' }, { id: 'd', text: 'Clover does not have reports' }], correct_option_id: 'b', explanation: 'The Clover dashboard offers transaction and summary reports for export.', order_index: 0 },
  { question: 'Clover export data typically includes:', options: [{ id: 'a', text: 'Only totals' }, { id: 'b', text: 'Amount, date, payment type, and often category' }, { id: 'c', text: 'Only employee names' }, { id: 'd', text: 'Only tax' }], correct_option_id: 'b', explanation: 'Clover exports include transaction-level detail that can be mapped to revenue and discount accounts.', order_index: 1 },
  { question: 'Before finalizing a close using Clover data, you should:', options: [{ id: 'a', text: 'Skip verification' }, { id: 'b', text: 'Verify totals match the dashboard and refunds are clear' }, { id: 'c', text: 'Delete other POS data' }, { id: 'd', text: 'Only check one day' }], correct_option_id: 'b', explanation: 'Verifying totals and refund treatment ensures the imported data matches the source.', order_index: 2 },
  { question: 'Clover-specific considerations might include:', options: [{ id: 'a', text: 'None' }, { id: 'b', text: 'Tip handling and multi-device or multi-location setup' }, { id: 'c', text: 'Only hardware' }, { id: 'd', text: 'Only fees' }], correct_option_id: 'b', explanation: 'Tips and multi-location or multi-device setups may require extra mapping in the COA.', order_index: 3 },
  { question: 'Transaction report vs Summary report in Clover:', options: [{ id: 'a', text: 'They are identical' }, { id: 'b', text: 'Transaction lists individual sales; summary aggregates by period' }, { id: 'c', text: 'Only transaction exists' }, { id: 'd', text: 'Only summary exists' }], correct_option_id: 'b', explanation: 'Use the report type that matches your process (detail vs rolled-up totals).', order_index: 4 },
  { question: 'Export format for Clover that works well for QBO or templates is:', options: [{ id: 'a', text: 'PDF only' }, { id: 'b', text: 'CSV' }, { id: 'c', text: 'Image' }, { id: 'd', text: 'Printed only' }], correct_option_id: 'b', explanation: 'CSV is the standard format for importing into accounting software or spreadsheets.', order_index: 5 },
  { question: 'If Clover totals do not match QBO after import, you should:', options: [{ id: 'a', text: 'Ignore the difference' }, { id: 'b', text: 'Check date range, duplicates, and mapping' }, { id: 'c', text: 'Change QBO to match Clover exactly' }, { id: 'd', text: 'Delete the import' }], correct_option_id: 'b', explanation: 'Re-check date range, duplicate imports, and account mapping to find the cause of the variance.', order_index: 6 },
]

const QUIZ_9: QuizQ[] = [
  { question: 'Which of these is typically a source file for the weekly close?', options: [{ id: 'a', text: 'Employee personal emails' }, { id: 'b', text: 'POS sales summary' }, { id: 'c', text: 'Marketing ideas' }, { id: 'd', text: 'Menu design' }], correct_option_id: 'b', explanation: 'POS sales data is one of the primary sources for revenue in the close.', order_index: 0 },
  { question: 'Payroll data in the close should:', options: [{ id: 'a', text: 'Be ignored' }, { id: 'b', text: 'Match the period when labor was earned and tie to labor accounts' }, { id: 'c', text: 'Only include management' }, { id: 'd', text: 'Be estimated' }], correct_option_id: 'b', explanation: 'Labor is a major cost; payroll should be for the close period and reconciled to the P&L.', order_index: 1 },
  { question: 'Reconciling POS revenue to QBO means:', options: [{ id: 'a', text: 'Deleting one source' }, { id: 'b', text: 'Ensuring POS net sales match revenue recorded in QBO for the period' }, { id: 'c', text: 'Only checking the total once' }, { id: 'd', text: 'Using only POS from now on' }], correct_option_id: 'b', explanation: 'Reconciliation ensures the books reflect the same revenue as the POS for that period.', order_index: 2 },
  { question: 'What should you do with uncategorized transactions before closing?', options: [{ id: 'a', text: 'Leave them' }, { id: 'b', text: 'Categorize or resolve them so the P&L is accurate' }, { id: 'c', text: 'Delete them' }, { id: 'd', text: 'Move them to next period' }], correct_option_id: 'b', explanation: 'Uncategorized items distort the P&L; they should be categorized or flagged for resolution.', order_index: 3 },
  { question: 'A common weekly close mistake is:', options: [{ id: 'a', text: 'Using a checklist' }, { id: 'b', text: 'Using the wrong date range for POS or payroll' }, { id: 'c', text: 'Reconciling bank' }, { id: 'd', text: 'Exporting reports' }], correct_option_id: 'b', explanation: 'Wrong date ranges are a frequent cause of incorrect closes and KPI variance.', order_index: 4 },
  { question: 'Why "flag issues" in the close process?', options: [{ id: 'a', text: 'To hide them' }, { id: 'b', text: 'To document missing data or anomalies for follow-up' }, { id: 'c', text: 'To delete them' }, { id: 'd', text: 'Flags are not used' }], correct_option_id: 'b', explanation: 'Flagging ensures missing data and unusual items are tracked and resolved.', order_index: 5 },
  { question: 'Saving a backup of exports and the close file is important because:', options: [{ id: 'a', text: 'It is not' }, { id: 'b', text: 'You may need to re-run or audit later' }, { id: 'c', text: 'QBO requires it' }, { id: 'd', text: 'Only for annual close' }], correct_option_id: 'b', explanation: 'Backups allow you to verify or redo work and support audit or review.', order_index: 6 },
]

const QUIZ_10: QuizQ[] = [
  { question: 'Mixing cash and accrual in the same P&L causes:', options: [{ id: 'a', text: 'No issues' }, { id: 'b', text: 'Incorrect margins and misleading period comparison' }, { id: 'c', text: 'Faster close' }, { id: 'd', text: 'Better KPIs' }], correct_option_id: 'b', explanation: 'Revenue and expenses must be on the same basis for an accurate P&L.', order_index: 0 },
  { question: 'Wrong account mapping when importing POS data leads to:', options: [{ id: 'a', text: 'Faster reporting' }, { id: 'b', text: 'Skewed KPIs and incorrect P&L categories' }, { id: 'c', text: 'Better prime cost' }, { id: 'd', text: 'No impact' }], correct_option_id: 'b', explanation: 'Mapping to the wrong accounts distorts food cost %, labor %, and other metrics.', order_index: 1 },
  { question: 'Why is "not verifying totals" a mistake?', options: [{ id: 'a', text: 'Verification is optional' }, { id: 'b', text: 'Tying POS and payroll to QBO catches import and mapping errors' }, { id: 'c', text: 'Totals are always correct' }, { id: 'd', text: 'Only annual totals matter' }], correct_option_id: 'b', explanation: 'Verification catches duplicates, wrong dates, and mapping errors before the close is final.', order_index: 2 },
  { question: 'Ignoring a flag or review note can result in:', options: [{ id: 'a', text: 'Faster close' }, { id: 'b', text: 'Unresolved issues and potential rework later' }, { id: 'c', text: 'Better communication' }, { id: 'd', text: 'No downside' }], correct_option_id: 'b', explanation: 'Flags exist to ensure issues are resolved; ignoring them risks errors or client questions.', order_index: 3 },
  { question: 'Duplicate entries often happen when:', options: [{ id: 'a', text: 'Using one source only' }, { id: 'b', text: 'Importing POS and also entering manually, or importing twice' }, { id: 'c', text: 'Reconciling' }, { id: 'd', text: 'Using accrual' }], correct_option_id: 'b', explanation: 'Using a single source of truth and avoiding double entry prevents duplicate revenue.', order_index: 4 },
  { question: 'Poor communication during the close can lead to:', options: [{ id: 'a', text: 'Faster close' }, { id: 'b', text: 'Missing data or wrong assumptions not caught by client or reviewer' }, { id: 'c', text: 'Less work' }, { id: 'd', text: 'Better accuracy' }], correct_option_id: 'b', explanation: 'Documenting and communicating assumptions and issues helps the reviewer and client.', order_index: 5 },
  { question: 'To catch mistakes before submitting, you should:', options: [{ id: 'a', text: 'Skip the checklist' }, { id: 'b', text: 'Use a close checklist, reconcile each step, and have a second review if possible' }, { id: 'c', text: 'Only check revenue' }, { id: 'd', text: 'Submit as early as possible' }], correct_option_id: 'b', explanation: 'A checklist and reconciliation at each step reduce errors before the close is submitted.', order_index: 6 },
]

// New Module 1: US Restaurant Industry (6 questions)
const QUIZ_US_INDUSTRY: QuizQ[] = [
  { question: 'Which of the following is one of the six main restaurant types covered in this module?', options: [{ id: 'a', text: 'Cafe / Coffee Shop' }, { id: 'b', text: 'Retail Store' }, { id: 'c', text: 'Food Manufacturing' }, { id: 'd', text: 'Catering Only' }], correct_option_id: 'a', explanation: 'In this module we learned the six types: Cafe, FSR, Bar & Grill, Fast Casual/QSR, Fine Dining, and Multi-Unit. Morning Buzz is an example of a cafe.', order_index: 0 },
  { question: 'Which restaurant type typically has the HIGHEST profit margin?', options: [{ id: 'a', text: 'Full Service Restaurant' }, { id: 'b', text: 'Cafe/Coffee Shop' }, { id: 'c', text: 'Fast Casual' }, { id: 'd', text: 'Casual Dining' }], correct_option_id: 'b', explanation: 'Cafes run 10-15% margins due to high-margin beverages (coffee) and lower labor costs.', order_index: 1 },
  { question: 'A restaurant does $100,000/month in revenue. Approximately how much is NET PROFIT?', options: [{ id: 'a', text: '$25,000' }, { id: 'b', text: '$15,000' }, { id: 'c', text: '$5,000' }, { id: 'd', text: '$1,000' }], correct_option_id: 'c', explanation: 'Typical restaurant net profit is only 3-7%. $100K × 5% = $5,000.', order_index: 2 },
  { question: 'What percentage of restaurants fail within the first year?', options: [{ id: 'a', text: '20%' }, { id: 'b', text: '40%' }, { id: 'c', text: '60%' }, { id: 'd', text: '80%' }], correct_option_id: 'c', explanation: '60% fail in year 1, 80% within 5 years. Financial visibility helps prevent this.', order_index: 3 },
  { question: 'Morning Buzz Cafe is a coffee shop. What percentage of their sales is likely beverages?', options: [{ id: 'a', text: '20-30%' }, { id: 'b', text: '40-50%' }, { id: 'c', text: '60-70%' }, { id: 'd', text: '80-90%' }], correct_option_id: 'c', explanation: 'Coffee shops are beverage-focused, typically 60-70% of revenue from drinks.', order_index: 4 },
  { question: 'Which ownership structure provides liability protection and is most common for restaurants?', options: [{ id: 'a', text: 'Sole Proprietorship' }, { id: 'b', text: 'Partnership' }, { id: 'c', text: 'LLC' }, { id: 'd', text: 'Franchise' }], correct_option_id: 'c', explanation: 'LLCs separate business from personal assets while being simpler than corporations.', order_index: 5 },
  { question: 'A franchise restaurant owner must pay what to the franchisor?', options: [{ id: 'a', text: 'Nothing after initial purchase' }, { id: 'b', text: 'Royalty fees of 4-8% of sales' }, { id: 'c', text: '50% of all profits' }, { id: 'd', text: 'Only marketing costs' }], correct_option_id: 'b', explanation: 'Franchisees pay ongoing royalties (4-8%) plus often marketing fees.', order_index: 6 },
]

// New Module 2: Restaurant Roles & Operations (8 questions)
const QUIZ_ROLES_OPS: QuizQ[] = [
  { question: "A 'Line Cook' works in which area of the restaurant?", options: [{ id: 'a', text: 'Front of House' }, { id: 'b', text: 'Back of House' }, { id: 'c', text: 'Management' }, { id: 'd', text: 'Delivery' }], correct_option_id: 'b', explanation: 'Line cooks work in the kitchen (Back of House), preparing food on their station.', order_index: 0 },
  { question: "Where would a Line Cook's wages be coded in the FinAcct360 COA?", options: [{ id: 'a', text: '6010 Server Wages' }, { id: 'b', text: '6110 Line Cook Wages' }, { id: 'c', text: '6210 General Manager' }, { id: 'd', text: '4000 Food Sales' }], correct_option_id: 'b', explanation: 'In this module we saw that BOH labor uses the 6100s: 6110 Line Cook, 6120 Prep Cook, 6130 Dishwasher.', order_index: 1 },
  { question: "The restaurant term '86'd' means:", options: [{ id: 'a', text: 'Table 86 is ready' }, { id: 'b', text: 'Item costs $86' }, { id: 'c', text: 'Item is out of stock' }, { id: 'd', text: '86 covers served' }], correct_option_id: 'c', explanation: "'86 the salmon' means salmon is out of stock and unavailable to order.", order_index: 2 },
  { question: "When is a restaurant's highest revenue period typically?", options: [{ id: 'a', text: 'Breakfast (6-10 AM)' }, { id: 'b', text: 'Lunch (11 AM - 2 PM)' }, { id: 'c', text: 'Dinner (5-10 PM)' }, { id: 'd', text: 'Late night (10 PM - 2 AM)' }], correct_option_id: 'c', explanation: 'Dinner service typically generates the highest revenue with higher check averages.', order_index: 3 },
  { question: 'Why does FinAcct360 code labor by position (FOH, BOH, management)?', options: [{ id: 'a', text: 'To reduce payroll' }, { id: 'b', text: 'To track labor % by category, support scheduling, and control costs' }, { id: 'c', text: 'Only for tax filing' }, { id: 'd', text: 'It is not required' }], correct_option_id: 'b', explanation: 'As we learned, labor by role allows owners to see FOH vs BOH %, manage staffing, and hit labor targets.', order_index: 4 },
  { question: "A 'Cover' in restaurant terminology means:", options: [{ id: 'a', text: 'A table cloth' }, { id: 'b', text: 'One guest served' }, { id: 'c', text: 'A shift worked' }, { id: 'd', text: 'A menu item' }], correct_option_id: 'b', explanation: "'We did 200 covers tonight' means 200 guests were served.", order_index: 5 },
  { question: 'FOH staff typically includes all EXCEPT:', options: [{ id: 'a', text: 'Servers' }, { id: 'b', text: 'Bartenders' }, { id: 'c', text: 'Line Cooks' }, { id: 'd', text: 'Hosts' }], correct_option_id: 'c', explanation: 'Line cooks are BOH (Back of House). FOH is customer-facing staff.', order_index: 6 },
  { question: "Where would a General Manager's salary be coded in the COA?", options: [{ id: 'a', text: '6010 Server Wages' }, { id: 'b', text: '6110 Line Cook Wages' }, { id: 'c', text: '6210 General Manager' }, { id: 'd', text: '5010 Food Cost' }], correct_option_id: 'c', explanation: 'In this module we learned that management positions use the 6200 series: 6210 GM, 6220 AGM, 6230 Kitchen Manager.', order_index: 7 },
  { question: "Your senior asks you to 'check the COGS on the P&L'. What are they asking?", options: [{ id: 'a', text: 'Check the customer reviews' }, { id: 'b', text: 'Check the Cost of Goods Sold on the Profit & Loss statement' }, { id: 'c', text: 'Check the payment processing fees' }, { id: 'd', text: 'Check the payroll taxes' }], correct_option_id: 'b', explanation: 'COGS = Cost of Goods Sold, P&L = Profit & Loss Statement. They want you to review the food/beverage costs.', order_index: 8 },
]

// New Module 3: Restaurant Finances & Taxes (7 questions)
const QUIZ_FINANCES_TAXES: QuizQ[] = [
  { question: 'Which of the following are main revenue categories on a restaurant P&L?', options: [{ id: 'a', text: 'Food sales, Beverage sales, Other revenue' }, { id: 'b', text: 'Only food sales' }, { id: 'c', text: 'Rent and utilities' }, { id: 'd', text: 'Payroll taxes' }], correct_option_id: 'a', explanation: 'In this module we learned that the main revenue categories are Food Sales, Beverage Sales, and Other (e.g., catering, merchandise).', order_index: 0 },
  { question: 'Prime Cost on a restaurant P&L is:', options: [{ id: 'a', text: 'Revenue minus comps' }, { id: 'b', text: 'COGS plus Labor' }, { id: 'c', text: 'Gross profit minus rent' }, { id: 'd', text: 'Net profit before tax' }], correct_option_id: 'b', explanation: 'Prime Cost = Food Cost + Beverage Cost + Total Labor. Target is under 60% (typically 55–65%) of revenue.', order_index: 1 },
  { question: "DoorDash deposits $5,000 into the client's bank. The original order total was $6,500. What happened to the missing $1,500?", options: [{ id: 'a', text: 'Bank error' }, { id: 'b', text: 'DoorDash commission fee' }, { id: 'c', text: 'Customer refund' }, { id: 'd', text: 'Sales tax' }], correct_option_id: 'b', explanation: 'Third-party apps take 15-30% commission. $6,500 × 23% ≈ $1,500 fee.', order_index: 2 },
  { question: 'US Sales tax collected from customers is:', options: [{ id: 'a', text: 'Restaurant revenue' }, { id: 'b', text: 'Money held in trust for the state' }, { id: 'c', text: 'Profit' }, { id: 'd', text: 'An expense' }], correct_option_id: 'b', explanation: 'Sales tax belongs to the state. Restaurants collect it and remit it—it\'s not their money.', order_index: 3 },
  { question: "A server's hourly wage is $15. With employer taxes (~13%), what's the TRUE cost per hour?", options: [{ id: 'a', text: '$15.00' }, { id: 'b', text: '$16.95' }, { id: 'c', text: '$19.50' }, { id: 'd', text: '$22.00' }], correct_option_id: 'b', explanation: '$15 × 1.13 = $16.95. Labor cost includes employer-paid taxes.', order_index: 4 },
  { question: 'Rent (occupancy) appears in which section of the P&L?', options: [{ id: 'a', text: 'COGS' }, { id: 'b', text: 'Labor' }, { id: 'c', text: 'Operating expenses' }, { id: 'd', text: 'Revenue' }], correct_option_id: 'c', explanation: 'As we saw in this module, COGS is what you sell (food, beverage); rent is an operating expense (7000s).', order_index: 5 },
  { question: 'Tips in US restaurants are:', options: [{ id: 'a', text: 'Optional and not taxed' }, { id: 'b', text: 'Owned by the restaurant' }, { id: 'c', text: 'Taxable income for employees' }, { id: 'd', text: 'Included in the menu price' }], correct_option_id: 'c', explanation: 'Tips belong to employees and are taxable income that must be reported.', order_index: 6 },
]

const ALL_QUIZZES: { moduleSlug: string; questions: QuizQ[] }[] = [
  { moduleSlug: 'us-restaurant-industry', questions: QUIZ_US_INDUSTRY },
  { moduleSlug: 'restaurant-roles-operations', questions: QUIZ_ROLES_OPS },
  { moduleSlug: 'restaurant-finances-taxes', questions: QUIZ_FINANCES_TAXES },
  { moduleSlug: 'restaurant-accounting-basics', questions: QUIZ_1 },
  { moduleSlug: 'chart-of-accounts', questions: QUIZ_2 },
  { moduleSlug: 'reading-restaurant-pl', questions: QUIZ_3 },
  { moduleSlug: 'kpi-fundamentals', questions: QUIZ_4 },
  { moduleSlug: 'qbo-essentials', questions: QUIZ_5 },
  { moduleSlug: 'pos-square', questions: QUIZ_6 },
  { moduleSlug: 'pos-toast', questions: QUIZ_7 },
  { moduleSlug: 'pos-clover', questions: QUIZ_8 },
  { moduleSlug: 'weekly-close-process', questions: QUIZ_9 },
  { moduleSlug: 'common-mistakes', questions: QUIZ_10 },
]

async function seedQuizQuestions(slugToId: Map<string, string>) {
  console.log('Inserting quiz questions…')
  let total = 0
  for (const { moduleSlug, questions } of ALL_QUIZZES) {
    const moduleId = slugToId.get(moduleSlug)
    if (!moduleId) {
      console.warn(`  ⚠ Module not found: ${moduleSlug}, skipping questions`)
      continue
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const row = {
        module_id: moduleId,
        question: q.question,
        options: q.options,
        correct_option_id: q.correct_option_id,
        explanation: q.explanation,
        order_index: i,
      }
      const { error } = await supabase.from('quiz_questions').insert(row)
      if (error) throw error
      total++
    }
    console.log(`  ✓ ${questions.length} questions for ${moduleSlug}`)
  }
  console.log(`Quiz questions done (${total} total).\n`)
}

// ——— Main ———
async function main() {
  console.log('FinAcct360 KB Seed Script\n')
  try {
    if (clearFlag) await clearData()
    const sectionSlugToId = await seedSections()
    const slugToId = await seedTrainingModules()
    await seedArticles(sectionSlugToId)
    await seedQuizQuestions(slugToId)
    console.log('Seed completed successfully.')
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

main()
