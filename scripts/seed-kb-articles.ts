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
    description: 'Sample P&L statements by restaurant type, plus Balance Sheet template. Use for client expectations and benchmarking.',
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

const coaAccountList = (category: string, restaurantType = 'fsr') => ({
  type: 'coaAccountList',
  attrs: { category, restaurantType },
})

const stepFlow = (steps: { title: string; description: string }[]) => ({
  type: 'stepFlow',
  attrs: { steps, vertical: true },
})

// =============================================================================
// SECTION 1: CHART OF ACCOUNTS (5 cards: 1.1 – 1.5)
// =============================================================================

const chartOfAccountsArticles = [
  {
    title: '1.1 Master COA Framework',
    slug: '1-1-master-coa-framework',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Account range structure, revenue, COGS, labor, and operating expense breakdowns',
    read_time: 12,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, '1.1 Master COA Framework'),
        paragraph('The FinAcct360 Chart of Accounts is designed specifically for restaurant operations, providing granular visibility into all revenue streams, cost centers, and operational metrics that drive profitability in the food service industry.'),

        heading(2, 'Account Range Structure'),
        table(
          ['Range', 'Category', 'Purpose'],
          [
            ['1000-1999', 'Assets', 'Cash, receivables, inventory, equipment, deposits'],
            ['2000-2999', 'Liabilities', 'Payables, credit cards, loans, accrued expenses'],
            ['3000-3999', 'Equity', 'Owner capital, retained earnings, distributions'],
            ['4000-4999', 'Revenue', 'All sales by category, discounts, comps'],
            ['5000-5999', 'Cost of Goods Sold', 'Food cost, beverage cost, packaging, supplies'],
            ['6000-6999', 'Labor Costs', 'Wages, benefits, payroll taxes by position'],
            ['7000-7999', 'Operating Expenses', 'Rent, utilities, marketing, repairs, insurance'],
            ['8000-8999', 'Other Income/Expense', 'Interest, depreciation, one-time items'],
            ['9000-9999', 'Multi-Unit/Consolidated', 'Intercompany, allocations, consolidated entries'],
          ]
        ),

        heading(2, 'Revenue Accounts (4000s) - Detailed Breakdown'),
        table(
          ['Account', 'Name', 'Description & Usage'],
          [
            ['4000', 'Food Sales - Dine In', 'All food revenue from on-premise dining. Primary revenue driver for full-service.'],
            ['4010', 'Food Sales - Takeout', 'Direct takeout orders placed in-store or by phone. No third-party fees.'],
            ['4020', 'Food Sales - Delivery (1st Party)', "Delivery orders through restaurant's own drivers/system."],
            ['4030', 'Food Sales - DoorDash', 'Gross food sales via DoorDash before commission deduction.'],
            ['4031', 'Food Sales - Uber Eats', 'Gross food sales via Uber Eats before commission deduction.'],
            ['4032', 'Food Sales - Grubhub', 'Gross food sales via Grubhub before commission deduction.'],
            ['4040', 'Food Sales - Catering', 'Large orders for events, corporate functions, parties.'],
            ['4100', 'Beer Sales', 'All draft, bottle, and can beer sales.'],
            ['4110', 'Wine Sales', 'Wine by glass and bottle sales.'],
            ['4120', 'Spirits/Liquor Sales', 'All mixed drinks, shots, premium spirits.'],
            ['4130', 'Non-Alcoholic Beverage Sales', 'Soft drinks, coffee, tea, juices, mocktails.'],
            ['4200', 'Merchandise Sales', 'Branded items, retail products, gift cards.'],
            ['4900', 'Discounts & Comps', 'CONTRA ACCOUNT - Reduces revenue. Manager comps, promos, coupons.'],
            ['4910', 'Employee Meals', 'CONTRA ACCOUNT - Staff meal deductions from sales.'],
            ['4920', 'Voids & Refunds', 'CONTRA ACCOUNT - Order errors, customer refunds.'],
          ]
        ),

        heading(2, 'Cost of Goods Sold (5000s) - Detailed Breakdown'),
        table(
          ['Account', 'Name', 'Description & Usage'],
          [
            ['5000', 'Food Cost - Proteins', 'Meat, poultry, seafood purchases. Typically 35-45% of food cost.'],
            ['5010', 'Food Cost - Produce', 'Fresh vegetables, fruits, herbs. Monitor for waste closely.'],
            ['5020', 'Food Cost - Dairy', 'Milk, cheese, butter, cream, eggs.'],
            ['5030', 'Food Cost - Dry Goods', 'Pasta, rice, flour, canned goods, spices, oils.'],
            ['5040', 'Food Cost - Frozen', 'Frozen proteins, vegetables, prepared items.'],
            ['5050', 'Food Cost - Bakery/Bread', 'Bread, buns, pastries, desserts.'],
            ['5100', 'Beverage Cost - Beer', 'Draft, bottle, can beer purchases.'],
            ['5110', 'Beverage Cost - Wine', 'Wine inventory purchases.'],
            ['5120', 'Beverage Cost - Spirits', 'Liquor, mixers, garnishes for bar.'],
            ['5130', 'Beverage Cost - NA Beverages', 'Soft drinks, coffee, tea, juices, syrups.'],
            ['5200', 'Paper & Packaging', 'To-go containers, napkins, straws, bags. Critical for QSR/fast casual.'],
            ['5210', 'Smallwares & Supplies', 'Kitchen tools, utensils, disposable gloves.'],
            ['5300', 'Third-Party Delivery Fees', 'DoorDash, Uber Eats, Grubhub commissions (15-30% of order).'],
          ]
        ),

        heading(2, 'Labor Costs (6000s) - Detailed Breakdown'),
        table(
          ['Account', 'Name', 'Description & Usage'],
          [
            ['6000', 'FOH Wages - Servers', 'Server hourly wages (often $2.13-$7.25 tipped minimum).'],
            ['6010', 'FOH Wages - Bartenders', 'Bartender hourly wages.'],
            ['6020', 'FOH Wages - Hosts/Cashiers', 'Host stand, cashier positions.'],
            ['6030', 'FOH Wages - Bussers/Runners', 'Support staff hourly wages.'],
            ['6100', 'BOH Wages - Line Cooks', 'Kitchen line cook hourly wages.'],
            ['6110', 'BOH Wages - Prep Cooks', 'Prep cook hourly wages.'],
            ['6120', 'BOH Wages - Dishwashers', 'Dish/porter hourly wages.'],
            ['6200', 'Management Salaries', 'GM, AGM, Kitchen Manager fixed salaries.'],
            ['6210', 'Sous Chef/Executive Chef', 'Senior kitchen leadership salaries.'],
            ['6300', 'Overtime Pay', 'All overtime wages (1.5x rate). Track closely - major cost leak.'],
            ['6400', 'Payroll Taxes', 'FICA, FUTA, SUTA employer portion. ~7.65% of wages.'],
            ['6410', 'Workers Comp Insurance', 'Workers compensation premiums. High-risk industry.'],
            ['6420', 'Health Insurance', 'Employer-paid health benefits.'],
            ['6500', 'Contract Labor', 'Temp agencies, event staffing, 1099 workers.'],
          ]
        ),

        heading(2, 'Operating Expenses (7000s) - Detailed Breakdown'),
        table(
          ['Account', 'Name', 'Description & Usage'],
          [
            ['7000', 'Rent - Base', 'Monthly base rent per lease. Typically 6-10% of revenue.'],
            ['7010', 'Rent - CAM/NNN', 'Common area maintenance, triple net pass-throughs.'],
            ['7020', 'Rent - Percentage Rent', 'Revenue-based rent above breakpoint (mall/high-traffic locations).'],
            ['7100', 'Utilities - Electric', 'Electricity for HVAC, kitchen equipment, lighting.'],
            ['7110', 'Utilities - Gas', 'Natural gas for cooking, heating.'],
            ['7120', 'Utilities - Water/Sewer', 'Water usage, sewer, trash removal.'],
            ['7130', 'Utilities - Internet/Phone', 'Internet for POS, phones, music streaming.'],
            ['7200', 'Marketing - Digital', 'Social media ads, Google Ads, SEO, email marketing.'],
            ['7210', 'Marketing - Print/Local', 'Flyers, local sponsorships, signage.'],
            ['7220', 'Marketing - Loyalty Programs', 'Loyalty software, rewards fulfillment costs.'],
            ['7300', 'Repairs & Maintenance', 'Equipment repairs, HVAC service, plumbing, electrical.'],
            ['7310', 'Equipment Rental/Leases', 'Leased kitchen equipment, POS hardware rental.'],
            ['7400', 'Insurance - General Liability', 'GL policy for slip/fall, property damage.'],
            ['7410', 'Insurance - Property', 'Building/contents insurance.'],
            ['7420', 'Insurance - Liquor Liability', 'Dram shop coverage for alcohol service.'],
            ['7500', 'Professional Services', 'Accounting, legal, consulting fees.'],
            ['7510', 'Bank & Credit Card Fees', 'Merchant processing fees (typically 2.5-3.5% of CC sales).'],
            ['7520', 'Software & Subscriptions', 'POS subscription, scheduling software, inventory systems.'],
            ['7600', 'Cleaning & Janitorial', 'Cleaning supplies, janitorial service, linen service.'],
            ['7610', 'Pest Control', 'Monthly pest control service.'],
            ['7700', 'Licenses & Permits', 'Health permits, liquor license, business license.'],
            ['7800', 'Music & Entertainment', 'ASCAP/BMI fees, DJ, live entertainment.'],
          ]
        ),
      ],
    },
  },

  {
    title: '1.2 COA by Restaurant Type',
    slug: '1-2-coa-by-restaurant-type',
    section_slug: 'chart-of-accounts',
    type: 'guide',
    excerpt: 'Key accounts and target percentages for cafe, FSR, bar, QSR, fine dining, multi-unit',
    read_time: 10,
    is_pinned: true,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, '1.2 COA by Restaurant Type'),
        paragraph('While our master COA provides the complete framework, different restaurant concepts emphasize different accounts. Below are the key accounts and typical percentages for each restaurant type we serve.'),

        heading(2, 'Type 1: Cafe / Coffee Shop (Morning Buzz Profile)'),
        paragraph('Key Characteristics: High-margin beverages, morning/afternoon daypart focus, lower labor needs, high transaction volume with low average ticket.'),
        table(
          ['Revenue Focus', 'COGS Focus', 'Target Percentages'],
          [
            ['4130 NA Bev Sales (60-70%)', '5130 Coffee/Tea Cost', 'Total COGS: 22-28%'],
            ['4040 Food Sales (25-35%)', '5050 Bakery/Pastries', 'Labor: 25-30%'],
            ['4200 Merchandise (5-10%)', '5200 Paper Cups/Lids', 'Prime Cost: 50-55%'],
          ]
        ),

        heading(2, 'Type 2: Full Service Restaurant (Olive & Vine Profile)'),
        paragraph('Key Characteristics: Table service, full bar, higher check averages, lunch and dinner dayparts, significant FOH labor.'),
        table(
          ['Revenue Focus', 'COGS Focus', 'Target Percentages'],
          [
            ['4000 Food Dine-In (65-75%)', '5000-5050 Full Food Cost', 'Food COGS: 28-32%'],
            ['4100-4120 Alcohol (20-30%)', '5100-5120 Full Bar Cost', 'Bev COGS: 18-22%'],
            ['4130 NA Beverages (5%)', '5300 Delivery Fees (if applicable)', 'Labor: 30-35%'],
            ['', '', 'Prime Cost: 60-65%'],
          ]
        ),

        heading(2, 'Type 3: Bar & Grill / Sports Bar (Smokeys, Tailgators Profile)'),
        paragraph('Key Characteristics: Beverage-forward concept, high alcohol mix, event-driven traffic (games), late-night hours, entertainment costs.'),
        table(
          ['Revenue Focus', 'COGS Focus', 'Target Percentages'],
          [
            ['4100 Beer (30-40%)', '5100 Beer Cost (critical)', 'Bev COGS: 20-24%'],
            ['4120 Spirits (15-25%)', '5120 Spirits Cost', 'Food COGS: 30-35%'],
            ['4000 Food (35-45%)', '5000 Wings/Appetizers', 'Labor: 28-32%'],
            ['', '', 'Prime Cost: 58-62%'],
          ]
        ),

        heading(2, 'Type 4: Fast Casual / QSR (Brij Foods / Spitz Profile)'),
        paragraph('Key Characteristics: Counter service, high volume, fast throughput, heavy delivery mix, significant paper/packaging costs.'),
        table(
          ['Revenue Focus', 'COGS Focus', 'Target Percentages'],
          [
            ['4000 Food Dine-In (30-40%)', '5200 Paper/Packaging (HIGH)', 'Food COGS: 28-32%'],
            ['4010 Takeout (20-30%)', '5300 Delivery Fees (HIGH)', 'Paper: 3-5%'],
            ['4030-4032 3rd Party (25-35%)', '5000-5040 Food Cost', 'Delivery Fees: 8-12%'],
            ['', '', 'Labor: 25-30%'],
            ['', '', 'Prime Cost: 58-65%'],
          ]
        ),

        heading(2, 'Type 5: Fine Dining'),
        paragraph('Key Characteristics: High check average, premium ingredients, extensive wine program, high labor with skilled staff, dinner-focused.'),
        table(
          ['Revenue Focus', 'COGS Focus', 'Target Percentages'],
          [
            ['4000 Food Dine-In (60-70%)', '5000 Premium Proteins', 'Food COGS: 30-35%'],
            ['4110 Wine (20-30%)', '5110 Wine Inventory', 'Wine COGS: 28-35%'],
            ['4120 Spirits (5-10%)', '6200-6210 Chef Salaries', 'Labor: 35-40%'],
            ['', '', 'Prime Cost: 65-70%'],
          ]
        ),

        heading(2, 'Type 6: Multi-Unit / Chain Operations'),
        paragraph('Key Characteristics: Multiple locations, corporate overhead allocation, intercompany transactions, consolidated reporting requirements.'),
        table(
          ['Additional Accounts', 'Allocation Methods', 'Consolidation Notes'],
          [
            ['9000 Intercompany Revenue', 'Corporate overhead by revenue %', 'Eliminate intercompany'],
            ['9100 Management Fees', 'Marketing by unit count', 'Unit-level P&L required'],
            ['9200 Royalty Expense', 'IT by transaction volume', 'Same-store sales tracking'],
            ['9300 Corporate Allocations', 'HR by headcount', 'Four-wall EBITDA focus'],
          ]
        ),
      ],
    },
  },

  {
    title: '1.3 Balance Sheet Accounts',
    slug: '1-3-balance-sheet-accounts',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Assets (1000s), Liabilities (2000s), and Equity (3000s)',
    read_time: 8,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, '1.3 Balance Sheet Accounts'),
        paragraph('Balance sheet accounts represent what the business owns (assets), owes (liabilities), and owner interest (equity).'),

        heading(2, 'Assets (1000s)'),
        table(
          ['Account', 'Name', 'Description & Notes'],
          [
            ['1000', 'Operating Checking', 'Primary operating account for daily transactions.'],
            ['1010', 'Payroll Account', 'Dedicated account for payroll funding.'],
            ['1020', 'Savings/Reserve', 'Emergency fund, tax reserves.'],
            ['1100', 'Accounts Receivable', 'Catering deposits, gift card sales clearing, etc.'],
            ['1200', 'Food Inventory', 'On-hand food inventory value (if tracking).'],
            ['1210', 'Beverage Inventory', 'Bar inventory value (if tracking).'],
            ['1300', 'Prepaid Rent', 'Rent paid in advance.'],
            ['1310', 'Prepaid Insurance', 'Annual insurance premiums paid upfront.'],
            ['1400', 'Security Deposits', 'Lease deposits, utility deposits.'],
            ['1500', 'Leasehold Improvements', 'Build-out costs, tenant improvements.'],
            ['1510', 'Accumulated Depr - LHI', 'CONTRA - Accumulated depreciation on improvements.'],
            ['1600', 'Kitchen Equipment', 'Ovens, fryers, refrigeration, prep equipment.'],
            ['1610', 'Accumulated Depr - Equipment', 'CONTRA - Accumulated depreciation on equipment.'],
            ['1700', 'Furniture & Fixtures', 'Tables, chairs, bar fixtures, decor.'],
            ['1710', 'Accumulated Depr - FF&E', 'CONTRA - Accumulated depreciation on FF&E.'],
            ['1800', 'POS System & Technology', 'Point of sale hardware, computers, tablets.'],
          ]
        ),

        heading(2, 'Liabilities (2000s)'),
        table(
          ['Account', 'Name', 'Description & Notes'],
          [
            ['2000', 'Accounts Payable', 'Amounts owed to vendors, suppliers.'],
            ['2100', 'Credit Card - Amex', 'Business credit card balance.'],
            ['2110', 'Credit Card - Visa/MC', 'Additional credit card accounts.'],
            ['2200', 'Accrued Payroll', 'Wages earned but not yet paid.'],
            ['2210', 'Accrued Payroll Taxes', 'Payroll taxes owed to IRS/state.'],
            ['2300', 'Sales Tax Payable', 'Collected sales tax owed to state.'],
            ['2400', 'Gift Card Liability', 'Outstanding gift card balances (unearned revenue).'],
            ['2500', 'Line of Credit', 'Revolving credit facility balance.'],
            ['2600', 'Equipment Loan', 'Financed kitchen equipment.'],
            ['2700', 'SBA Loan / Term Loan', 'Long-term business loans.'],
            ['2800', 'Due to Owner/Shareholder', 'Owner loans to the business.'],
          ]
        ),

        heading(2, 'Equity (3000s)'),
        table(
          ['Account', 'Name', 'Description & Notes'],
          [
            ['3000', 'Owner Capital / Common Stock', 'Initial and additional owner investments.'],
            ['3100', 'Retained Earnings', 'Accumulated profits from prior years.'],
            ['3200', 'Owner Distributions', 'CONTRA - Owner draws/distributions.'],
            ['3300', 'Current Year Net Income', 'YTD profit/loss (auto-calculated).'],
          ]
        ),
      ],
    },
  },

  {
    title: '1.4 Cash Flow Classification',
    slug: '1-4-cash-flow-classification',
    section_slug: 'chart-of-accounts',
    type: 'reference',
    excerpt: 'Operating, Investing, and Financing cash flow mapping',
    read_time: 5,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, '1.4 Cash Flow Classification'),
        paragraph('Understanding cash flow classification is critical for restaurant owners. Below is our standard mapping of restaurant accounts to the three cash flow categories.'),

        heading(2, 'Operating Activities'),
        table(
          ['Cash Inflows (Sources)', 'Cash Outflows (Uses)'],
          [
            ['Cash sales and credit card settlements', 'Payment to food/beverage vendors'],
            ['Collection of accounts receivable', 'Payroll and payroll taxes'],
            ['Gift card sales (initially)', 'Rent and utility payments'],
            ['Deposits received for catering', 'Insurance premiums'],
            ['', 'Marketing and advertising'],
            ['', 'All operating expenses'],
          ]
        ),

        heading(2, 'Investing Activities'),
        table(
          ['Cash Inflows (Sources)', 'Cash Outflows (Uses)'],
          [
            ['Sale of equipment', 'Purchase of kitchen equipment'],
            ['Return of security deposits', 'Leasehold improvements'],
            ['Proceeds from selling a location', 'POS system purchases'],
            ['', 'Security deposits paid'],
            ['', 'Furniture and fixtures'],
          ]
        ),

        heading(2, 'Financing Activities'),
        table(
          ['Cash Inflows (Sources)', 'Cash Outflows (Uses)'],
          [
            ['Owner capital contributions', 'Owner distributions/draws'],
            ['Bank loan proceeds', 'Loan principal payments'],
            ['Line of credit draws', 'Line of credit paydowns'],
            ['Equipment financing', 'Equipment loan payments'],
          ]
        ),
      ],
    },
  },

  {
    title: '1.5 QuickBooks Online Mapping Guide',
    slug: '1-5-quickbooks-online-mapping-guide',
    section_slug: 'chart-of-accounts',
    type: 'guide',
    excerpt: 'QBO account type mapping and setup best practices',
    read_time: 8,
    is_pinned: true,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, '1.5 QuickBooks Online Mapping Guide'),
        paragraph('When setting up a new client in QBO or converting an existing file to our COA structure, follow this mapping guide to ensure consistency across all FinAcct360 clients.'),

        heading(2, 'QBO Account Type Mapping'),
        table(
          ['Our Range', 'QBO Account Type', 'QBO Detail Type', 'Notes'],
          [
            ['1000-1099', 'Bank', 'Checking/Savings', 'One account per bank acct'],
            ['1100-1199', 'Accounts Receivable', 'Accounts Receivable', 'Use for catering AR'],
            ['1200-1299', 'Other Current Assets', 'Inventory', 'Only if tracking inventory'],
            ['1300-1399', 'Other Current Assets', 'Prepaid Expenses', 'Rent, insurance'],
            ['1500-1899', 'Fixed Assets', 'Various', 'LHI, Equipment, FF&E'],
            ['2000-2099', 'Accounts Payable', 'Accounts Payable', 'Vendor payables'],
            ['2100-2199', 'Credit Card', 'Credit Card', 'One per card'],
            ['2200-2499', 'Other Current Liabilities', 'Various', 'Accruals, sales tax, gift cards'],
            ['2500-2899', 'Long Term Liabilities', 'Notes Payable', 'Loans, equipment financing'],
            ['3000-3999', 'Equity', 'Various', 'Owner equity, retained earnings'],
            ['4000-4999', 'Income', 'Sales of Product Income', 'All revenue accounts'],
            ['5000-5999', 'Cost of Goods Sold', 'Supplies & Materials COGS', 'All COGS accounts'],
            ['6000-6999', 'Expenses', 'Payroll Expenses', 'All labor accounts'],
            ['7000-7999', 'Expenses', 'Various', 'Operating expenses'],
            ['8000-8999', 'Other Income/Expense', 'Various', 'Interest, depreciation, other'],
          ]
        ),

        heading(2, 'QBO Setup Best Practices'),
        bulletList([
          'Account Numbering: Enable account numbers in QBO (Settings > Advanced > Chart of Accounts > Enable account numbers). Use our 4-digit numbering system consistently.',
          'Sub-accounts: Use parent/sub-account structure for grouping (e.g., 4100 Beverage Sales as parent with 4100 Beer, 4110 Wine, 4120 Spirits as subs).',
          'Inactive Accounts: Rather than delete accounts from a messy conversion, make unused accounts inactive. This preserves historical data while cleaning the active COA.',
          'Classes: For multi-unit operators, use QBO Classes for location tracking rather than creating duplicate account numbers per location.',
          'Import Template: Use our standard COA import template (available in Google Drive > Templates > COA Import Template.xlsx) for new client setups.',
        ]),
      ],
    },
  },
]

// =============================================================================
// SECTION 2: STANDARD OPERATING PROCEDURES (5 articles: 2.1 – 2.5)
// =============================================================================

const sopArticles = [
  {
    title: '2.1 Client Onboarding Procedure',
    slug: '2-1-client-onboarding-procedure',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'Phases, steps, and checklist for onboarding new restaurant clients',
    read_time: 12,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, '2.1 Client Onboarding Procedure'),
        paragraph('The onboarding process is critical to establishing a successful client relationship. A thorough onboarding ensures we have complete access, understand the client\'s business model, and can set up their books according to FinAcct360 standards.'),

        heading(2, 'Phase 1: Pre-Onboarding (Day 0)'),
        table(
          ['Step', 'Action', 'Owner'],
          [
            ['1.1', 'Receive signed engagement letter and payment info from sales', 'Account Manager'],
            ['1.2', 'Create client folder in Google Drive using template structure', 'Account Manager'],
            ['1.3', 'Send Welcome Email with onboarding questionnaire link', 'Account Manager'],
            ['1.4', 'Schedule kickoff call within 3 business days', 'Account Manager'],
            ['1.5', 'Add client to project management system (Monday.com)', 'Account Manager'],
          ]
        ),

        heading(2, 'Phase 2: Kickoff Call (Day 1-3)'),
        table(
          ['Step', 'Action', 'Owner'],
          [
            ['2.1', 'Review completed onboarding questionnaire before call', 'Assigned Accountant'],
            ['2.2', 'Conduct 30-minute kickoff call covering: Confirm restaurant type and business model; Identify POS system and integrations; Discuss reporting preferences; Set communication expectations', 'Account Manager + Accountant'],
            ['2.3', 'Request QBO login credentials (accountant invite)', 'Accountant'],
            ['2.4', 'Request POS system read-only access credentials', 'Accountant'],
            ['2.5', 'Request bank read-only access (Plaid connection or statements)', 'Accountant'],
            ['2.6', 'Request payroll system access (Gusto, ADP, etc.)', 'Accountant'],
          ]
        ),

        heading(2, 'Phase 3: System Setup (Day 3-7)'),
        table(
          ['Step', 'Action', 'Owner'],
          [
            ['3.1', 'Complete Books Health Check (see SOP 2.2)', 'Accountant'],
            ['3.2', 'Implement FinAcct360 Chart of Accounts (COA conversion)', 'Senior Accountant'],
            ['3.3', 'Set up bank feeds and verify connections', 'Accountant'],
            ['3.4', 'Configure POS data import process or bank rule mapping', 'Accountant'],
            ['3.5', 'Set up recurring vendor bills if applicable', 'Accountant'],
            ['3.6', 'Create client profile in KPI Dashboard system', 'Accountant'],
          ]
        ),

        heading(2, 'Phase 4: First Close Cycle (Week 2-4)'),
        table(
          ['Step', 'Action', 'Owner'],
          [
            ['4.1', 'Complete first weekly close with detailed review', 'Senior Accountant'],
            ['4.2', 'Present first week KPI dashboard to client', 'Account Manager'],
            ['4.3', 'Gather client feedback and adjust processes', 'Account Manager'],
            ['4.4', 'Complete first monthly close with full P&L review', 'Senior Accountant'],
            ['4.5', 'Schedule 30-day check-in call to review onboarding', 'Account Manager'],
          ]
        ),

        heading(2, 'Onboarding Checklist Summary'),
        table(
          ['Required Item', 'Status'],
          [
            ['Signed engagement letter received', '[ ] Complete'],
            ['Onboarding questionnaire completed', '[ ] Complete'],
            ['QBO accountant access granted', '[ ] Complete'],
            ['POS system access received', '[ ] Complete'],
            ['Bank feeds connected', '[ ] Complete'],
            ['Payroll access received', '[ ] Complete'],
            ['Books Health Check completed', '[ ] Complete'],
            ['COA converted to FinAcct360 standard', '[ ] Complete'],
            ['First weekly close completed', '[ ] Complete'],
            ['First monthly close completed', '[ ] Complete'],
            ['30-day check-in completed', '[ ] Complete'],
          ]
        ),
      ],
    },
  },

  {
    title: '2.2 Books Health Check Procedure',
    slug: '2-2-books-health-check-procedure',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'Scoring system, criteria, and steps for auditing client books',
    read_time: 10,
    is_pinned: false,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, '2.2 Books Health Check Procedure'),
        paragraph('The Books Health Check is performed for every new client and quarterly for existing clients. This systematic review identifies issues, establishes a baseline, and prioritizes cleanup work.'),

        heading(2, 'Health Check Scoring System'),
        table(
          ['Score', 'Rating', 'Description'],
          [
            ['90-100', 'Excellent', 'Books are clean, COA aligned, minimal adjustments needed'],
            ['70-89', 'Good', 'Minor issues, some COA adjustments, 1-2 weeks cleanup'],
            ['50-69', 'Fair', 'Moderate issues, COA overhaul needed, 2-4 weeks cleanup'],
            ['Below 50', 'Poor', 'Major issues, significant reconstruction required, 4+ weeks'],
          ]
        ),

        heading(2, 'Health Check Criteria (100 Points Total)'),
        table(
          ['Category', 'Points', 'Evaluation Criteria'],
          [
            ['Bank Reconciliation', '20 pts', 'All bank accounts reconciled within 30 days? No unexplained differences?'],
            ['Chart of Accounts', '15 pts', 'Logical structure? Appropriate detail level? Consistent with restaurant needs?'],
            ['Revenue Recording', '15 pts', 'Daily sales recorded? Sales match POS reports? Proper sales tax handling?'],
            ['COGS Tracking', '15 pts', 'Food/bev costs separated? Purchases properly categorized? Reasonable cost ratios?'],
            ['Payroll Recording', '10 pts', 'Payroll entries match payroll reports? Taxes properly recorded? Labor categories clear?'],
            ['Accounts Payable', '10 pts', 'Open bills accurate? Aging reasonable? No duplicate entries?'],
            ['Fixed Assets', '5 pts', 'Equipment recorded? Depreciation calculated? Proper capitalization?'],
            ['Loans & Liabilities', '5 pts', 'Loan balances accurate? Payments split principal/interest?'],
            ['Equity Section', '5 pts', 'Owner contributions/distributions clear? Retained earnings correct?'],
          ]
        ),

        heading(2, 'Health Check Procedure Steps'),
        bulletList([
          'Run Balance Sheet and P&L for last 12 months',
          'Check bank reconciliation status for all accounts',
          'Review Chart of Accounts structure and compare to FinAcct360 template',
          'Cross-reference monthly revenue to POS summary reports',
          'Calculate food cost % and beverage cost % — flag if outside industry norms',
          'Verify payroll entries against payroll register totals',
          'Review AP aging for old/duplicate items',
          'Check for uncategorized transactions or suspense accounts',
          'Verify loan balances against lender statements',
          'Document findings in Health Check Report template',
        ]),
      ],
    },
  },

  {
    title: '2.3 Weekly Close Process',
    slug: '2-3-weekly-close-process',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'Timeline and step-by-step weekly close for KPI dashboard delivery by Wednesday',
    read_time: 14,
    is_pinned: true,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, '2.3 Weekly Close Process'),
        paragraph('The weekly close is the foundation of our service. Clients receive their KPI dashboard every week, which requires disciplined close procedures completed by Wednesday of each week for the prior week ending Sunday.'),

        heading(2, 'Weekly Close Timeline'),
        table(
          ['Day', 'Task', 'Deliverable'],
          [
            ['Monday', 'Download POS sales reports (Mon-Sun) Download bank transactions Request vendor invoices if needed', 'Raw data files saved to client folder'],
            ['Tuesday', 'Reconcile daily sales to bank deposits Categorize all bank transactions Record vendor invoices', 'Sales reconciled Bank transactions coded'],
            ['Wednesday', 'Run weekly P&L Populate KPI dashboard Quality check all numbers Send dashboard to client', 'Weekly KPI Dashboard delivered by 5pm'],
          ]
        ),

        heading(2, 'Step-by-Step Weekly Close'),
        heading(3, 'Step 1: Export POS Sales Data'),
        paragraph('Log into client\'s POS system and export the weekly sales summary. See POS & Software Guides section for system-specific instructions. Required data points:'),
        bulletList([
          'Gross sales by category (food, beer, wine, spirits, NA beverages)',
          'Discounts and comps',
          'Voids and refunds',
          'Net sales by payment type',
          'Sales by order type (dine-in, takeout, delivery)',
          'Third-party delivery sales (DoorDash, Uber Eats, Grubhub)',
        ]),

        heading(3, 'Step 2: Reconcile Sales to Bank Deposits'),
        paragraph('Daily credit card settlements should match POS credit card totals within a small variance (typically merchant fees are deducted). Document any variances over $50.'),

        heading(3, 'Step 3: Categorize Bank Transactions'),
        paragraph('Review and categorize all bank transactions using established bank rules. Key categorizations:'),
        table(
          ['Transaction Type', 'Account'],
          [
            ['Sysco, US Foods, Restaurant Depot', '5000-5050 Food Cost accounts'],
            ['Beverage distributors (breakout beer/wine/spirits)', '5100-5120 Beverage Cost accounts'],
            ['Gusto, ADP, Paychex', '6000s Labor accounts (review register)'],
            ['Landlord payments', '7000-7020 Rent accounts'],
            ['Utility companies', '7100-7130 Utilities'],
          ]
        ),

        heading(3, 'Step 4: Run Weekly P&L'),
        paragraph('Generate P&L for the week (Monday-Sunday). Review for reasonableness:'),
        bulletList([
          'Revenue within 10% of prior week (unless event/holiday)?',
          'Food cost % between 25-35% depending on concept?',
          'Labor cost % between 25-35% depending on concept?',
          'No unusual spikes in any expense category?',
        ]),

        heading(3, 'Step 5: Populate KPI Dashboard'),
        paragraph('Enter data into the client\'s KPI dashboard. All 30+ data fields must be populated. See KPI field list in COA section. Dashboard auto-calculates:'),
        bulletList([
          'Prime Cost % = (COGS + Labor) / Net Sales',
          'Gross Profit = Net Sales - COGS',
          'EBITDA = Net Profit + Interest + Taxes + Depreciation + Amortization',
          'Week-over-week comparisons',
          'Budget vs. actual variances',
        ]),
      ],
    },
  },

  {
    title: '2.4 Monthly Close Process',
    slug: '2-4-monthly-close-process',
    section_slug: 'standard-operating-procedures',
    type: 'checklist',
    excerpt: 'Checklist, adjusting entries, and P&L analysis for month-end close by 10th',
    read_time: 12,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, '2.4 Monthly Close Process'),
        paragraph('The monthly close builds on weekly closes to produce final financial statements. Monthly closes are completed by the 10th of the following month.'),

        heading(2, 'Monthly Close Checklist'),
        table(
          ['#', 'Task', 'Due Date'],
          [
            ['1', 'Complete all weekly closes for the month', 'By 5th'],
            ['2', 'Reconcile all bank accounts to statements', 'By 7th'],
            ['3', 'Reconcile all credit card accounts', 'By 7th'],
            ['4', 'Verify payroll register totals match QBO entries', 'By 7th'],
            ['5', 'Record any accruals (if accrual basis client)', 'By 8th'],
            ['6', 'Record prepaid expense amortization', 'By 8th'],
            ['7', 'Record depreciation expense', 'By 8th'],
            ['8', 'Record loan interest allocation', 'By 8th'],
            ['9', 'Review P&L for reasonableness and anomalies', 'By 9th'],
            ['10', 'Review Balance Sheet for reasonableness', 'By 9th'],
            ['11', 'Generate final P&L and Balance Sheet PDFs', 'By 10th'],
            ['12', 'Prepare monthly summary commentary', 'By 10th'],
            ['13', 'Send monthly financial package to client', 'By 10th'],
          ]
        ),

        heading(2, 'Monthly Adjusting Entries'),
        bulletList([
          'Prepaid Rent: If rent is paid quarterly or annually, record 1/3 or 1/12 of the prepaid balance as rent expense each month.',
          'Prepaid Insurance: Amortize annual insurance premiums monthly (1/12 per month).',
          'Depreciation: Record monthly depreciation for all fixed assets. Typical lives: Equipment 5-7 years, LHI over lease term, FF&E 5-7 years.',
          'Loan Interest: Split loan payments between principal (reduces liability) and interest (expense). Use amortization schedule from lender.',
        ]),

        heading(2, 'Monthly P&L Analysis Points'),
        paragraph('When reviewing the monthly P&L, analyze these key metrics and flag anything outside normal ranges:'),
        table(
          ['Metric', 'Target Range', 'Red Flag If'],
          [
            ['Food Cost %', '25-35% of food sales', '> 38% or < 22%'],
            ['Beverage Cost %', '18-24% of bev sales', '> 28% or < 15%'],
            ['Total Labor %', '28-35% of sales', '> 40%'],
            ['Prime Cost %', '55-65% of sales', '> 70%'],
            ['Occupancy Cost %', '6-10% of sales', '> 12%'],
            ['Net Profit %', '5-15% of sales', '< 3% or negative'],
          ]
        ),
      ],
    },
  },

  {
    title: '2.5 QBO Export Guides',
    slug: '2-5-qbo-export-guides',
    section_slug: 'standard-operating-procedures',
    type: 'guide',
    excerpt: 'Standard exports for P&L, Balance Sheet, transactions, and Chart of Accounts',
    read_time: 8,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, '2.5 QBO Export Guides'),
        paragraph('Standard exports we provide to clients and use internally for analysis.'),

        heading(2, 'Profit & Loss Export'),
        bulletList([
          'Navigate to Reports > Profit and Loss',
          'Set date range (weekly: specific Mon-Sun, monthly: full month)',
          'Click Customize > Rows/Columns',
          'Enable: Show non-zero rows, Show % of Income column',
          'For comparison: Add columns for Previous Period or Same Period Last Year',
          'Click Run Report, then Export > Export to PDF',
        ]),

        heading(2, 'Balance Sheet Export'),
        bulletList([
          'Navigate to Reports > Balance Sheet',
          'Set As of date to last day of period',
          'Click Customize > Rows/Columns',
          'For comparison: Add Previous Year column',
          'Click Run Report, then Export > Export to PDF',
        ]),

        heading(2, 'Transaction Export for Analysis'),
        bulletList([
          'Navigate to Reports > Transaction List by Date',
          'Set date range for period needed',
          'Click Customize > Filter > Transaction Type (select specific types if needed)',
          'Export > Export to Excel for data manipulation',
        ]),

        heading(2, 'Chart of Accounts Export'),
        bulletList([
          'Navigate to Settings (gear) > Chart of Accounts',
          'Click Run Report (top right)',
          'Export > Export to Excel',
          'Use this for COA comparisons and cleanup planning',
        ]),
      ],
    },
  },
]

// =============================================================================
// =============================================================================
// SECTION 3: EXCEPTION HANDLING (8 articles: 3.1 – 3.8)
// =============================================================================

const exceptionArticles = [
  {
    title: '3.1 Client Refuses COA Change',
    slug: '3-1-client-refuses-coa-change',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'Address client resistance to Chart of Accounts conversion professionally',
    read_time: 10,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, '3.1 Client Refuses COA Change'),
        paragraph('Occasionally, a client will resist converting to our standardized Chart of Accounts. This protocol defines how to address resistance professionally while maintaining service quality.'),

        heading(2, 'Common Client Objections & Responses'),
        table(
          ['Objection', 'Response Strategy'],
          [
            ['My CPA set this up', 'We\'re not changing tax categorizations — just adding operational detail. Offer to send a mapping summary to their CPA showing how our COA aligns with tax returns.'],
            ['I\'ve done it this way for years', 'Acknowledge their experience. Our restaurant-specific COA provides insights generic setups can\'t offer. We can keep their accounts as sub-accounts under our structure.'],
            ['It seems too complicated', 'Emphasize that THEY won\'t do any additional work — we handle all categorization. Show them a sample KPI dashboard to demonstrate the value they\'ll receive.'],
            ['I don\'t want to lose historical data', 'We NEVER delete historical data. We reclassify and add structure. We can produce reports in the old format for comparison if needed.'],
          ]
        ),

        heading(2, 'Escalation Path'),
        bulletList([
          'Accountant discusses value proposition with client (first attempt)',
          'If resistance continues, Account Manager joins call to discuss business impact',
          'Document client\'s specific objections in client notes',
          'If client still refuses, escalate to Ganesh for final decision',
        ]),
        warningBox('IMPORTANT', 'If a client refuses our COA AND is not willing to accept any exception option, Ganesh must approve continuation. We do not onboard clients where we cannot deliver our standard of service.'),
      ],
    },
  },

  {
    title: '3.2 Messy Books Protocol',
    slug: '3-2-messy-books-protocol',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'Assess severity, communicate with client, and execute cleanup plan',
    read_time: 14,
    is_pinned: true,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, '3.2 Messy Books Protocol'),
        paragraph('Some new clients come to us with books in disarray. This protocol defines how to assess the situation, communicate with the client, and develop a cleanup plan.'),

        heading(2, 'Severity Assessment Matrix'),
        table(
          ['Level', 'Indicators', 'Cleanup Scope'],
          [
            ['Level 1: Minor', 'Bank not reconciled 1-2 months, some miscategorized transactions, minor COA issues', '1-2 weeks cleanup, proceed with normal onboarding, no additional billing'],
            ['Level 2: Moderate', 'Bank not reconciled 3-6 months, payroll entries not matching, uncategorized > $5K/month', '2-4 weeks cleanup, $500-$1,500 fee, delay dashboards until complete'],
            ['Level 3: Severe', 'Bank not reconciled 6+ months, differences > $10K, payroll liability issues, unclear sales tax', '4-8 weeks cleanup, $1,500-$5,000 fee, must complete before service starts'],
            ['Level 4: Critical', 'Unreliable historical data, possible fraud, tax returns don\'t match books, multiple years of issues', 'Forensic review needed, may need CPA, separate engagement, $5,000-$15,000+'],
          ]
        ),

        heading(2, 'Cleanup Protocol Steps'),
        bulletList([
          'Complete Books Health Check immediately upon receiving access',
          'Document all issues with specific examples and dollar amounts',
          'Assign severity level per matrix above',
          'For Level 2+, schedule client call to present findings and cleanup proposal',
          'Get written approval before starting cleanup work',
          'Start with bank reconciliations — work from oldest unreconciled month forward',
          'Document all adjustments made with explanations',
        ]),
        insightBox('Current First, Always', 'Don\'t spend 3 weeks cleaning up history while current transactions pile up. Get the current week clean and delivering value, THEN work backward.'),
      ],
    },
  },

  {
    title: '3.3 Missing Data Handling',
    slug: '3-3-missing-data-handling',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'Immediate actions and escalation when POS, bank, payroll, or vendor data is missing',
    read_time: 10,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, '3.3 Missing Data Handling'),
        paragraph('When client data is incomplete or unavailable, follow these scenarios and escalation steps.'),

        heading(2, 'Missing Data Scenarios & Actions'),
        table(
          ['Missing Item', 'Immediate Action', 'If Not Received in 48 Hours'],
          [
            ['POS Sales Report', 'Email client with specific date range needed and export instructions', 'Delay weekly dashboard with note. Escalate to Account Manager.'],
            ['Bank Statement', 'Check if bank feed is connected. If not, request PDF statement.', 'Proceed with available data, note unreconciled period.'],
            ['Payroll Register', 'Log into payroll system if we have access. If not, email client.', 'Record estimated payroll based on prior periods with adjusting entry.'],
            ['Vendor Invoices', 'Check document folder. Email client for missing items.', 'Categorize based on vendor name and prior patterns. Note as estimated.'],
            ['3rd Party Delivery Statements', 'Log into DoorDash/Uber/Grubhub portals if we have access.', 'Use bank deposits and standard commission rates (15-30%) to estimate.'],
          ]
        ),

        heading(2, 'Chronic Missing Data Escalation'),
        bulletList([
          'After 3rd instance in a month: Account Manager sends formal reminder email',
          'After 5th instance: Schedule call to discuss data delivery expectations',
          'If pattern continues: Escalate to Ganesh to discuss engagement terms',
        ]),
        warningBox('Never Guess', 'If you can\'t get the data and can\'t find an alternative source, flag it clearly on the P&L. Never estimate without documentation.'),
      ],
    },
  },

  {
    title: '3.4 QBO Technical Issues',
    slug: '3-4-qbo-technical-issues',
    section_slug: 'exception-handling',
    type: 'troubleshoot',
    excerpt: 'Bank feed, duplicates, reconciliation, payroll sync, and balance sheet issues',
    read_time: 12,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, '3.4 QBO Technical Issues'),
        paragraph('Common QuickBooks Online problems and resolution steps.'),

        heading(2, 'Common Issues & Solutions'),
        table(
          ['Issue', 'Resolution Steps'],
          [
            ['Bank Feed Disconnected', '1. Go to Banking > Link Account > Reconnect. 2. Client may need to re-enter credentials. 3. If persistent, contact bank. 4. Alternative: Import via CSV.'],
            ['Duplicate Transactions', '1. Check if same transaction imported AND manually entered. 2. Use Exclude feature. 3. NEVER delete — use Match or Exclude. 4. Run Transaction List by Date to identify duplicates.'],
            ['Reconciliation Won\'t Balance', '1. Check for voided/deleted transactions. 2. Look for wrong date entries. 3. Verify opening balance. 4. Run Reconciliation Discrepancy Report.'],
            ['Payroll Not Syncing', '1. Verify QBO Payroll subscription. 2. Check Sync preferences. 3. Run Re-sync. 4. If third-party payroll, create journal entries manually.'],
            ['Balance Sheet Out of Balance', 'RARE — indicates serious issue. 1. Run BS by quarter to identify timing. 2. Check modified reconciliations. 3. Contact Intuit support immediately.'],
          ]
        ),
        exampleBox('Intuit ProAdvisor Support', '1-800-488-7330'),
        proTipBox('Clear browser cache and try incognito mode before escalating QBO issues. Many problems are browser-related.'),
      ],
    },
  },

  {
    title: '3.5 Business Model Exceptions',
    slug: '3-5-business-model-exceptions',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'COA modifications for ghost kitchens, food halls, catering, franchise, and hotel F&B',
    read_time: 14,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, '3.5 Business Model Exceptions'),
        paragraph('Not all restaurant operations fit neatly into our standard COA framework. This section addresses non-standard business models.'),

        heading(2, 'Ghost Kitchens / Virtual Brands'),
        paragraph('Characteristics: No dine-in, delivery-only, may operate multiple brands from one kitchen, high third-party delivery percentage (often 80-100%).'),
        paragraph('COA Modifications: Remove dine-in revenue accounts. Expand delivery revenue accounts by platform AND by virtual brand. Track packaging costs carefully (often 5-8% of revenue). Consider separate P&L per brand using QBO Classes.'),

        heading(2, 'Food Halls / Shared Kitchens'),
        paragraph('Characteristics: Shared facilities, complex rent structures (base + percentage), shared staff arrangements, central POS vs. individual POS.'),
        paragraph('COA Modifications: Add accounts for common area fees (7030), percentage rent tracking (7020), shared labor allocation if applicable. Track commission fees to food hall operator.'),

        heading(2, 'Catering-Heavy Operations'),
        paragraph('Characteristics: More than 30% of revenue from catering, deposit-based sales, event staffing costs, transportation/delivery costs.'),
        paragraph('COA Modifications: Separate catering P&L using QBO Class. Add: Catering Deposits Liability (2410), Event Staffing (6510), Catering Vehicle Expense (7350), Equipment Rental (7360). Track gross margin by event.'),

        heading(2, 'Franchise Operations'),
        paragraph('Characteristics: Royalty fees, marketing fund contributions, required vendor purchases, franchisor reporting requirements.'),
        paragraph('COA Modifications: Add: Royalty Expense (7900), Marketing Fund Contribution (7910), Franchisor Required Purchases sub-account under COGS. May need to produce reports matching franchisor format.'),

        heading(2, 'Hotel F&B Operations'),
        paragraph('Characteristics: Room service, banquet operations, hotel allocations, complex comp meal handling, multiple outlets.'),
        paragraph('COA Modifications: Separate revenue by outlet (Restaurant, Bar, Room Service, Banquet). Track hotel management fees and allocations. Handle room charges and settlement process. May need custom reporting to match hotel owner requirements.'),

        warningBox('Non-Standard Setup', 'For any non-standard business model: Document the modifications needed, get Ganesh approval before onboarding, and create a custom setup guide for the client file.'),
      ],
    },
  },

  {
    title: '3.6 Bank Feed Errors',
    slug: '3-6-bank-feed-errors',
    section_slug: 'exception-handling',
    type: 'troubleshoot',
    excerpt: 'Fixing bank connection and import issues; when to use manual CSV import',
    read_time: 8,
    is_pinned: false,
    order_index: 5,
    content: {
      type: 'doc',
      content: [
        heading(1, '3.6 Bank Feed Errors'),
        paragraph('Bank feed issues are common. See 3.4 for high-level bank feed steps; this article details disconnection causes and manual import fallback.'),

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
    title: '3.7 Payroll Discrepancies',
    slug: '3-7-payroll-discrepancies',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'When payroll doesn\'t match bank or reports; investigation and adjustments',
    read_time: 8,
    is_pinned: false,
    order_index: 6,
    content: {
      type: 'doc',
      content: [
        heading(1, '3.7 Payroll Discrepancies'),
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
    title: '3.8 Third-Party Delivery Issues',
    slug: '3-8-third-party-delivery-issues',
    section_slug: 'exception-handling',
    type: 'playbook',
    excerpt: 'DoorDash, Uber Eats, Grubhub reconciliation and fee recording',
    read_time: 9,
    is_pinned: false,
    order_index: 7,
    content: {
      type: 'doc',
      content: [
        heading(1, '3.8 Third-Party Delivery Issues'),
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
// SECTION 4: SAMPLE FINANCIALS (5 articles: 4.1 – 4.5)
// =============================================================================

const sampleFinancialsArticles = [
  {
    title: '4.1 Cafe / Coffee Shop P&L (Morning Buzz Profile)',
    slug: '4-1-cafe-coffee-shop-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Monthly P&L for a typical 1,200 sq ft cafe with $85,000 monthly revenue',
    read_time: 10,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, '4.1 Cafe / Coffee Shop P&L (Morning Buzz Profile)'),
        paragraph('Monthly P&L for a typical 1,200 sq ft cafe with $85,000 monthly revenue.'),

        heading(2, 'REVENUE'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Coffee & Espresso Sales', '$51,000', '60.0%'],
            ['Tea & Other Beverages', '$8,500', '10.0%'],
            ['Food - Pastries & Bakery', '$17,000', '20.0%'],
            ['Food - Breakfast/Lunch Items', '$6,800', '8.0%'],
            ['Retail Merchandise', '$2,550', '3.0%'],
            ['Less: Discounts & Comps', '($850)', '-1.0%'],
            ['TOTAL REVENUE', '$85,000', '100.0%'],
          ]
        ),

        heading(2, 'COST OF GOODS SOLD'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Coffee Beans & Supplies', '$8,500', '10.0%'],
            ['Milk & Dairy', '$4,250', '5.0%'],
            ['Bakery/Pastry Cost', '$5,100', '6.0%'],
            ['Food Ingredients', '$2,550', '3.0%'],
            ['Paper Cups & Supplies', '$2,125', '2.5%'],
            ['TOTAL COGS', '$22,525', '26.5%'],
          ]
        ),

        heading(2, 'GROSS PROFIT'),
        paragraph('$62,475 — 73.5%'),

        heading(2, 'LABOR'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Barista Wages', '$15,300', '18.0%'],
            ['Manager Salary', '$4,500', '5.3%'],
            ['Payroll Taxes & Benefits', '$2,380', '2.8%'],
            ['TOTAL LABOR', '$22,180', '26.1%'],
          ]
        ),

        heading(2, 'PRIME COST (COGS + Labor)'),
        paragraph('$44,705 — 52.6%'),

        heading(2, 'OPERATING EXPENSES'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Rent', '$6,000', '7.1%'],
            ['Utilities', '$1,275', '1.5%'],
            ['Insurance', '$850', '1.0%'],
            ['Marketing', '$1,275', '1.5%'],
            ['Credit Card Fees', '$2,550', '3.0%'],
            ['Software & Tech', '$425', '0.5%'],
            ['Repairs & Maintenance', '$680', '0.8%'],
            ['Other Operating', '$1,020', '1.2%'],
            ['TOTAL OPERATING', '$14,075', '16.6%'],
          ]
        ),

        heading(2, 'NET OPERATING INCOME'),
        paragraph('$26,220 — 30.8%'),

        insightBox('Key Benchmarks', 'Beverage cost should be 15-20% of beverage sales. Prime cost target: 50-55%. Rent should stay under 8% of sales.'),
      ],
    },
  },

  {
    title: '4.2 Full Service Restaurant P&L (Olive & Vine Profile)',
    slug: '4-2-full-service-restaurant-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Monthly P&L for a 4,500 sq ft full-service restaurant with $350,000 monthly revenue',
    read_time: 12,
    is_pinned: false,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, '4.2 Full Service Restaurant P&L (Olive & Vine Profile)'),
        paragraph('Monthly P&L for a 4,500 sq ft full-service restaurant with $350,000 monthly revenue.'),

        heading(2, 'REVENUE'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Food Sales - Dine In', '$227,500', '65.0%'],
            ['Food Sales - Takeout', '$21,000', '6.0%'],
            ['Beer Sales', '$21,000', '6.0%'],
            ['Wine Sales', '$42,000', '12.0%'],
            ['Spirits Sales', '$24,500', '7.0%'],
            ['NA Beverages', '$17,500', '5.0%'],
            ['Less: Discounts & Comps', '($3,500)', '-1.0%'],
            ['TOTAL REVENUE', '$350,000', '100.0%'],
          ]
        ),

        heading(2, 'COST OF GOODS SOLD'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Food Cost', '$77,000', '22.0%'],
            ['Beer Cost', '$4,900', '1.4%'],
            ['Wine Cost', '$12,600', '3.6%'],
            ['Spirits Cost', '$4,900', '1.4%'],
            ['NA Beverage Cost', '$2,800', '0.8%'],
            ['Paper & Supplies', '$3,500', '1.0%'],
            ['TOTAL COGS', '$105,700', '30.2%'],
          ]
        ),

        heading(2, 'GROSS PROFIT'),
        paragraph('$244,300 — 69.8%'),

        heading(2, 'LABOR'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['FOH Wages (Servers, Bartenders, Hosts)', '$42,000', '12.0%'],
            ['BOH Wages (Cooks, Prep, Dish)', '$38,500', '11.0%'],
            ['Management Salaries', '$21,000', '6.0%'],
            ['Payroll Taxes & Benefits', '$12,250', '3.5%'],
            ['TOTAL LABOR', '$113,750', '32.5%'],
          ]
        ),

        heading(2, 'PRIME COST'),
        paragraph('$219,450 — 62.7%'),

        heading(2, 'OPERATING EXPENSES'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Rent & CAM', '$28,000', '8.0%'],
            ['Utilities', '$7,000', '2.0%'],
            ['Insurance', '$3,500', '1.0%'],
            ['Marketing', '$7,000', '2.0%'],
            ['Credit Card Processing', '$10,500', '3.0%'],
            ['Repairs & Maintenance', '$5,250', '1.5%'],
            ['Professional Services', '$3,500', '1.0%'],
            ['Other Operating', '$5,250', '1.5%'],
            ['TOTAL OPERATING', '$70,000', '20.0%'],
          ]
        ),

        heading(2, 'NET OPERATING INCOME'),
        paragraph('$60,550 — 17.3%'),
      ],
    },
  },

  {
    title: '4.3 Bar & Grill P&L (Smokeys/Tailgators Profile)',
    slug: '4-3-bar-grill-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Monthly P&L for a 3,500 sq ft sports bar with $275,000 monthly revenue',
    read_time: 12,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, '4.3 Bar & Grill P&L (Smokeys/Tailgators Profile)'),
        paragraph('Monthly P&L for a 3,500 sq ft sports bar with $275,000 monthly revenue.'),

        heading(2, 'REVENUE'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Food Sales', '$110,000', '40.0%'],
            ['Beer Sales', '$96,250', '35.0%'],
            ['Spirits Sales', '$55,000', '20.0%'],
            ['Wine Sales', '$8,250', '3.0%'],
            ['NA Beverages', '$8,250', '3.0%'],
            ['Less: Discounts (Happy Hour, etc.)', '($2,750)', '-1.0%'],
            ['TOTAL REVENUE', '$275,000', '100.0%'],
          ]
        ),

        heading(2, 'COST OF GOODS SOLD'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Food Cost (wings, burgers, apps)', '$35,750', '13.0%'],
            ['Beer Cost', '$19,250', '7.0%'],
            ['Spirits Cost', '$11,000', '4.0%'],
            ['Wine Cost', '$2,200', '0.8%'],
            ['NA Beverage Cost', '$1,375', '0.5%'],
            ['Paper & Supplies', '$2,750', '1.0%'],
            ['TOTAL COGS', '$72,325', '26.3%'],
          ]
        ),

        heading(2, 'GROSS PROFIT'),
        paragraph('$202,675 — 73.7%'),

        heading(2, 'LABOR'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['FOH Wages', '$38,500', '14.0%'],
            ['BOH Wages', '$27,500', '10.0%'],
            ['Management', '$13,750', '5.0%'],
            ['Payroll Taxes & Benefits', '$9,625', '3.5%'],
            ['TOTAL LABOR', '$89,375', '32.5%'],
          ]
        ),

        heading(2, 'PRIME COST'),
        paragraph('$161,700 — 58.8%'),

        heading(2, 'OPERATING (incl. entertainment, TVs)'),
        paragraph('$55,000 — 20.0%'),

        heading(2, 'NET OPERATING INCOME'),
        paragraph('$58,300 — 21.2%'),

        insightBox('Key Benchmarks', 'Beer cost should be 20-24% of beer sales. Total beverage cost target: 18-22%. Entertainment costs (TV packages, music) typically 1-2% of sales.'),
      ],
    },
  },

  {
    title: '4.4 Fast Casual / QSR P&L (Brij Foods / Spitz Profile)',
    slug: '4-4-fast-casual-qsr-pl',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Monthly P&L for a 2,000 sq ft fast-casual with heavy delivery mix — $200,000 monthly revenue',
    read_time: 14,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, '4.4 Fast Casual / QSR P&L (Brij Foods / Spitz Profile)'),
        paragraph('Monthly P&L for a 2,000 sq ft fast-casual with heavy delivery mix — $200,000 monthly revenue.'),

        heading(2, 'REVENUE'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Food Sales - Dine In', '$60,000', '30.0%'],
            ['Food Sales - Takeout', '$40,000', '20.0%'],
            ['Food Sales - DoorDash', '$40,000', '20.0%'],
            ['Food Sales - Uber Eats', '$30,000', '15.0%'],
            ['Food Sales - Grubhub', '$20,000', '10.0%'],
            ['NA Beverages', '$12,000', '6.0%'],
            ['Less: Discounts', '($2,000)', '-1.0%'],
            ['TOTAL REVENUE', '$200,000', '100.0%'],
          ]
        ),

        heading(2, 'COST OF GOODS SOLD'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Food Cost', '$56,000', '28.0%'],
            ['NA Beverage Cost', '$2,400', '1.2%'],
            ['Paper & Packaging (HIGH)', '$10,000', '5.0%'],
            ['TOTAL COGS', '$68,400', '34.2%'],
          ]
        ),

        heading(2, 'THIRD-PARTY DELIVERY FEES'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['DoorDash Commission (25%)', '$10,000', '5.0%'],
            ['Uber Eats Commission (30%)', '$9,000', '4.5%'],
            ['Grubhub Commission (25%)', '$5,000', '2.5%'],
            ['TOTAL DELIVERY FEES', '$24,000', '12.0%'],
          ]
        ),

        heading(2, 'GROSS PROFIT (after delivery fees)'),
        paragraph('$107,600 — 53.8%'),

        heading(2, 'LABOR'),
        table(
          ['Account', 'Amount', '% of Sales'],
          [
            ['Hourly Wages (Counter, Kitchen)', '$42,000', '21.0%'],
            ['Management', '$10,000', '5.0%'],
            ['Payroll Taxes & Benefits', '$6,240', '3.1%'],
            ['TOTAL LABOR', '$58,240', '29.1%'],
          ]
        ),

        heading(2, 'OPERATING EXPENSES'),
        paragraph('$32,000 — 16.0%'),

        heading(2, 'NET OPERATING INCOME'),
        paragraph('$17,360 — 8.7%'),

        warningBox('Third-Party Delivery Impact', 'Third-party delivery fees significantly impact margin. At 45% delivery mix, fees consume 12% of total revenue. Help clients understand true profitability by channel.'),
      ],
    },
  },

  {
    title: '4.5 Sample Balance Sheet',
    slug: '4-5-sample-balance-sheet',
    section_slug: 'sample-financials',
    type: 'template',
    excerpt: 'Balance sheet for a typical full-service restaurant',
    read_time: 10,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, '4.5 Sample Balance Sheet'),
        paragraph('Balance sheet for a typical full-service restaurant.'),

        heading(2, 'ASSETS'),
        table(
          ['Account', 'Amount'],
          [
            ['Current Assets', ''],
            ['1000 Operating Checking', '$45,000'],
            ['1010 Payroll Account', '$12,000'],
            ['1020 Savings/Reserve', '$25,000'],
            ['1100 Accounts Receivable', '$3,500'],
            ['1200 Food Inventory', '$8,000'],
            ['1210 Beverage Inventory', '$15,000'],
            ['1300 Prepaid Rent', '$14,000'],
            ['1310 Prepaid Insurance', '$6,000'],
            ['Total Current Assets', '$128,500'],
            ['', ''],
            ['Fixed Assets', ''],
            ['1400 Security Deposits', '$14,000'],
            ['1500 Leasehold Improvements', '$250,000'],
            ['1510 Accumulated Depr - LHI', '($75,000)'],
            ['1600 Kitchen Equipment', '$120,000'],
            ['1610 Accumulated Depr - Equipment', '($48,000)'],
            ['1700 Furniture & Fixtures', '$65,000'],
            ['1710 Accumulated Depr - FF&E', '($26,000)'],
            ['Total Fixed Assets', '$300,000'],
            ['', ''],
            ['TOTAL ASSETS', '$428,500'],
          ]
        ),

        heading(2, 'LIABILITIES & EQUITY'),
        table(
          ['Account', 'Amount'],
          [
            ['Current Liabilities', ''],
            ['2000 Accounts Payable', '$32,000'],
            ['2100 Credit Cards', '$8,500'],
            ['2200 Accrued Payroll', '$12,000'],
            ['2300 Sales Tax Payable', '$6,500'],
            ['2400 Gift Card Liability', '$4,200'],
            ['Total Current Liabilities', '$63,200'],
            ['', ''],
            ['Long-Term Liabilities', ''],
            ['2600 Equipment Loan', '$45,000'],
            ['2700 SBA Loan', '$85,000'],
            ['Total Long-Term Liabilities', '$130,000'],
            ['TOTAL LIABILITIES', '$193,200'],
            ['', ''],
            ['Equity', ''],
            ['3000 Owner Capital', '$150,000'],
            ['3100 Retained Earnings', '$45,300'],
            ['3200 Owner Distributions', '($20,000)'],
            ['3300 Current Year Net Income', '$60,000'],
            ['TOTAL EQUITY', '$235,300'],
            ['', ''],
            ['TOTAL LIABILITIES & EQUITY', '$428,500'],
          ]
        ),
        insightBox('Use for Client Expectations', 'Share this structure when onboarding. It aligns with FinAcct360 COA and shows typical account ranges (e.g. inventory, prepaid, loans) for benchmarking.'),
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
// SECTION 6: POS & SOFTWARE GUIDES (8 articles: 5.1 – 5.8)
// =============================================================================

const posGuidesArticles = [
  {
    title: '5.1 Square POS Export Guide',
    slug: '5-1-square-pos-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Daily sales summary, item sales detail, and COA mapping for Square',
    read_time: 12,
    is_pinned: true,
    order_index: 0,
    content: {
      type: 'doc',
      content: [
        heading(1, '5.1 Square POS Export Guide'),
        paragraph('Square is popular with cafes, coffee shops, and quick-service restaurants. This guide covers extracting sales data for weekly and monthly close.'),

        heading(2, 'Daily Sales Summary Export'),
        stepFlow([
          { title: 'Step 1: Access Square Dashboard', description: 'Log in to squareup.com → Dashboard → Reports' },
          { title: 'Step 2: Select Date Range', description: "Click 'Date Range' dropdown → Select 'Custom' → Enter weekly close dates (Monday-Sunday)" },
          { title: 'Step 3: Navigate to Sales Summary', description: "Click 'Reports' → 'Sales Summary' → Verify date range is correct" },
          { title: 'Step 4: Export CSV', description: "Click 'Export' button (top right) → Select 'CSV' → Click 'Download'" },
          { title: 'Step 5: Save with Naming Convention', description: 'Rename file: [ClientCode]_Square_Sales_[YYYYMMDD-YYYYMMDD].csv' },
        ]),

        heading(2, 'Item Sales Detail Export'),
        stepFlow([
          { title: 'Step 1: Access Item Sales Report', description: "Reports → 'Sales by Item' → Set date range" },
          { title: 'Step 2: Filter Categories', description: 'Filter by: Food, Beverages, Alcohol, Merchandise (export separately if needed)' },
          { title: 'Step 3: Export Detailed View', description: "Ensure 'Include modifiers' is checked → Export CSV" },
        ]),

        heading(2, 'Square Data Mapping to COA'),
        table(
          ['Square Category', 'FinAcct360 Account', 'Account #'],
          [
            ['Food Sales', 'Dine-In Food Revenue', '4010'],
            ['Beverage Sales (non-alc)', 'N/A Beverage Revenue', '4050'],
            ['Beer Sales', 'Beer Revenue', '4030'],
            ['Wine Sales', 'Wine Revenue', '4035'],
            ['Liquor Sales', 'Spirits Revenue', '4040'],
            ['Gift Card Redemptions', 'Gift Card Liability (reduce)', '2300'],
            ['Tips Collected', 'Tips Payable', '2200'],
            ['Discounts', 'Discounts & Comps', '4080'],
            ['Refunds', 'Refunds', '4085'],
          ]
        ),
        proTipBox('Square\'s category sales don\'t always map cleanly. Create a Category Mapping spreadsheet for each client showing their Square categories → FinAcct360 accounts.'),

        heading(2, 'Common Square Issues'),
        table(
          ['Issue', 'Cause', 'Resolution'],
          [
            ['Sales don\'t match bank deposit', 'Tips held separately, timing difference', 'Reconcile tips payable, check deposit dates'],
            ['Missing alcohol sales', 'Items miscategorized', 'Review item library, fix categories in Square'],
            ['Duplicate transactions', 'Manual entry + POS ring', 'Filter by payment method, dedupe'],
            ['Gift card sales inflated', 'Counting redemptions as sales', 'Use Gift Card report separately'],
          ]
        ),
      ],
    },
  },

  {
    title: '5.2 Toast POS Export Guide',
    slug: '5-2-toast-pos-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Sales summary, menu mix, labor reports, and COA mapping for Toast',
    read_time: 14,
    is_pinned: false,
    order_index: 1,
    content: {
      type: 'doc',
      content: [
        heading(1, '5.2 Toast POS Export Guide'),
        paragraph('Toast is the most common POS for full-service restaurants. It provides robust reporting but requires specific export procedures for accurate data.'),

        heading(2, 'Accessing Toast Reports'),
        stepFlow([
          { title: 'Step 1: Log In to Toast', description: 'Go to pos.toasttab.com → Enter credentials → Select location (for multi-unit)' },
          { title: 'Step 2: Navigate to Reports', description: "Click hamburger menu (☰) → 'Reports' → 'Sales'" },
          { title: 'Step 3: Set Report Parameters', description: "Date Range: Custom → Enter dates → Time: 'Business Day' (not calendar day)" },
        ]),
        warningBox('Toast Business Day', "Toast uses 'Business Day' which may end at 2 AM or 4 AM. Always confirm client's business day settings before exporting."),

        heading(2, 'Sales Summary Export'),
        stepFlow([
          { title: 'Step 1: Select Sales Summary', description: "Reports → Sales → 'Sales Summary'" },
          { title: 'Step 2: Verify Metrics', description: 'Ensure you see: Gross Sales, Discounts, Net Sales, Tax, Tips, Service Charges' },
          { title: 'Step 3: Export Data', description: "Click 'Export' → Select 'Excel' or 'CSV' → Download" },
          { title: 'Step 4: Naming Convention', description: 'Rename: [ClientCode]_Toast_SalesSummary_[YYYYMMDD-YYYYMMDD].xlsx' },
        ]),

        heading(2, 'Menu Mix Report (for COGS Analysis)'),
        stepFlow([
          { title: 'Step 1: Access Menu Mix', description: "Reports → 'Menu' → 'Product Mix'" },
          { title: 'Step 2: Group by Category', description: "Group: 'Menu Group' → Sub-group: 'Menu Item'" },
          { title: 'Step 3: Include Cost Data', description: "If theoretical cost is set up, include 'Item Cost' column" },
          { title: 'Step 4: Export', description: 'Export to Excel for COGS theoretical vs actual analysis' },
        ]),

        heading(2, 'Toast Data Mapping to COA'),
        table(
          ['Toast Field', 'FinAcct360 Account', 'Account #'],
          [
            ['Net Food Sales', 'Food Revenue (split dine-in/takeout)', '4010/4020'],
            ['Net Beverage Sales', 'N/A Beverage Revenue', '4050'],
            ['Net Beer Sales', 'Beer Revenue', '4030'],
            ['Net Wine Sales', 'Wine Revenue', '4035'],
            ['Net Liquor Sales', 'Spirits Revenue', '4040'],
            ['Delivery Revenue (1st party)', 'Delivery Revenue (In-House)', '4070'],
            ['Service Charges', 'Service Charge Revenue', '4090'],
            ['Auto Gratuity', 'Tips Payable (if distributed)', '2200'],
            ['Voids (Manager)', 'Voids & Comps', '4085'],
            ['Comps & Discounts', 'Discounts & Comps', '4080'],
          ]
        ),

        heading(2, 'Labor Report Export'),
        stepFlow([
          { title: 'Step 1: Access Labor Reports', description: "Reports → 'Labor' → 'Labor Summary'" },
          { title: 'Step 2: Set Parameters', description: 'Date range, include: Regular Hours, Overtime, Job Codes' },
          { title: 'Step 3: Export by Job Code', description: 'This allows mapping FOH vs BOH labor accurately' },
        ]),
        proTipBox('Toast\'s labor report should reconcile to payroll. If discrepancies exist, check for salaried managers (not in Toast timeclock) and tip credits.'),
      ],
    },
  },

  {
    title: '5.3 Clover POS Export Guide',
    slug: '5-3-clover-pos-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Dashboard access, sales reports, COA mapping, and Clover-specific challenges',
    read_time: 12,
    is_pinned: false,
    order_index: 2,
    content: {
      type: 'doc',
      content: [
        heading(1, '5.3 Clover POS Export Guide'),
        paragraph('Clover is common in bars, small restaurants, and quick-service. The reporting interface varies by Clover app installed.'),

        heading(2, 'Accessing Clover Dashboard'),
        stepFlow([
          { title: 'Step 1: Log In', description: 'Go to clover.com → Dashboard → Select merchant' },
          { title: 'Step 2: Check Installed Apps', description: "Settings → 'Installed Apps' → Note which reporting apps are available" },
          { title: 'Step 3: Navigate to Reports', description: "Most clients use: 'Reporting & Analytics' or 'Advanced Reports'" },
        ]),

        heading(2, 'Sales Report Export'),
        stepFlow([
          { title: 'Step 1: Select Report Type', description: "For weekly close: 'Sales Report' or 'Transactions'" },
          { title: 'Step 2: Set Date Range', description: 'Custom dates → Monday-Sunday of close week' },
          { title: 'Step 3: Choose Detail Level', description: 'Summary for P&L, Detail for audit/reconciliation' },
          { title: 'Step 4: Export Options', description: 'CSV preferred → Download → Rename with convention' },
        ]),

        heading(2, 'Clover Data Mapping'),
        table(
          ['Clover Field', 'FinAcct360 Account', 'Account #'],
          [
            ['Total Revenue (Category: Food)', 'Food Revenue', '4010'],
            ['Total Revenue (Category: Drinks)', 'N/A Beverage Revenue', '4050'],
            ['Total Revenue (Category: Alcohol)', 'Alcohol Revenue (split)', '4030-4040'],
            ['Tips', 'Tips Payable', '2200'],
            ['Discounts', 'Discounts & Comps', '4080'],
            ['Refunds', 'Refunds', '4085'],
            ['Cash Sales', 'Cash drawer reconciliation', '1010'],
            ['Card Sales', 'Bank deposit reconciliation', '1000'],
          ]
        ),

        heading(2, 'Clover-Specific Challenges'),
        bulletList([
          'Category Inconsistency: Clover allows custom categories; each client may have different setups',
          'Multiple Apps: Different reporting apps = different export formats. Document which app client uses',
          'Offline Transactions: If Clover goes offline, transactions sync later. Verify all transactions posted',
          'Tip Adjustment: Tips may adjust after initial transaction. Pull reports 2+ days after period end',
        ]),
        warningBox('Clover Alcohol Split', "Clover's default reports may not split alcohol by type (beer/wine/spirits). Client may need to set up proper inventory categories."),
      ],
    },
  },

  {
    title: '5.4 SpotOn POS Export Guide',
    slug: '5-4-spoton-pos-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Sales summary, labor export, and COA mapping for SpotOn',
    read_time: 11,
    is_pinned: false,
    order_index: 3,
    content: {
      type: 'doc',
      content: [
        heading(1, '5.4 SpotOn POS Export Guide'),
        paragraph('SpotOn is growing in popularity, especially with full-service and bar concepts. It offers strong reporting but has a unique interface.'),

        heading(2, 'SpotOn Dashboard Access'),
        stepFlow([
          { title: 'Step 1: Login', description: 'Go to dashboard.spoton.com → Enter credentials' },
          { title: 'Step 2: Select Location', description: 'For multi-unit: Use location selector dropdown' },
          { title: 'Step 3: Reports Section', description: "Main menu → 'Reports' → 'Sales Reports'" },
        ]),

        heading(2, 'Daily/Weekly Sales Export'),
        stepFlow([
          { title: 'Step 1: Sales Summary', description: "Reports → 'Sales Summary' → Set custom date range" },
          { title: 'Step 2: Revenue Breakdown', description: 'Ensure report shows: Gross Sales, Taxes, Discounts, Net Sales by category' },
          { title: 'Step 3: Export Format', description: "Click 'Export' → CSV or Excel → Download" },
        ]),

        heading(2, 'SpotOn Data Mapping'),
        table(
          ['SpotOn Field', 'FinAcct360 Account', 'Account #'],
          [
            ['Food Category Sales', 'Food Revenue', '4010'],
            ['Non-Alc Bev Sales', 'N/A Beverage Revenue', '4050'],
            ['Beer Sales', 'Beer Revenue', '4030'],
            ['Wine Sales', 'Wine Revenue', '4035'],
            ['Liquor Sales', 'Spirits Revenue', '4040'],
            ['Online Orders', 'Takeout Revenue or Delivery', '4020/4060'],
            ['Gift Card Sales', 'Gift Card Liability', '2300'],
            ['Service Charges', 'Service Charge Revenue', '4090'],
            ['Manager Voids', 'Voids & Comps', '4085'],
          ]
        ),

        heading(2, 'SpotOn Labor Export'),
        stepFlow([
          { title: 'Step 1: Access Labor Reports', description: "Reports → 'Labor' → 'Timecard Summary'" },
          { title: 'Step 2: Set Date Range', description: "Match pay period (verify client's pay period)" },
          { title: 'Step 3: Include Details', description: 'Include: Employee name, Job code, Regular hours, OT hours, Total pay' },
          { title: 'Step 4: Reconcile to Payroll', description: 'SpotOn labor should match payroll register ± salaried employees' },
        ]),
        proTipBox('SpotOn\'s reporting API can connect to QBO directly. Ask client if they\'ve enabled the integration—it may eliminate manual exports.'),
      ],
    },
  },

  {
    title: '5.5 QuickBooks Online P&L Export',
    slug: '5-5-quickbooks-online-pl-export',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Standard P&L export, P&L by Class, and export checklist',
    read_time: 12,
    is_pinned: false,
    order_index: 4,
    content: {
      type: 'doc',
      content: [
        heading(1, '5.5 QuickBooks Online P&L Export'),
        paragraph('Generating accurate P&L exports from QBO is essential for client delivery and KPI dashboard population.'),

        heading(2, 'Standard P&L Export'),
        stepFlow([
          { title: 'Step 1: Access Reports', description: "QBO → Reports → Type 'Profit and Loss' in search" },
          { title: 'Step 2: Select Report', description: "Choose 'Profit and Loss' (standard, not Detail or by Customer)" },
          { title: 'Step 3: Set Date Range', description: 'Report period: Custom → Enter month dates (1st to last day)' },
          { title: 'Step 4: Set Comparison', description: "For monthly: Add 'Previous Period' and 'Year over Year' columns" },
          { title: 'Step 5: Customize Columns', description: "Click 'Customize' → Columns: Add '% of Revenue' if needed" },
          { title: 'Step 6: Run Report', description: "Click 'Run Report' → Verify totals look reasonable" },
          { title: 'Step 7: Export', description: "Click 'Export' → 'Export to Excel' → Save" },
          { title: 'Step 8: Naming Convention', description: '[ClientCode]_QBO_PL_[YYYY-MM].xlsx' },
        ]),

        heading(2, 'P&L by Class (Multi-Location)'),
        paragraph('For multi-unit clients using Classes for locations:'),
        stepFlow([
          { title: 'Step 1: Run P&L by Class', description: "Reports → 'Profit and Loss by Class'" },
          { title: 'Step 2: Set All Classes', description: 'Ensure all location classes are included' },
          { title: 'Step 3: Review Unclassified', description: "Check 'Not Specified' column—should be minimal" },
          { title: 'Step 4: Export for Analysis', description: 'Export to Excel for location comparison' },
        ]),

        heading(2, 'P&L Export Checklist'),
        table(
          ['Checkpoint', 'What to Verify', 'Action if Wrong'],
          [
            ['Revenue Total', 'Matches POS net sales ± discounts', 'Reconcile POS to GL'],
            ['COGS %', 'Food 28-35%, Bev 18-25%', 'Review purchase categorization'],
            ['Labor %', '25-35% depending on type', 'Check payroll journal entries'],
            ['Net Income', 'Positive unless startup/seasonal', 'Review unusual expenses'],
            ['Uncategorized', '$0 in uncategorized', 'Categorize before export'],
            ['Suspense Account', '$0 balance', 'Clear suspense items'],
          ]
        ),
      ],
    },
  },

  {
    title: '5.6 QuickBooks Online Balance Sheet Export',
    slug: '5-6-quickbooks-online-balance-sheet-export',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Standard balance sheet export and review checklist',
    read_time: 11,
    is_pinned: false,
    order_index: 5,
    content: {
      type: 'doc',
      content: [
        heading(1, '5.6 QuickBooks Online Balance Sheet Export'),
        paragraph('Balance sheet exports are required for monthly close packages and loan/investor reporting.'),

        heading(2, 'Standard Balance Sheet Export'),
        stepFlow([
          { title: 'Step 1: Access Reports', description: "QBO → Reports → Search 'Balance Sheet'" },
          { title: 'Step 2: Select Report', description: "Choose 'Balance Sheet' (standard)" },
          { title: 'Step 3: Set As-Of Date', description: "Report period: 'As of' → Last day of month" },
          { title: 'Step 4: Add Comparison', description: "Customize → Add 'Previous Period' column for comparison" },
          { title: 'Step 5: Run and Review', description: 'Verify Assets = Liabilities + Equity (must balance)' },
          { title: 'Step 6: Export', description: 'Export to Excel → Rename: [ClientCode]_QBO_BS_[YYYY-MM].xlsx' },
        ]),

        heading(2, 'Balance Sheet Review Checklist'),
        table(
          ['Account', 'What to Check', 'Common Issues'],
          [
            ['Cash (1000)', 'Matches bank statement', 'Outstanding checks, deposits in transit'],
            ['A/R (1100)', 'Minimal for restaurant', 'Gift cards miscoded, timing'],
            ['Inventory (1200)', 'Month-end count if tracked', 'COGS timing, purchase vs inventory'],
            ['Fixed Assets (1500)', 'Depreciation posted', 'Missing depreciation entries'],
            ['A/P (2000)', 'Open bills cleared', 'Duplicate bills, missed payments'],
            ['Credit Cards (2100)', 'Matches CC statement', 'Missing payments, interest'],
            ['Payroll Liabilities (2150)', 'Near zero after deposits', 'Missed tax deposits'],
            ['Loans (2400)', 'Amortization posted', 'Missed principal reduction'],
            ['Retained Earnings (3900)', 'Auto-calculated', 'Prior period adjustments'],
          ]
        ),
        warningBox('Balance Sheet Must Balance', "If Balance Sheet doesn't balance, DO NOT export. Find the discrepancy first—common causes: voided transactions, duplicates, or corrupted data."),
      ],
    },
  },

  {
    title: '5.7 Payroll Register Export Guide',
    slug: '5-7-payroll-register-export-guide',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'Gusto and ADP exports, payroll-to-COA mapping, and reconciliation steps',
    read_time: 11,
    is_pinned: false,
    order_index: 6,
    content: {
      type: 'doc',
      content: [
        heading(1, '5.7 Payroll Register Export Guide'),
        paragraph('Accurate payroll data is critical for labor cost analysis. This guide covers exports from common payroll providers.'),

        heading(2, 'Gusto Payroll Export'),
        stepFlow([
          { title: 'Step 1: Login', description: 'gusto.com → Company dashboard' },
          { title: 'Step 2: Access Reports', description: "Reports → 'Payroll Journal'" },
          { title: 'Step 3: Set Pay Period', description: 'Select specific pay periods for the month' },
          { title: 'Step 4: Export', description: 'Download CSV → Rename: [ClientCode]_Gusto_Payroll_[YYYY-MM].csv' },
        ]),

        heading(2, 'ADP Payroll Export'),
        stepFlow([
          { title: 'Step 1: Login', description: 'ADP portal → Run Payroll' },
          { title: 'Step 2: Payroll Reports', description: "Reports → 'Payroll Summary' or 'Payroll Register'" },
          { title: 'Step 3: Set Parameters', description: 'Date range covering full month' },
          { title: 'Step 4: Export to Excel', description: 'Download → Rename with convention' },
        ]),

        heading(2, 'Payroll Data Mapping'),
        table(
          ['Payroll Field', 'FinAcct360 Account', 'Account #'],
          [
            ['Gross Wages - FOH Hourly', 'FOH Wages', '6100'],
            ['Gross Wages - BOH Hourly', 'BOH Wages', '6200'],
            ['Gross Wages - Management', 'Management Salaries', '6300'],
            ['Overtime Pay (all)', 'Overtime Expense', '6400'],
            ['Tips Paid (payroll)', 'Tips Paid (offset Tips Payable)', '6150/2200'],
            ['Employer Payroll Taxes', 'Payroll Taxes', '6600'],
            ['Workers Comp', 'Workers Compensation', '6700'],
            ['Health Insurance (ER portion)', 'Employee Benefits', '6800'],
            ['401k Match', 'Retirement Benefits', '6850'],
          ]
        ),

        heading(2, 'Payroll Reconciliation Steps'),
        bulletList([
          'Total payroll register = Bank withdrawals for payroll (net pay + taxes)',
          'Gross wages by department should map to correct GL accounts',
          'Employer taxes should match tax liability accounts',
          'Tips paid through payroll should reduce Tips Payable liability',
          'Any differences > $50 require investigation before close',
        ]),
        proTipBox('Many payroll providers can integrate directly with QBO. Recommend client enable this to eliminate manual journal entries.'),
      ],
    },
  },

  {
    title: '5.8 Third-Party Delivery Platform Exports',
    slug: '5-8-third-party-delivery-platform-exports',
    section_slug: 'pos-guides',
    type: 'guide',
    excerpt: 'DoorDash, Uber Eats, Grubhub exports; gross vs net revenue; reconciliation',
    read_time: 14,
    is_pinned: false,
    order_index: 7,
    content: {
      type: 'doc',
      content: [
        heading(1, '5.8 Third-Party Delivery Platform Exports'),
        paragraph('DoorDash, Uber Eats, and Grubhub require special handling. Revenue is reported gross but deposits are net of fees.'),

        heading(2, 'DoorDash Merchant Portal Export'),
        stepFlow([
          { title: 'Step 1: Login', description: 'merchants.doordash.com → Dashboard' },
          { title: 'Step 2: Access Financials', description: "Menu → 'Financials' → 'Payouts'" },
          { title: 'Step 3: Set Date Range', description: 'Filter for month being closed' },
          { title: 'Step 4: Download Statement', description: "Click 'Download' → Save PDF and CSV" },
          { title: 'Step 5: Key Data Points', description: 'Gross Sales, Commission %, Marketing Fees, Tips, Net Payout' },
        ]),

        heading(2, 'Uber Eats Restaurant Dashboard Export'),
        stepFlow([
          { title: 'Step 1: Login', description: 'restaurant.uber.com → Dashboard' },
          { title: 'Step 2: Payments Section', description: "Navigate to 'Payments' → 'Payment Statements'" },
          { title: 'Step 3: Download Statements', description: 'Select week/month → Download' },
          { title: 'Step 4: Review Fees', description: 'Note: Service fee, Marketing fee, Delivery fee breakdown' },
        ]),

        heading(2, 'Grubhub for Restaurants Export'),
        stepFlow([
          { title: 'Step 1: Login', description: 'restaurant.grubhub.com → Sign in' },
          { title: 'Step 2: Reports', description: "Navigate to 'Financials' → 'Statements'" },
          { title: 'Step 3: Download', description: 'Select period → Export CSV' },
        ]),

        heading(2, 'Third-Party Delivery Accounting'),
        paragraph('There are two acceptable methods for recording delivery revenue:'),
        bulletList([
          'Method 1 — Gross Revenue (Preferred): Record full gross sales as Delivery Revenue (4060-4075). Record fees as Delivery Fees Expense (5300). Bank deposit = Net (Gross - Fees). Pros: Shows true revenue volume, fees visible in P&L.',
          'Method 2 — Net Revenue: Record only net payout as revenue. Pros: Simpler, matches bank deposits. Cons: Understates revenue, hides true fee impact.',
        ]),

        heading(2, 'Platform Fee Accounts'),
        table(
          ['Platform', 'Typical Commission', 'Account for Fees'],
          [
            ['DoorDash', '15-30%', '5310 - DoorDash Fees'],
            ['Uber Eats', '15-30%', '5320 - Uber Eats Fees'],
            ['Grubhub', '15-30%', '5330 - Grubhub Fees'],
            ['Generic/Other', 'Varies', '5300 - Third-Party Delivery Fees'],
          ]
        ),
        warningBox('Deposit Lag', 'Delivery platform deposits often have 2-7 day lag. Match statements to bank deposits by date, not by order date.'),

        heading(2, 'Monthly Reconciliation Process'),
        bulletList([
          'Pull statements from all delivery platforms for the month',
          'Create reconciliation spreadsheet: Platform | Gross Sales | Fees | Net Payout',
          'Match net payouts to bank deposits (may need to combine multiple deposits)',
          'Verify total gross from platforms = POS delivery orders (if tracked separately)',
          'Post journal entry for any unreconciled differences',
        ]),
        proTipBox('Create a recurring \'Delivery Reconciliation\' template in Google Sheets. Link to client\'s folder for easy monthly updates.'),
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

  // Ensure all 6 sections exist (upsert by slug so missing sections like standard-operating-procedures are created)
  console.log('📁 Ensuring sections exist...')
  const sectionRows = sections.map(({ id: _id, ...s }) => ({
    title: s.title,
    slug: s.slug,
    description: s.description ?? null,
    icon: s.icon ?? 'fa-folder',
    order_index: s.order_index,
    is_published: true,
  }))
  const { error: sectionsUpsertError } = await supabase.from('kb_sections').upsert(sectionRows, {
    onConflict: 'slug',
    ignoreDuplicates: false,
  })
  if (sectionsUpsertError) {
    console.error('Error upserting sections:', sectionsUpsertError)
    return
  }
  console.log(`✓ Ensured ${sectionRows.length} sections`)
  console.log('')

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
