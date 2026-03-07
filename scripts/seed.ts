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
    p('Why restaurants aren\'t like other businesses—and what that means for you.'),
    scenarioBox(
      p('Your first day. You\'ve been assigned Morning Buzz Cafe, a busy coffee shop doing $45,000/month. Owner Sarah Chen asks: "My cousin\'s accountant charges half what FinAcct360 does. Why do I need specialized restaurant accounting?" By the end of this module, you\'ll know exactly how to answer her.')
    ),
    h(2, 'Why Restaurants Are Unique'),
    p('Three facts that make restaurants completely different from other businesses:'),
    kpiCards([
      { value: '500-2,000+', label: 'Transactions per week', sublabel: 'vs. 50-100 for typical retail' },
      { value: '4-7 days', label: 'Before food spoils', sublabel: 'vs. 30-90 days for retail' },
      { value: '3-7%', label: 'Net profit margin', sublabel: 'vs. 10-20% for other retail' },
    ]),
    insightBox(
      'The 1% Problem',
      p('At Morning Buzz ($45,000/month revenue), a 1% error in cost tracking = $450/month = $5,400/year lost. That\'s Sarah\'s family vacation. That\'s a new espresso machine. Precision isn\'t optional—it\'s the difference between thriving and struggling.')
    ),
    h(2, 'Restaurant vs. Regular Business'),
    table([
      { cells: ['Factor', 'Auto Repair Shop', 'Morning Buzz Cafe'], header: true },
      { cells: ['Daily transactions', '8-15', '200-400'] },
      { cells: ['Inventory shelf life', 'Months/Years', 'Days'] },
      { cells: ['Revenue categories', '2-3', '8-12'] },
      { cells: ['Profit margin', '15-25%', '3-7%'] },
    ]),
    h(2, 'The 4 Revenue Streams'),
    p('Every dollar into a restaurant falls into one of these categories. Getting this wrong throws off every KPI.'),
    bulletList(
      [pContent(textBold('FOOD SALES (4100s)'), { type: 'text', text: ' — Dine-in, takeout, delivery, catering food' } as TipTapNode)],
      [pContent(textBold('BEVERAGE SALES (4200s)'), { type: 'text', text: ' — Beer, wine, spirits, non-alcoholic. Each has different margins.' } as TipTapNode)],
      [pContent(textBold('THIRD-PARTY DELIVERY (4300s)'), { type: 'text', text: ' — DoorDash, UberEats, Grubhub. Comes with 15-30% fees!' } as TipTapNode)],
      [pContent(textBold('OTHER REVENUE (4400s)'), { type: 'text', text: ' — Catering, private events, merchandise, gift cards' } as TipTapNode)]
    ),
    exampleBox(
      'Morning Buzz Revenue Breakdown',
      table([
        { cells: ['Category', 'Monthly', '%'], header: true },
        { cells: ['☕ Coffee & Espresso', '$22,500', '50%'] },
        { cells: ['🥤 Other Beverages', '$5,400', '12%'] },
        { cells: ['🥐 Pastries & Food', '$15,300', '34%'] },
        { cells: ['🛍️ Retail', '$1,800', '4%'] },
      ]),
      pContent(textBold('Key insight: '), { type: 'text', text: '62% of Morning Buzz revenue is beverages. Beverage cost % matters MORE than food cost % for Sarah\'s profitability.' } as TipTapNode)
    ),
    warningBox(
      'The Delivery Trap',
      p('A restaurant owner sees $10,000 in \'sales\' from DoorDash and thinks business is great. But after DoorDash\'s 25% fee ($2,500), food cost (30% = $3,000), and packaging ($300), that \'$10,000\' is actually only $4,200 in real revenue. If you don\'t track third-party separately, you\'ll report inflated margins.')
    ),
    h(2, 'The Cost Structure'),
    p('Restaurant costs fall into 5 buckets. Memorize these—you\'ll use them daily.'),
    stepFlowSteps([
      { title: 'COGS (15-35%)', description: 'Food cost, beverage cost, packaging. Variable—goes up with sales.' },
      { title: 'LABOR (25-35%)', description: 'FOH wages, BOH wages, management, benefits, payroll taxes.' },
      { title: 'OCCUPANCY (6-10%)', description: 'Rent, CAM, property taxes, insurance. Mostly fixed.' },
      { title: 'OPERATING (8-15%)', description: 'Utilities, marketing, repairs, supplies, technology.' },
      { title: 'OTHER (2-5%)', description: 'Bank fees, depreciation, interest, miscellaneous.' },
    ]),
    insightBox(
      'PRIME COST = The Number That Matters Most',
      pContent(textBold('Prime Cost = COGS + Labor')),
      p('Target: 55-65% of revenue. This is what restaurant operators obsess over—it\'s your two largest controllable costs combined.'),
      p('At Morning Buzz: COGS ($11,700) + Labor ($13,500) = Prime Cost $25,200 (56%) ✅ Healthy!')
    ),
    h(2, 'The P&L Flow'),
    p('Here\'s how money flows through a restaurant P&L:'),
    stepFlowSteps([
      { title: 'REVENUE', description: 'Total Sales' },
      { title: '− COGS', description: 'Food + Beverage Cost' },
      { title: '= GROSS PROFIT', description: '' },
      { title: '− LABOR', description: 'All payroll costs' },
      { title: '= PRIME PROFIT', description: 'Rev − COGS − Labor' },
      { title: '− OPERATING', description: 'Rent, utilities, etc.' },
      { title: '= EBITDA', description: '' },
      { title: '− OTHER', description: 'Depreciation, interest' },
      { title: '= NET PROFIT', description: 'The bottom line' },
    ]),
    exampleBox(
      'Morning Buzz P&L',
      table([
        { cells: ['Line Item', 'Amount', '%'], header: true },
        { cells: ['Revenue', '$45,000', '100%'] },
        { cells: ['− Food Cost', '$4,590', '10.2%'] },
        { cells: ['− Beverage Cost', '$7,110', '15.8%'] },
        { cells: ['Gross Profit', '$33,300', '74%'] },
        { cells: ['− Labor', '$13,500', '30%'] },
        { cells: ['− Rent', '$4,500', '10%'] },
        { cells: ['− Other Operating', '$4,725', '10.5%'] },
        { cells: ['Net Profit', '$10,575', '23.5%'] },
      ]),
      p('23.5% net profit is unusually high! That\'s because Morning Buzz is a coffee shop with high beverage margins (75-80%) and lower food costs.')
    ),
    h(2, 'Key Terminology'),
    p('You\'ll hear these terms constantly. Know them cold:'),
    bulletList(
      [pContent(textBold('Covers'), { type: 'text', text: ' — Number of guests served. "We did 450 covers this weekend."' } as TipTapNode)],
      [pContent(textBold('Ticket Average'), { type: 'text', text: ' — Average revenue per transaction. "$18.50 check average."' } as TipTapNode)],
      [pContent(textBold('Daypart'), { type: 'text', text: ' — Time-based periods: Breakfast (6-11am), Lunch (11-3pm), Dinner (5-10pm).' } as TipTapNode)],
      [pContent(textBold('Comps'), { type: 'text', text: ' — Complimentary items given free. Must be tracked—affects food cost %.' } as TipTapNode)],
      [pContent(textBold('Voids'), { type: 'text', text: ' — Items rung up then removed. High voids may indicate theft.' } as TipTapNode)],
      [pContent(textBold('86\'d'), { type: 'text', text: ' — Item is out of stock. "86 the salmon—we\'re out."' } as TipTapNode)],
      [pContent(textBold('Table Turn'), { type: 'text', text: ' — How many times a table is used per service. Higher = more revenue.' } as TipTapNode)]
    ),
    proTipBox(
      'First Week on a New Client',
      p('Before diving into numbers, spend 30 minutes understanding the CONCEPT. Is it quick-service or full-service? Beer-focused or cocktail-focused? Heavy on delivery or dine-in only? This context changes which accounts matter most and what "good" looks like for their KPIs.')
    )
  )
}

function module2Content() {
  return doc(
    h(1, 'The Chart of Accounts'),
    p('The foundation of every financial report you\'ll ever create. Get the COA right and every KPI falls into place.'),
    scenarioBox(
      p('You\'re reviewing a new client\'s QBO. Their "Cost of Goods Sold" account shows $45,000 last month. Sounds reasonable for $120,000 in sales—that\'s 37.5% COGS. But you dig deeper and find: Food cost $28,000 ✓, Beverage $9,000 ✓, CLEANING SUPPLIES $3,000 ✗, PAPER GOODS $2,000 ✗, SMALLWARES $3,000 ✗. Their true COGS is $37,000 (31%), not $45,000. They\'ve been making decisions based on inflated costs. This is why COA structure matters.')
    ),
    h(2, 'Account Ranges at a Glance'),
    p('Every restaurant P&L category maps to a range. Memorize these:'),
    stepFlowSteps([
      { title: '1000–1999 ASSETS', description: 'What the business owns: cash, inventory, equipment, prepaid.' },
      { title: '2000–2999 LIABILITIES', description: 'What it owes: payables, accrued payroll, gift card liability.' },
      { title: '3000–3999 EQUITY', description: 'Owner capital, retained earnings.' },
      { title: '4000–4999 REVENUE', description: 'Food, beverage, delivery, other. The top line.' },
      { title: '5000–5999 COGS', description: 'Food cost, beverage cost, packaging.' },
      { title: '6000–6999 LABOR', description: 'Wages, benefits, payroll taxes.' },
      { title: '7000–7999 OPERATING', description: 'Rent, utilities, marketing, supplies, repairs.' },
      { title: '8000–8999 OTHER', description: 'Depreciation, interest, bank fees, miscellaneous.' },
    ]),
    insightBox(
      'Why These Ranges Matter',
      p('The FinAcct360 COA is designed so KPIs calculate automatically. When food cost sits in 5100, the system divides it by 4100 (food sales) to get Food Cost %. If someone codes food cost in 7000s, the KPI breaks—and so does the owner\'s ability to manage margins.')
    ),
    h(2, 'Revenue Accounts (4000s)'),
    accountTree([
      { id: '4000', label: 'TOTAL REVENUE', children: [
        { id: '4100', label: 'Food Sales' },
        { id: '4200', label: 'Beverage Sales' },
        { id: '4300', label: 'Third-Party Delivery' },
        { id: '4400', label: 'Other Revenue' },
        { id: '4900', label: 'Contra Revenue (Discounts, Comps)' },
      ]},
    ]),
    exampleBox(
      'Olive & Vine Revenue Structure',
      p('Marcus Thompson\'s full-service restaurant ($150K/month) uses 4100 for food and 4200 for beverage. With 70% food / 30% beverage mix, food sales = $105,000 and beverage = $45,000. Third-party is minimal; most revenue is dine-in.'),
      table([
        { cells: ['Account', 'Description', 'Olive & Vine Monthly'], header: true },
        { cells: ['4100', 'Food Sales', '$105,000'] },
        { cells: ['4200', 'Beverage Sales', '$45,000'] },
        { cells: ['4300', 'Third-Party (if any)', '—'] },
        { cells: ['4400', 'Other (events, etc.)', '—'] },
      ])
    ),
    warningBox(
      'Third-Party Sales Are NOT Regular Sales',
      p('When DoorDash deposits $5,000, do NOT book: Debit Cash $5,000 / Credit Food Sales $5,000. The actual sale was $6,250 with a $1,250 fee withheld. Book: Debit Cash $5,000, Debit Third-Party Fees $1,250, Credit Third-Party Sales $6,250. Critical for accurate margin calculation.')
    ),
    h(2, 'COGS Accounts (5000s)'),
    p('5100 Food Cost, 5200 Beverage Cost, 5300 Packaging & Disposables, 5400 Kitchen Supplies (oil, foil—consumables that touch the product).'),
    insightBox(
      'What IS and ISN\'T COGS',
      p('COGS = costs that DIRECTLY go into what you sell. Steak you serve ✓. Vodka in a cocktail ✓. To-go container ✓. Cooking oil ✓.')
    ),
    comparisonTable('Wrong (often misclassified here)', 'Correct home', [
      { wrong: 'Cleaning supplies in 5100', right: '7510 Operating Supplies' },
      { wrong: 'Paper towels / napkins in COGS', right: '5300 if for guest use; 7510 if back-of-house' },
      { wrong: 'Office supplies in 5100', right: '7520 Office' },
      { wrong: 'New blender / equipment in COGS', right: '1600 Equipment (asset)' },
      { wrong: 'Repair to oven in 5200', right: '7400 Repairs' },
    ]),
    h(2, 'Labor (6000s) and Operating (7000s)'),
    p('6100 FOH wages, 6200 BOH, 6300 Management, 6400 Benefits & payroll taxes. 7100 Rent, 7200 Utilities, 7300 Marketing, 7400 Repairs, 7500 Supplies, 7600 Technology.'),
    proTipBox(
      'New Client COA Review',
      p('Before changing anything, export the current COA and map it to the standard ranges. Flag every account that\'s in the wrong bucket. Fix the highest-volume misclassifications first—they have the biggest impact on KPIs.')
    )
  )
}

function module3Content() {
  return doc(
    h(1, 'Reading a Restaurant P&L'),
    p('Walk through a restaurant P&L line by line—and learn what \"good\" looks like for each concept type.'),
    scenarioBox(
      p('Marcus Thompson at Olive & Vine just received his monthly P&L. Revenue is up 8% vs last year, but his prime cost jumped from 58% to 62%. He wants to know: \"Are we still healthy?\" You need to read the full P&L, compare to benchmarks, and tell him exactly where the pressure is.')
    ),
    h(2, 'Revenue Section'),
    p('Revenue is broken down by source: food, beverage, delivery, other. Net revenue (after discounts and comps) is your top line. Track each stream separately so food cost % and beverage cost % calculate correctly.'),
    exampleBox(
      'Revenue by Concept',
      table([
        { cells: ['Concept', 'Food', 'Beverage', 'Other', 'Total/mo'], header: true },
        { cells: ['Morning Buzz Cafe', '$15,300 (34%)', '$27,900 (62%)', '$1,800 (4%)', '$45,000'] },
        { cells: ['Olive & Vine', '$105,000 (70%)', '$45,000 (30%)', '—', '$150,000'] },
        { cells: ['Smokey\'s Bar & Grill', '$48,000 (40%)', '$72,000 (60%)', '—', '$120,000'] },
        { cells: ['Spitz Mediterranean', 'Dine-in + Off-prem', '—', 'Packaging impact', '$80,000'] },
      ]),
      p('Notice: at Smokey\'s, beverage is 60% of revenue—so beverage cost % matters more than food cost % for Dave\'s margins.')
    ),
    h(2, 'Cost of Goods Sold'),
    p('COGS includes food cost and beverage cost. It should reflect the cost of product used for sales in the period, not just purchases. Use inventory movement when possible.'),
    insightBox(
      'COGS vs Purchases',
      p('If you don\'t adjust for inventory, a big end-of-month delivery can make COGS look artificially high. True food cost = Opening inventory + Purchases − Closing inventory − Comps/waste (if tracked).')
    ),
    h(2, 'Gross Profit and Labor'),
    p('Gross Profit = Revenue − COGS. Gross margin % = Gross Profit ÷ Revenue. Then subtract labor (FOH, BOH, management, benefits, payroll taxes) to get Prime Profit.'),
    kpiCards([
      { value: '55–65%', label: 'Prime cost target', sublabel: 'COGS + Labor as % of revenue' },
      { value: '>65%', label: 'Red flag', sublabel: 'Little left for rent and profit' },
      { value: '<55%', label: 'Strong', sublabel: 'Room for operating and net profit' },
    ]),
    h(2, 'Operating, EBITDA, Net'),
    p('Below prime cost: rent, utilities, marketing, repairs, supplies, technology. Then depreciation and interest. Net profit is the bottom line.'),
    exampleBox(
      'Side-by-Side: Cafe vs Full-Service vs Bar',
      table([
        { cells: ['Line', 'Morning Buzz', 'Olive & Vine', 'Smokey\'s'], header: true },
        { cells: ['Revenue', '$45,000', '$150,000', '$120,000'] },
        { cells: ['COGS %', '26%', '29%', '27%'] },
        { cells: ['Labor %', '30%', '32%', '30%'] },
        { cells: ['Prime Cost %', '56%', '62%', '55%'] },
        { cells: ['Net profit %', '~23%', '~5–8%', '~8–12%'] },
      ]),
      p('Cafes often show higher net % due to beverage mix. Full-service restaurants run thinner margins; bars can be strong if beverage cost is controlled.')
    ),
    h(2, 'Red Flags to Watch'),
    warningBox(
      'Investigate When You See',
      p('Food cost or labor % creeping up 2+ points vs prior period or benchmark. Prime cost over 65%. Revenue per cover declining. Large unexplained variances in any line. Third-party revenue mixed into regular sales (inflates margin).')
    ),
    proTipBox(
      'Variance Analysis',
      p('When you present a P&L, always show period-over-period or budget vs actual. \"Food cost was 32% this month vs 30% last month—that\'s $3,000. Possible causes: price increase from vendor, waste, or mix shift to higher-cost items.\" That kind of clarity is what owners pay for.')
    )
  )
}

function module4Content() {
  return doc(
    h(1, 'KPI Fundamentals'),
    p('Key performance indicators tell you at a glance whether a restaurant is healthy—and where to dig deeper.'),
    scenarioBox(
      p('Your client Smokey\'s Bar & Grill shows food cost at 38% this month. Dave Morrison is worried. You run the numbers: food sales $48,000, food COGS $18,240. That\'s 38%. Target for a bar & grill is typically 28–32%. By the end of this module you\'ll know how to interpret that, what to check first, and how to explain it to Dave.')
    ),
    h(2, 'The Big Four KPIs'),
    p('These four metrics drive most restaurant conversations:'),
    kpiCards([
      { value: '28–32%', label: 'Food Cost %', sublabel: 'Food COGS ÷ Food Sales. Cafe/fast casual: 28–30%. FSR: 30–32%.', status: 'neutral' },
      { value: '18–24%', label: 'Beverage Cost %', sublabel: 'Bev COGS ÷ Bev Sales. Beer/wine/spirits each differ.', status: 'neutral' },
      { value: '28–35%', label: 'Labor Cost %', sublabel: 'Total labor ÷ Revenue. Varies by service style.', status: 'neutral' },
      { value: '55–65%', label: 'Prime Cost %', sublabel: '(COGS + Labor) ÷ Revenue. The number operators watch most.', status: 'neutral' },
    ]),
    h(2, 'Formulas and Calculations'),
    exampleBox(
      'Morning Buzz: Food Cost %',
      p('Food sales = $15,300. Food COGS = $4,590. Food Cost % = 4,590 ÷ 15,300 = 30%. On target for a cafe with pastries and light food.')
    ),
    exampleBox(
      'Olive & Vine: Prime Cost',
      p('Revenue $150,000. COGS $43,500 (29%). Labor $48,000 (32%). Prime Cost = $91,500 = 61%. Within the 55–65% target.')
    ),
    h(2, 'Benchmarks by Restaurant Type'),
    table([
      { cells: ['Type', 'Food Cost %', 'Bev Cost %', 'Labor %', 'Prime Cost %'], header: true },
      { cells: ['Cafe / Coffee', '28–32%', '22–26%', '28–32%', '54–58%'] },
      { cells: ['Full-Service', '30–33%', '22–26%', '30–34%', '58–65%'] },
      { cells: ['Bar & Grill', '30–33%', '18–24%', '28–32%', '54–60%'] },
      { cells: ['Fast Casual', '28–32%', '—', '26–30%', '55–60%'] },
    ]),
    insightBox(
      'Context Matters',
      p('A 32% food cost at a steakhouse might be fine; at a pasta concept it could be high. A 24% labor at quick-service is normal; at full-service it might mean understaffing. Always compare to the right benchmark for that concept.')
    ),
    warningBox(
      'When Food Cost Is 38%',
      p('First verify the numbers: correct food sales and food COGS accounts, no misclassified operating expenses in COGS. Then consider: vendor price increases, waste/spoilage, mix shift to higher-cost items, or theft. Run variance vs last period and ask the owner what changed.')
    ),
    proTipBox(
      'Presenting KPIs to Owners',
      p('Lead with the one number they care about most—usually prime cost. Then break it down: "Your prime cost is 62%. Food is on target at 31%, but labor is 33%—that\'s where we\'re over. Next step is to look at labor vs covers."')
    )
  )
}

function module5Content() {
  return doc(
    h(1, 'QBO Essentials'),
    p('QuickBooks Online is the backbone of many restaurant books. Navigate it confidently and avoid the most common setup mistakes.'),
    scenarioBox(
      p('Amir Hassan at Spitz Mediterranean just switched to FinAcct360. His previous bookkeeper left QBO with custom accounts and rules that don\'t match the standard restaurant COA. You need to map his accounts, fix the bank feed rules, and run a clean P&L for the first weekly close.')
    ),
    h(2, 'QBO Navigation Overview'),
    p('Dashboard: overview of cash and recent activity. Banking: feeds and transactions. Expenses: bills and spend. Reports: P&L, Balance Sheet, and custom reports. Use the search bar (magnifying glass) to jump to any account or report.'),
    stepFlowSteps([
      { title: 'Set up COA', description: 'Chart of Accounts → add/edit accounts to match restaurant ranges (4000s revenue, 5000s COGS, etc.).' },
      { title: 'Connect bank feeds', description: 'Banking → Connect account. Match or create rules for recurring vendors.' },
      { title: 'Categorize transactions', description: 'Assign each transaction to the correct COA account. Avoid \"Uncategorized\" before close.' },
      { title: 'Run P&L', description: 'Reports → Profit and Loss. Set date range to your close period (e.g., week or month).' },
      { title: 'Export for records', description: 'Export to Excel or PDF. Confirm date range and accrual vs cash basis.' },
    ]),
    insightBox(
      'Account Mapping',
      p('Default QBO accounts often don\'t match restaurant COA. \"Merchandise\" might need to map to 4400 Other Revenue. \"Cost of Goods Sold\" might be one account—split into 5100 Food, 5200 Beverage, 5300 Packaging. Create a mapping doc and stick to it.')
    ),
    warningBox(
      'Common QBO Errors',
      p('Duplicate transactions (POS imported and also entered manually). Wrong account (e.g., food in 5200). Misdated entries (wrong period). Unreconciled bank feed. Fix these before every close.')
    ),
    proTipBox(
      'Speed Tips',
      p('Use rules in the bank feed to auto-categorize recurring vendors (e.g., Sysco → 5100). Use classes or locations if you have multiple units. Reconcile weekly so nothing piles up.')
    )
  )
}

function module6Content() {
  return doc(
    h(1, 'POS Exports — Square'),
    p('Learn how to pull and interpret Square sales data for bookkeeping.'),
    h(2, 'Logging Into Square Dashboard'),
    p('Use the restaurant’s Square login. Ensure you have Reports access.'),
    h(2, 'Navigating to Reports'),
    p('From the main menu, go to Reports or Analytics. Select the type of report you need (e.g., Sales Summary).'),
    h(2, 'Pulling Sales Summary Report'),
    p('Sales Summary shows daily or custom-period totals: gross sales, discounts, refunds, net sales.'),
    h(2, 'Understanding the Data Fields'),
    p('Fields typically include: gross sales, discounts, comps, net sales, tax, tips. Match these to your P&L categories.'),
    h(2, 'Date Range Selection'),
    p('Always match the date range to your close period (e.g., week or month). Avoid time-zone mismatches.'),
    h(2, 'Exporting to CSV'),
    p('Export to CSV for import into QBO or your template. Check that decimals and dates format correctly.'),
    h(2, 'What to Verify Before Importing'),
    p('Verify totals tie to the dashboard, no duplicate dates, and that refunds and comps are handled consistently.')
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
    p('Understand restaurant types, business models, and economics.'),
    h(2, 'The US Restaurant Industry'),
    p('The US restaurant industry is over $1 trillion in size. There are 1 million+ restaurants across America and 15 million+ employees. Americans spend over 50% of their food budget eating out.'),
    insightBox(
      'Why This Matters',
      p('Restaurants are the backbone of American communities. Every Main Street has them. Your work supports real families running real businesses.')
    ),
    h(2, 'The 6 Restaurant Types'),
    kpiCards([
      { value: 'QSR/Fast Food', label: 'High volume, low check', sublabel: '$8-15 avg' },
      { value: 'Fast Casual', label: 'Counter service, quality', sublabel: '$12-20 avg' },
      { value: 'Cafe/Coffee', label: 'Beverage-focused', sublabel: '60-70% drinks' },
      { value: 'Casual Dining', label: 'Full table service', sublabel: '5-8% margin' },
      { value: 'Full Service/Fine', label: 'Upscale, skilled staff', sublabel: '$50-150+ check' },
      { value: 'Bar & Grill', label: 'Beverage + entertainment', sublabel: '8-12% margin' },
    ]),
    p('1. QUICK SERVICE / FAST FOOD — Counter service, no table service. High volume (500+ transactions/day). Examples: McDonald\'s, Subway, Chipotle. Net margin: 6-9%.'),
    p('2. FAST CASUAL — Counter service, higher quality food. Focus on fresh, customizable. Examples: Panera, Sweetgreen, Spitz. Net margin: 6-9%.'),
    p('3. CAFE / COFFEE SHOP — Beverage-focused (60-70% of sales). High margins on coffee drinks. Examples: Starbucks, local cafes, Morning Buzz. Net margin: 10-15%.'),
    p('4. CASUAL DINING — Full table service. Family-friendly atmosphere. Examples: Applebee\'s, Chili\'s, Olive Garden. Net margin: 5-8%.'),
    p('5. FULL SERVICE / FINE DINING — Upscale, skilled staff. High check average ($50-150+). Examples: Steakhouses, fine dining. Net margin: 3-7%.'),
    p('6. BAR & GRILL — Beverage-focused (50-60% drinks). Entertainment (sports, music). Examples: Sports bars, neighborhood pubs. Net margin: 8-12%.'),
    h(2, 'Restaurant Economics'),
    table([
      { cells: ['Revenue', 'Where It Goes'], header: true },
      { cells: ['100%', 'Total Sales'] },
      { cells: ['-30%', 'Food & Beverage Cost'] },
      { cells: ['-30%', 'Labor'] },
      { cells: ['-10%', 'Rent & Occupancy'] },
      { cells: ['-15%', 'Operating Expenses'] },
      { cells: ['-10%', 'Other Expenses'] },
      { cells: ['=5%', 'NET PROFIT'] },
    ]),
    warningBox(
      'The Brutal Math',
      p('A restaurant doing $100,000/month might only keep $5,000 as profit. ONE bad week of food waste or labor issues can wipe out the entire month\'s profit.')
    ),
    h(2, 'Why Restaurants Fail'),
    p('Statistics: 60% fail in year 1; 80% fail within 5 years.'),
    p('Top reasons: Undercapitalized (ran out of money); Poor location; Bad food cost management; Labor cost out of control; No financial visibility.'),
    insightBox(
      'Where You Come In',
      p('Good accounting = financial visibility. Financial visibility = better decisions. Better decisions = survival. You\'re not just doing bookkeeping—you\'re helping restaurants survive.')
    ),
    h(2, 'Ownership Structures'),
    bulletList(
      [pContent(textBold('SOLE PROPRIETOR'), { type: 'text', text: ': One person owns everything, personal liability.' } as TipTapNode)],
      [pContent(textBold('PARTNERSHIP'), { type: 'text', text: ': 2+ people share ownership and profits.' } as TipTapNode)],
      [pContent(textBold('LLC'), { type: 'text', text: ': Most common, separates business from personal assets.' } as TipTapNode)],
      [pContent(textBold('CORPORATION'), { type: 'text', text: ': S-Corp or C-Corp, more complex.' } as TipTapNode)],
      [pContent(textBold('FRANCHISE'), { type: 'text', text: ': Pays fees to use brand (McDonald\'s, Subway).' } as TipTapNode)]
    ),
  )
}

function restaurantRolesOperationsContent() {
  return doc(
    h(1, 'Restaurant Roles & Operations'),
    p('Who works in restaurants and how daily operations flow.'),
    h(2, 'Front of House (FOH)'),
    table([
      { cells: ['Role', 'What They Do', 'Pay Type'], header: true },
      { cells: ['Server', 'Takes orders, serves food', 'Hourly + Tips'] },
      { cells: ['Bartender', 'Makes and serves drinks', 'Hourly + Tips'] },
      { cells: ['Host/Hostess', 'Greets and seats guests', 'Hourly'] },
      { cells: ['Busser', 'Clears tables', 'Hourly + Tip share'] },
      { cells: ['Cashier', 'Handles payments', 'Hourly'] },
      { cells: ['Food Runner', 'Delivers food to tables', 'Hourly + Tip share'] },
    ]),
    h(2, 'Back of House (BOH)'),
    table([
      { cells: ['Role', 'What They Do', 'Pay Type'], header: true },
      { cells: ['Executive Chef', 'Menu, food quality', 'Salary'] },
      { cells: ['Sous Chef', 'Second in command', 'Salary'] },
      { cells: ['Line Cook', 'Prepares food on station', 'Hourly'] },
      { cells: ['Prep Cook', 'Cuts, prepares ingredients', 'Hourly'] },
      { cells: ['Dishwasher', 'Cleans dishes', 'Hourly'] },
    ]),
    h(2, 'Management'),
    table([
      { cells: ['Role', 'What They Do', 'Pay Type'], header: true },
      { cells: ['Owner', 'Business decisions', 'Profit/Draw'] },
      { cells: ['General Manager', 'Daily operations', 'Salary'] },
      { cells: ['Assistant Manager', 'Supports GM', 'Salary'] },
      { cells: ['Kitchen Manager', 'BOH operations', 'Salary'] },
    ]),
    h(2, 'A Day in Restaurant Life'),
    stepFlowSteps([
      { title: '6-8 AM', description: 'Prep cooks arrive, deliveries received' },
      { title: '11 AM - 2 PM', description: 'Lunch service rush' },
      { title: '2-5 PM', description: 'Slower period, prep for dinner, shift change' },
      { title: '5-10 PM', description: 'Dinner service (highest revenue)' },
      { title: '10 PM - 12 AM', description: 'Closing duties, register close, reports' },
    ]),
    h(2, 'Key Vendors'),
    p('Food & Beverage: Sysco, US Foods (broadline distributors); Local produce suppliers; Beverage distributors.'),
    p('Technology: POS — Square, Toast, Clover; Payroll — Gusto, ADP, Paychex; Accounting — QBO, Xero; Delivery — DoorDash, UberEats, Grubhub.'),
    h(2, 'Restaurant Terminology'),
    table([
      { cells: ['Term', 'Meaning'], header: true },
      { cells: ['86\'d', 'Out of stock'] },
      { cells: ['In the weeds', 'Overwhelmed, too busy'] },
      { cells: ['Cover', 'One guest served'] },
      { cells: ['Turn', 'Table used and reset'] },
      { cells: ['Comp', 'Free item given'] },
      { cells: ['Void', 'Order cancelled'] },
      { cells: ['Ticket', 'Order/check'] },
      { cells: ['Daypart', 'Time period (breakfast, lunch, dinner)'] },
    ]),
    h(2, 'Abbreviations You\'ll See Daily'),
    p('You\'ll encounter these abbreviations constantly in reports, emails, and systems. Memorize the key ones—you\'ll use them every day.'),
    table([
      { cells: ['Abbrev', 'Full Term', 'What It Means'], header: true },
      { cells: ['FOH', 'Front of House', 'Customer-facing staff (servers, hosts, bartenders)'] },
      { cells: ['BOH', 'Back of House', 'Kitchen staff (cooks, prep, dishwashers)'] },
      { cells: ['POS', 'Point of Sale', 'Register/ordering system (Square, Toast, Clover)'] },
      { cells: ['QSR', 'Quick Service Restaurant', 'Fast food (McDonald\'s, Chipotle)'] },
      { cells: ['FSR', 'Full Service Restaurant', 'Sit-down dining with servers'] },
      { cells: ['GM', 'General Manager', 'Runs daily operations'] },
      { cells: ['F&B', 'Food & Beverage', 'Food and drink categories'] },
      { cells: ['CoGS / COGS', 'Cost of Goods Sold', 'Direct cost of items sold'] },
      { cells: ['86\'d', 'Eighty-sixed', 'Item out of stock'] },
    ]),
    table([
      { cells: ['Abbrev', 'Full Term', 'What It Means'], header: true },
      { cells: ['P&L', 'Profit & Loss Statement', 'Income statement showing revenue minus expenses'] },
      { cells: ['KPI', 'Key Performance Indicator', 'Performance metric (food cost %, labor %)'] },
      { cells: ['EBITDA', 'Earnings Before Interest, Taxes, Depreciation, Amortization', 'Operating profitability'] },
      { cells: ['AR', 'Accounts Receivable', 'Money owed TO the business'] },
      { cells: ['AP', 'Accounts Payable', 'Money the business OWES'] },
      { cells: ['COA', 'Chart of Accounts', 'List of all account categories'] },
      { cells: ['GL', 'General Ledger', 'Master record of all transactions'] },
      { cells: ['YTD', 'Year to Date', 'From January 1 to today'] },
      { cells: ['MTD', 'Month to Date', 'From 1st of month to today'] },
      { cells: ['WTD', 'Week to Date', 'From start of week to today'] },
    ]),
    table([
      { cells: ['Abbrev', 'Full Term', 'What It Means'], header: true },
      { cells: ['FICA', 'Federal Insurance Contributions Act', 'Social Security + Medicare taxes'] },
      { cells: ['FUTA', 'Federal Unemployment Tax Act', 'Federal unemployment tax (employer pays)'] },
      { cells: ['SUTA', 'State Unemployment Tax Act', 'State unemployment tax'] },
      { cells: ['W-2', 'Wage and Tax Statement', 'Annual tax form for employees'] },
      { cells: ['1099', 'Miscellaneous Income Form', 'Annual tax form for contractors'] },
      { cells: ['EIN', 'Employer Identification Number', 'Business tax ID number'] },
      { cells: ['OT', 'Overtime', 'Hours worked beyond 40/week'] },
      { cells: ['PTO', 'Paid Time Off', 'Vacation/sick days'] },
    ]),
    table([
      { cells: ['Abbrev', 'Full Term', 'What It Means'], header: true },
      { cells: ['QBO', 'QuickBooks Online', 'Accounting software'] },
      { cells: ['ACH', 'Automated Clearing House', 'Bank-to-bank transfer'] },
      { cells: ['CC', 'Credit Card', 'Card payment'] },
      { cells: ['EFT', 'Electronic Funds Transfer', 'Digital money transfer'] },
      { cells: ['API', 'Application Programming Interface', 'Software connection'] },
    ]),
    table([
      { cells: ['Abbrev', 'Full Term', 'What It Means'], header: true },
      { cells: ['ET / EST', 'Eastern Time', 'New York, Florida (UTC-5)'] },
      { cells: ['CT / CST', 'Central Time', 'Texas, Chicago (UTC-6)'] },
      { cells: ['PT / PST', 'Pacific Time', 'California (UTC-8)'] },
      { cells: ['EOD', 'End of Day', 'By close of business'] },
      { cells: ['EOM', 'End of Month', 'Last day of month'] },
      { cells: ['EOW', 'End of Week', 'Friday'] },
      { cells: ['COB', 'Close of Business', 'End of work day'] },
      { cells: ['ASAP', 'As Soon As Possible', 'Urgent'] },
      { cells: ['FYI', 'For Your Information', 'Just letting you know'] },
      { cells: ['TBD', 'To Be Determined', 'Not decided yet'] },
      { cells: ['N/A', 'Not Applicable', 'Does not apply'] },
      { cells: ['TBC', 'To Be Confirmed', 'Awaiting confirmation'] },
    ]),
    insightBox(
      'Pro Tip',
      p('When you see an abbreviation you don\'t recognize, ask! It\'s better to ask than to guess wrong. Save this list and refer back to it often.')
    )
  )
}

function restaurantFinancesTaxesContent() {
  return doc(
    h(1, 'Restaurant Finances & Taxes'),
    p('How money flows, US taxes, tips, and payment processing.'),
    h(2, 'Revenue Streams'),
    p('1. DINE-IN: Customer eats in restaurant, full margin. 2. TAKEOUT: Customer picks up, needs packaging. 3. DELIVERY (own): Restaurant employs drivers. 4. THIRD-PARTY: DoorDash, UberEats (15-30% fees!). 5. CATERING: Large orders for events. 6. OTHER: Gift cards, merchandise, private events.'),
    warningBox(
      'Third-Party Trap',
      p('A $100 DoorDash order: DoorDash fee (25%): -$25; Food cost (30%): -$30; Packaging: -$3. = $42 actual margin. vs. $100 dine-in: Food cost (30%): -$30 = $70 margin. Third-party looks like growth but kills margins.')
    ),
    h(2, 'US Sales Tax'),
    insightBox(
      'How It Works',
      p('Sales tax is collected FROM customers and paid TO the state. It\'s not restaurant revenue—it\'s money held in trust.')
    ),
    p('Example: Customer pays $50 food + $4.13 tax = $54.13. Restaurant keeps $50. Restaurant owes state $4.13.'),
    p('Tax rates by state: Texas 8.25%; California 7.25% + local; New York 8%+; Florida 6% + local; Oregon 0%.'),
    h(2, 'US Payroll Taxes'),
    p('EMPLOYEE PAYS (withheld from check): Federal Income Tax; State Income Tax; Social Security 6.2%; Medicare 1.45%.'),
    p('EMPLOYER PAYS (additional): Social Security 6.2%; Medicare 1.45%; Unemployment 1-5%.'),
    exampleBox(
      'True Cost of Labor',
      p('Server wage: $15.00/hour. + Employer taxes (~13%): $1.95. = TRUE COST: $16.95/hour. This is why Labor Cost includes taxes, not just wages.')
    ),
    h(2, 'Tips'),
    p('Customers tip 15-25% of bill. Tips belong to employees, not restaurant. Tips are TAXABLE income. Tip credit: Some states allow lower base wage if tips make up difference.'),
    table([
      { cells: ['State', 'Tipped Wage', 'Regular Wage'], header: true },
      { cells: ['Texas', '$2.13', '$7.25'] },
      { cells: ['California', '$16.00', '$16.00'] },
      { cells: ['New York', '$10.00', '$15.00'] },
      { cells: ['Florida', '$8.98', '$12.00'] },
    ]),
    h(2, 'Payment Processing Fees'),
    table([
      { cells: ['Payment Type', 'Typical Fee'], header: true },
      { cells: ['Credit Card', '2.5-3.5%'] },
      { cells: ['Debit Card', '1.5-2.5%'] },
      { cells: ['Cash', '0%'] },
      { cells: ['DoorDash', '15-30%'] },
      { cells: ['UberEats', '15-30%'] },
    ]),
    exampleBox(
      'Morning Buzz Cafe Fees',
      p('$45,000/month sales. 80% by card: $36,000. Avg fee 2.8%: $1,008/month. Annual: $12,096. That\'s real money coming off the bottom line.')
    )
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
  { title: 'POS Exports — Square', slug: 'pos-square', description: 'Pull and understand Square sales reports', estimated_minutes: 30, order_index: 8 },
  { title: 'POS Exports — Toast', slug: 'pos-toast', description: 'Pull and understand Toast sales reports', estimated_minutes: 30, order_index: 9 },
  { title: 'POS Exports — Clover', slug: 'pos-clover', description: 'Pull and understand Clover sales reports', estimated_minutes: 30, order_index: 10 },
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
  { question: 'Which of the following is typically a restaurant revenue stream?', options: [{ id: 'a', text: 'Equipment depreciation' }, { id: 'b', text: 'Food sales' }, { id: 'c', text: 'Loan proceeds' }, { id: 'd', text: 'Owner capital contributions' }], correct_option_id: 'b', explanation: 'Food sales are a primary revenue stream; beverage, delivery, and catering are other common streams.', order_index: 1 },
  { question: 'What does "ticket average" mean?', options: [{ id: 'a', text: 'Number of items per order' }, { id: 'b', text: 'Revenue per guest or per transaction' }, { id: 'c', text: 'Average labor cost per hour' }, { id: 'd', text: 'Average food cost per plate' }], correct_option_id: 'b', explanation: 'Ticket average is the revenue per guest or per check, used to measure sales performance.', order_index: 2 },
  { question: 'For accurate period reporting, which accounting basis is preferred?', options: [{ id: 'a', text: 'Cash only' }, { id: 'b', text: 'Accrual' }, { id: 'c', text: 'Hybrid with no rules' }, { id: 'd', text: 'Tax basis only' }], correct_option_id: 'b', explanation: 'Accrual accounting matches revenue and expenses to the period earned or incurred, giving a clearer P&L.', order_index: 3 },
  { question: 'What is "prime cost" in a restaurant P&L?', options: [{ id: 'a', text: 'Revenue minus comps' }, { id: 'b', text: 'COGS plus labor' }, { id: 'c', text: 'Gross profit minus rent' }, { id: 'd', text: 'Net profit before tax' }], correct_option_id: 'b', explanation: 'Prime cost is the sum of COGS and labor—the two largest controllable costs.', order_index: 4 },
  { question: 'What are "comps" in restaurant reporting?', options: [{ id: 'a', text: 'Competitor analysis' }, { id: 'b', text: 'Complimentary items given to guests that reduce revenue' }, { id: 'c', text: 'Computer system costs' }, { id: 'd', text: 'Compensation expense' }], correct_option_id: 'b', explanation: 'Comps are complimentary items (e.g., free dessert) that reduce revenue and are often tracked separately.', order_index: 5 },
  { question: 'Which cost category typically appears first below revenue on a restaurant P&L?', options: [{ id: 'a', text: 'Labor' }, { id: 'b', text: 'Rent' }, { id: 'c', text: 'Cost of Goods Sold' }, { id: 'd', text: 'Marketing' }], correct_option_id: 'c', explanation: 'COGS is deducted from revenue first to arrive at gross profit; then labor and other expenses follow.', order_index: 6 },
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
]

// Module 3: Reading a Restaurant P&L
const QUIZ_3: QuizQ[] = [
  { question: 'How is Gross Profit calculated?', options: [{ id: 'a', text: 'Revenue minus labor' }, { id: 'b', text: 'Revenue minus COGS' }, { id: 'c', text: 'Revenue minus rent' }, { id: 'd', text: 'Net profit plus taxes' }], correct_option_id: 'b', explanation: 'Gross Profit = Revenue − COGS. It is the margin after direct product cost.', order_index: 0 },
  { question: 'What is included in "labor" on a typical restaurant P&L?', options: [{ id: 'a', text: 'Only server wages' }, { id: 'b', text: 'Wages, payroll taxes, and benefits for FOH, BOH, and management' }, { id: 'c', text: 'Only management salaries' }, { id: 'd', text: 'Contractor payments only' }], correct_option_id: 'b', explanation: 'Labor typically includes all wages, taxes, and benefits for front and back of house and management.', order_index: 1 },
  { question: 'What is the target range for prime cost % of revenue?', options: [{ id: 'a', text: '20–30%' }, { id: 'b', text: '40–50%' }, { id: 'c', text: '55–65%' }, { id: 'd', text: '80–90%' }], correct_option_id: 'c', explanation: 'Prime cost (COGS + labor) as a percentage of revenue is typically targeted at 55–65%.', order_index: 2 },
  { question: 'What does EBITDA represent?', options: [{ id: 'a', text: 'Revenue minus COGS only' }, { id: 'b', text: 'Earnings before interest, taxes, depreciation, and amortization' }, { id: 'c', text: 'Total assets minus liabilities' }, { id: 'd', text: 'Net profit after tax' }], correct_option_id: 'b', explanation: 'EBITDA is a measure of operating profitability before financing and non-cash charges.', order_index: 3 },
  { question: 'Which section of the P&L appears first?', options: [{ id: 'a', text: 'Operating expenses' }, { id: 'b', text: 'Revenue' }, { id: 'c', text: 'Labor' }, { id: 'd', text: 'Net profit' }], correct_option_id: 'b', explanation: 'Revenue is the top line; then COGS, labor, and other expenses are deducted to get to net profit.', order_index: 4 },
  { question: 'A rising food cost % with flat sales might indicate:', options: [{ id: 'a', text: 'Nothing important' }, { id: 'b', text: 'Portion creep, waste, or pricing issues' }, { id: 'c', text: 'Lower labor cost' }, { id: 'd', text: 'Higher profit' }], correct_option_id: 'b', explanation: 'Rising food cost % often points to over-portioning, waste, or cost increases not passed to menu prices.', order_index: 5 },
  { question: 'Net profit on a P&L is:', options: [{ id: 'a', text: 'Revenue only' }, { id: 'b', text: 'The bottom line after all revenue and expenses' }, { id: 'c', text: 'Same as gross profit' }, { id: 'd', text: 'Prime cost minus COGS' }], correct_option_id: 'b', explanation: 'Net profit is the final line after all revenue and expenses have been accounted for.', order_index: 6 },
]

// Module 4: KPI Fundamentals
const QUIZ_4: QuizQ[] = [
  { question: "You're reviewing Morning Buzz Cafe's P&L. They show $4,590 food cost on $15,300 food sales. What's their food cost % and is it healthy?", options: [{ id: 'a', text: '30% — this is exactly on target for a cafe' }, { id: 'b', text: '30% — this is high; cafes should be under 25%' }, { id: 'c', text: '15% — this is too low; something is miscoded' }, { id: 'd', text: '45% — this is dangerously high' }], correct_option_id: 'a', explanation: 'Food cost % = 4,590 ÷ 15,300 = 30%. For a cafe with pastries and breakfast items, 28–32% is on target.', order_index: 0 },
  { question: 'Beverage cost % is often lower than food cost % because:', options: [{ id: 'a', text: 'Beverages are not important' }, { id: 'b', text: 'Alcohol and drinks typically have higher margins' }, { id: 'c', text: 'It is never lower' }, { id: 'd', text: 'Labor is included in beverage cost' }], correct_option_id: 'b', explanation: 'Beverage, especially alcohol, often has higher margins, so beverage cost % targets are commonly 18–24%.', order_index: 1 },
  { question: 'Labor cost % target is typically in what range?', options: [{ id: 'a', text: '10–15%' }, { id: 'b', text: '28–35%' }, { id: 'c', text: '50–55%' }, { id: 'd', text: '70–80%' }], correct_option_id: 'b', explanation: 'Labor cost as a percentage of revenue is often targeted at 28–35% depending on concept.', order_index: 2 },
  { question: 'Why is prime cost % considered a critical KPI?', options: [{ id: 'a', text: 'It is the only metric that matters' }, { id: 'b', text: 'COGS + labor are the two largest controllable costs; above 65% leaves little for rent and other expenses' }, { id: 'c', text: 'It replaces the need for a P&L' }, { id: 'd', text: 'It measures revenue only' }], correct_option_id: 'b', explanation: 'Prime cost is the sum of the two biggest controllable costs; keeping it in the 55–65% range is key to profitability.', order_index: 3 },
  { question: 'Benchmarks for a quick-service restaurant (QSR) vs full-service are:', options: [{ id: 'a', text: 'Always the same' }, { id: 'b', text: 'Often different (e.g., labor and food cost %)' }, { id: 'c', text: 'Only used for cafes' }, { id: 'd', text: 'Not recommended' }], correct_option_id: 'b', explanation: 'QSR, full-service, cafes, and bars have different cost structures; use type-appropriate benchmarks.', order_index: 4 },
  { question: 'How do you calculate food cost %?', options: [{ id: 'a', text: 'Food COGS ÷ Total revenue' }, { id: 'b', text: '(Food COGS ÷ Food revenue) × 100' }, { id: 'c', text: 'Food revenue ÷ Labor' }, { id: 'd', text: 'Total COGS × 100' }], correct_option_id: 'b', explanation: 'Food cost % = (Food COGS ÷ Food Revenue) × 100, so it measures food margin on food sales only.', order_index: 5 },
  { question: 'A prime cost % of 70% suggests:', options: [{ id: 'a', text: 'Excellent performance' }, { id: 'b', text: 'Only 30% left for rent, utilities, and other expenses—a red flag' }, { id: 'c', text: 'Revenue is too high' }, { id: 'd', text: 'Labor is not included' }], correct_option_id: 'b', explanation: 'Prime cost above 65% leaves very little for occupancy and operating expenses; investigate COGS and labor.', order_index: 6 },
]

// Module 5: QBO Essentials
const QUIZ_5: QuizQ[] = [
  { question: 'What is the first step after connecting a bank feed in QBO?', options: [{ id: 'a', text: 'Delete old transactions' }, { id: 'b', text: 'Categorize transactions to the correct COA accounts' }, { id: 'c', text: 'Close the account' }, { id: 'd', text: 'Ignore uncategorized items' }], correct_option_id: 'b', explanation: 'Transactions must be categorized to the correct accounts so the P&L and balance sheet are accurate.', order_index: 0 },
  { question: 'Where do you run a Profit and Loss report in QBO?', options: [{ id: 'a', text: 'Banking' }, { id: 'b', text: 'Reports → Profit and Loss' }, { id: 'c', text: 'Settings only' }, { id: 'd', text: 'Invoice screen' }], correct_option_id: 'b', explanation: 'Reports → Profit and Loss (or P&L) is where you run the income statement.', order_index: 1 },
  { question: 'Why is the report date range important?', options: [{ id: 'a', text: 'It does not matter' }, { id: 'b', text: 'It must match the period you are closing (e.g., week or month)' }, { id: 'c', text: 'Only the start date matters' }, { id: 'd', text: 'QBO ignores the range' }], correct_option_id: 'b', explanation: 'The date range determines which transactions are included; it should match your close period.', order_index: 2 },
  { question: 'What can cause duplicate transactions in QBO?', options: [{ id: 'a', text: 'Nothing' }, { id: 'b', text: 'Importing POS data and also entering manually, or importing twice' }, { id: 'c', text: 'Reconciling the account' }, { id: 'd', text: 'Using accrual basis' }], correct_option_id: 'b', explanation: 'Duplicate entries often come from multiple sources for the same sales or from double imports.', order_index: 3 },
  { question: 'Which report shows assets, liabilities, and equity at a point in time?', options: [{ id: 'a', text: 'P&L' }, { id: 'b', text: 'Balance Sheet' }, { id: 'c', text: 'Sales by Customer' }, { id: 'd', text: 'Aged Receivables' }], correct_option_id: 'b', explanation: 'The Balance Sheet report shows the balance sheet equation at a given date.', order_index: 4 },
  { question: 'Before closing a period, you should:', options: [{ id: 'a', text: 'Skip reconciliation' }, { id: 'b', text: 'Reconcile bank feeds and clear uncategorized transactions' }, { id: 'c', text: 'Delete old reports' }, { id: 'd', text: 'Only check revenue' }], correct_option_id: 'b', explanation: 'Reconciling and clearing uncategorized items ensures the books are complete and consistent.', order_index: 5 },
  { question: 'Exporting a report to Excel is useful for:', options: [{ id: 'a', text: 'Deleting data' }, { id: 'b', text: 'Sharing, analysis, and client deliverables' }, { id: 'c', text: 'Changing QBO data' }, { id: 'd', text: 'Backing up the entire company' }], correct_option_id: 'b', explanation: 'Export to Excel or PDF for further analysis and to send to clients or reviewers.', order_index: 6 },
]

// Module 6–10 quiz arrays (abbreviated for length; full set in file)
const QUIZ_6: QuizQ[] = [
  { question: 'Where do you find the Sales Summary in Square?', options: [{ id: 'a', text: 'Only in the mobile app' }, { id: 'b', text: 'Reports or Analytics section of the Square Dashboard' }, { id: 'c', text: 'In QuickBooks only' }, { id: 'd', text: 'Square does not have reports' }], correct_option_id: 'b', explanation: 'Sales Summary and other reports are in the Reports/Analytics area of the Square dashboard.', order_index: 0 },
  { question: 'Before importing Square data, you should verify:', options: [{ id: 'a', text: 'Nothing' }, { id: 'b', text: 'Totals tie to the dashboard, date range is correct, and refunds/comps are handled consistently' }, { id: 'c', text: 'Only the start date' }, { id: 'd', text: 'Only gross sales' }], correct_option_id: 'b', explanation: 'Verifying totals, dates, and treatment of refunds/comps prevents errors in the books.', order_index: 1 },
  { question: 'What does "net sales" in Square typically represent?', options: [{ id: 'a', text: 'Only tips' }, { id: 'b', text: 'Gross sales minus discounts, refunds, and comps' }, { id: 'c', text: 'Tax collected' }, { id: 'd', text: 'Fees paid to Square' }], correct_option_id: 'b', explanation: 'Net sales is usually gross sales less discounts, refunds, and comps—the amount to recognize as revenue.', order_index: 2 },
  { question: 'Why match the Square export date range to your close period?', options: [{ id: 'a', text: 'It is not important' }, { id: 'b', text: 'So revenue and period match and KPIs are correct' }, { id: 'c', text: 'Only for annual closes' }, { id: 'd', text: 'Square requires it' }], correct_option_id: 'b', explanation: 'Matching the date range ensures the right sales are in the right period for the P&L and KPIs.', order_index: 3 },
  { question: 'Square export format commonly used for bookkeeping is:', options: [{ id: 'a', text: 'PDF only' }, { id: 'b', text: 'CSV' }, { id: 'c', text: 'Image file' }, { id: 'd', text: 'Word document' }], correct_option_id: 'b', explanation: 'CSV is the standard format for importing into QBO or spreadsheets.', order_index: 4 },
  { question: 'What could cause a mismatch between Square and QBO revenue?', options: [{ id: 'a', text: 'Nothing' }, { id: 'b', text: 'Wrong date range, duplicate import, or different treatment of refunds' }, { id: 'c', text: 'Using accrual in QBO' }, { id: 'd', text: 'Having more than one location' }], correct_option_id: 'b', explanation: 'Date range, duplicate entries, and refund/comps handling are common causes of variance.', order_index: 5 },
  { question: 'Tips in Square reports should be:', options: [{ id: 'a', text: 'Ignored' }, { id: 'b', text: 'Understood and mapped correctly (e.g., to labor or tip liability)' }, { id: 'c', text: 'Added to food revenue' }, { id: 'd', text: 'Deleted from export' }], correct_option_id: 'b', explanation: 'Tips affect labor reporting and tip liability; they should be mapped according to your COA and policy.', order_index: 6 },
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
  { question: 'Which restaurant type typically has the HIGHEST profit margin?', options: [{ id: 'a', text: 'Full Service Restaurant' }, { id: 'b', text: 'Cafe/Coffee Shop' }, { id: 'c', text: 'Fast Casual' }, { id: 'd', text: 'Casual Dining' }], correct_option_id: 'b', explanation: 'Cafes run 10-15% margins due to high-margin beverages (coffee) and lower labor costs.', order_index: 0 },
  { question: 'A restaurant does $100,000/month in revenue. Approximately how much is NET PROFIT?', options: [{ id: 'a', text: '$25,000' }, { id: 'b', text: '$15,000' }, { id: 'c', text: '$5,000' }, { id: 'd', text: '$1,000' }], correct_option_id: 'c', explanation: 'Typical restaurant net profit is only 3-7%. $100K × 5% = $5,000.', order_index: 1 },
  { question: 'What percentage of restaurants fail within the first year?', options: [{ id: 'a', text: '20%' }, { id: 'b', text: '40%' }, { id: 'c', text: '60%' }, { id: 'd', text: '80%' }], correct_option_id: 'c', explanation: '60% fail in year 1, 80% within 5 years. Financial visibility helps prevent this.', order_index: 2 },
  { question: 'Morning Buzz Cafe is a coffee shop. What percentage of their sales is likely beverages?', options: [{ id: 'a', text: '20-30%' }, { id: 'b', text: '40-50%' }, { id: 'c', text: '60-70%' }, { id: 'd', text: '80-90%' }], correct_option_id: 'c', explanation: 'Coffee shops are beverage-focused, typically 60-70% of revenue from drinks.', order_index: 3 },
  { question: 'Which ownership structure provides liability protection and is most common for restaurants?', options: [{ id: 'a', text: 'Sole Proprietorship' }, { id: 'b', text: 'Partnership' }, { id: 'c', text: 'LLC' }, { id: 'd', text: 'Franchise' }], correct_option_id: 'c', explanation: 'LLCs separate business from personal assets while being simpler than corporations.', order_index: 4 },
  { question: 'A franchise restaurant owner must pay what to the franchisor?', options: [{ id: 'a', text: 'Nothing after initial purchase' }, { id: 'b', text: 'Royalty fees of 4-8% of sales' }, { id: 'c', text: '50% of all profits' }, { id: 'd', text: 'Only marketing costs' }], correct_option_id: 'b', explanation: 'Franchisees pay ongoing royalties (4-8%) plus often marketing fees.', order_index: 5 },
]

// New Module 2: Restaurant Roles & Operations (8 questions)
const QUIZ_ROLES_OPS: QuizQ[] = [
  { question: "A 'Line Cook' works in which area of the restaurant?", options: [{ id: 'a', text: 'Front of House' }, { id: 'b', text: 'Back of House' }, { id: 'c', text: 'Management' }, { id: 'd', text: 'Delivery' }], correct_option_id: 'b', explanation: 'Line cooks work in the kitchen (Back of House), preparing food on their station.', order_index: 0 },
  { question: "The restaurant term '86'd' means:", options: [{ id: 'a', text: 'Table 86 is ready' }, { id: 'b', text: 'Item costs $86' }, { id: 'c', text: 'Item is out of stock' }, { id: 'd', text: '86 covers served' }], correct_option_id: 'c', explanation: "'86 the salmon' means salmon is out of stock and unavailable to order.", order_index: 1 },
  { question: "When is a restaurant's highest revenue period typically?", options: [{ id: 'a', text: 'Breakfast (6-10 AM)' }, { id: 'b', text: 'Lunch (11 AM - 2 PM)' }, { id: 'c', text: 'Dinner (5-10 PM)' }, { id: 'd', text: 'Late night (10 PM - 2 AM)' }], correct_option_id: 'c', explanation: 'Dinner service typically generates the highest revenue with higher check averages.', order_index: 2 },
  { question: 'Which vendor type provides food products like produce, meat, and dry goods?', options: [{ id: 'a', text: 'POS provider' }, { id: 'b', text: 'Broadline distributor' }, { id: 'c', text: 'Payroll company' }, { id: 'd', text: 'Linen service' }], correct_option_id: 'b', explanation: 'Sysco and US Foods are broadline distributors providing most food products.', order_index: 3 },
  { question: "A 'Cover' in restaurant terminology means:", options: [{ id: 'a', text: 'A table cloth' }, { id: 'b', text: 'One guest served' }, { id: 'c', text: 'A shift worked' }, { id: 'd', text: 'A menu item' }], correct_option_id: 'b', explanation: "'We did 200 covers tonight' means 200 guests were served.", order_index: 4 },
  { question: 'FOH staff typically includes all EXCEPT:', options: [{ id: 'a', text: 'Servers' }, { id: 'b', text: 'Bartenders' }, { id: 'c', text: 'Line Cooks' }, { id: 'd', text: 'Hosts' }], correct_option_id: 'c', explanation: 'Line cooks are BOH (Back of House). FOH is customer-facing staff.', order_index: 5 },
  { question: "Your senior asks you to 'check the COGS on the P&L'. What are they asking?", options: [{ id: 'a', text: 'Check the customer reviews' }, { id: 'b', text: 'Check the Cost of Goods Sold on the Profit & Loss statement' }, { id: 'c', text: 'Check the payment processing fees' }, { id: 'd', text: 'Check the payroll taxes' }], correct_option_id: 'b', explanation: 'COGS = Cost of Goods Sold, P&L = Profit & Loss Statement. They want you to review the food/beverage costs.', order_index: 6 },
  { question: "A client emails: 'Please send the MTD report by EOD ET.' What does this mean?", options: [{ id: 'a', text: 'Monthly report by end of year' }, { id: 'b', text: 'Month-to-Date report by End of Day Eastern Time' }, { id: 'c', text: 'Master data by tomorrow' }, { id: 'd', text: 'Management report by evening' }], correct_option_id: 'b', explanation: 'MTD = Month to Date, EOD = End of Day, ET = Eastern Time. They want this month\'s data by close of business New York time.', order_index: 7 },
]

// New Module 3: Restaurant Finances & Taxes (7 questions)
const QUIZ_FINANCES_TAXES: QuizQ[] = [
  { question: "DoorDash deposits $5,000 into the client's bank. The original order total was $6,500. What happened to the missing $1,500?", options: [{ id: 'a', text: 'Bank error' }, { id: 'b', text: 'DoorDash commission fee' }, { id: 'c', text: 'Customer refund' }, { id: 'd', text: 'Sales tax' }], correct_option_id: 'b', explanation: 'Third-party apps take 15-30% commission. $6,500 × 23% ≈ $1,500 fee.', order_index: 0 },
  { question: 'US Sales tax collected from customers is:', options: [{ id: 'a', text: 'Restaurant revenue' }, { id: 'b', text: 'Money held in trust for the state' }, { id: 'c', text: 'Profit' }, { id: 'd', text: 'An expense' }], correct_option_id: 'b', explanation: 'Sales tax belongs to the state. Restaurants collect it and remit it—it\'s not their money.', order_index: 1 },
  { question: "A server's hourly wage is $15. With employer taxes (~13%), what's the TRUE cost per hour?", options: [{ id: 'a', text: '$15.00' }, { id: 'b', text: '$16.95' }, { id: 'c', text: '$19.50' }, { id: 'd', text: '$22.00' }], correct_option_id: 'b', explanation: '$15 × 1.13 = $16.95. Labor cost includes employer-paid taxes.', order_index: 2 },
  { question: 'In Texas, the minimum wage for tipped employees is:', options: [{ id: 'a', text: '$7.25' }, { id: 'b', text: '$5.00' }, { id: 'c', text: '$2.13' }, { id: 'd', text: '$15.00' }], correct_option_id: 'c', explanation: 'Texas uses federal tipped minimum of $2.13/hour (tip credit state).', order_index: 3 },
  { question: 'Credit card processing typically costs a restaurant:', options: [{ id: 'a', text: '0-1%' }, { id: 'b', text: '2.5-3.5%' }, { id: 'c', text: '10-15%' }, { id: 'd', text: '25-30%' }], correct_option_id: 'b', explanation: 'Credit cards cost 2.5-3.5%, while third-party delivery is 15-30%.', order_index: 4 },
  { question: 'A $100 DoorDash order vs $100 dine-in order. Which has higher margin for the restaurant?', options: [{ id: 'a', text: 'DoorDash (more convenient)' }, { id: 'b', text: "They're the same" }, { id: 'c', text: 'Dine-in (no platform fee)' }, { id: 'd', text: 'Depends on the day' }], correct_option_id: 'c', explanation: 'Dine-in has no 15-30% platform fee. $100 dine-in ≈ $70 margin. $100 DoorDash ≈ $42 margin.', order_index: 5 },
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
