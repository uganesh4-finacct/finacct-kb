/**
 * Track 4: Payroll for Restaurants — 5 draft modules + quizzes
 * Run: npm run seed:payroll
 * Re-run safe: upserts modules, replaces quiz questions per module
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Prerequisite migration: 20250705210000_training_tracks_payroll.sql
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'
import { PAYROLL_TRACK } from '../lib/training-tracks'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ——— TipTap helpers ———
type TipTapNode = { type: string; content?: TipTapNode[]; text?: string; attrs?: Record<string, unknown>; marks?: { type: string; attrs?: Record<string, unknown> }[] }

function p(text: string): TipTapNode {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}

function h(level: 1 | 2 | 3, text: string): TipTapNode {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text }] }
}

function doc(...nodes: TipTapNode[]): { type: 'doc'; content: TipTapNode[] } {
  return { type: 'doc', content: nodes }
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

function scenarioBox(...content: TipTapNode[]): TipTapNode {
  return { type: 'scenarioBox', attrs: {}, content }
}

function checkpointBoxItems(items: string[]): TipTapNode {
  return { type: 'checkpointBox', attrs: { items }, content: [] }
}

function kpiCards(cards: { value: string; label: string; sublabel?: string; status?: 'good' | 'warning' | 'bad' | 'neutral' }[]): TipTapNode {
  return { type: 'kpiCard', attrs: { cards }, content: [] }
}

function stepFlowSteps(steps: { title: string; description?: string }[]): TipTapNode {
  return { type: 'stepFlow', attrs: { steps }, content: [] }
}

function bulletList(...items: TipTapNode[][]): TipTapNode {
  return { type: 'bulletList', content: items.map((c) => ({ type: 'listItem', content: c })) }
}

function pLink(before: string, linkText: string, href: string, after = ''): TipTapNode {
  return {
    type: 'paragraph',
    content: [
      { type: 'text', text: before },
      { type: 'text', marks: [{ type: 'link', attrs: { href, target: '_blank' } }], text: linkText },
      { type: 'text', text: after },
    ],
  }
}

const KB_PAYROLL_REGISTER = '/section/pos-guides/5-7-payroll-register-export-guide'

// ——— Module 4.1 ———
function payrollAnatomyContent() {
  return doc(
    h(1, '4.1 Restaurant Payroll Anatomy'),
    h(2, 'The Stakes'),
    p('Labor is typically the largest controllable expense after COGS — often 28–35% of revenue. When wages, payroll taxes, and benefits are miscoded or blended into a single account, the owner loses visibility into FOH vs BOH vs management labor and the FinAcct360 KPI dashboard shows wrong percentages. That is how a profitable week looks broken on paper.'),
    h(2, 'The Teaching'),
    p('Restaurant payroll has three distinct cost layers, and each belongs in its own 6000s account range — never mixed into wage accounts.'),
    table([
      { cells: ['Layer', 'What It Is', 'Typical Accounts', 'KPI Impact'], header: true },
      { cells: ['Wages', 'Gross pay by role before withholdings', '6110 Server, 6210 Kitchen, 6310 GM', 'foh_labor, boh_labor, mgmt_labor'] },
      { cells: ['Employer Payroll Taxes', 'Employer portion of FICA, FUTA, SUTA', '6400 Payroll Taxes', 'Included in total labor %'] },
      { cells: ['Benefits', 'Health, 401k match, workers comp', '6500 Benefits', 'Included in total labor %'] },
    ]),
    insightBox(
      'Why taxes and benefits never go in wage accounts',
      p('Employee tax withholdings (federal, state, FICA) are liabilities — not expenses. Only the employer\'s share of payroll taxes hits the P&L. Coding employer FICA into Server Wages inflates foh_labor and makes the GM think servers are overpaid when the real issue is a mapping error.')
    ),
    p('FinAcct360 splits wages by operational role because owners manage FOH and BOH differently. Front of house (servers, hosts, bartenders) maps to foh_labor. Back of house (line cooks, prep, dish) maps to boh_labor. Salaried GMs and kitchen managers map to mgmt_labor. The platform KPI fields read directly from these account mappings — garbage in, garbage out.'),
    kpiCards([
      { value: '12–18%', label: 'FOH Labor', sublabel: 'foh_labor KPI', status: 'good' },
      { value: '10–14%', label: 'BOH Labor', sublabel: 'boh_labor KPI', status: 'good' },
      { value: '5–8%', label: 'Management', sublabel: 'mgmt_labor KPI', status: 'neutral' },
      { value: '28–35%', label: 'Total Labor', sublabel: 'All 6000s labor', status: 'warning' },
    ]),
    warningBox(
      'Common miscoding',
      p('Putting payroll taxes in 6110 Server Wages, booking owner draws as kitchen wages, or lumping all staff into one "Payroll Expense" account breaks every labor KPI on the dashboard.')
    ),
    h(2, 'A Real Case — Olive & Vine (Full Service)'),
    p('Olive & Vine runs $100,000 in weekly net revenue. Their payroll register for the close week shows:'),
    table([
      { cells: ['Category', 'Amount', 'Correct Account'], header: true },
      { cells: ['Server & host wages', '$9,200', '6110 / 6130 (FOH)'] },
      { cells: ['Bartender wages', '$3,100', '6120 (FOH)'] },
      { cells: ['Line cook & prep wages', '$8,400', '6210 (BOH)'] },
      { cells: ['Dishwasher wages', '$1,600', '6220 (BOH)'] },
      { cells: ['GM & AGM salaries', '$4,200', '6310 (Management)'] },
      { cells: ['Employer payroll taxes', '$2,050', '6400 Payroll Taxes'] },
      { cells: ['Health insurance (employer)', '$980', '6500 Benefits'] },
    ]),
    p('FOH labor = $12,300 (12.3%), BOH = $10,000 (10.0%), Management = $4,200 (4.2%). Total labor = $29,530 (29.5%) — inside the 28–35% band. If the bookkeeper had dumped employer taxes into server wages, FOH would show 14.3% and the owner would cut server shifts that were not the problem.'),
    h(2, 'Try It'),
    scenarioBox(
      p('Classify each payroll register line to the correct account type (Wages — FOH, Wages — BOH, Wages — Management, Employer Taxes, or Benefits):'),
      bulletList(
        [p('Barback hourly pay → Wages — FOH')],
        [p('Sous chef salary → Wages — BOH (or Management if salaried KM)')],
        [p('Employer FICA match → Employer Taxes (6400)')],
        [p('401k employer match → Benefits (6500)')],
        [p('Host stand hourly → Wages — FOH')],
        [p('Federal withholding from server paycheck → NOT an expense (liability)')],
      ),
      p('If you classified employer taxes or benefits as wages, redo the mapping before posting the journal entry.')
    ),
    proTipBox('Quiz prep', p('Remember: wages by role feed foh_labor / boh_labor / mgmt_labor. Employer taxes and benefits are separate 6000s accounts. Employee withholdings are balance-sheet liabilities.')),
    checkpointBoxItems([
      'I can separate wages, employer taxes, and benefits',
      'I know which KPI field each wage category feeds',
      'I understand why employee withholdings are not P&L expenses',
    ])
  )
}

// ——— Module 4.2 ———
function payrollTipsContent() {
  return doc(
    h(1, '4.2 Tips: The Liability That Looks Like Revenue'),
    h(2, 'The Stakes'),
    p('Tips flow through the bank deposit and POS reports, so they look like revenue to an untrained eye. They are not. Tips belong to staff — the restaurant is only the conduit. Mishandling tips inflates revenue, breaks POS-to-bank reconciliation, and creates payroll liability surprises that can exceed a week of profit at a high-volume bar.'),
    h(2, 'The Teaching'),
    p('When a guest tips on a credit card, the POS records the sale and the tip. The processor deposits sales plus tips together. The restaurant owes those tips to employees — that obligation is Tips Payable (liability, typically 2200/2440), not revenue.'),
    table([
      { cells: ['Tip Type', 'Cash Flow', 'Accounting Treatment'], header: true },
      { cells: ['Credit card tips', 'Deposit includes tips; paid out on payroll or tip pool', 'Dr Cash / Cr Tips Payable when collected; Dr Tips Payable / Cr Cash or Payroll when paid'] },
      { cells: ['Cash tips', 'Stay in server pockets or tip pool jar', 'Often no cash movement through books until declared for payroll; still track Tips Payable if house collects and redistributes'] },
      { cells: ['Auto-gratuity / service charge', 'Contractual charge, not voluntary tip', 'May be house revenue if policy + disclosure meet IRS rules — confirm with client'] },
    ]),
    insightBox(
      'The tip journal entry pattern',
      p('Weekly tip accrual from POS tip report: Debit Tips Paid (6150 expense offset) or allocate to wage accounts, Credit Tips Payable. When payroll runs tips: Debit Tips Payable, Credit Cash/Payroll Clearing. Tips paid through payroll reduce the liability — they are not new revenue when the deposit arrived.')
    ),
    warningBox(
      'POS-to-bank reconciliation trap',
      p('If you book the full processor deposit as revenue, tips are double-counted when you also record sales from the POS. The deposit will always be higher than POS net sales by the tip amount. That variance is expected — it is not "missing money."')
    ),
    h(2, 'A Real Case — Smokey\'s Bar & Grill'),
    p('Smokey\'s processes $68,000 in weekly food and beverage sales. Credit card tips totaled $11,200 (16.5% tip rate — normal for a sports bar). The bank deposit from the processor was $76,400 including tips.'),
    exampleBox(
      'What Smokey\'s accountant should record',
      p('POS sales journal: $68,000 revenue (not $76,400). Tips accrual: increase Tips Payable by $11,200 when earned. On payday, Gusto pays $10,800 in charged tips to staff (some cash tips kept by servers): Debit Tips Payable $10,800, Credit Payroll Clearing. Reconciliation: deposit ($76,400) = net sales collected + tips passed through. Any unexplained gap usually means tips were booked as revenue.')
    ),
    kpiCards([
      { value: '$68,000', label: 'Net Sales', status: 'neutral' },
      { value: '$11,200', label: 'CC Tips (Liability)', sublabel: 'Not revenue', status: 'warning' },
      { value: '$76,400', label: 'Processor Deposit', sublabel: 'Sales + tips', status: 'neutral' },
    ]),
    h(2, 'Try It'),
    scenarioBox(
      p('Morning Buzz cafe had $42,000 in sales and $3,150 in credit card tips. The owner asks why the bank deposit is $43,800 but the POS says $42,000.'),
      p('Draft your answer in three sentences: (1) identify what the $1,800 difference likely is, (2) state the correct liability account, (3) explain what would happen to labor % if tips were coded as beverage revenue.')
    ),
    proTipBox('Quiz prep', p('Tips = liability until paid to staff. CC tips ride deposits. Mishandling tips breaks POS-to-bank tie-out and inflates revenue.')),
    checkpointBoxItems([
      'I can explain why tips are not revenue',
      'I know the basic tip accrual and payout entries',
      'I can explain deposit vs POS sales variances caused by tips',
    ])
  )
}

// ——— Module 4.3 ———
function payrollOvertimeContent() {
  return doc(
    h(1, '4.3 Overtime & Labor Cost Analysis'),
    h(2, 'The Stakes'),
    p('When labor percentage breaks the 25–35% band, overtime is the first place a sharp accountant looks. OT premium is pure margin erosion — every hour at 1.5× hits the P&L with no additional revenue. Owners need overtime_cost isolated in the KPI dashboard, not buried in line cook wages.'),
    h(2, 'The Teaching'),
    p('FinAcct360 maps overtime to account 6600 (or the overtime_cost KPI field) so it is visible separately from regular wages. Total labor % = all 6000s labor including OT, taxes, and benefits, divided by net revenue.'),
    table([
      { cells: ['Metric', 'Formula', 'Target / Signal'], header: true },
      { cells: ['Labor %', 'Total Labor ÷ Net Revenue', '28–35%; investigate if >35%'] },
      { cells: ['Overtime Cost', 'OT premium hours × 0.5 × rate (or OT wages from register)', 'Spike = scheduling problem'] },
      { cells: ['FOH / BOH / Mgmt split', 'Each category ÷ Revenue', 'Identifies which department drove the miss'] },
    ]),
    insightBox(
      'Scheduled vs actual hours',
      p('Compare the scheduling export (Toast, Square, 7shifts) to payroll register hours. If scheduled was 420 hours but payroll shows 468, the 48-hour gap is overtime, call-outs covered by doubles, or clock fraud. The fix is operational — but you cannot advise the owner until the data is split correctly.')
    ),
    warningBox(
      'Exam pattern: labor $0 in an open week',
      p('If labor shows $0 on a partial-week or open-period dashboard, that is always a data problem — payroll not imported, wrong pay-period dates, or accrual missing. Never tell an owner labor is "great" when the field is empty. Flag it on the tie-out checklist.')
    ),
    h(2, 'A Real Case — Morning Buzz Cafe'),
    p('Morning Buzz budgeted 32% labor on $50,000 weekly revenue ($16,000). Actual payroll landed at $20,000 (40%). Food cost was on target at 25%. Prime cost blew past 60%.'),
    exampleBox(
      'Overtime investigation',
      p('Drill-down: FOH regular wages $7,200; OT premium $1,400 (6600); BOH regular $6,800; OT $1,600; taxes & benefits $2,000. OT alone added 6 points to labor % ($3,000 / $50,000). Two baristas called out Saturday — remaining staff worked 22 OT hours. Recommendation: fix scheduling, not menu prices.')
    ),
    kpiCards([
      { value: '40%', label: 'Actual Labor %', status: 'bad' },
      { value: '32%', label: 'Budget Labor %', status: 'good' },
      { value: '$3,000', label: 'Overtime Cost', sublabel: 'overtime_cost KPI', status: 'bad' },
    ]),
    h(2, 'Try It'),
    scenarioBox(
      p('Brij Foods (QSR) had $28,000 revenue and $9,800 total labor. OT was $1,200 of that total. Calculate: (1) labor percentage, (2) what labor % would have been without OT, (3) whether the location is inside the 28–35% band either way.')
    ),
    proTipBox('Quiz prep', p('OT first when labor breaks band. overtime_cost is its own KPI. Labor $0 on open week = data problem, always.')),
    checkpointBoxItems([
      'I know the labor % target band (28–35%)',
      'I can interpret overtime_cost separately from regular wages',
      'I will flag $0 labor on open weeks as a data issue',
    ])
  )
}

// ——— Module 4.4 ———
function payrollRegisterContent() {
  return doc(
    h(1, '4.4 Reading a Payroll Register'),
    h(2, 'The Stakes'),
    p('The payroll register is the source document for every labor dollar on the P&L. Misread one column — gross vs net, employee vs employer taxes — and you will post a journal entry that looks balanced but destroys labor KPIs. Every FinAcct360 weekly close that includes payroll starts here.'),
    h(2, 'The Teaching'),
    p('A payroll register (Gusto, ADP, Paychex) is a line-by-line breakdown of a pay run. Read it top to bottom: employee sections, then employer taxes, then totals.'),
    stepFlowSteps([
      { title: 'Gross wages', description: 'Hours × rate + tips + bonuses — expense by role (6110, 6210, etc.)' },
      { title: 'Employee taxes withheld', description: 'Federal, state, FICA withheld from paycheck — liabilities (2410, 2420, 2430), NOT expense' },
      { title: 'Deductions', description: 'Health, 401k employee portion — reduce net pay, often liabilities' },
      { title: 'Net pay', description: 'What hits the employee\'s bank — matches payroll cash outflow' },
      { title: 'Employer taxes', description: 'Employer FICA, FUTA, SUTA — expense in 6400' },
      { title: 'Employer benefits', description: 'Employer health match, etc. — expense in 6500' },
    ]),
    table([
      { cells: ['Register Column', 'P&L or Balance Sheet', 'FinAcct360 Account'], header: true },
      { cells: ['Gross — Servers', 'P&L Expense', '6110 Server Wages'] },
      { cells: ['Gross — Kitchen', 'P&L Expense', '6210 Kitchen Wages'] },
      { cells: ['Employee Federal WH', 'Liability', '2410 Federal Tax Payable'] },
      { cells: ['Employer FICA', 'P&L Expense', '6400 Payroll Taxes'] },
      { cells: ['Net Pay', 'Cash outflow', '1010 Payroll Checking'] },
      { cells: ['Tips paid on check', 'Reduces Tips Payable', '2200 / 6150'] },
    ]),
    insightBox(
      'The payroll run journal entry (simplified)',
      p('Debit wage accounts (gross by department), Debit 6400 (employer taxes), Debit 6500 (employer benefits). Credit liability accounts for withholdings, Credit Tips Payable for tips paid, Credit Cash/Payroll Clearing for net pay and tax remittances. Debits must equal credits — if you put employee withholdings in wages, the entry still "balances" but the P&L is wrong.')
    ),
    pLink(
      'For export steps from Gusto and ADP, field-by-field mapping, and reconciliation checks, see the KB article ',
      'Payroll Register Export Guide',
      KB_PAYROLL_REGISTER,
      ' in POS & Software Guides.'
    ),
    h(2, 'A Real Case — Brij Foods (QSR)'),
    p('Brij Foods runs biweekly payroll through Gusto. One pay run shows: Kitchen gross $14,200, Shift lead gross $3,800, Employer FICA $1,374, Employee taxes withheld $3,210 (liability), Net pay $12,640, Tips paid on payroll $2,180.'),
    exampleBox(
      'Mapping walkthrough',
      p('Expense side: $14,200 → 6210, $3,800 → 6210 or 6310 (lead role), $1,374 → 6400. Tips: Dr Tips Payable $2,180 (not revenue). Liabilities: $3,210 employee taxes credited to withholding accounts. Cash: net pay + any taxes remitted from the payroll account. Cross-check: register total employer cost should match sum of wage + 6400 + 6500 debits.')
    ),
    h(2, 'Try It'),
    scenarioBox(
      p('Given a register line "Employer SUTA — $186," where does it go? What about "Employee Medicare — $142 withheld"? Write the account number and whether it is expense or liability for each.')
    ),
    proTipBox('Quiz prep', p('Gross wages → 6000s by role. Employee withholdings → liabilities. Employer taxes → 6400. Net pay → cash.')),
    checkpointBoxItems([
      'I can read gross, net, employee taxes, and employer taxes on a register',
      'I know employee withholdings are not employer expense',
      'I can build a basic payroll journal entry from a register',
    ])
  )
}

// ——— Module 4.5 ———
function payrollWeeklyCloseContent() {
  return doc(
    h(1, '4.5 Payroll in the Weekly Close'),
    h(2, 'The Stakes'),
    p('Payroll timing kills more weekly closes than POS issues. Pay periods rarely align with Sunday close. Post payroll on the wrong week and labor % swings 10 points — the owner makes staffing decisions on fiction. Accruals, reversals, and tie-out discipline are what separate a clean close from a rework Saturday.'),
    h(2, 'The Teaching'),
    p('In the FinAcct360 weekly rhythm, payroll lands after POS sales are booked and before prime cost is finalized. Standard sequence:'),
    stepFlowSteps([
      { title: 'Import POS sales', description: 'Revenue for the close week (Sun–Sat or client fiscal week)' },
      { title: 'Accrue earned wages', description: 'If pay period crosses week-end, accrue days worked in the close week' },
      { title: 'Post payroll register', description: 'When pay run processes, map to 6000s; reverse accrual if used' },
      { title: 'Reconcile payroll cash', description: 'Bank withdrawals = net pay + tax remittances from payroll account' },
      { title: 'Tie-out checklist', description: 'Labor accounts tie to register; Tips Payable reasonable; OT in 6600' },
    ]),
    insightBox(
      'Accrued payroll when periods cross week/month ends',
      p('Olive & Vine pays biweekly. Close week ends Saturday; pay run covers Mon–Sun including three days of the prior close week. Accrue those three days: Debit wage accounts, Credit 2310 Accrued Payroll. When the register posts, reverse the accrual and book actuals.')
    ),
    table([
      { cells: ['Tie-Out Check', 'What Good Looks Like', 'Red Flag'], header: true },
      { cells: ['Register ↔ QBO labor', 'Within $50 rounding', 'Hundreds off — wrong period or missing class'] },
      { cells: ['Payroll cash ↔ Net pay + taxes', 'Matches within timing', 'Extra withdrawal — duplicate JE'] },
      { cells: ['Tips Payable balance', 'Trends with tip volume', 'Negative or zero at high-tip bar'] },
      { cells: ['OT in 6600', 'Matches register OT line', 'OT buried in kitchen wages'] },
    ]),
    warningBox(
      'Common payroll miscodings to spot',
      bulletList(
        [p('Employer taxes coded to wage accounts → inflates foh_labor / boh_labor')],
        [p('Owner draw or guaranteed payment coded as line cook wages → BOH labor looks catastrophic')],
        [p('1099 contractor payments in payroll wages → should be 7100+ contractor expense, not 6000s')],
        [p('Payroll for wrong week posted → labor % spikes or drops vs trend')],
      )
    ),
    h(2, 'A Real Case — Olive & Vine (Pay Period Crosses Month End)'),
    p('Month-end close week: Sat Jan 31. Pay run Feb 3 covers Jan 20–Feb 2. Four days (Jan 28–31) belong to January close. Accrue $6,400 in wages + $490 employer taxes to January. Feb 3: reverse accrual, post full register to correct weeks by day-split or full period per client policy.'),
    exampleBox(
      'Reversal entry pattern',
      p('Accrual (Jan 31): Dr 6210/6110 $6,400, Dr 6400 $490, Cr 2310 $6,890. Reversal (Feb 3): reverse lines, then post actual payroll per allocation. Document in close notes so next month\'s reviewer sees the bridge.')
    ),
    h(2, 'Try It'),
    scenarioBox(
      p('Smokey\'s weekly close is done but payroll has not arrived. Labor shows $0. List three checklist actions and one sentence you would send the client. Include the phrase "data problem" in your internal flag note.')
    ),
    proTipBox('Quiz prep', p('Accrue when periods cross closes. Reverse when register posts. Watch for taxes in wages, owner pay in labor, contractors in payroll.')),
    checkpointBoxItems([
      'I know where payroll fits in the weekly close sequence',
      'I can explain accrued payroll and reversals',
      'I can spot common payroll miscodings on the tie-out checklist',
    ])
  )
}

const MODULE_CONTENT_FNS = [
  payrollAnatomyContent,
  payrollTipsContent,
  payrollOvertimeContent,
  payrollRegisterContent,
  payrollWeeklyCloseContent,
]

const PAYROLL_MODULES = [
  {
    title: 'Restaurant Payroll Anatomy',
    slug: 'payroll-restaurant-anatomy',
    module_code: '4.1',
    description: 'Track 4 — Wages vs taxes vs benefits; FOH/BOH/management split and KPI mapping',
    estimated_minutes: 25,
    order_index: 14,
  },
  {
    title: 'Tips: The Liability That Looks Like Revenue',
    slug: 'payroll-tips-liability',
    module_code: '4.2',
    description: 'Track 4 — Tip flow, liabilities, journal entries, and POS-to-bank reconciliation',
    estimated_minutes: 25,
    order_index: 15,
  },
  {
    title: 'Overtime & Labor Cost Analysis',
    slug: 'payroll-overtime-labor-analysis',
    module_code: '4.3',
    description: 'Track 4 — overtime_cost KPI, labor % bands, scheduled vs actual, data flags',
    estimated_minutes: 25,
    order_index: 16,
  },
  {
    title: 'Reading a Payroll Register',
    slug: 'payroll-reading-register',
    module_code: '4.4',
    description: 'Track 4 — Register exports, column mapping to 6000s, payroll journal entries',
    estimated_minutes: 25,
    order_index: 17,
  },
  {
    title: 'Payroll in the Weekly Close',
    slug: 'payroll-weekly-close',
    module_code: '4.5',
    description: 'Track 4 — Accruals, reversals, tie-out checklist, common miscodings',
    estimated_minutes: 25,
    order_index: 18,
  },
]

// ——— Quiz types ———
interface QuizQ {
  question: string
  options: { id: string; text: string }[]
  correct_option_id: string
  explanation: string
  order_index: number
  variant_group?: string
}

const QUIZ_4_1: QuizQ[] = [
  { question: 'Why should employer payroll taxes never be coded into server wage accounts?', options: [{ id: 'a', text: 'They are revenue' }, { id: 'b', text: 'They inflate foh_labor and distort KPI dashboards' }, { id: 'c', text: 'IRS prohibits it' }, { id: 'd', text: 'They are always cash items only' }], correct_option_id: 'b', explanation: 'Employer taxes belong in 6400. Putting them in wages breaks the foh_labor KPI.', order_index: 0 },
  { question: 'Employee federal tax withheld from paychecks is recorded as:', options: [{ id: 'a', text: 'Payroll expense in 6000s' }, { id: 'b', text: 'A liability until remitted to the IRS' }, { id: 'c', text: 'Revenue offset' }, { id: 'd', text: 'Owner equity' }], correct_option_id: 'b', explanation: 'Withholdings are liabilities (2410 etc.), not employer expense.', order_index: 1 },
  { question: 'Which FinAcct360 KPI field maps to back-of-house wages?', options: [{ id: 'a', text: 'foh_labor' }, { id: 'b', text: 'boh_labor' }, { id: 'c', text: 'mgmt_labor' }, { id: 'd', text: 'overtime_cost' }], correct_option_id: 'b', explanation: 'BOH roles (kitchen, prep, dish) feed boh_labor.', order_index: 2 },
  { question: 'Morning Buzz has $50,000 revenue and $20,000 total labor. What is labor %?', options: [{ id: 'a', text: '25%' }, { id: 'b', text: '40%' }, { id: 'c', text: '35%' }, { id: 'd', text: '20%' }], correct_option_id: 'b', explanation: '$20,000 ÷ $50,000 = 40%.', order_index: 3, variant_group: '4.1-labor-pct' },
  { question: 'Olive & Vine has $80,000 revenue and $24,000 total labor. What is labor %?', options: [{ id: 'a', text: '30%' }, { id: 'b', text: '24%' }, { id: 'c', text: '35%' }, { id: 'd', text: '40%' }], correct_option_id: 'a', explanation: '$24,000 ÷ $80,000 = 30%.', order_index: 4, variant_group: '4.1-labor-pct' },
  { question: 'Health insurance employer match should post to:', options: [{ id: 'a', text: '6110 Server Wages' }, { id: 'b', text: '6500 Benefits' }, { id: 'c', text: '4000 Revenue' }, { id: 'd', text: '2200 Tips Payable' }], correct_option_id: 'b', explanation: 'Employer benefits are separate from wage accounts.', order_index: 5 },
  { question: 'GM salary belongs in which KPI category?', options: [{ id: 'a', text: 'foh_labor' }, { id: 'b', text: 'boh_labor' }, { id: 'c', text: 'mgmt_labor' }, { id: 'd', text: 'Food cost' }], correct_option_id: 'c', explanation: 'Management salaries map to mgmt_labor.', order_index: 6 },
  { question: 'Total labor target as % of revenue is typically:', options: [{ id: 'a', text: '10–15%' }, { id: 'b', text: '28–35%' }, { id: 'c', text: '45–55%' }, { id: 'd', text: '60–70%' }], correct_option_id: 'b', explanation: 'FinAcct360 uses 28–35% as the labor band for most restaurant types.', order_index: 7 },
  { question: 'Brij Foods: Total labor $10,800 and revenue $28,000. What is total labor %?', options: [{ id: 'a', text: '38.6%' }, { id: 'b', text: '28.6%' }, { id: 'c', text: '32.1%' }, { id: 'd', text: '25.0%' }], correct_option_id: 'a', explanation: '$10,800 ÷ $28,000 = 38.6%.', order_index: 8, variant_group: '4.1-total-labor' },
  { question: 'Smokey\'s: FOH $8,000, BOH $6,500, Mgmt $2,000, Taxes $1,100, Benefits $600, Revenue $45,000. Total labor %?', options: [{ id: 'a', text: '40.4%' }, { id: 'b', text: '32.2%' }, { id: 'c', text: '38.0%' }, { id: 'd', text: '28.0%' }], correct_option_id: 'a', explanation: 'Total = $18,200; $18,200 ÷ $45,000 = 40.4%.', order_index: 9, variant_group: '4.1-total-labor' },
  { question: 'Mixing wages and employer taxes in one account primarily breaks:', options: [{ id: 'a', text: 'Inventory counts' }, { id: 'b', text: 'Role-based labor KPIs on the platform' }, { id: 'c', text: 'Sales tax filing' }, { id: 'd', text: 'Gift card tracking' }], correct_option_id: 'b', explanation: 'KPI fields depend on clean 6000s mapping by role and cost type.', order_index: 10 },
  { question: 'Dishwasher hourly pay should map to:', options: [{ id: 'a', text: '6110 Server Wages' }, { id: 'b', text: '6220 Dishwasher / BOH wages' }, { id: 'c', text: '6400 Payroll Taxes' }, { id: 'd', text: '5100 Food Cost' }], correct_option_id: 'b', explanation: 'Dishwashers are BOH labor.', order_index: 11 },
]

const QUIZ_4_2: QuizQ[] = [
  { question: 'Credit card tips collected by the restaurant are:', options: [{ id: 'a', text: 'Revenue' }, { id: 'b', text: 'A liability owed to staff' }, { id: 'c', text: 'COGS' }, { id: 'd', text: 'Owner equity' }], correct_option_id: 'b', explanation: 'Tips belong to employees; the house holds them in Tips Payable.', order_index: 0 },
  { question: 'Why does a processor deposit often exceed POS net sales?', options: [{ id: 'a', text: 'Processor theft' }, { id: 'b', text: 'Tips are included in the deposit but are not sales revenue' }, { id: 'c', text: 'Sales tax is revenue' }, { id: 'd', text: 'POS is always wrong' }], correct_option_id: 'b', explanation: 'Deposits include tips passed through; POS sales exclude tip liability.', order_index: 1 },
  { question: 'Tips paid to staff through payroll should:', options: [{ id: 'a', text: 'Be recorded as new revenue' }, { id: 'b', text: 'Reduce Tips Payable liability' }, { id: 'c', text: 'Go to food cost' }, { id: 'd', text: 'Be ignored' }], correct_option_id: 'b', explanation: 'Debit Tips Payable when tips are paid out.', order_index: 2 },
  { question: 'Smokey\'s: POS sales $68,000, CC tips $11,200. Expected processor deposit (ignoring fees)?', options: [{ id: 'a', text: '$68,000' }, { id: 'b', text: '$79,200' }, { id: 'c', text: '$56,800' }, { id: 'd', text: '$11,200' }], correct_option_id: 'b', explanation: 'Sales + tips = $79,200 before processor fees.', order_index: 3, variant_group: '4.2-deposit' },
  { question: 'Morning Buzz: POS sales $42,000, CC tips $3,150. Expected gross deposit before fees?', options: [{ id: 'a', text: '$45,150' }, { id: 'b', text: '$38,850' }, { id: 'c', text: '$42,000' }, { id: 'd', text: '$3,150' }], correct_option_id: 'a', explanation: '$42,000 + $3,150 = $45,150.', order_index: 4, variant_group: '4.2-deposit' },
  { question: 'Booking the full bank deposit as sales revenue will:', options: [{ id: 'a', text: 'Understate revenue' }, { id: 'b', text: 'Overstate revenue and break POS-to-bank reconciliation' }, { id: 'c', text: 'Have no effect' }, { id: 'd', text: 'Reduce tips payable correctly' }], correct_option_id: 'b', explanation: 'Tips must be liability, not sales.', order_index: 5 },
  { question: 'Cash tips that servers keep (not turned in) are often:', options: [{ id: 'a', text: 'Booked as house revenue' }, { id: 'b', text: 'Not in house cash until declared for payroll/tip reporting' }, { id: 'c', text: 'COGS' }, { id: 'd', text: 'Always in Tips Payable' }], correct_option_id: 'b', explanation: 'Cash tips may not flow through house books until payroll reporting.', order_index: 6 },
  { question: 'Tips Payable is what type of account?', options: [{ id: 'a', text: 'Expense' }, { id: 'b', text: 'Liability' }, { id: 'c', text: 'Revenue' }, { id: 'd', text: 'Asset' }], correct_option_id: 'b', explanation: 'Tips Payable (2200/2440) is a liability until paid.', order_index: 7 },
  { question: 'If tips are coded as beverage revenue, beverage cost % will:', options: [{ id: 'a', text: 'Improve artificially' }, { id: 'b', text: 'Look worse (higher sales denominator mismatch)' }, { id: 'c', text: 'Stay the same' }, { id: 'd', text: 'Become zero' }], correct_option_id: 'b', explanation: 'Misclassified tips distort revenue and cost percentages.', order_index: 8 },
  { question: 'Olive & Vine auto-gratuity on large parties may be:', options: [{ id: 'a', text: 'Always a tip liability' }, { id: 'b', text: 'House revenue if policy and disclosure meet IRS rules — verify with client' }, { id: 'c', text: 'COGS' }, { id: 'd', text: 'Never recorded' }], correct_option_id: 'b', explanation: 'Service charges vs tips depend on policy; confirm before coding.', order_index: 9 },
  { question: 'The tip accrual from POS typically credits:', options: [{ id: 'a', text: 'Food Sales' }, { id: 'b', text: 'Tips Payable' }, { id: 'c', text: 'Cash only' }, { id: 'd', text: 'Payroll Taxes' }], correct_option_id: 'b', explanation: 'Credit Tips Payable when tips are earned/collected.', order_index: 10 },
  { question: 'A bar with high CC tips showing zero Tips Payable likely has:', options: [{ id: 'a', text: 'Perfect processes' }, { id: 'b', text: 'Tips booked as revenue or missing accrual' }, { id: 'c', text: 'No tips' }, { id: 'd', text: 'Low sales' }], correct_option_id: 'b', explanation: 'High-tip concepts should carry a Tips Payable balance.', order_index: 11 },
]

const QUIZ_4_3: QuizQ[] = [
  { question: 'When labor % breaks the 28–35% band, the first place to investigate is often:', options: [{ id: 'a', text: 'Food vendor prices' }, { id: 'b', text: 'Overtime cost' }, { id: 'c', text: 'Rent' }, { id: 'd', text: 'Marketing' }], correct_option_id: 'b', explanation: 'OT premium erodes margin quickly; check overtime_cost KPI.', order_index: 0 },
  { question: 'Labor showing $0 on an open week dashboard indicates:', options: [{ id: 'a', text: 'Perfect labor control' }, { id: 'b', text: 'A data problem — payroll not imported or wrong period' }, { id: 'c', text: 'No staff scheduled' }, { id: 'd', text: 'Revenue is zero' }], correct_option_id: 'b', explanation: 'Always flag missing payroll data; never interpret as good performance.', order_index: 1 },
  { question: 'FinAcct360 maps overtime premium to:', options: [{ id: 'a', text: '5100 Food Cost' }, { id: 'b', text: '6600 / overtime_cost KPI' }, { id: 'c', text: '4000 Revenue' }, { id: 'd', text: '2200 Tips Payable' }], correct_option_id: 'b', explanation: 'OT should be visible separately from regular wages.', order_index: 2 },
  { question: 'Morning Buzz: Revenue $50,000, labor $20,000. Labor %?', options: [{ id: 'a', text: '40%' }, { id: 'b', text: '25%' }, { id: 'c', text: '35%' }, { id: 'd', text: '20%' }], correct_option_id: 'a', explanation: '$20k ÷ $50k = 40%.', order_index: 3, variant_group: '4.3-labor-pct' },
  { question: 'Brij Foods: Revenue $35,000, labor $10,500. Labor %?', options: [{ id: 'a', text: '30%' }, { id: 'b', text: '35%' }, { id: 'c', text: '25%' }, { id: 'd', text: '40%' }], correct_option_id: 'a', explanation: '$10,500 ÷ $35,000 = 30%.', order_index: 4, variant_group: '4.3-labor-pct' },
  { question: 'Brij Foods: Revenue $28,000, total labor $9,800 including $1,200 OT. Labor % without OT?', options: [{ id: 'a', text: '30.7%' }, { id: 'b', text: '35.0%' }, { id: 'c', text: '25.4%' }, { id: 'd', text: '40.0%' }], correct_option_id: 'a', explanation: '($9,800 − $1,200) ÷ $28,000 = 30.7%.', order_index: 5, variant_group: '4.3-ot-strip' },
  { question: 'Olive & Vine: Revenue $90,000, total labor $31,500 including $2,000 OT. Labor % without OT?', options: [{ id: 'a', text: '32.8%' }, { id: 'b', text: '35.0%' }, { id: 'c', text: '38.0%' }, { id: 'd', text: '28.0%' }], correct_option_id: 'a', explanation: '($31,500 − $2,000) ÷ $90,000 = 32.8%.', order_index: 6, variant_group: '4.3-ot-strip' },
  { question: 'Scheduled 420 hours vs payroll 468 hours suggests:', options: [{ id: 'a', text: 'OT, coverage doubles, or clock issues — investigate' }, { id: 'b', text: 'Payroll is always wrong' }, { id: 'c', text: 'Schedule is irrelevant' }, { id: 'd', text: 'Revenue will drop' }], correct_option_id: 'a', explanation: 'Hour variance drives OT and labor % misses.', order_index: 7 },
  { question: 'Target total labor % for most restaurants is:', options: [{ id: 'a', text: '28–35%' }, { id: 'b', text: '5–10%' }, { id: 'c', text: '50–60%' }, { id: 'd', text: '15–20%' }], correct_option_id: 'a', explanation: 'Standard FinAcct360 labor band.', order_index: 8 },
  { question: 'OT buried in kitchen wages hides:', options: [{ id: 'a', text: 'Food cost' }, { id: 'b', text: 'Scheduling problems from the overtime_cost KPI' }, { id: 'c', text: 'Sales tax' }, { id: 'd', text: 'Rent' }], correct_option_id: 'b', explanation: 'Isolate OT in 6600 for owner visibility.', order_index: 9 },
  { question: 'Prime cost is most directly hurt when labor spikes because:', options: [{ id: 'a', text: 'Labor is part of prime cost with COGS' }, { id: 'b', text: 'Labor is revenue' }, { id: 'c', text: 'COGS drops' }, { id: 'd', text: 'Tips increase' }], correct_option_id: 'a', explanation: 'Prime cost = COGS + labor; OT pushes both sides of the control equation.', order_index: 10 },
  { question: 'Before advising an owner to cut menu prices due to labor %, you should:', options: [{ id: 'a', text: 'Confirm payroll data is complete and OT is split out' }, { id: 'b', text: 'Ignore scheduling data' }, { id: 'c', text: 'Assume POS is wrong' }, { id: 'd', text: 'Skip tie-out' }], correct_option_id: 'a', explanation: 'Fix data integrity first — $0 labor or buried OT misleads decisions.', order_index: 11 },
]

const QUIZ_4_4: QuizQ[] = [
  { question: 'Gross wages on a payroll register post to:', options: [{ id: 'a', text: 'Liability accounts' }, { id: 'b', text: '6000s wage expense by role' }, { id: 'c', text: 'Revenue' }, { id: 'd', text: 'Inventory' }], correct_option_id: 'b', explanation: 'Gross wages are expense in the appropriate wage accounts.', order_index: 0 },
  { question: 'Employee FICA withheld from paychecks is:', options: [{ id: 'a', text: 'Employer payroll tax expense' }, { id: 'b', text: 'A liability (employee portion withheld)' }, { id: 'c', text: 'Revenue' }, { id: 'd', text: 'COGS' }], correct_option_id: 'b', explanation: 'Employee taxes withheld are liabilities until remitted.', order_index: 1 },
  { question: 'Employer FICA match on the register belongs in:', options: [{ id: 'a', text: '6110 Server Wages' }, { id: 'b', text: '6400 Payroll Taxes' }, { id: 'c', text: '4010 Food Sales' }, { id: 'd', text: '1200 Inventory' }], correct_option_id: 'b', explanation: 'Employer taxes are 6400, not wages.', order_index: 2 },
  { question: 'Net pay on the register represents:', options: [{ id: 'a', text: 'Total revenue' }, { id: 'b', text: 'Cash paid to employees after withholdings' }, { id: 'c', text: 'Employer tax expense' }, { id: 'd', text: 'Food cost' }], correct_option_id: 'b', explanation: 'Net pay is what employees receive; ties to payroll cash.', order_index: 3 },
  { question: 'Brij Foods register: Kitchen gross $14,200. Correct debit account?', options: [{ id: 'a', text: '6210 Kitchen Wages' }, { id: 'b', text: '6400 Payroll Taxes' }, { id: 'c', text: '2410 Federal WH' }, { id: 'd', text: '5100 Food Cost' }], correct_option_id: 'a', explanation: 'Kitchen gross → BOH wage account.', order_index: 4, variant_group: '4.4-gross-map' },
  { question: 'Olive & Vine register: Server gross $9,200. Correct debit account?', options: [{ id: 'a', text: '6110 Server Wages' }, { id: 'b', text: '6210 Kitchen' }, { id: 'c', text: '6500 Benefits' }, { id: 'd', text: '2200 Tips Payable only' }], correct_option_id: 'a', explanation: 'Server gross → FOH wage account.', order_index: 5, variant_group: '4.4-gross-map' },
  { question: 'Tips paid on payroll checks should:', options: [{ id: 'a', text: 'Increase revenue' }, { id: 'b', text: 'Debit Tips Payable (reduce liability)' }, { id: 'c', text: 'Go to food cost' }, { id: 'd', text: 'Be ignored' }], correct_option_id: 'b', explanation: 'Tips paid reduce Tips Payable.', order_index: 6 },
  { question: 'Register line "Employer SUTA $186" posts to:', options: [{ id: 'a', text: '6400 Payroll Taxes (expense)' }, { id: 'b', text: '6110 Wages' }, { id: 'c', text: 'Revenue' }, { id: 'd', text: 'Cash only, no JE' }], correct_option_id: 'a', explanation: 'Employer SUTA is employer tax expense.', order_index: 7 },
  { question: 'Register line "Employee Medicare withheld $142" posts to:', options: [{ id: 'a', text: '6400 Payroll Taxes expense' }, { id: 'b', text: 'Payroll tax liability (employee WH)' }, { id: 'c', text: '6210 Kitchen' }, { id: 'd', text: 'Owner draw' }], correct_option_id: 'b', explanation: 'Employee portion is withheld — liability, not employer expense.', order_index: 8 },
  { question: 'After posting payroll JE, debits should equal credits. If withholdings are coded as wages:', options: [{ id: 'a', text: 'The entry may balance but P&L labor will be wrong' }, { id: 'b', text: 'Nothing is wrong' }, { id: 'c', text: 'Revenue increases' }, { id: 'd', text: 'Tips disappear' }], correct_option_id: 'a', explanation: 'Balancing ≠ correct mapping.', order_index: 9 },
  { question: 'The Payroll Register Export Guide in the KB lives under:', options: [{ id: 'a', text: 'Chart of Accounts' }, { id: 'b', text: 'POS & Software Guides' }, { id: 'c', text: 'Client Education only' }, { id: 'd', text: 'Templates' }], correct_option_id: 'b', explanation: 'Article 5.7 is in pos-guides section.', order_index: 10 },
  { question: 'Cross-check after posting: register employer cost should match:', options: [{ id: 'a', text: 'Sum of wage + 6400 + 6500 debits (approx.)' }, { id: 'b', text: 'Food sales only' }, { id: 'c', text: 'Tips revenue' }, { id: 'd', text: 'Gift cards' }], correct_option_id: 'a', explanation: 'Tie register totals to labor JEs.', order_index: 11 },
]

const QUIZ_4_5: QuizQ[] = [
  { question: 'In the weekly close, payroll is typically posted:', options: [{ id: 'a', text: 'Before POS sales' }, { id: 'b', text: 'After POS sales, before prime cost is finalized' }, { id: 'c', text: 'Never' }, { id: 'd', text: 'Only annually' }], correct_option_id: 'b', explanation: 'Sales first, then payroll/accrual, then tie-out.', order_index: 0 },
  { question: 'When a pay period crosses week-end, you should often:', options: [{ id: 'a', text: 'Skip payroll' }, { id: 'b', text: 'Accrue wages for days in the close week, reverse when register posts' }, { id: 'c', text: 'Book full payroll to prior year' }, { id: 'd', text: 'Delete POS sales' }], correct_option_id: 'b', explanation: 'Accrual + reversal matches labor to the correct period.', order_index: 1 },
  { question: 'Accrued payroll is credited to:', options: [{ id: 'a', text: '2310 Accrued Payroll (liability)' }, { id: 'b', text: '4010 Food Sales' }, { id: 'c', text: '6110 Wages permanently' }, { id: 'd', text: 'Cash' }], correct_option_id: 'a', explanation: 'Accrual: Dr wages, Cr Accrued Payroll.', order_index: 2 },
  { question: '1099 contractor payments belong in:', options: [{ id: 'a', text: '6000s payroll wages' }, { id: 'b', text: 'Contractor / professional expense (7100+), not payroll wages' }, { id: 'c', text: 'Tips Payable' }, { id: 'd', text: 'Revenue' }], correct_option_id: 'b', explanation: 'Contractors are not employee payroll.', order_index: 3 },
  { question: 'Owner draw coded as line cook wages will:', options: [{ id: 'a', text: 'Inflate boh_labor incorrectly' }, { id: 'b', text: 'Reduce food cost' }, { id: 'c', text: 'Fix tips' }, { id: 'd', text: 'Lower revenue' }], correct_option_id: 'a', explanation: 'Owner/comp payments should not pollute labor KPIs.', order_index: 4 },
  { question: 'Payroll cash reconciliation compares bank withdrawals to:', options: [{ id: 'a', text: 'Net pay plus tax remittances from payroll account' }, { id: 'b', text: 'Food sales only' }, { id: 'c', text: 'Gift card liability' }, { id: 'd', text: 'Marketing invoices' }], correct_option_id: 'a', explanation: 'Cash out = net pay + remitted taxes (timing adjusted).', order_index: 5 },
  { question: 'Olive & Vine: $6,400 wages + $490 employer taxes accrued Jan 28–31. Accrual credits:', options: [{ id: 'a', text: '$6,890 to Accrued Payroll' }, { id: 'b', text: '$6,400 only' }, { id: 'c', text: 'Revenue' }, { id: 'd', text: 'Cash' }], correct_option_id: 'a', explanation: 'Total accrual = wages + employer taxes for the stub period.', order_index: 6, variant_group: '4.5-accrual' },
  { question: 'Smokey\'s: $5,200 wages + $390 employer taxes accrued for stub week. Accrual credits:', options: [{ id: 'a', text: '$5,590 to Accrued Payroll' }, { id: 'b', text: '$5,200 only' }, { id: 'c', text: 'Tips Payable' }, { id: 'd', text: 'Food cost' }], correct_option_id: 'a', explanation: '$5,200 + $390 = $5,590 accrued liability.', order_index: 7, variant_group: '4.5-accrual' },
  { question: 'Close done but payroll missing — labor $0. You should:', options: [{ id: 'a', text: 'Tell owner labor is excellent' }, { id: 'b', text: 'Flag as data problem; request register; do not finalize labor KPIs' }, { id: 'c', text: 'Delete the close' }, { id: 'd', text: 'Copy last month food cost' }], correct_option_id: 'b', explanation: 'Missing payroll = incomplete close.', order_index: 8 },
  { question: 'When full payroll posts after an accrual, you:', options: [{ id: 'a', text: 'Reverse accrual and book actuals per allocation policy' }, { id: 'b', text: 'Leave double expense' }, { id: 'c', text: 'Skip reversal' }, { id: 'd', text: 'Zero out revenue' }], correct_option_id: 'a', explanation: 'Reverse stub accrual to avoid double-counting.', order_index: 9 },
  { question: 'Register ↔ QBO labor tie-out within a few dollars is good; hundreds off suggests:', options: [{ id: 'a', text: 'Wrong period or missing JE' }, { id: 'b', text: 'Perfect close' }, { id: 'c', text: 'Tips are revenue' }, { id: 'd', text: 'Ignore' }], correct_option_id: 'a', explanation: 'Large variances need investigation.', order_index: 10 },
  { question: 'Employer taxes in wage accounts is a miscoding that tie-out should catch because:', options: [{ id: 'a', text: 'Register shows employer taxes separately from gross wages' }, { id: 'b', text: 'IRS bans wages' }, { id: 'c', text: 'POS shows it' }, { id: 'd', text: 'Banks do not cash checks' }], correct_option_id: 'a', explanation: 'Compare register employer tax lines to 6400, not wage accounts.', order_index: 11 },
]

const ALL_QUIZZES: { moduleSlug: string; questions: QuizQ[] }[] = [
  { moduleSlug: 'payroll-restaurant-anatomy', questions: QUIZ_4_1 },
  { moduleSlug: 'payroll-tips-liability', questions: QUIZ_4_2 },
  { moduleSlug: 'payroll-overtime-labor-analysis', questions: QUIZ_4_3 },
  { moduleSlug: 'payroll-reading-register', questions: QUIZ_4_4 },
  { moduleSlug: 'payroll-weekly-close', questions: QUIZ_4_5 },
]

async function getTrackId(): Promise<string> {
  const { data, error } = await supabase
    .from('training_tracks')
    .select('id')
    .eq('slug', PAYROLL_TRACK.slug)
    .single()
  if (error || !data) {
    throw new Error(
      'Payroll track not found. Run migration 20250705210000_training_tracks_payroll.sql first.'
    )
  }
  return data.id
}

async function seedPayrollModules(trackId: string): Promise<Map<string, string>> {
  console.log('Upserting Track 4 payroll modules (draft)…')
  const slugToId = new Map<string, string>()

  for (let i = 0; i < PAYROLL_MODULES.length; i++) {
    const m = PAYROLL_MODULES[i]
    const content = MODULE_CONTENT_FNS[i]()
    const row = {
      ...m,
      content,
      track_id: trackId,
      is_published: false,
    }
    const { data, error } = await supabase
      .from('training_modules')
      .upsert(row, { onConflict: 'slug' })
      .select('id')
      .single()
    if (error) throw error
    if (data?.id) slugToId.set(m.slug, data.id)
    console.log(`  ✓ ${m.module_code} ${m.title} (draft)`)
  }

  console.log('')
  return slugToId
}

async function replaceQuizQuestions(slugToId: Map<string, string>) {
  console.log('Seeding quiz questions (10 per attempt, variant groups for numeric)…')
  let total = 0

  for (const { moduleSlug, questions } of ALL_QUIZZES) {
    const moduleId = slugToId.get(moduleSlug)
    if (!moduleId) {
      console.warn(`  ⚠ Module not found: ${moduleSlug}`)
      continue
    }

    const { error: delError } = await supabase.from('quiz_questions').delete().eq('module_id', moduleId)
    if (delError) throw delError

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const row = {
        module_id: moduleId,
        question: q.question,
        options: q.options,
        correct_option_id: q.correct_option_id,
        explanation: q.explanation,
        order_index: i,
        variant_group: q.variant_group ?? null,
      }
      const { error } = await supabase.from('quiz_questions').insert(row)
      if (error) throw error
      total++
    }
    const groups = new Set(questions.filter((q) => q.variant_group).map((q) => q.variant_group))
    const perAttempt = questions.length - groups.size
    console.log(`  ✓ ${moduleSlug}: ${questions.length} in bank → ${perAttempt} per quiz attempt`)
  }

  console.log(`Quiz questions done (${total} total).\n`)
}

async function main() {
  console.log('FinAcct360 — Seed Track 4: Payroll for Restaurants\n')
  try {
    const trackId = await getTrackId()
    const slugToId = await seedPayrollModules(trackId)
    await replaceQuizQuestions(slugToId)
    console.log('Payroll track seed completed.')
    console.log('Modules are DRAFT (is_published: false). Review at /admin/training before publishing.')
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

main()
