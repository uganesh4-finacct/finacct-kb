/**
 * FinAcct360 Knowledge Base - Article Seed Script
 * 
 * This script seeds all 50 KB articles across 6 sections.
 * 
 * Usage:
 *   npm run seed:kb          - Add articles (skip existing)
 *   npm run seed:kb -- --clear  - Delete all and re-seed
 * 
 * Add to package.json scripts:
 *   "seed:kb": "npx ts-node scripts/seed-kb-articles.ts"
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local first (Windows-safe path), then .env as fallback
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars. Ensure .env.local has:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Check for --clear flag
const shouldClear = process.argv.includes('--clear')

// =============================================================================
// SECTION DEFINITIONS
// =============================================================================

const sections = [
  {
    id: 'chart-of-accounts',
    title: 'Chart of Accounts',
    slug: 'chart-of-accounts',
    description: 'Master COA framework for all restaurant types',
    icon: 'FileSpreadsheet',
    order_index: 0,
  },
  {
    id: 'standard-operating-procedures',
    title: 'Standard Operating Procedures',
    slug: 'standard-operating-procedures',
    description: 'Workflows and processes for restaurant accounting',
    icon: 'ClipboardList',
    order_index: 1,
  },
  {
    id: 'exception-handling',
    title: 'Exception Handling',
    slug: 'exception-handling',
    description: 'Playbooks for handling common issues and edge cases',
    icon: 'AlertTriangle',
    order_index: 2,
  },
  {
    id: 'sample-financials',
    title: 'Sample Financials',
    slug: 'sample-financials',
    description: 'P&L templates and examples by restaurant type',
    icon: 'BarChart3',
    order_index: 3,
  },
  {
    id: 'client-education',
    title: 'Client Education',
    slug: 'client-education',
    description: 'Resources to share with restaurant owners',
    icon: 'GraduationCap',
    order_index: 4,
  },
  {
    id: 'pos-guides',
    title: 'POS & Software Guides',
    slug: 'pos-guides',
    description: 'Export guides for Square, Toast, Clover, and more',
    icon: 'Monitor',
    order_index: 5,
  },
]

// =============================================================================
// HELPER: TipTap JSON Builders
// =============================================================================

const text = (content: string) => ({ type: 'text', text: content })

const heading = (level: number, content: string) => ({
  type: 'heading',
  attrs: { level },
  content: [text(content)],
})

const paragraph = (content: string) => ({
  type: 'paragraph',
  content: [text(content)],
})

const bulletList = (items: string[]) => ({
  type: 'bulletList',
  content: items.map(item => ({
    type: 'listItem',
    content: [paragraph(item)],
  })),
})

const table = (headers: string[], rows: string[][]) => ({
  type: 'table',
  content: [
    {
      type: 'tableRow',
      content: headers.map(header => ({
        type: 'tableHeader',
        content: [paragraph(header)],
      })),
    },
    ...rows.map(row => ({
      type: 'tableRow',
      content: row.map(cell => ({
        type: 'tableCell',
        content: [paragraph(cell)],
      })),
    })),
  ],
})

const insightBox = (title: string, content: string) => ({
  type: 'insightBox',
  attrs: { title },
  content: [paragraph(content)],
})

const FINACCT360_COMMUNICATION_BOX = insightBox(
  'FinAcct360 Communication Options',
  'Use these tools to communicate with clients: Chat — Quick questions, instant responses. Schedule Meeting — Complex discussions, screen sharing. Create Task — Action items with deadlines and assignments. Add Note — Internal documentation (client doesn\'t see).'
)

const warningBox = (title: string, content: string) => ({
  type: 'warningBox',
  attrs: { title },
  content: [paragraph(content)],
})

const proTipBox = (content: string) => ({
  type: 'proTipBox',
  content: [paragraph(content)],
})

const exampleBox = (title: string, content: string) => ({
  type: 'exampleBox',
  attrs: { title },
  content: [paragraph(content)],
})

const scenarioBox = (content: string) => ({
  type: 'scenarioBox',
  content: [paragraph(content)],
})

const stepFlow = (steps: { title: string; description: string }[]) => ({
  type: 'stepFlow',
  attrs: { steps, vertical: true },
})

// =============================================================================
// SECTION 1: CHART OF ACCOUNTS (12 articles)
// =============================================================================

const chartOfAccountsArticles = [
  {
    title: 'COA Master Framework',
    slug: 'coa-master-framework',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Complete FinAcct360 Chart of Accounts structure for all restaurant types',
    read_time: 8,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, 'COA Master Framework'),
        paragraph('The FinAcct360 Chart of Accounts is specifically designed for restaurant accounting. Every account maps directly to the KPIs our clients see on their dashboard.'),
        insightBox('Why Our COA Matters', 'Generic COAs don\'t work for restaurants. Our structure ensures: Prime Cost calculates correctly, Food vs Beverage costs are separated, Third-party delivery fees are visible, and Labor is broken down by department.'),
        
        heading(2, 'Account Range Overview'),
        table(
          ['Range', 'Category', 'Purpose'],
          [
            ['1000-1999', 'Assets', 'Cash, AR, inventory, equipment'],
            ['2000-2999', 'Liabilities', 'AP, credit cards, loans, accruals'],
            ['3000-3999', 'Equity', 'Owner\'s equity, retained earnings, draws'],
            ['4000-4999', 'Revenue', 'All sales categories'],
            ['5000-5999', 'Cost of Goods Sold', 'Food, beverage, packaging'],
            ['6000-6999', 'Labor', 'All payroll and related costs'],
            ['7000-7999', 'Operating Expenses', 'Rent, utilities, marketing, supplies'],
            ['8000-8999', 'Other Expenses', 'Bank fees, depreciation, interest'],
            ['9000-9999', 'Multi-Unit', 'Consolidated reporting (chains only)'],
          ]
        ),

        heading(2, 'Revenue Accounts (4000s)'),
        table(
          ['Account', 'Name', 'Description'],
          [
            ['4100', 'Food Sales', 'Dine-in and takeout food'],
            ['4110', 'Food Sales - Dine In', 'Food consumed on premises'],
            ['4120', 'Food Sales - Takeout', 'Food picked up by customer'],
            ['4130', 'Food Sales - Catering', 'Catering and events'],
            ['4200', 'Beverage Sales', 'All drink sales'],
            ['4210', 'Beer Sales', 'Draft and bottled beer'],
            ['4220', 'Wine Sales', 'Wine by glass and bottle'],
            ['4230', 'Spirits Sales', 'Liquor and cocktails'],
            ['4240', 'NA Beverage Sales', 'Soft drinks, coffee, tea'],
            ['4300', 'Third-Party Delivery', 'DoorDash, UberEats, Grubhub'],
            ['4310', 'DoorDash Sales', 'DoorDash orders'],
            ['4320', 'UberEats Sales', 'UberEats orders'],
            ['4330', 'Grubhub Sales', 'Grubhub orders'],
            ['4400', 'Other Revenue', 'Non-food/bev revenue'],
            ['4410', 'Gift Card Sales', 'Gift card purchases'],
            ['4420', 'Merchandise Sales', 'Branded items'],
            ['4500', 'Discounts', 'Negative - reduces revenue'],
            ['4510', 'Comps', 'Complimentary items'],
            ['4520', 'Employee Meals', 'Staff food allowance'],
          ]
        ),
        warningBox('Third-Party Delivery', 'ALWAYS separate third-party sales from regular food sales. The 15-30% commission fees significantly impact margins. Clients need to see this clearly.'),

        heading(2, 'COGS Accounts (5000s)'),
        table(
          ['Account', 'Name', 'Description'],
          [
            ['5100', 'Food Cost', 'All food purchases'],
            ['5110', 'Meat & Poultry', 'Beef, chicken, pork'],
            ['5120', 'Seafood', 'Fish, shellfish'],
            ['5130', 'Produce', 'Fruits, vegetables'],
            ['5140', 'Dairy', 'Milk, cheese, eggs'],
            ['5150', 'Dry Goods', 'Pasta, rice, flour'],
            ['5200', 'Beverage Cost', 'All beverage purchases'],
            ['5210', 'Beer Cost', 'Beer inventory'],
            ['5220', 'Wine Cost', 'Wine inventory'],
            ['5230', 'Spirits Cost', 'Liquor inventory'],
            ['5240', 'NA Beverage Cost', 'Soft drinks, coffee beans'],
            ['5300', 'Packaging', 'To-go containers, bags'],
            ['5400', 'Paper Goods', 'Napkins, paper towels (customer use)'],
          ]
        ),
        proTipBox('Paper goods for customer use (napkins at tables) go to 5400. Paper goods for cleaning (paper towels in kitchen) go to 7510 Cleaning Supplies.'),

        heading(2, 'Labor Accounts (6000s)'),
        table(
          ['Account', 'Name', 'Description'],
          [
            ['6100', 'FOH Labor', 'Front of house wages'],
            ['6110', 'Server Wages', 'Servers, waitstaff'],
            ['6120', 'Bartender Wages', 'Bartenders'],
            ['6130', 'Host Wages', 'Hosts, hostesses'],
            ['6140', 'Busser Wages', 'Bussers, food runners'],
            ['6200', 'BOH Labor', 'Back of house wages'],
            ['6210', 'Kitchen Wages', 'Line cooks, prep'],
            ['6220', 'Dishwasher Wages', 'Dishwashers'],
            ['6300', 'Management Labor', 'Salaried managers'],
            ['6310', 'GM Salary', 'General Manager'],
            ['6320', 'AGM Salary', 'Assistant Manager'],
            ['6400', 'Payroll Taxes', 'Employer portion'],
            ['6410', 'Social Security', 'Employer SS 6.2%'],
            ['6420', 'Medicare', 'Employer Medicare 1.45%'],
            ['6430', 'FUTA', 'Federal unemployment'],
            ['6440', 'SUTA', 'State unemployment'],
            ['6500', 'Benefits', 'Health, 401k, workers comp'],
            ['6600', 'Overtime', 'OT premium (0.5x portion only)'],
          ]
        ),
        insightBox('Overtime Recording', 'Record the base rate in regular wages (6100/6200). Only the 0.5x premium goes to 6600 Overtime. This gives accurate regular vs OT visibility.'),

        heading(2, 'Operating Expenses (7000s)'),
        table(
          ['Account', 'Name', 'Description'],
          [
            ['7100', 'Rent & Occupancy', 'Base rent, CAM, property tax'],
            ['7200', 'Utilities', 'Electric, gas, water, trash, internet'],
            ['7300', 'Marketing', 'Digital, print, local advertising'],
            ['7400', 'Technology', 'POS fees, software subscriptions'],
            ['7500', 'Supplies', 'Cleaning, office, smallwares'],
            ['7600', 'Repairs & Maintenance', 'Equipment repair, building maintenance'],
            ['7700', 'Insurance', 'General liability, property'],
            ['7800', 'Professional Services', 'Accounting, legal, consulting'],
            ['7900', 'Licenses & Permits', 'Liquor license, health permit, business license'],
          ]
        ),

        heading(2, 'Other Expenses (8000s)'),
        table(
          ['Account', 'Name', 'Description'],
          [
            ['8100', 'Bank & CC Fees', 'Bank fees, credit card processing'],
            ['8110', 'Bank Fees', 'Account fees'],
            ['8120', 'CC Processing', 'Card processing fees (2.5-3.5%)'],
            ['8200', 'Third-Party Fees', 'Delivery platform commissions'],
            ['8210', 'DoorDash Fees', 'DoorDash commission (15-30%)'],
            ['8220', 'UberEats Fees', 'UberEats commission'],
            ['8230', 'Grubhub Fees', 'Grubhub commission'],
            ['8300', 'Interest Expense', 'Loan interest'],
            ['8400', 'Depreciation', 'Asset depreciation'],
            ['8500', 'Amortization', 'Intangible amortization'],
          ]
        ),
      ],
    },
  },

  {
    title: 'Assets Accounts (1000s)',
    slug: 'assets-accounts-1000s',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Cash, AR, inventory, prepaid, fixed assets, and accumulated depreciation',
    read_time: 5,
    is_pinned: false,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Assets Accounts (1000s)'),
        paragraph('Asset accounts represent what the business owns or is owed. They appear on the balance sheet and drive cash flow classification on the Statement of Cash Flows (SCF).'),

        heading(2, 'Cash (1010-1040)'),
        paragraph('Operating and payroll checking, savings, and petty cash. Changes in cash are reconciled on the SCF.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['1010', 'Operating Checking', 'Operating'],
            ['1020', 'Payroll Checking', 'Operating'],
            ['1030', 'Savings', 'Operating'],
            ['1040', 'Petty Cash', 'Operating'],
          ]
        ),

        heading(2, 'Accounts Receivable (1100s)'),
        paragraph('Money owed to the business. Catering and gift card receivables are common in restaurants.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['1100', 'Accounts Receivable', 'Operating'],
            ['1110', 'AR - Catering', 'Operating'],
            ['1120', 'AR - Gift Cards', 'Operating'],
          ]
        ),

        heading(2, 'Inventory (1200s)'),
        paragraph('Food, beverage, and supplies on hand. Valued at cost for balance sheet.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['1200', 'Inventory', 'Operating'],
            ['1210', 'Food Inventory', 'Operating'],
            ['1220', 'Beverage Inventory', 'Operating'],
          ]
        ),
        insightBox('Inventory and SCF', 'An increase in inventory uses cash (Operating); a decrease frees cash. Restaurant inventory should be counted at least monthly for accurate COGS.'),

        heading(2, 'Prepaid Expenses (1300s)'),
        paragraph('Expenses paid in advance. As time passes, these move to expense accounts.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['1300', 'Prepaid Expenses', 'Operating'],
            ['1310', 'Prepaid Insurance', 'Operating'],
            ['1320', 'Prepaid Rent', 'Operating'],
          ]
        ),

        heading(2, 'Fixed Assets (1500s)'),
        paragraph('Equipment, furniture, and improvements. Purchases are Investing activities on the SCF.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['1500', 'Fixed Assets', 'Investing'],
            ['1510', 'Kitchen Equipment', 'Investing'],
            ['1520', 'Furniture & Fixtures', 'Investing'],
            ['1530', 'Leasehold Improvements', 'Investing'],
          ]
        ),

        heading(2, 'Accumulated Depreciation (1600)'),
        paragraph('Contra-asset that reduces fixed assets. Depreciation expense is non-cash; on SCF it is added back in Operating.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['1600', 'Accumulated Depreciation', 'Operating (add-back)'],
          ]
        ),
      ],
    },
  },

  {
    title: 'Liabilities Accounts (2000s)',
    slug: 'liabilities-accounts-2000s',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'AP, credit cards, accrued expenses, loans, and deferred revenue',
    read_time: 5,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Liabilities Accounts (2000s)'),
        paragraph('Liability accounts represent what the business owes. They appear on the balance sheet and affect Operating or Financing sections of the Statement of Cash Flows.'),

        heading(2, 'Accounts Payable (2100s)'),
        paragraph('Amounts owed to vendors for goods and services already received.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['2100', 'Accounts Payable', 'Operating'],
            ['2110', 'AP - Food Vendors', 'Operating'],
            ['2120', 'AP - Beverage Vendors', 'Operating'],
          ]
        ),

        heading(2, 'Credit Cards Payable (2200)'),
        paragraph('Outstanding credit card balances used for business expenses. Paydown is Operating.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['2200', 'Credit Cards Payable', 'Operating'],
          ]
        ),
        warningBox('Credit Card vs Expense', 'Charges go to expense accounts (e.g. 5100 Food Cost). The liability (2200) increases when you charge; it decreases when you pay the card. Don\'t double-count expenses when paying the bill.'),

        heading(2, 'Accrued Expenses (2300s)'),
        paragraph('Expenses incurred but not yet paid or invoiced.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['2300', 'Accrued Expenses', 'Operating'],
            ['2310', 'Accrued Payroll', 'Operating'],
            ['2320', 'Accrued Taxes', 'Operating'],
            ['2330', 'Accrued Interest', 'Operating'],
          ]
        ),

        heading(2, 'Loans Payable (2400s)'),
        paragraph('Debt from lenders. Principal payments are Financing on the SCF; interest is Operating.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['2400', 'Loans Payable', 'Financing'],
            ['2410', 'Line of Credit', 'Financing'],
            ['2420', 'Equipment Loans', 'Financing'],
            ['2430', 'SBA Loans', 'Financing'],
          ]
        ),
        proTipBox('When recording a loan payment: split between Interest Expense (8300) and reduction of 2400s. Only the principal portion is Financing on SCF.'),

        heading(2, 'Deferred Revenue (2500s)'),
        paragraph('Money received before revenue is earned (e.g. gift cards, deposits).'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['2500', 'Deferred Revenue', 'Operating'],
            ['2510', 'Gift Card Liability', 'Operating'],
            ['2520', 'Deposits Received', 'Operating'],
          ]
        ),

      ],
    },
  },

  {
    title: 'Equity Accounts (3000s)',
    slug: 'equity-accounts-3000s',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: "Owner's equity, retained earnings, draws, and current year earnings",
    read_time: 4,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Equity Accounts (3000s)'),
        paragraph('Equity represents ownership and accumulated results. Owner contributions and draws are Financing on the Statement of Cash Flows; net income flows through Operating.'),

        heading(2, "Owner's Equity / Capital (3100)"),
        paragraph('Capital contributed by owners. Increases are Financing (inflow).'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['3100', "Owner's Equity / Capital", 'Financing'],
          ]
        ),

        heading(2, 'Retained Earnings (3200)'),
        paragraph('Cumulative profit (or loss) from prior years. Not a source of cash flow by itself; it\'s the result of past operations.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['3200', 'Retained Earnings', '—'],
          ]
        ),
        insightBox('Closing the Books', 'Each period, net income closes into Retained Earnings (or 3900 Current Year Earnings). Retained Earnings = opening balance + prior year net income - dividends/draws.'),

        heading(2, "Owner's Draws / Distributions (3300)"),
        paragraph('Withdrawals by owners. Reduces equity and is a Financing outflow on the SCF.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['3300', "Owner's Draws / Distributions", 'Financing'],
          ]
        ),
        warningBox('Draws vs Salary', 'In pass-through entities (LLC, S-Corp), owner draws are not wages—they\'re distributions. W-2 salary to owner goes through Labor (6300s) and reduces net income.'),

        heading(2, 'Current Year Earnings (3900)'),
        paragraph('Current period net income before closing. On the SCF, net income is the starting point for Operating activities.'),
        table(
          ['Account', 'Name', 'SCF'],
          [
            ['3900', 'Current Year Earnings', 'Operating (net income)'],
          ]
        ),

      ],
    },
  },

  {
    title: 'Revenue Accounts (4000s)',
    slug: 'revenue-accounts-4000s',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Food, beverage, third-party, and other revenue account setup',
    read_time: 5,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Revenue Accounts (4000s)'),
        paragraph('All revenue accounts fall in the 4000-4999 range. This section details each account and when to use it.'),
        
        heading(2, 'Food Sales (4100-4130)'),
        paragraph('Food sales are the primary revenue driver for most restaurants. We break them down by service type to track channel performance.'),
        table(
          ['Account', 'Name', 'When to Use'],
          [
            ['4100', 'Food Sales', 'Parent account - use sub-accounts when possible'],
            ['4110', 'Food Sales - Dine In', 'Customer eats in the restaurant'],
            ['4120', 'Food Sales - Takeout', 'Customer picks up, no delivery'],
            ['4130', 'Food Sales - Catering', 'Large orders for events, parties'],
          ]
        ),
        proTipBox('If the POS doesn\'t separate dine-in from takeout, use 4100 Food Sales as the catch-all. Getting some data is better than forcing incorrect splits.'),

        heading(2, 'Beverage Sales (4200-4240)'),
        paragraph('Beverage sales have different margins than food. Bars especially need granular tracking by category.'),
        table(
          ['Account', 'Name', 'Typical Margin'],
          [
            ['4210', 'Beer Sales', '70-80% gross margin'],
            ['4220', 'Wine Sales', '65-75% gross margin'],
            ['4230', 'Spirits Sales', '80-85% gross margin'],
            ['4240', 'NA Beverage Sales', '85-90% gross margin'],
          ]
        ),
        insightBox('Pour Cost Tracking', 'For bars, tracking each beverage category separately reveals over-pouring or theft. A bar with 28% wine cost (instead of target 25%) is losing $3,000+/month on a $100K revenue bar.'),

        heading(2, 'Third-Party Delivery (4300-4340)'),
        paragraph('Third-party delivery MUST be tracked separately from regular sales because of the significant commission fees.'),
        table(
          ['Account', 'Name', 'Typical Fee'],
          [
            ['4310', 'DoorDash Sales', '15-30% commission'],
            ['4320', 'UberEats Sales', '15-30% commission'],
            ['4330', 'Grubhub Sales', '15-30% commission'],
            ['4340', 'Other Delivery Sales', 'Varies by platform'],
          ]
        ),
        warningBox('Record GROSS Sales', 'Record the full order amount the customer paid (before platform fees). The fees go to 8200 Third-Party Fees. This keeps revenue accurate and shows true fee impact.'),

        heading(2, 'Other Revenue (4400-4430)'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['4410', 'Gift Card Sales', 'Liability until redeemed - discuss with senior'],
            ['4420', 'Merchandise Sales', 'T-shirts, mugs, branded items'],
            ['4430', 'Private Events', 'Event space rental, buyouts'],
          ]
        ),

        heading(2, 'Discounts (4500-4530)'),
        paragraph('Discounts are NEGATIVE revenue accounts. They reduce total revenue rather than being expenses.'),
        table(
          ['Account', 'Name', 'When to Use'],
          [
            ['4500', 'Discounts', 'General discounts'],
            ['4510', 'Comps', 'Free items given (quality issues, VIP)'],
            ['4520', 'Employee Meals', 'Staff food allowance'],
            ['4530', 'Promotions', 'Happy hour, coupons, loyalty'],
          ]
        ),

      ],
    },
  },

  {
    title: 'COGS Accounts (5000s)',
    slug: 'cogs-accounts-5000s',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Food cost, beverage cost, packaging, and inventory accounts',
    read_time: 4,
    is_pinned: false,
    order_index: 5,
    content: {
      type: 'doc',
      content: [
        heading(1, 'COGS Accounts (5000s)'),
        paragraph('Cost of Goods Sold (COGS) represents the direct cost of items sold to customers. This is one of the most important sections for restaurant profitability.'),

        heading(2, 'What Belongs in COGS?'),
        insightBox('The Simple Test', 'If a customer takes it or consumes it, it\'s COGS. If it stays in the restaurant after the customer leaves, it\'s probably an operating expense.'),
        
        table(
          ['✅ COGS (5000s)', '❌ NOT COGS (7000s)'],
          [
            ['Burger patties', 'Kitchen cleaning supplies'],
            ['To-go containers', 'Mop and bucket'],
            ['Napkins at customer table', 'Paper towels in kitchen'],
            ['Coffee beans', 'Coffee machine repair'],
            ['Wine bottles', 'Wine glasses'],
          ]
        ),

        heading(2, 'Food Cost (5100-5160)'),
        table(
          ['Account', 'Name', 'Examples'],
          [
            ['5100', 'Food Cost', 'Parent account'],
            ['5110', 'Meat & Poultry', 'Beef, chicken, pork, turkey'],
            ['5120', 'Seafood', 'Fish, shrimp, crab, lobster'],
            ['5130', 'Produce', 'Vegetables, fruits, herbs'],
            ['5140', 'Dairy', 'Milk, cream, cheese, eggs, butter'],
            ['5150', 'Dry Goods', 'Pasta, rice, flour, spices, canned goods'],
            ['5160', 'Bakery', 'Bread, rolls, pastries (purchased)'],
          ]
        ),

        heading(2, 'Beverage Cost (5200-5240)'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['5200', 'Beverage Cost', 'Parent account'],
            ['5210', 'Beer Cost', 'Kegs, bottles, cans'],
            ['5220', 'Wine Cost', 'Wine bottles, bag-in-box'],
            ['5230', 'Spirits Cost', 'Liquor bottles'],
            ['5240', 'NA Beverage Cost', 'Coffee, tea, soda syrup, juices'],
          ]
        ),
        proTipBox('Soda syrup for fountain drinks goes to 5240. The CO2 for carbonation goes to 7500 Supplies (it\'s equipment-related, not consumed by customer).'),

        heading(2, 'Packaging (5300-5320)'),
        paragraph('Packaging has grown significantly with delivery. Track it carefully.'),
        table(
          ['Account', 'Name', 'Examples'],
          [
            ['5300', 'Packaging', 'Parent account'],
            ['5310', 'Food Packaging', 'To-go boxes, foil, plastic containers'],
            ['5320', 'Beverage Packaging', 'Cups, lids, straws, sleeves'],
          ]
        ),

        heading(2, 'Common Categorization Mistakes'),
        table(
          ['Item', 'Wrong Account', 'Correct Account'],
          [
            ['Cleaning chemicals', '5100 Food Cost', '7510 Cleaning Supplies'],
            ['Kitchen equipment repair', '5100 Food Cost', '7610 Equipment Repair'],
            ['To-go containers', '7500 Supplies', '5310 Food Packaging'],
            ['Uniforms', '5100 Food Cost', '7500 Supplies'],
            ['Ice machine', '5100 Food Cost', '1500 Equipment (asset)'],
          ]
        ),

      ],
    },
  },

  {
    title: 'Labor Accounts (6000s)',
    slug: 'labor-accounts-6000s',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'FOH, BOH, management, benefits, and payroll taxes',
    read_time: 6,
    is_pinned: false,
    order_index: 6,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Labor Accounts (6000s)'),
        paragraph('Labor is typically the second-largest expense for restaurants (after COGS). Breaking it down by department helps identify staffing issues.'),

        heading(2, 'Why We Separate Labor by Department'),
        insightBox('Department Visibility', 'If labor is just one number, you can\'t tell if you\'re overstaffed in the kitchen or the front. Separation reveals where to focus.'),

        heading(2, 'FOH Labor (6100s)'),
        paragraph('Front of House staff are customer-facing. Many receive tips.'),
        table(
          ['Account', 'Name', 'Typical Pay'],
          [
            ['6110', 'Server Wages', 'Hourly + tips'],
            ['6120', 'Bartender Wages', 'Hourly + tips'],
            ['6130', 'Host Wages', 'Hourly'],
            ['6140', 'Busser Wages', 'Hourly + tip share'],
            ['6150', 'Food Runner Wages', 'Hourly + tip share'],
          ]
        ),

        heading(2, 'BOH Labor (6200s)'),
        paragraph('Back of House staff work in the kitchen. They typically don\'t receive tips.'),
        table(
          ['Account', 'Name', 'Typical Pay'],
          [
            ['6210', 'Kitchen Wages', 'Hourly (line cooks, prep)'],
            ['6220', 'Dishwasher Wages', 'Hourly'],
          ]
        ),

        heading(2, 'Management (6300s)'),
        table(
          ['Account', 'Name', 'Typical Pay'],
          [
            ['6310', 'GM Salary', 'Salary (exempt)'],
            ['6320', 'AGM Salary', 'Salary (exempt)'],
            ['6330', 'Kitchen Manager', 'Salary (exempt)'],
          ]
        ),

        heading(2, 'Payroll Taxes (6400s)'),
        paragraph('These are the EMPLOYER portion of payroll taxes. Employee withholdings don\'t show here.'),
        table(
          ['Account', 'Name', 'Rate'],
          [
            ['6410', 'Social Security', '6.2% of wages up to cap'],
            ['6420', 'Medicare', '1.45% of all wages'],
            ['6430', 'FUTA', '0.6% (first $7,000 per employee)'],
            ['6440', 'SUTA', 'Varies by state (1-5%)'],
          ]
        ),
        warningBox('Don\'t Mix Up Tax Types', 'Employee-paid taxes (withheld from paycheck) are liabilities, not expenses. Only employer-paid taxes go in 6400s.'),

        heading(2, 'Benefits (6500s)'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['6510', 'Health Insurance', 'Employer contribution'],
            ['6520', 'Workers Compensation', 'Required insurance'],
            ['6530', '401k Match', 'Employer match portion'],
          ]
        ),

        heading(2, 'Overtime (6600)'),
        paragraph('This is tricky! Only record the 0.5x PREMIUM here, not the full overtime pay.'),
        exampleBox('Overtime Example', 'Employee works 45 hours at $15/hour. First 40 hours: $600 → goes to 6110 Server Wages. Next 5 hours at 1.5x: $112.50 total. The base $75 (5 × $15) → goes to 6110. The premium $37.50 (5 × $7.50) → goes to 6600 Overtime. This way, you see true overtime COST, not inflated wage numbers.'),

      ],
    },
  },

  {
    title: 'Operating Expenses (7000s)',
    slug: 'operating-expenses-7000s',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Rent, utilities, marketing, supplies, and other operating costs',
    read_time: 5,
    is_pinned: false,
    order_index: 7,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Operating Expenses (7000s)'),
        paragraph('Operating expenses are the costs of running the restaurant that aren\'t directly tied to food/beverage or labor.'),

        heading(2, 'Rent & Occupancy (7100s)'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['7110', 'Base Rent', 'Monthly rent payment'],
            ['7120', 'CAM Charges', 'Common area maintenance'],
            ['7130', 'Property Tax', 'Real estate taxes (if paid by tenant)'],
            ['7140', 'Percentage Rent', 'Rent based on sales (some leases)'],
          ]
        ),

        heading(2, 'Utilities (7200s)'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['7210', 'Electric', 'Electricity'],
            ['7220', 'Gas', 'Natural gas'],
            ['7230', 'Water', 'Water and sewer'],
            ['7240', 'Trash', 'Waste removal, recycling'],
            ['7250', 'Internet/Phone', 'Communications'],
          ]
        ),

        heading(2, 'Marketing (7300s)'),
        table(
          ['Account', 'Name', 'Examples'],
          [
            ['7310', 'Digital Marketing', 'Google ads, Facebook ads, Instagram'],
            ['7320', 'Print Marketing', 'Menus, flyers, business cards'],
            ['7330', 'Local Marketing', 'Sponsorships, community events'],
          ]
        ),

        heading(2, 'Technology (7400s)'),
        table(
          ['Account', 'Name', 'Examples'],
          [
            ['7410', 'POS Fees', 'Square, Toast, Clover monthly fees'],
            ['7420', 'Software Subscriptions', '7shifts, MarketMan, etc.'],
          ]
        ),
        proTipBox('POS processing fees (per-transaction) go to 8120 CC Processing, not 7410. 7410 is for the monthly software subscription.'),

        heading(2, 'Supplies (7500s)'),
        table(
          ['Account', 'Name', 'Examples'],
          [
            ['7510', 'Cleaning Supplies', 'Chemicals, mops, buckets (NOT napkins)'],
            ['7520', 'Office Supplies', 'Pens, paper, printer ink'],
            ['7530', 'Smallwares', 'Pots, pans, utensils (under $500)'],
          ]
        ),

        heading(2, 'Repairs & Maintenance (7600s)'),
        table(
          ['Account', 'Name', 'Examples'],
          [
            ['7610', 'Equipment Repair', 'Oven repair, refrigerator service'],
            ['7620', 'Building Maintenance', 'Plumbing, HVAC, general repairs'],
          ]
        ),

        heading(2, 'Insurance (7700s)'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['7710', 'General Liability', 'Slip and fall coverage'],
            ['7720', 'Property Insurance', 'Building and equipment coverage'],
          ]
        ),

        heading(2, 'Professional Services (7800s)'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['7810', 'Accounting Fees', 'That\'s us!'],
            ['7820', 'Legal Fees', 'Attorney costs'],
            ['7830', 'Consulting', 'Restaurant consultants'],
          ]
        ),

        heading(2, 'Licenses & Permits (7900s)'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['7910', 'Liquor License', 'Annual liquor license fee'],
            ['7920', 'Health Permit', 'Health department permit'],
            ['7930', 'Business License', 'City/county business license'],
          ]
        ),

      ],
    },
  },

  {
    title: 'Other Expenses (8000s)',
    slug: 'other-expenses-8000s',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Bank fees, third-party commissions, depreciation, interest',
    read_time: 4,
    is_pinned: false,
    order_index: 8,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Other Expenses (8000s)'),
        paragraph('These are non-operating expenses that still impact the bottom line.'),

        heading(2, 'Bank & CC Fees (8100s)'),
        table(
          ['Account', 'Name', 'Rate'],
          [
            ['8110', 'Bank Fees', 'Monthly account fees'],
            ['8120', 'CC Processing', '2.5-3.5% per transaction'],
            ['8130', 'ACH Fees', 'Electronic transfer fees'],
          ]
        ),
        insightBox('CC Processing Impact', 'On $100K/month sales with 80% card payments, CC fees are ~$2,400/month or $28,800/year. This is real money!'),

        heading(2, 'Third-Party Fees (8200s)'),
        paragraph('This is one of the most important expense categories for modern restaurants.'),
        table(
          ['Account', 'Name', 'Typical Rate'],
          [
            ['8210', 'DoorDash Fees', '15-30% of order'],
            ['8220', 'UberEats Fees', '15-30% of order'],
            ['8230', 'Grubhub Fees', '15-30% of order'],
          ]
        ),
        warningBox('Third-Party Math', 'A $100 DoorDash order at 25% commission: $100 revenue (4310) - $25 fee (8210) - $30 food cost - $5 packaging = $40 margin. Compare to dine-in: $100 - $30 food cost = $70 margin. Clients MUST see this!'),

        heading(2, 'Other Non-Operating'),
        table(
          ['Account', 'Name', 'Notes'],
          [
            ['8300', 'Interest Expense', 'Loan interest payments'],
            ['8400', 'Depreciation', 'Equipment depreciation'],
            ['8500', 'Amortization', 'Intangible amortization'],
            ['8900', 'Other Expenses', 'Miscellaneous (use sparingly)'],
          ]
        ),

      ],
    },
  },

  {
    title: 'COA by Restaurant Type',
    slug: 'coa-by-restaurant-type',
    section_slug: 'chart-of-accounts',
    type: 'guide',
    excerpt: 'Specific COA configurations for cafe, FSR, bar, QSR, fine dining',
    read_time: 10,
    is_pinned: true,
    order_index: 9,
    content: {
      type: 'doc',
      content: [
        heading(1, 'COA by Restaurant Type'),
        paragraph('While the master COA framework applies to all restaurants, different types emphasize different accounts. This guide shows which accounts matter most for each.'),

        heading(2, 'Cafe / Coffee Shop'),
        scenarioBox('Morning Buzz Cafe: $45,000/month revenue, 65% beverages, 35% food. Owner: Sarah Chen. Key focus: Beverage margins and labor efficiency.'),
        paragraph('Key accounts for cafes:'),
        bulletList([
          '4240 NA Beverage Sales — Primary revenue (coffee, tea)',
          '5240 NA Beverage Cost — Coffee beans, milk, syrups',
          '6100 FOH Labor — Baristas (lower than FSR)',
        ]),
        table(
          ['KPI', 'Target', 'Why'],
          [
            ['Beverage Cost', '18-22%', 'Coffee has high margins'],
            ['Food Cost', '28-32%', 'Pastries are lower margin'],
            ['Labor Cost', '25-30%', 'Counter service, less staff'],
            ['Prime Cost', '55-60%', 'Lower than FSR'],
          ]
        ),

        heading(2, 'Full Service Restaurant'),
        scenarioBox('Olive & Vine: $150,000/month revenue, 70% food, 30% beverage. Owner: Marcus Thompson. Key focus: Labor management with full service.'),
        paragraph('Key accounts for FSR:'),
        bulletList([
          '4100 Food Sales — Primary revenue driver',
          '4200 Beverage Sales — Wine and cocktails important',
          '6100 FOH Labor — Significant (servers, hosts, bussers)',
          '6200 BOH Labor — Full kitchen staff',
        ]),
        table(
          ['KPI', 'Target', 'Why'],
          [
            ['Food Cost', '28-32%', 'Standard target'],
            ['Beverage Cost', '20-24%', 'Wine/cocktails'],
            ['Labor Cost', '30-35%', 'Full service requires more staff'],
            ['Prime Cost', '60-65%', 'Higher due to labor'],
          ]
        ),

        heading(2, 'Bar & Grill'),
        scenarioBox('Smokey\'s Bar & Grill: $120,000/month revenue, 55% beverage, 45% food. Owner: Dave Morrison. Key focus: Pour cost control.'),
        paragraph('Key accounts for bars:'),
        bulletList([
          '4210/4220/4230 Beer/Wine/Spirits — Primary revenue',
          '5210/5220/5230 Beverage Costs — Track separately!',
          '7910 Liquor License — Higher regulatory costs',
        ]),
        table(
          ['KPI', 'Target', 'Why'],
          [
            ['Pour Cost', '18-22%', 'Alcohol has best margins'],
            ['Food Cost', '30-35%', 'Bar food higher cost'],
            ['Labor Cost', '25-30%', 'Less service than FSR'],
            ['Prime Cost', '52-58%', 'Lower due to high bev margin'],
          ]
        ),
        warningBox('Pour Cost Control', 'Bars MUST track beer, wine, and spirits separately. Over-pouring or theft shows up as elevated pour cost. Each category has different margin expectations.'),

        heading(2, 'Fast Casual / QSR'),
        scenarioBox('Spitz Mediterranean: $80,000/month revenue, 85% food, 15% beverage. Owner: Amir Hassan. Key focus: Third-party delivery impact.'),
        paragraph('Key accounts for QSR:'),
        bulletList([
          '4100 Food Sales — Primary revenue',
          '4300 Third-Party Delivery — Growing but margin-killing',
          '5300 Packaging — Higher due to takeout focus',
          '8200 Third-Party Fees — Must track separately',
        ]),
        table(
          ['KPI', 'Target', 'Why'],
          [
            ['Food Cost', '28-32%', 'Standard target'],
            ['Packaging Cost', '2-4%', 'Significant for QSR'],
            ['Third-Party Fees', 'Track separately', '15-30% of delivery sales'],
            ['Prime Cost', '58-62%', 'Watch delivery impact'],
          ]
        ),

      ],
    },
  },

  {
    title: 'QBO Mapping Guide',
    slug: 'qbo-mapping-guide',
    section_slug: 'chart-of-accounts',
    type: 'guide',
    excerpt: 'Step-by-step QuickBooks Online setup with our COA',
    read_time: 15,
    is_pinned: true,
    order_index: 10,
    content: {
      type: 'doc',
      content: [
        heading(1, 'QBO Mapping Guide'),
        paragraph('This guide walks you through setting up our COA in QuickBooks Online for a new client.'),

        heading(2, 'Before You Start'),
        bulletList([
          'Get admin access to client\'s QBO',
          'Export current COA for reference',
          'Get client approval for COA changes',
          'Schedule time when client won\'t be entering data',
        ]),

        heading(2, 'Step 1: Export Current COA'),
        stepFlow([
          { title: 'Go to Settings', description: 'Click gear icon > Chart of Accounts' },
          { title: 'Run Report', description: 'Click "Run Report" to see all accounts' },
          { title: 'Export', description: 'Export to Excel for reference' },
          { title: 'Review', description: 'Note which accounts have activity' },
        ]),

        heading(2, 'Step 2: Add Missing Accounts'),
        paragraph('Add our standard accounts that don\'t exist yet. Use exact names and numbers.'),
        stepFlow([
          { title: 'New Account', description: 'Click "New" in Chart of Accounts' },
          { title: 'Account Type', description: 'Select correct type (Income, COGS, Expense)' },
          { title: 'Detail Type', description: 'Select appropriate detail type' },
          { title: 'Name & Number', description: 'Enter exact name and number from our COA' },
        ]),
        proTipBox('Add parent accounts first (4100 Food Sales), then sub-accounts (4110 Food Sales - Dine In). QBO needs the parent to exist before creating sub-accounts.'),

        heading(2, 'Step 3: Rename Existing Accounts'),
        paragraph('Where possible, rename existing accounts to match our structure rather than creating duplicates.'),
        warningBox('Don\'t Delete Accounts with Transactions', 'If an account has historical transactions, don\'t delete it. Rename it to match our structure or make it inactive after moving balances.'),

        heading(2, 'Step 4: Verify Account Types'),
        paragraph('QBO sometimes creates accounts with wrong types. Verify these common issues:'),
        table(
          ['Account', 'Should Be', 'Common Error'],
          [
            ['Food Sales', 'Income', 'Sometimes created as COGS'],
            ['Discounts', 'Income (negative)', 'Sometimes created as Expense'],
            ['Packaging', 'COGS', 'Sometimes in Operating Expenses'],
            ['CC Processing', 'Other Expense', 'Sometimes in COGS'],
          ]
        ),

        heading(2, 'Step 5: Set Up Sub-Accounts'),
        paragraph('Link sub-accounts to parent accounts for proper roll-up.'),
        stepFlow([
          { title: 'Edit Sub-Account', description: 'Click on the sub-account' },
          { title: 'Check "Is Sub-Account"', description: 'Enable sub-account option' },
          { title: 'Select Parent', description: 'Choose the correct parent account' },
          { title: 'Save', description: 'Save and verify hierarchy' },
        ]),

        heading(2, 'Step 6: Verify & Test'),
        bulletList([
          'Run a P&L to verify account structure',
          'Check that totals roll up correctly',
          'Verify Prime Cost calculation works',
          'Test one week of transactions',
        ]),

      ],
    },
  },

  {
    title: 'Account Number Quick Reference',
    slug: 'account-quick-reference',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Copy-paste ready account numbers for daily use',
    read_time: 2,
    is_pinned: true,
    order_index: 11,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Account Number Quick Reference'),
        paragraph('Use this for quick lookups during daily work. All numbers are copy-paste ready.'),

        heading(2, 'Account Ranges'),
        table(
          ['Category', 'Range'],
          [
            ['Assets', '1000-1999'],
            ['Liabilities', '2000-2999'],
            ['Equity', '3000-3999'],
            ['Revenue', '4000-4999'],
            ['COGS', '5000-5999'],
            ['Labor', '6000-6999'],
            ['Operating', '7000-7999'],
            ['Other', '8000-8999'],
          ]
        ),

        heading(2, 'Most Used Revenue'),
        table(
          ['#', 'Name'],
          [
            ['4100', 'Food Sales'],
            ['4200', 'Beverage Sales'],
            ['4210', 'Beer Sales'],
            ['4220', 'Wine Sales'],
            ['4230', 'Spirits Sales'],
            ['4240', 'NA Beverage Sales'],
            ['4310', 'DoorDash Sales'],
            ['4320', 'UberEats Sales'],
            ['4510', 'Comps'],
          ]
        ),

        heading(2, 'Most Used COGS'),
        table(
          ['#', 'Name'],
          [
            ['5100', 'Food Cost'],
            ['5210', 'Beer Cost'],
            ['5220', 'Wine Cost'],
            ['5230', 'Spirits Cost'],
            ['5240', 'NA Beverage Cost'],
            ['5300', 'Packaging'],
          ]
        ),

        heading(2, 'Most Used Labor'),
        table(
          ['#', 'Name'],
          [
            ['6100', 'FOH Labor'],
            ['6200', 'BOH Labor'],
            ['6300', 'Management'],
            ['6400', 'Payroll Taxes'],
            ['6600', 'Overtime'],
          ]
        ),

        heading(2, 'Most Used Operating'),
        table(
          ['#', 'Name'],
          [
            ['7110', 'Base Rent'],
            ['7200', 'Utilities'],
            ['7300', 'Marketing'],
            ['7410', 'POS Fees'],
            ['7510', 'Cleaning Supplies'],
            ['7610', 'Equipment Repair'],
          ]
        ),

        heading(2, 'Most Used Other'),
        table(
          ['#', 'Name'],
          [
            ['8120', 'CC Processing'],
            ['8210', 'DoorDash Fees'],
            ['8220', 'UberEats Fees'],
            ['8400', 'Depreciation'],
          ]
        ),
      ],
    },
  },
]

// =============================================================================
// SECTION 2: STANDARD OPERATING PROCEDURES (7 articles)
// =============================================================================

const sopArticles = [
  {
    title: 'Client Onboarding Checklist',
    slug: 'client-onboarding-checklist',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'Complete checklist for setting up new restaurant clients',
    read_time: 10,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Client Onboarding Checklist'),
        paragraph('Use this checklist for every new client. Complete all items within the first 2 weeks of engagement.'),

        FINACCT360_COMMUNICATION_BOX,
        heading(2, 'Day 1: Initial Setup'),
        table(
          ['Task', 'Owner', 'Notes'],
          [
            ['Create client folder in Google Drive', 'Junior', 'Use template folder'],
            ['Add client to FinAcct360 workspace', 'Junior', 'Invite client contacts'],
            ['Request QBO access', 'Senior', 'Admin-level needed'],
            ['Request POS access', 'Senior', 'Export permissions'],
            ['Request bank feeds', 'Senior', 'Read-only access'],
            ['Request payroll access', 'Senior', 'Report access only'],
            ['Schedule kickoff call', 'Senior', '30-min video call'],
          ]
        ),

        heading(2, 'Day 2-3: Information Gathering'),
        table(
          ['Task', 'Owner', 'Notes'],
          [
            ['Confirm restaurant type', 'Accountant', 'Cafe/FSR/Bar/QSR'],
            ['Document POS system', 'Accountant', 'Square/Toast/Clover'],
            ['Document payroll provider', 'Accountant', 'Gusto/ADP/Paychex'],
            ['Get vendor list', 'Accountant', 'Top 10 vendors'],
            ['Get current COA', 'Accountant', 'Screenshot from QBO'],
            ['Identify third-party platforms', 'Accountant', 'DD/UE/GH'],
          ]
        ),

        heading(2, 'Day 4-7: System Setup'),
        table(
          ['Task', 'Owner', 'Notes'],
          [
            ['Map existing COA to FinAcct360', 'Senior', 'Document all changes'],
            ['Create COA change proposal', 'Senior', 'For client approval'],
            ['Set up bank feeds in QBO', 'Accountant', 'Verify all accounts'],
            ['Configure POS integration', 'Accountant', 'If available'],
            ['Test payroll import', 'Accountant', 'One pay period'],
          ]
        ),
        warningBox('COA Changes', 'NEVER change client\'s COA without written approval. Send the COA mapping document and get confirmation via FinAcct360 (Chat or Task) before making changes.'),

        heading(2, 'Day 8-14: First Close'),
        table(
          ['Task', 'Owner', 'Notes'],
          [
            ['Complete first weekly close', 'Accountant', 'With senior review'],
            ['Deliver first P&L', 'Senior', 'Walk through with client'],
            ['Set up KPI dashboard', 'Senior', 'Configure targets'],
            ['Document any issues', 'Accountant', 'For process notes'],
            ['Get client feedback', 'Senior', 'What\'s working?'],
          ]
        ),

        heading(2, 'Access Request Template'),
        exampleBox('Email: QBO Access Request', 'Subject: QuickBooks Online Access - FinAcct360 Setup\n\nHi [Client Name],\n\nWe\'re ready to set up your QuickBooks Online for weekly reporting. Please add our team email as an admin user:\n\nEmail: accounting@finacctsolutions.com\n\nSteps:\n1. Go to Settings > Manage Users\n2. Click "Add User"\n3. Enter email above\n4. Select "Company Admin"\n5. Click Invite\n\nLet me know once complete!\n\nBest,\n[Your Name]'),

      ],
    },
  },

  {
    title: 'Weekly Close Process',
    slug: 'weekly-close-process',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'Sunday week end through Monday 2 PM ET delivery: data collection, import, reconcile, review, senior approval, P&L delivered',
    read_time: 12,
    is_pinned: true,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Weekly Close Process'),
        paragraph('The week runs Sunday to Saturday. Week ends Sunday close of business. Data collection begins Monday; P&L is delivered by Monday 2 PM ET the following week. Here\'s the process.'),

        heading(2, 'The Weekly Timeline'),
        stepFlow([
          { title: 'Sunday', description: 'Week ends (Sunday close of business)' },
          { title: 'Monday', description: 'Data collection begins' },
          { title: 'Tuesday', description: 'Import and categorize' },
          { title: 'Wednesday', description: 'Reconcile' },
          { title: 'Thursday', description: 'Review and flag' },
          { title: 'Friday', description: 'Senior review' },
          { title: 'Monday 2 PM ET', description: 'P&L delivered' },
        ]),

        heading(2, 'Monday: Data Collection'),
        bulletList([
          'Download POS reports, bank transactions, payroll, third-party reports',
          'Gather all source documents for the closed week',
        ]),

        heading(2, 'Tuesday: Import and Categorize'),
        bulletList([
          'Import all transactions into QBO',
          'Categorize to FinAcct360 COA',
          'Flag uncategorized or unknown items',
        ]),

        heading(2, 'Wednesday: Reconcile'),
        bulletList([
          'Reconcile bank accounts',
          'Reconcile credit cards',
          'Resolve any feed or timing issues',
        ]),

        heading(2, 'Thursday: Review and Flag'),
        bulletList([
          'Review P&L for reasonableness',
          'Document issues and questions',
          'Export reports and upload to client folder',
        ]),

        heading(2, 'Friday: Senior Review'),
        paragraph('Senior reviews all uploads and either approves or returns for fixes.'),
        table(
          ['Check', 'Pass Criteria'],
          [
            ['Bank reconciliation', 'All accounts reconcile to $0 difference'],
            ['P&L accuracy', 'No obvious errors, variances explained'],
            ['KPIs in range', 'Food cost, labor, prime cost within targets'],
            ['Flags resolved', 'All questions answered or documented'],
          ]
        ),

        heading(2, 'Monday 2 PM ET: P&L Delivered'),
        paragraph('Once approved, the KPI Dashboard publishes to the client by Monday 2 PM ET. If you need to message the client about the close, use FinAcct360 Chat or create a Task.'),
        FINACCT360_COMMUNICATION_BOX,

        heading(2, 'Common Issues & Solutions'),
        table(
          ['Issue', 'Solution'],
          [
            ['Missing bank transactions', 'Check bank feed connection, manually download'],
            ['POS doesn\'t match deposits', 'Look for cash deposits, timing differences'],
            ['Payroll doesn\'t match', 'Check for manual checks, adjustments'],
            ['Third-party fees missing', 'Download settlement report directly'],
            ['Unknown vendor', 'Ask client via FinAcct360 Chat or create a Task'],
          ]
        ),
        warningBox('Reconciliation Rules', 'NEVER mark a reconciliation complete if it doesn\'t balance. A $1 difference means something is wrong. Find it.'),

      ],
    },
  },

  {
    title: 'Monthly Close Process',
    slug: 'monthly-close-process',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'End of month procedures and additional reconciliations',
    read_time: 8,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Monthly Close Process'),
        paragraph('Monthly close includes everything in weekly close plus additional procedures.'),

        heading(2, 'Additional Monthly Tasks'),
        table(
          ['Task', 'When', 'Owner'],
          [
            ['Accrue unpaid invoices', 'EOM', 'Accountant'],
            ['Review prepaid expenses', 'EOM', 'Senior'],
            ['Record depreciation', 'EOM', 'Senior'],
            ['Reconcile credit cards', 'EOM', 'Accountant'],
            ['Review inventory counts', 'EOM', 'Accountant'],
            ['YTD variance analysis', 'EOM', 'Senior'],
          ]
        ),

        heading(2, 'Accruals'),
        paragraph('Record expenses incurred but not yet billed or paid.'),
        exampleBox('Common Accruals', 'Utilities received but not yet paid\nPayroll earned but not yet processed\nRent for partial month\nProfessional services rendered but not invoiced'),

        heading(2, 'Depreciation'),
        paragraph('Monthly depreciation entries for fixed assets.'),
        table(
          ['Asset Type', 'Typical Life', 'Monthly Entry'],
          [
            ['Kitchen Equipment', '7 years', 'Cost / 84 months'],
            ['Furniture', '5 years', 'Cost / 60 months'],
            ['Leasehold Improvements', 'Lease term', 'Cost / months of lease'],
          ]
        ),

      ],
    },
  },

  {
    title: 'Books Health Check',
    slug: 'books-health-check',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'How to audit client books for accuracy and completeness',
    read_time: 10,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Books Health Check'),
        paragraph('Use this checklist to assess the quality of a client\'s books, especially during onboarding or when issues arise.'),

        heading(2, 'Quick Assessment (15 minutes)'),
        table(
          ['Check', 'Red Flag If...'],
          [
            ['Bank reconciliation date', 'More than 1 month behind'],
            ['Uncategorized transactions', 'More than 10 items'],
            ['Negative bank balance', 'Shows negative in QBO'],
            ['"Ask My Accountant"', 'More than 5 items'],
            ['Food cost %', 'Over 40% or under 20%'],
            ['Payroll entries', 'Missing or irregular'],
          ]
        ),

        heading(2, 'Deep Dive (1-2 hours)'),
        paragraph('If quick assessment reveals issues, dig deeper:'),
        bulletList([
          'Run bank reconciliation for past 3 months',
          'Review all "Other Income" and "Other Expense"',
          'Check for duplicate transactions',
          'Verify all vendor names are meaningful',
          'Confirm all credit card accounts are connected',
        ]),

        heading(2, 'Health Score'),
        table(
          ['Score', 'Meaning', 'Action'],
          [
            ['Green (90%+)', 'Books are clean', 'Standard weekly close'],
            ['Yellow (70-89%)', 'Minor issues', 'Clean up within 2 weeks'],
            ['Red (Below 70%)', 'Significant issues', 'Escalate, may need cleanup project'],
          ]
        ),

      ],
    },
  },

  {
    title: 'QBO Export Procedures',
    slug: 'qbo-export-procedures',
    section_slug: 'standard-operating-procedures',
    type: 'guide',
    excerpt: 'How to export reports from QuickBooks Online',
    read_time: 6,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, 'QBO Export Procedures'),
        paragraph('Standard procedures for exporting reports from QuickBooks Online.'),

        heading(2, 'P&L Export'),
        stepFlow([
          { title: 'Navigate', description: 'Reports > Profit and Loss' },
          { title: 'Set Dates', description: 'Select the reporting period' },
          { title: 'Customize', description: 'Show all rows, group by none' },
          { title: 'Run Report', description: 'Click Run Report' },
          { title: 'Export', description: 'Export to Excel' },
        ]),

        heading(2, 'Balance Sheet Export'),
        stepFlow([
          { title: 'Navigate', description: 'Reports > Balance Sheet' },
          { title: 'Set Date', description: 'Select As of date' },
          { title: 'Run Report', description: 'Click Run Report' },
          { title: 'Export', description: 'Export to Excel' },
        ]),

        heading(2, 'General Ledger Export'),
        stepFlow([
          { title: 'Navigate', description: 'Reports > General Ledger' },
          { title: 'Set Dates', description: 'Select date range' },
          { title: 'Filter', description: 'Select specific accounts if needed' },
          { title: 'Run Report', description: 'Click Run Report' },
          { title: 'Export', description: 'Export to Excel' },
        ]),

        proTipBox('Always verify the date range before exporting. It\'s easy to accidentally pull the wrong period.'),

      ],
    },
  },

  {
    title: 'Handoff Protocol',
    slug: 'handoff-protocol',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'Transitioning clients between team members',
    read_time: 5,
    is_pinned: false,
    order_index: 5,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Handoff Protocol'),
        paragraph('Use this protocol when transitioning a client to another team member (vacation, role change, etc.).'),

        heading(2, 'Before Handoff'),
        table(
          ['Task', 'Notes'],
          [
            ['Document all client specifics', 'Special requests, preferences'],
            ['List pending items', 'Open questions, issues'],
            ['Update process notes', 'Any deviations from standard'],
            ['Check access levels', 'New person has all access'],
          ]
        ),

        heading(2, 'During Handoff'),
        table(
          ['Task', 'Notes'],
          [
            ['30-minute handoff call', 'Walk through everything'],
            ['Share screen in QBO', 'Show any unusual items'],
            ['Review last 2 weeks', 'Recent history'],
            ['Introduce via email', 'If new person to client'],
          ]
        ),

        heading(2, 'After Handoff'),
        table(
          ['Task', 'Notes'],
          [
            ['Shadow first week', 'Available for questions'],
            ['Check in mid-week', 'Any issues?'],
            ['Formal close', 'Handoff complete'],
          ]
        ),

      ],
    },
  },

  {
    title: 'Client Communication Standards',
    slug: 'client-communication-standards',
    section_slug: 'standard-operating-procedures',
    type: 'guide',
    excerpt: 'How to communicate professionally with US clients',
    read_time: 8,
    is_pinned: false,
    order_index: 6,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Client Communication Standards'),
        paragraph('How to communicate professionally with US restaurant clients.'),

        heading(2, 'Response Time Standards'),
        table(
          ['Channel', 'Response Time'],
          [
            ['FinAcct360 Chat', 'Within 2 hours'],
            ['Schedule Meeting', 'Same business day when needed'],
            ['Task with deadline', 'By due date'],
            ['Urgent (flagged)', 'Within 1 hour'],
          ]
        ),

        heading(2, 'Tone Guidelines'),
        paragraph('US business communication is casual but professional.'),
        table(
          ['Instead Of', 'Use'],
          [
            ['Dear Sir/Madam', 'Hi [First Name]'],
            ['I am writing to inform you', 'Quick update on...'],
            ['Please do the needful', 'Could you please...'],
            ['Kindly revert', 'Let me know'],
            ['As per my previous email', 'Following up on...'],
          ]
        ),

        heading(2, 'Good vs Bad Examples'),
        exampleBox('❌ BAD', 'Dear Sir,\n\nI am writing to inform you that there is a discrepancy in your books. Please do the needful and revert back.\n\nRegards'),
        exampleBox('✅ GOOD', 'Hi Sarah,\n\nQuick question — your Square shows $5,200 in sales for March 3rd, but the bank deposit was $4,700. Could this be a cash deposit that went elsewhere?\n\nLet me know and I\'ll get it sorted.\n\nThanks!'),

        heading(2, 'When to Escalate'),
        bulletList([
          'Client is unhappy or frustrated',
          'Technical issue you can\'t resolve',
          'Request outside normal scope',
          'Any legal or compliance concern',
        ]),

      ],
    },
  },
]

// =============================================================================
// SECTION 3: EXCEPTION HANDLING (7 articles)
// =============================================================================

const exceptionArticles = [
  {
    title: 'Client Refuses COA Change',
    slug: 'client-refuses-coa-change',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'How to handle pushback on Chart of Accounts changes',
    read_time: 8,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Client Refuses COA Change'),
        paragraph('Sometimes clients resist changing their Chart of Accounts. This playbook helps you navigate the conversation professionally.'),

        heading(2, 'Why This Happens'),
        table(
          ['Reason', 'Client Says', 'Real Concern'],
          [
            ['Familiarity', '"I\'ve always done it this way"', 'Fear of learning new system'],
            ['Accountant', '"My CPA set this up"', 'Doesn\'t want to upset CPA'],
            ['Software', '"QuickBooks created these"', 'Thinks QBO is correct'],
            ['Time', '"I don\'t have time for this"', 'Worried about transition'],
          ]
        ),

        heading(2, 'The Conversation Framework'),
        stepFlow([
          { title: 'Listen First', description: 'Understand their specific concern' },
          { title: 'Acknowledge', description: 'Validate their perspective' },
          { title: 'Educate', description: 'Explain the "why" behind our COA' },
          { title: 'Show Value', description: 'Demonstrate with real examples' },
          { title: 'Offer Options', description: 'Phased approach or full transition' },
        ]),

        heading(2, 'Escalation Path'),
        table(
          ['If...', 'Then...'],
          [
            ['Client is hesitant but open', 'Offer phased approach'],
            ['Client needs CPA approval', 'Send documentation to their CPA'],
            ['Client firmly refuses', 'Escalate to Manager'],
            ['Client threatens to cancel', 'Escalate to Controller immediately'],
          ]
        ),
        warningBox('Never Force It', 'If a client absolutely refuses, we can work with their existing COA temporarily. Document the situation and escalate. Never damage the client relationship over COA changes.'),

      ],
    },
  },

  {
    title: 'Messy Books Protocol',
    slug: 'messy-books-protocol',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'How to clean up disorganized or incorrect bookkeeping',
    read_time: 12,
    is_pinned: true,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Messy Books Protocol'),
        paragraph('New clients often come with months of messy bookkeeping. This protocol helps you clean up systematically.'),

        heading(2, 'Signs of Messy Books'),
        table(
          ['Red Flag', 'What It Means'],
          [
            ['Negative bank balance in QBO', 'Unreconciled transactions'],
            ['"Ask My Accountant" everywhere', 'Previous accountant gave up'],
            ['Uncategorized Expenses > $10K', 'No one categorized'],
            ['Food cost > 50%', 'Miscategorized expenses'],
            ['No payroll entries', 'Payroll not recorded'],
          ]
        ),

        heading(2, 'The Cleanup Framework'),
        stepFlow([
          { title: 'Stabilize', description: 'Fix bank connections, stop the bleeding' },
          { title: 'Current First', description: 'Get current week/month clean' },
          { title: 'Go Backward', description: 'Clean up historical month by month' },
          { title: 'Reconcile', description: 'Reconcile each month as you go' },
          { title: 'Document', description: 'Note all major adjustments' },
        ]),
        insightBox('Current First, Always', 'Don\'t spend 3 weeks cleaning up history while current transactions pile up. Get the current week clean and delivering value, THEN work backward.'),

        heading(2, 'Time Estimates'),
        table(
          ['Situation', 'Estimated Hours'],
          [
            ['1 month behind', '4-8 hours'],
            ['3 months behind', '15-25 hours'],
            ['6 months behind', '30-50 hours'],
            ['12+ months behind', '60-100+ hours'],
          ]
        ),
        warningBox('Scope Creep Alert', 'If cleanup exceeds 20 hours, escalate to Manager. This may require a separate cleanup project with additional billing.'),

      ],
    },
  },

  {
    title: 'Missing Data Handling',
    slug: 'missing-data-handling',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'What to do when client data is incomplete or unavailable',
    read_time: 6,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Missing Data Handling'),
        paragraph('Sometimes data is missing or incomplete. Here\'s how to handle it. Request from the client via FinAcct360 Chat or create a Task with a deadline.'),

        FINACCT360_COMMUNICATION_BOX,
        heading(2, 'Common Missing Data'),
        table(
          ['Missing', 'Source Alternative'],
          [
            ['POS sales', 'Bank deposits, manual log'],
            ['Bank statement', 'Client download, bank direct'],
            ['Payroll report', 'Bank withdrawals, ADP/Gusto portal'],
            ['Vendor invoices', 'Credit card statements'],
            ['Third-party reports', 'Platform dashboards'],
          ]
        ),

        heading(2, 'Escalation Timeline'),
        table(
          ['Day', 'Action'],
          [
            ['Day 1', 'Request via FinAcct360 Chat'],
            ['Day 2', 'Follow up via FinAcct360'],
            ['Day 3', 'Escalate to senior, call client'],
            ['Day 4', 'Manager involvement'],
          ]
        ),

        warningBox('Never Guess', 'If you can\'t get the data and can\'t find an alternative source, flag it clearly on the P&L. Never estimate without documentation.'),

      ],
    },
  },

  {
    title: 'QBO Technical Issues',
    slug: 'qbo-technical-issues',
    section_slug: 'exception-handling',
    type: 'troubleshoot',
    excerpt: 'Common QuickBooks Online problems and solutions',
    read_time: 10,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, 'QBO Technical Issues'),
        paragraph('Common QuickBooks Online issues and how to resolve them.'),

        heading(2, 'Bank Feed Issues'),
        table(
          ['Problem', 'Solution'],
          [
            ['Bank feed disconnected', 'Reconnect via Settings > Bank Connections'],
            ['Duplicate transactions', 'Undo/delete duplicates, check date range'],
            ['Missing transactions', 'Manual import from CSV'],
            ['Wrong account linked', 'Disconnect, reconnect to correct account'],
          ]
        ),

        heading(2, 'Report Issues'),
        table(
          ['Problem', 'Solution'],
          [
            ['P&L shows wrong dates', 'Check "Customize" settings, date range'],
            ['Accounts missing from report', 'Check "Rows/Columns" show all'],
            ['Totals don\'t match', 'Check for filtering, sub-accounts'],
          ]
        ),

        heading(2, 'Access Issues'),
        table(
          ['Problem', 'Solution'],
          [
            ['Can\'t access company', 'Check FinAcct360 for invite; request re-invite via Chat'],
            ['Limited access', 'Request admin upgrade from client'],
            ['Two-factor problems', 'Use backup codes, reach out via FinAcct360'],
          ]
        ),

        proTipBox('Clear browser cache and try incognito mode before escalating QBO issues. Many problems are browser-related.'),

      ],
    },
  },

  {
    title: 'Bank Feed Errors',
    slug: 'bank-feed-errors',
    section_slug: 'exception-handling',
    type: 'troubleshoot',
    excerpt: 'Fixing bank connection and import issues',
    read_time: 8,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Bank Feed Errors'),
        paragraph('Bank feed issues are common. Here\'s how to diagnose and fix them.'),

        heading(2, 'Disconnection Causes'),
        bulletList([
          'Client changed bank password',
          'Bank security update required',
          'Two-factor authentication changed',
          'Account closed or changed',
        ]),

        heading(2, 'Reconnection Steps'),
        stepFlow([
          { title: 'Check Status', description: 'Settings > Bank Connections' },
          { title: 'Review Error', description: 'Note the specific error message' },
          { title: 'Update Credentials', description: 'Re-enter bank username/password' },
          { title: 'Complete 2FA', description: 'May need client to approve' },
          { title: 'Verify Connection', description: 'Test with recent transaction' },
        ]),

        heading(2, 'Manual Import Fallback'),
        paragraph('If automated feed won\'t work, import manually:'),
        stepFlow([
          { title: 'Download CSV', description: 'From bank website' },
          { title: 'Go to Banking', description: 'In QBO' },
          { title: 'Click Upload', description: 'File upload option' },
          { title: 'Map Columns', description: 'Match CSV to QBO fields' },
          { title: 'Import', description: 'Review and accept' },
        ]),

      ],
    },
  },

  {
    title: 'Payroll Discrepancies',
    slug: 'payroll-discrepancies',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'When payroll doesn\'t match bank or reports',
    read_time: 7,
    is_pinned: false,
    order_index: 5,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Payroll Discrepancies'),
        paragraph('When payroll journal entries don\'t match bank withdrawals or payroll reports.'),

        heading(2, 'Common Causes'),
        table(
          ['Discrepancy', 'Likely Cause'],
          [
            ['JE higher than bank withdrawal', 'Employer taxes paid separately'],
            ['JE lower than bank withdrawal', 'Manual check issued'],
            ['Timing difference', 'Payroll processed vs paid date'],
            ['Missing payroll entirely', 'Not imported, new pay period'],
          ]
        ),

        heading(2, 'Investigation Steps'),
        stepFlow([
          { title: 'Compare', description: 'JE total vs payroll register vs bank' },
          { title: 'Check Dates', description: 'Pay period vs payment date' },
          { title: 'Review Components', description: 'Wages, taxes, benefits separately' },
          { title: 'Contact Payroll', description: 'Gusto/ADP support if needed' },
        ]),

        heading(2, 'Common Adjustments'),
        table(
          ['Situation', 'Adjustment'],
          [
            ['Tax payment timing', 'Accrue or split by date'],
            ['Manual check', 'Add separate entry'],
            ['Voided check', 'Reverse entry'],
            ['Reimbursement included', 'Separate from wages'],
          ]
        ),

      ],
    },
  },

  {
    title: 'Third-Party Delivery Issues',
    slug: 'third-party-delivery-issues',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'DoorDash, UberEats, Grubhub reconciliation problems',
    read_time: 8,
    is_pinned: false,
    order_index: 6,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Third-Party Delivery Issues'),
        paragraph('Third-party platforms have complex fee structures. Here\'s how to reconcile them.'),

        heading(2, 'The Math'),
        exampleBox('DoorDash Example', 'Customer order: $50.00\nDoorDash commission (25%): $12.50\nDelivery fee (kept by DD): $4.99\nTip (to restaurant if applicable): $5.00\n\nDeposit to restaurant: $37.50\n\nRecord:\n4310 DoorDash Sales: $50.00 (gross order)\n8210 DoorDash Fees: $12.50 (commission)\nNet in bank: $37.50'),

        heading(2, 'Common Issues'),
        table(
          ['Issue', 'Solution'],
          [
            ['Deposit doesn\'t match POS', 'Check for refunds, adjustments'],
            ['Missing settlement', 'Download from platform dashboard'],
            ['Fee % seems wrong', 'Review contract, check promotions'],
            ['Tips not matching', 'Verify tip payout method'],
          ]
        ),

        heading(2, 'Weekly Reconciliation'),
        stepFlow([
          { title: 'Download Settlement', description: 'From each platform dashboard' },
          { title: 'Match to POS', description: 'Verify order totals' },
          { title: 'Match to Bank', description: 'Verify deposit amounts' },
          { title: 'Record Fees', description: 'Commission to 8200 accounts' },
        ]),

        warningBox('Record Gross Sales', 'Always record the full order amount as revenue (4300). Record the commission as an expense (8200). This keeps revenue accurate for KPIs.'),

      ],
    },
  },
]

// =============================================================================
// SECTION 4: SAMPLE FINANCIALS (9 articles) - Abbreviated for space
// =============================================================================

const sampleFinancialsArticles = [
  {
    title: 'Cafe / Coffee Shop P&L',
    slug: 'cafe-coffee-shop-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Sample P&L for Morning Buzz Cafe with KPI analysis',
    read_time: 8,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Cafe / Coffee Shop P&L'),
        scenarioBox('Morning Buzz Cafe: $45,000/month revenue, 65% beverages, 35% food. Owner: Sarah Chen.'),
        
        heading(2, 'Sample Monthly P&L'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Food Sales', '$15,750', '35.0%'],
            ['NA Beverage Sales', '$27,000', '60.0%'],
            ['Third-Party Delivery', '$2,700', '6.0%'],
            ['Discounts', '($450)', '-1.0%'],
            ['Total Revenue', '$45,000', '100%'],
            ['', '', ''],
            ['Food Cost', '$4,725', '10.5%'],
            ['NA Beverage Cost', '$5,400', '12.0%'],
            ['Packaging', '$675', '1.5%'],
            ['Total COGS', '$10,800', '24.0%'],
            ['', '', ''],
            ['Gross Profit', '$34,200', '76.0%'],
            ['', '', ''],
            ['FOH Labor', '$9,000', '20.0%'],
            ['Management', '$3,000', '6.7%'],
            ['Payroll Taxes', '$1,440', '3.2%'],
            ['Total Labor', '$13,440', '29.9%'],
            ['', '', ''],
            ['Prime Cost', '$24,240', '53.9%'],
          ]
        ),
        insightBox('Why Cafes Have Higher Margins', 'Morning Buzz achieves strong margins because: Beverage-heavy (65%) with high margins, Lower labor (counter service), Simple menu, Limited third-party delivery.'),

      ],
    },
  },

  {
    title: 'Full Service Restaurant P&L',
    slug: 'full-service-restaurant-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Sample P&L for Olive & Vine with KPI analysis',
    read_time: 10,
    is_pinned: false,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Full Service Restaurant P&L'),
        scenarioBox('Olive & Vine: $150,000/month revenue, 70% food, 30% beverage. Owner: Marcus Thompson.'),
        paragraph('Full P&L template for full-service restaurants with higher labor costs and wine/cocktail programs.'),
      ],
    },
  },

  {
    title: 'Bar & Grill P&L',
    slug: 'bar-grill-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Sample P&L for Smokey\'s Bar & Grill with pour cost analysis',
    read_time: 10,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Bar & Grill P&L'),
        scenarioBox('Smokey\'s Bar & Grill: $120,000/month revenue, 55% beverage, 45% food. Owner: Dave Morrison.'),
      ],
    },
  },

  {
    title: 'Fast Casual / QSR P&L',
    slug: 'fast-casual-qsr-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Sample P&L for Spitz with third-party delivery impact',
    read_time: 10,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Fast Casual / QSR P&L'),
        scenarioBox('Spitz Mediterranean: $80,000/month revenue, 85% food, 15% beverage. 40% from third-party delivery. Owner: Amir Hassan.'),
      ],
    },
  },

  {
    title: 'Fine Dining P&L',
    slug: 'fine-dining-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Sample P&L for upscale restaurant',
    read_time: 10,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Fine Dining P&L'),
      ],
    },
  },

  {
    title: 'Multi-Unit Consolidated P&L',
    slug: 'multi-unit-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Consolidated P&L for restaurant chains',
    read_time: 12,
    is_pinned: false,
    order_index: 5,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Multi-Unit Consolidated P&L'),
      ],
    },
  },

  {
    title: 'Sample Balance Sheet',
    slug: 'sample-balance-sheet',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Standard restaurant balance sheet structure',
    read_time: 8,
    is_pinned: false,
    order_index: 6,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Sample Balance Sheet'),
      ],
    },
  },

  {
    title: 'Sample Cash Flow Statement',
    slug: 'sample-cash-flow',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Restaurant cash flow statement structure',
    read_time: 8,
    is_pinned: false,
    order_index: 7,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Sample Cash Flow Statement'),
      ],
    },
  },

  {
    title: 'KPI Dashboard Sample',
    slug: 'kpi-dashboard-sample',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'What clients see on their FinAcct360 dashboard',
    read_time: 6,
    is_pinned: false,
    order_index: 8,
    content: {
      type: 'doc',
      content: [
        heading(1, 'KPI Dashboard Sample'),
      ],
    },
  },
]

// =============================================================================
// SECTION 5: CLIENT EDUCATION (6 articles)
// =============================================================================

const clientEducationArticles = [
  {
    title: 'How to Read Your P&L',
    slug: 'how-to-read-pl',
    section_slug: 'client-education',
    type: 'guide',
    excerpt: 'Client-friendly guide to understanding the P&L statement',
    read_time: 8,
    is_pinned: true,
    is_client_facing: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, 'How to Read Your P&L'),
        paragraph('Your Profit & Loss statement (P&L) shows how your restaurant made money and where it went. Here\'s how to read it like a pro.'),
        insightBox('The Big Picture', 'Think of your P&L as a story of your money: Revenue is money in, Expenses are money out, Profit is what\'s left for you.'),

        heading(2, 'The Key Numbers to Watch'),
        table(
          ['KPI', 'Target', 'What It Means'],
          [
            ['Food Cost', '28-32%', 'Food purchases divided by food sales'],
            ['Beverage Cost', '18-24%', 'Drink purchases divided by drink sales'],
            ['Labor Cost', '28-35%', 'All payroll divided by total sales'],
            ['Prime Cost', '55-65%', 'COGS + Labor divided by total sales'],
          ]
        ),

        heading(2, 'Quick Health Check'),
        paragraph('Every Monday, spend 5 minutes checking:'),
        bulletList([
          'Is Prime Cost under 65%? ✅ Good / ❌ Investigate',
          'Did any cost jump more than 3%? ❌ Ask your accountant',
          'Is Net Profit positive? ✅ Keep going / ❌ Something needs to change',
        ]),

      ],
    },
  },

  {
    title: 'What is Prime Cost?',
    slug: 'what-is-prime-cost',
    section_slug: 'client-education',
    type: 'guide',
    excerpt: 'Client-friendly explanation of the most important restaurant KPI',
    read_time: 5,
    is_pinned: false,
    is_client_facing: true,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, 'What is Prime Cost?'),
        paragraph('Prime Cost is the most important number in your restaurant. It\'s simply: Food + Beverage + Labor.'),
        insightBox('Why Prime Cost Matters', 'These are your two biggest controllable costs. Everything else (rent, utilities) is mostly fixed. Prime cost is where you have power.'),
      ],
    },
  },

  {
    title: 'Understanding Your KPIs',
    slug: 'understanding-kpis',
    section_slug: 'client-education',
    type: 'guide',
    excerpt: 'Guide to the metrics on your FinAcct360 dashboard',
    read_time: 10,
    is_pinned: false,
    is_client_facing: true,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Understanding Your KPIs'),
        paragraph('Your FinAcct360 dashboard shows key performance indicators. Here\'s what they mean.'),
      ],
    },
  },

  {
    title: 'Weekly Close: What to Expect',
    slug: 'weekly-close-expectations',
    section_slug: 'client-education',
    type: 'guide',
    excerpt: 'What happens each week and what we need from you',
    read_time: 5,
    is_pinned: false,
    is_client_facing: true,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Weekly Close: What to Expect'),
        paragraph('Every week we close your books, upload reports to your Google Drive by Monday EOD, and publish your KPI Dashboard by Tuesday.'),
        heading(2, 'What We Need From You'),
        bulletList([
          'Access to your POS system',
          'Bank and credit card connections',
          'Quick responses to questions',
        ]),
      ],
    },
  },

  {
    title: 'Common Questions & Answers',
    slug: 'common-questions-answers',
    section_slug: 'client-education',
    type: 'faq',
    excerpt: 'Frequently asked questions from restaurant owners',
    read_time: 8,
    is_pinned: true,
    is_client_facing: true,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Common Questions & Answers'),
        heading(2, 'Why does my food cost change week to week?'),
        paragraph('Food cost fluctuates based on purchasing, sales mix, and waste. Look at monthly averages for the true picture.'),
        heading(2, 'Why is labor high during slow weeks?'),
        paragraph('Fixed staff costs stay the same regardless of sales. The percentage goes up when sales drop.'),
        heading(2, 'What\'s a good net profit margin?'),
        paragraph('Most restaurants run 3-7%. Above 5% is doing well. Below 3% needs attention.'),
      ],
    },
  },

  {
    title: 'Why We Use This Chart of Accounts',
    slug: 'why-this-coa',
    section_slug: 'client-education',
    type: 'guide',
    excerpt: 'Explaining our account structure to clients',
    read_time: 6,
    is_pinned: false,
    is_client_facing: true,
    order_index: 5,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Why We Use This Chart of Accounts'),
      ],
    },
  },
]

// =============================================================================
// SECTION 6: POS & SOFTWARE GUIDES (9 articles)
// =============================================================================

const posGuidesArticles = [
  {
    title: 'Square Export Guide',
    slug: 'square-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Step-by-step guide to exporting reports from Square',
    read_time: 8,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Square Export Guide'),
        paragraph('Step-by-step guide to exporting sales reports from Square Dashboard.'),

        heading(2, 'Accessing Square Dashboard'),
        stepFlow([
          { title: 'Step 1', description: 'Go to squareup.com/dashboard' },
          { title: 'Step 2', description: 'Log in with client credentials' },
          { title: 'Step 3', description: 'Navigate to Reports > Sales' },
        ]),

        heading(2, 'Reports to Export Weekly'),
        table(
          ['Report', 'Where', 'What It Shows'],
          [
            ['Sales Summary', 'Reports > Sales', 'Total sales by category'],
            ['Itemized Sales', 'Reports > Sales', 'Sales by item'],
            ['Payment Methods', 'Reports > Sales', 'Cash vs card breakdown'],
            ['Deposits', 'Balance > Deposits', 'Bank deposit amounts'],
          ]
        ),

        proTipBox('Always verify the date range before exporting. It\'s easy to accidentally pull the wrong week.'),

      ],
    },
  },

  {
    title: 'Toast Export Guide',
    slug: 'toast-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Step-by-step guide to exporting reports from Toast',
    read_time: 8,
    is_pinned: false,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Toast Export Guide'),
      ],
    },
  },

  {
    title: 'Clover Export Guide',
    slug: 'clover-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Step-by-step guide to exporting reports from Clover',
    read_time: 8,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Clover Export Guide'),
      ],
    },
  },

  {
    title: 'SpotOn Export Guide',
    slug: 'spoton-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Step-by-step guide to exporting reports from SpotOn',
    read_time: 8,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, 'SpotOn Export Guide'),
      ],
    },
  },

  {
    title: 'QBO P&L Export Guide',
    slug: 'qbo-pl-export',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'How to export P&L from QuickBooks Online',
    read_time: 5,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, 'QBO P&L Export Guide'),
      ],
    },
  },

  {
    title: 'QBO Balance Sheet Export Guide',
    slug: 'qbo-balance-sheet-export',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'How to export Balance Sheet from QuickBooks Online',
    read_time: 5,
    is_pinned: false,
    order_index: 5,
    content: {
      type: 'doc',
      content: [
        heading(1, 'QBO Balance Sheet Export Guide'),
      ],
    },
  },

  {
    title: 'Gusto Payroll Export Guide',
    slug: 'gusto-payroll-export',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'How to export payroll reports from Gusto',
    read_time: 6,
    is_pinned: false,
    order_index: 6,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Gusto Payroll Export Guide'),
      ],
    },
  },

  {
    title: 'ADP Payroll Export Guide',
    slug: 'adp-payroll-export',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'How to export payroll reports from ADP',
    read_time: 6,
    is_pinned: false,
    order_index: 7,
    content: {
      type: 'doc',
      content: [
        heading(1, 'ADP Payroll Export Guide'),
      ],
    },
  },

  {
    title: 'Abbreviations & Glossary',
    slug: 'abbreviations-glossary',
    section_slug: 'pos-guides',
    type: 'reference',
    excerpt: 'Complete reference for all abbreviations and terms',
    read_time: 5,
    is_pinned: true,
    order_index: 8,
    content: {
      type: 'doc',
      content: [
        heading(1, 'Abbreviations & Glossary'),
        paragraph('Quick reference for all abbreviations and terminology.'),

        heading(2, 'Restaurant Operations'),
        table(
          ['Abbrev', 'Full Term', 'Meaning'],
          [
            ['FOH', 'Front of House', 'Customer-facing staff'],
            ['BOH', 'Back of House', 'Kitchen staff'],
            ['POS', 'Point of Sale', 'Register system'],
            ['QSR', 'Quick Service Restaurant', 'Fast food'],
            ['FSR', 'Full Service Restaurant', 'Sit-down dining'],
            ['GM', 'General Manager', 'Runs operations'],
            ['COGS', 'Cost of Goods Sold', 'Direct costs'],
          ]
        ),

        heading(2, 'Financial Terms'),
        table(
          ['Abbrev', 'Full Term', 'Meaning'],
          [
            ['P&L', 'Profit & Loss', 'Income statement'],
            ['KPI', 'Key Performance Indicator', 'Performance metric'],
            ['AR', 'Accounts Receivable', 'Money owed to you'],
            ['AP', 'Accounts Payable', 'Money you owe'],
            ['COA', 'Chart of Accounts', 'Account structure'],
            ['YTD', 'Year to Date', 'Since Jan 1'],
            ['MTD', 'Month to Date', 'Since 1st of month'],
          ]
        ),

        heading(2, 'Tax & Payroll'),
        table(
          ['Abbrev', 'Full Term', 'Meaning'],
          [
            ['FICA', 'Federal Insurance Contributions Act', 'SS + Medicare'],
            ['FUTA', 'Federal Unemployment Tax', 'Federal unemployment'],
            ['SUTA', 'State Unemployment Tax', 'State unemployment'],
            ['W-2', 'Wage and Tax Statement', 'Employee form'],
            ['1099', 'Miscellaneous Income', 'Contractor form'],
            ['OT', 'Overtime', 'Hours over 40/week'],
          ]
        ),

        heading(2, 'Time & Communication'),
        table(
          ['Abbrev', 'Full Term', 'Meaning'],
          [
            ['ET/EST', 'Eastern Time', 'New York'],
            ['CT/CST', 'Central Time', 'Texas'],
            ['PT/PST', 'Pacific Time', 'California'],
            ['EOD', 'End of Day', 'Close of business'],
            ['EOM', 'End of Month', 'Last day of month'],
            ['ASAP', 'As Soon As Possible', 'Urgent'],
          ]
        ),

      ],
    },
  },
]

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function seed() {
  console.log('🌱 Starting KB Article Seed...')
  console.log('')

  // Clear existing data if flag is set
  if (shouldClear) {
    console.log('🗑️  Clearing existing articles...')
    await supabase.from('kb_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('✓ Cleared existing articles')
    console.log('')
  }

  // Get section IDs
  console.log('📁 Fetching section IDs...')
  const { data: sectionsData, error: sectionsError } = await supabase
    .from('kb_sections')
    .select('id, slug')

  if (sectionsError) {
    console.error('Error fetching sections:', sectionsError)
    return
  }

  const sectionMap = new Map(sectionsData?.map(s => [s.slug, s.id]) || [])
  console.log(`✓ Found ${sectionMap.size} sections`)
  console.log('')

  // Combine all articles
  const allArticles = [
    ...chartOfAccountsArticles,
    ...sopArticles,
    ...exceptionArticles,
    ...sampleFinancialsArticles,
    ...clientEducationArticles,
    ...posGuidesArticles,
  ]

  console.log(`📝 Seeding ${allArticles.length} articles...`)
  console.log('')

  let successCount = 0
  let errorCount = 0

  for (const article of allArticles) {
    const sectionId = sectionMap.get(article.section_slug)
    
    if (!sectionId) {
      console.error(`❌ Section not found: ${article.section_slug}`)
      errorCount++
      continue
    }

    const { error } = await supabase.from('kb_articles').upsert({
      title: article.title,
      slug: article.slug,
      section_id: sectionId,
      excerpt: article.excerpt,
      is_published: true,
      order_index: article.order_index,
      content: article.content,
    }, {
      onConflict: 'section_id,slug',
    })

    if (error) {
      console.error(`❌ ${article.title}: ${error.message}`)
      errorCount++
    } else {
      console.log(`✓ ${article.title}`)
      successCount++
    }
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Success: ${successCount} articles`)
  console.log(`❌ Errors: ${errorCount} articles`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('🎉 KB Article Seed Complete!')
}

// Run the seed
seed().catch(console.error)
