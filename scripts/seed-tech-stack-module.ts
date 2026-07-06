/**
 * Track 3: The Restaurant Tech Stack — draft module + quiz
 * Run: npm run seed:tech-stack
 *
 * Also tags pos-square, pos-toast, pos-clover with Track 3 and bumps
 * weekly-close / common-mistakes order_index to make room at 11.
 *
 * Prerequisite: 20250705220000_training_track_pos.sql
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'
import { POS_TRACK } from '../lib/training-tracks'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

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

function techStackContent() {
  return doc(
    h(1, '3.4 The Restaurant Tech Stack'),
    h(2, 'The Stakes'),
    p('A restaurant\'s books are only as clean as the software feeding them. POS drives revenue and tips. Invoice tools push COGS. Scheduling explains labor hours. Payroll posts dollars. When an owner adds tools without mapping discipline, duplicates and timing errors show up in your weekly close — not as "software problems," but as wrong food cost % and labor %.'),
    h(2, 'The Teaching'),
    p('Think of the stack in four layers. Each layer has a system-of-record rule: one path into QBO per data type.'),
    table([
      { cells: ['Layer', 'Examples', 'Feeds QBO With…'], header: true },
      { cells: ['POS (sales)', 'Square, Toast, Clover', 'Revenue, tips, discounts, payment fees'] },
      { cells: ['AP / inventory', 'MarginEdge, Ottimate, xtraCHEF', 'Bills, food & beverage COGS'] },
      { cells: ['Scheduling', '7shifts, HotSchedules', 'Analysis only — payroll is $ source of truth'] },
      { cells: ['Payroll', 'Gusto, ADP, Paychex, Toast Payroll', '6000s labor, Tips Payable, tax liabilities'] },
    ]),
    insightBox(
      'ERP exception: Restaurant365',
      p('R365 combines GL, inventory, AP, and reporting in one ERP. FinAcct360 weekly close SOP targets QBO. If a client is on R365, clarify scope before promising the standard close rhythm.')
    ),
    kpiCards([
      { value: 'POS', label: 'Revenue & tips', status: 'neutral' },
      { value: 'AP tools', label: 'COGS timing', status: 'warning' },
      { value: 'Scheduling', label: 'Labor analysis', status: 'good' },
      { value: 'Payroll', label: 'Labor dollars', status: 'neutral' },
    ]),
    stepFlowSteps([
      { title: 'POS → QBO', description: 'Sales journal matches POS net sales; tips to liability' },
      { title: 'AP tool → QBO', description: 'Bills mapped to 5100s/5200s; watch duplicates' },
      { title: 'Payroll → QBO', description: 'Register mapped to 6000s by role' },
      { title: 'Bank reconcile', description: 'Deposits and payroll cash tie to the above' },
    ]),
    warningBox(
      'One GL, one path',
      p('Never run R365 as GL while QBO still syncs the same invoices. Never run MarginEdge and manual Sysco entry without duplicate checks.')
    ),
    h(2, 'A Real Case — Brij Foods (QSR on Toast)'),
    p('Brij Foods uses Toast POS, xtraCHEF for invoices, Gusto payroll, and 7shifts scheduling. A new accountant sees three login screens and assumes three sources of truth.'),
    exampleBox(
      'How the stack fits together',
      p('Truth for revenue: Toast sales export. Truth for COGS: xtraCHEF bills in QBO (verified to vendor statements). Truth for labor dollars: Gusto payroll register. 7shifts explains why OT happened — it does not override payroll. Weekly close ties all four to the P&L and bank.')
    ),
    h(2, 'Try It'),
    scenarioBox(
      p('Morning Buzz (Square + no AP tool) asks if they should add MarginEdge. List three book impacts and two tie-out checks you would add to their close if they proceed.'),
      bulletList(
        [p('Impacts: AP sync, COGS timing from bills, vendor mapping to 5100s')],
        [p('Checks: duplicate bill detection; invoice week vs close week alignment')],
      )
    ),
    pLink(
      'Deeper reference: see KB articles ',
      '5.9–5.13 in POS & Software Guides',
      '/section/pos-guides',
      ' (drafts) for R365, AP tools, scheduling, payroll providers, and client stack conversations.'
    ),
    proTipBox('Onboarding question', p('Ask every client: POS? AP automation? Scheduling? Payroll provider? GL (QBO vs R365)? Document answers in client notes before the first close.')),
    checkpointBoxItems([
      'I can name the four layers of the restaurant tech stack',
      'I know payroll is the source of truth for labor dollars',
      'I can explain why duplicate sync paths break the close',
    ])
  )
}

interface QuizQ {
  question: string
  options: { id: string; text: string }[]
  correct_option_id: string
  explanation: string
  order_index: number
  variant_group?: string
}

const QUIZ_TECH_STACK: QuizQ[] = [
  { question: 'In the FinAcct360 stack model, which layer is the source of truth for labor dollars?', options: [{ id: 'a', text: '7shifts' }, { id: 'b', text: 'Payroll register' }, { id: 'c', text: 'POS labor report' }, { id: 'd', text: 'MarginEdge' }], correct_option_id: 'b', explanation: 'Scheduling explains hours; payroll register posts dollars.', order_index: 0 },
  { question: 'MarginEdge and Ottimate primarily sync what into QBO?', options: [{ id: 'a', text: 'POS sales' }, { id: 'b', text: 'Vendor invoices / AP' }, { id: 'c', text: 'Payroll taxes' }, { id: 'd', text: 'Gift cards' }], correct_option_id: 'b', explanation: 'AP automation tools capture invoices and push bills.', order_index: 1 },
  { question: 'Credit card tips from POS should flow to:', options: [{ id: 'a', text: 'Food revenue' }, { id: 'b', text: 'Tips Payable liability' }, { id: 'c', text: 'Payroll taxes' }, { id: 'd', text: 'COGS' }], correct_option_id: 'b', explanation: 'Tips are owed to staff — not revenue.', order_index: 2 },
  { question: 'Restaurant365 (R365) is best described as:', options: [{ id: 'a', text: 'A POS only' }, { id: 'b', text: 'A restaurant ERP (GL + inventory + AP + more)' }, { id: 'c', text: 'A payroll provider' }, { id: 'd', text: 'A bank feed' }], correct_option_id: 'b', explanation: 'R365 is a full ERP, not a QBO plugin.', order_index: 3 },
  { question: 'The biggest risk when adding an AP automation tool is:', options: [{ id: 'a', text: 'Lower food quality' }, { id: 'b', text: 'Duplicate bills and COGS timing errors in QBO' }, { id: 'c', text: 'POS shutdown' }, { id: 'd', text: 'Fewer employees' }], correct_option_id: 'b', explanation: 'Duplicate sync + wrong week coding distorts COGS %.', order_index: 4 },
  { question: 'Smokey\'s uses Toast POS + Gusto. Sales truth comes from:', options: [{ id: 'a', text: 'Gusto' }, { id: 'b', text: 'Toast sales export' }, { id: 'c', text: 'Bank deposits only' }, { id: 'd', text: '7shifts' }], correct_option_id: 'b', explanation: 'POS export drives revenue journal; bank reconciles cash.', order_index: 5 },
  { question: 'Olive & Vine on QBO adds HotSchedules. HotSchedules data is mainly used for:', options: [{ id: 'a', text: 'Posting payroll' }, { id: 'b', text: 'Scheduled vs actual labor analysis' }, { id: 'c', text: 'Food purchases' }, { id: 'd', text: 'Sales tax filing' }], correct_option_id: 'b', explanation: 'Scheduling supports analysis; payroll remains authoritative for $.', order_index: 6 },
  { question: 'Morning Buzz: POS $50,000, tips $4,000. Bank deposit includes tips. Revenue journal should be:', options: [{ id: 'a', text: '$54,000' }, { id: 'b', text: '$50,000 with tips to liability' }, { id: 'c', text: '$46,000' }, { id: 'd', text: '$4,000' }], correct_option_id: 'b', explanation: 'Book POS net sales; tips separate.', order_index: 7, variant_group: '3.4-revenue' },
  { question: 'Brij Foods: POS $28,000, tips $2,100. Revenue journal should be:', options: [{ id: 'a', text: '$28,000 with tips to liability' }, { id: 'b', text: '$30,100' }, { id: 'c', text: '$25,900' }, { id: 'd', text: '$2,100' }], correct_option_id: 'a', explanation: 'Revenue = POS sales; tips not revenue.', order_index: 8, variant_group: '3.4-revenue' },
  { question: 'Running R365 as GL and QBO with the same invoice feeds causes:', options: [{ id: 'a', text: 'Better accuracy' }, { id: 'b', text: 'Dual system of record — cleanup required' }, { id: 'c', text: 'Lower fees' }, { id: 'd', text: 'Automatic reconciliation' }], correct_option_id: 'b', explanation: 'One GL only; dual feeds duplicate or conflict.', order_index: 9 },
  { question: 'When an owner asks "should we get MarginEdge?" you should:', options: [{ id: 'a', text: 'Always say yes' }, { id: 'b', text: 'Explain book impacts and tie-out changes without deciding for them' }, { id: 'c', text: 'Refuse to discuss' }, { id: 'd', text: 'Tell them to switch POS' }], correct_option_id: 'b', explanation: 'Advisor mode: tradeoffs + close impact, not resale.', order_index: 10 },
  { question: 'xtraCHEF is most closely associated with:', options: [{ id: 'a', text: 'Toast ecosystem / invoice capture' }, { id: 'b', text: 'Square payroll' }, { id: 'c', text: 'R365 inventory only' }, { id: 'd', text: 'DoorDash exports' }], correct_option_id: 'a', explanation: 'xtraCHEF (Toast) handles invoice processing for many Toast clients.', order_index: 11 },
]

const POS_TRACK_MODULES = [
  { slug: 'pos-square', module_code: '3.1' },
  { slug: 'pos-toast', module_code: '3.2' },
  { slug: 'pos-clover', module_code: '3.3' },
]

const TECH_STACK_MODULE = {
  title: 'The Restaurant Tech Stack',
  slug: 'restaurant-tech-stack',
  module_code: '3.4',
  description: 'Track 3 — POS, AP, scheduling, payroll, and ERP landscape (awareness level)',
  estimated_minutes: 25,
  order_index: 11,
}

const ORDER_BUMPS = [
  { slug: 'weekly-close-process', order_index: 12 },
  { slug: 'common-mistakes', order_index: 13 },
]

async function getPosTrackId(): Promise<string> {
  const { data, error } = await supabase
    .from('training_tracks')
    .select('id')
    .eq('slug', POS_TRACK.slug)
    .single()
  if (error || !data) {
    throw new Error('POS track not found. Run migration 20250705220000_training_track_pos.sql first.')
  }
  return data.id
}

async function bumpModuleOrder() {
  for (const { slug, order_index } of ORDER_BUMPS) {
    const { error } = await supabase.from('training_modules').update({ order_index }).eq('slug', slug)
    if (error) console.warn(`  ⚠ Could not bump ${slug}:`, error.message)
    else console.log(`  ✓ ${slug} → order_index ${order_index}`)
  }
}

async function tagPosTrackModules(trackId: string) {
  for (const { slug, module_code } of POS_TRACK_MODULES) {
    const { error } = await supabase
      .from('training_modules')
      .update({ track_id: trackId, module_code })
      .eq('slug', slug)
    if (error) console.warn(`  ⚠ Could not tag ${slug}:`, error.message)
    else console.log(`  ✓ Tagged ${slug} as Track 3 ${module_code}`)
  }
}

async function seedTechStackModule(trackId: string): Promise<string> {
  const content = techStackContent()
  const row = {
    ...TECH_STACK_MODULE,
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
  if (!data?.id) throw new Error('No module id returned')
  console.log(`  ✓ ${TECH_STACK_MODULE.module_code} ${TECH_STACK_MODULE.title} (draft)`)
  return data.id
}

async function replaceQuiz(moduleId: string) {
  const { error: delError } = await supabase.from('quiz_questions').delete().eq('module_id', moduleId)
  if (delError) throw delError

  for (let i = 0; i < QUIZ_TECH_STACK.length; i++) {
    const q = QUIZ_TECH_STACK[i]
    const { error } = await supabase.from('quiz_questions').insert({
      module_id: moduleId,
      question: q.question,
      options: q.options,
      correct_option_id: q.correct_option_id,
      explanation: q.explanation,
      order_index: i,
      variant_group: q.variant_group ?? null,
    })
    if (error) throw error
  }
  const groups = new Set(QUIZ_TECH_STACK.filter((q) => q.variant_group).map((q) => q.variant_group))
  console.log(`  ✓ Quiz: ${QUIZ_TECH_STACK.length} in bank → ${QUIZ_TECH_STACK.length - groups.size} per attempt`)
}

async function main() {
  console.log('FinAcct360 — Seed Track 3: The Restaurant Tech Stack\n')
  try {
    const trackId = await getPosTrackId()
    console.log('Reordering modules after Track 3 insert…')
    await bumpModuleOrder()
    console.log('Tagging existing POS modules…')
    await tagPosTrackModules(trackId)
    console.log('Upserting tech stack module…')
    const moduleId = await seedTechStackModule(trackId)
    await replaceQuiz(moduleId)
    console.log('\nTech stack seed completed (draft). Review at /admin/training.')
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

main()
