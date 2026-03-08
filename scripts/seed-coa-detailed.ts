/**
 * Seed coa_template_accounts with detailed hierarchy and KPI mapping.
 * Run migration 20250307120000_coa_template_accounts_hierarchy.sql first.
 * Usage: npm run seed:coa-detailed
 */

import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface COAAccountInsert {
  restaurant_type: string
  account_number: string
  account_name: string
  qbo_account_type: string
  qbo_detail_type: string
  category: string
  notes: string | null
  parent_account_number: string | null
  is_parent: boolean
  account_level: number
  kpi_mapping: string | null
  order_index: number
}

interface MasterCOARow {
  account_number: string
  account_name: string
  qbo_account_type: string
  qbo_detail_type: string
  category: string
  parent_account_number: string | null
  is_parent: boolean
  account_level: number
  kpi_mapping: string | null
}

const masterCOA: MasterCOARow[] = [
  { account_number: '1000', account_name: 'Cash & Bank', qbo_account_type: 'Bank', qbo_detail_type: 'Checking', category: 'Assets', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '1010', account_name: 'Operating Checking', qbo_account_type: 'Bank', qbo_detail_type: 'Checking', category: 'Assets', parent_account_number: '1000', is_parent: false, account_level: 2, kpi_mapping: 'bank_balance' },
  { account_number: '1020', account_name: 'Payroll Checking', qbo_account_type: 'Bank', qbo_detail_type: 'Checking', category: 'Assets', parent_account_number: '1000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1030', account_name: 'Savings Account', qbo_account_type: 'Bank', qbo_detail_type: 'Savings', category: 'Assets', parent_account_number: '1000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1040', account_name: 'Petty Cash', qbo_account_type: 'Bank', qbo_detail_type: 'CashOnHand', category: 'Assets', parent_account_number: '1000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1050', account_name: 'Cash Drawers', qbo_account_type: 'Bank', qbo_detail_type: 'CashOnHand', category: 'Assets', parent_account_number: '1000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1100', account_name: 'Accounts Receivable', qbo_account_type: 'Accounts Receivable', qbo_detail_type: 'AccountsReceivable', category: 'Assets', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '1110', account_name: 'House Accounts', qbo_account_type: 'Accounts Receivable', qbo_detail_type: 'AccountsReceivable', category: 'Assets', parent_account_number: '1100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1120', account_name: 'Catering Receivables', qbo_account_type: 'Accounts Receivable', qbo_detail_type: 'AccountsReceivable', category: 'Assets', parent_account_number: '1100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1130', account_name: 'Gift Card Receivables', qbo_account_type: 'Accounts Receivable', qbo_detail_type: 'AccountsReceivable', category: 'Assets', parent_account_number: '1100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1200', account_name: 'Inventory', qbo_account_type: 'Other Current Asset', qbo_detail_type: 'Inventory', category: 'Assets', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '1210', account_name: 'Food Inventory', qbo_account_type: 'Other Current Asset', qbo_detail_type: 'Inventory', category: 'Assets', parent_account_number: '1200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1220', account_name: 'Beverage Inventory', qbo_account_type: 'Other Current Asset', qbo_detail_type: 'Inventory', category: 'Assets', parent_account_number: '1200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1230', account_name: 'Supplies Inventory', qbo_account_type: 'Other Current Asset', qbo_detail_type: 'Inventory', category: 'Assets', parent_account_number: '1200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1300', account_name: 'Prepaid Expenses', qbo_account_type: 'Other Current Asset', qbo_detail_type: 'PrepaidExpenses', category: 'Assets', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '1310', account_name: 'Prepaid Insurance', qbo_account_type: 'Other Current Asset', qbo_detail_type: 'PrepaidExpenses', category: 'Assets', parent_account_number: '1300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1320', account_name: 'Prepaid Rent', qbo_account_type: 'Other Current Asset', qbo_detail_type: 'PrepaidExpenses', category: 'Assets', parent_account_number: '1300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1330', account_name: 'Prepaid Licenses', qbo_account_type: 'Other Current Asset', qbo_detail_type: 'PrepaidExpenses', category: 'Assets', parent_account_number: '1300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1400', account_name: 'Fixed Assets', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'FurnitureAndFixtures', category: 'Assets', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '1410', account_name: 'Furniture & Fixtures', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'FurnitureAndFixtures', category: 'Assets', parent_account_number: '1400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1420', account_name: 'Kitchen Equipment', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'MachineryAndEquipment', category: 'Assets', parent_account_number: '1400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1430', account_name: 'POS Equipment', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'MachineryAndEquipment', category: 'Assets', parent_account_number: '1400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1440', account_name: 'Leasehold Improvements', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'LeaseholdImprovements', category: 'Assets', parent_account_number: '1400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1450', account_name: 'Vehicles', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'Vehicles', category: 'Assets', parent_account_number: '1400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1500', account_name: 'Accumulated Depreciation', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'AccumulatedDepreciation', category: 'Assets', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '1510', account_name: 'Accum Depr - Furniture', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'AccumulatedDepreciation', category: 'Assets', parent_account_number: '1500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1520', account_name: 'Accum Depr - Equipment', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'AccumulatedDepreciation', category: 'Assets', parent_account_number: '1500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '1530', account_name: 'Accum Depr - Leasehold', qbo_account_type: 'Fixed Asset', qbo_detail_type: 'AccumulatedDepreciation', category: 'Assets', parent_account_number: '1500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2000', account_name: 'Accounts Payable', qbo_account_type: 'Accounts Payable', qbo_detail_type: 'AccountsPayable', category: 'Liabilities', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '2010', account_name: 'Food Vendors Payable', qbo_account_type: 'Accounts Payable', qbo_detail_type: 'AccountsPayable', category: 'Liabilities', parent_account_number: '2000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2020', account_name: 'Beverage Vendors Payable', qbo_account_type: 'Accounts Payable', qbo_detail_type: 'AccountsPayable', category: 'Liabilities', parent_account_number: '2000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2030', account_name: 'Operating Vendors Payable', qbo_account_type: 'Accounts Payable', qbo_detail_type: 'AccountsPayable', category: 'Liabilities', parent_account_number: '2000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2100', account_name: 'Credit Cards Payable', qbo_account_type: 'Credit Card', qbo_detail_type: 'CreditCard', category: 'Liabilities', parent_account_number: null, is_parent: false, account_level: 1, kpi_mapping: null },
  { account_number: '2200', account_name: 'Accrued Expenses', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'OtherCurrentLiabilities', category: 'Liabilities', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '2210', account_name: 'Accrued Payroll', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'OtherCurrentLiabilities', category: 'Liabilities', parent_account_number: '2200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2220', account_name: 'Accrued Taxes', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'OtherCurrentLiabilities', category: 'Liabilities', parent_account_number: '2200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2230', account_name: 'Accrued Utilities', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'OtherCurrentLiabilities', category: 'Liabilities', parent_account_number: '2200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2300', account_name: 'Sales Tax Payable', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'SalesTaxPayable', category: 'Liabilities', parent_account_number: null, is_parent: false, account_level: 1, kpi_mapping: null },
  { account_number: '2400', account_name: 'Payroll Liabilities', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'PayrollLiabilities', category: 'Liabilities', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '2410', account_name: 'Federal Tax Withheld', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'PayrollLiabilities', category: 'Liabilities', parent_account_number: '2400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2420', account_name: 'State Tax Withheld', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'PayrollLiabilities', category: 'Liabilities', parent_account_number: '2400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2430', account_name: 'FICA Payable', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'PayrollLiabilities', category: 'Liabilities', parent_account_number: '2400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2440', account_name: 'Tips Payable', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'PayrollLiabilities', category: 'Liabilities', parent_account_number: '2400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2500', account_name: 'Loans Payable', qbo_account_type: 'Long Term Liability', qbo_detail_type: 'NotesPayable', category: 'Liabilities', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '2510', account_name: 'Bank Loan', qbo_account_type: 'Long Term Liability', qbo_detail_type: 'NotesPayable', category: 'Liabilities', parent_account_number: '2500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2520', account_name: 'SBA Loan', qbo_account_type: 'Long Term Liability', qbo_detail_type: 'NotesPayable', category: 'Liabilities', parent_account_number: '2500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2530', account_name: 'Equipment Financing', qbo_account_type: 'Long Term Liability', qbo_detail_type: 'NotesPayable', category: 'Liabilities', parent_account_number: '2500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2600', account_name: 'Deferred Revenue', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'DeferredRevenue', category: 'Liabilities', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '2610', account_name: 'Gift Card Liability', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'DeferredRevenue', category: 'Liabilities', parent_account_number: '2600', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '2620', account_name: 'Deposits Received', qbo_account_type: 'Other Current Liability', qbo_detail_type: 'DeferredRevenue', category: 'Liabilities', parent_account_number: '2600', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '3000', account_name: "Owner's Equity", qbo_account_type: 'Equity', qbo_detail_type: 'OwnerEquity', category: 'Equity', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '3010', account_name: 'Owner Capital', qbo_account_type: 'Equity', qbo_detail_type: 'OwnerEquity', category: 'Equity', parent_account_number: '3000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '3020', account_name: 'Owner Draws', qbo_account_type: 'Equity', qbo_detail_type: 'OwnerEquity', category: 'Equity', parent_account_number: '3000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '3030', account_name: 'Retained Earnings', qbo_account_type: 'Equity', qbo_detail_type: 'RetainedEarnings', category: 'Equity', parent_account_number: '3000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4000', account_name: 'Food Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'food_sales' },
  { account_number: '4010', account_name: 'Dine-In Food Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4000', is_parent: false, account_level: 2, kpi_mapping: 'dine_in_sales' },
  { account_number: '4020', account_name: 'Takeout Food Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4000', is_parent: false, account_level: 2, kpi_mapping: 'takeout_sales' },
  { account_number: '4030', account_name: 'Delivery Food Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4000', is_parent: false, account_level: 2, kpi_mapping: 'delivery_sales' },
  { account_number: '4040', account_name: 'Catering Food Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4050', account_name: 'Lunch Food Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4000', is_parent: false, account_level: 2, kpi_mapping: 'lunch_sales' },
  { account_number: '4060', account_name: 'Dinner Food Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4000', is_parent: false, account_level: 2, kpi_mapping: 'dinner_sales' },
  { account_number: '4100', account_name: 'Beverage Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '4110', account_name: 'NA Beverage Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4100', is_parent: false, account_level: 2, kpi_mapping: 'na_bev_sales' },
  { account_number: '4120', account_name: 'Beer Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4100', is_parent: false, account_level: 2, kpi_mapping: 'beer_sales' },
  { account_number: '4130', account_name: 'Wine Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4100', is_parent: false, account_level: 2, kpi_mapping: 'wine_sales' },
  { account_number: '4140', account_name: 'Liquor/Spirits Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4100', is_parent: false, account_level: 2, kpi_mapping: 'spirits_sales' },
  { account_number: '4150', account_name: 'Coffee Sales', qbo_account_type: 'Income', qbo_detail_type: 'SalesOfProductIncome', category: 'Revenue', parent_account_number: '4100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4200', account_name: 'Other Revenue', qbo_account_type: 'Income', qbo_detail_type: 'OtherPrimaryIncome', category: 'Revenue', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '4210', account_name: 'Gift Card Sales', qbo_account_type: 'Income', qbo_detail_type: 'OtherPrimaryIncome', category: 'Revenue', parent_account_number: '4200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4220', account_name: 'Merchandise Sales', qbo_account_type: 'Income', qbo_detail_type: 'OtherPrimaryIncome', category: 'Revenue', parent_account_number: '4200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4230', account_name: 'Catering Service Fees', qbo_account_type: 'Income', qbo_detail_type: 'OtherPrimaryIncome', category: 'Revenue', parent_account_number: '4200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4300', account_name: 'Discounts & Comps', qbo_account_type: 'Income', qbo_detail_type: 'DiscountsRefundsGiven', category: 'Revenue', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'discounts' },
  { account_number: '4310', account_name: 'Manager Comps', qbo_account_type: 'Income', qbo_detail_type: 'DiscountsRefundsGiven', category: 'Revenue', parent_account_number: '4300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4320', account_name: 'Employee Discounts', qbo_account_type: 'Income', qbo_detail_type: 'DiscountsRefundsGiven', category: 'Revenue', parent_account_number: '4300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4330', account_name: 'Promotion Discounts', qbo_account_type: 'Income', qbo_detail_type: 'DiscountsRefundsGiven', category: 'Revenue', parent_account_number: '4300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '4340', account_name: 'Voids & Refunds', qbo_account_type: 'Income', qbo_detail_type: 'DiscountsRefundsGiven', category: 'Revenue', parent_account_number: '4300', is_parent: false, account_level: 2, kpi_mapping: 'void_amount' },
  { account_number: '5000', account_name: 'Food Cost', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'food_cogs' },
  { account_number: '5010', account_name: 'Meat & Poultry', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5020', account_name: 'Seafood', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5030', account_name: 'Produce', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5040', account_name: 'Dairy & Eggs', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5050', account_name: 'Dry Goods & Grocery', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5060', account_name: 'Bakery & Bread', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5070', account_name: 'Frozen Foods', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5080', account_name: 'Oils & Condiments', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5100', account_name: 'Beverage Cost', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'bev_cogs' },
  { account_number: '5110', account_name: 'NA Beverage Cost', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5120', account_name: 'Beer Cost', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5130', account_name: 'Wine Cost', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5140', account_name: 'Liquor Cost', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5150', account_name: 'Coffee & Tea Cost', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5200', account_name: 'Paper & Packaging', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '5210', account_name: 'To-Go Containers', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5220', account_name: 'Bags & Wraps', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '5230', account_name: 'Napkins & Utensils', qbo_account_type: 'Cost of Goods Sold', qbo_detail_type: 'SuppliesAndMaterialsCOS', category: 'COGS', parent_account_number: '5200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6000', account_name: 'FOH Labor', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'foh_labor' },
  { account_number: '6010', account_name: 'Server Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6020', account_name: 'Host Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6030', account_name: 'Bartender Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6040', account_name: 'Busser Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6050', account_name: 'Cashier Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6060', account_name: 'FOH Overtime', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6000', is_parent: false, account_level: 2, kpi_mapping: 'overtime_cost' },
  { account_number: '6100', account_name: 'BOH Labor', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'boh_labor' },
  { account_number: '6110', account_name: 'Line Cook Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6120', account_name: 'Prep Cook Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6130', account_name: 'Dishwasher Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6140', account_name: 'Expeditor Wages', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6150', account_name: 'BOH Overtime', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6100', is_parent: false, account_level: 2, kpi_mapping: 'overtime_cost' },
  { account_number: '6200', account_name: 'Management Salaries', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'mgmt_labor' },
  { account_number: '6210', account_name: 'General Manager', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6220', account_name: 'Assistant Manager', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6230', account_name: 'Kitchen Manager', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6240', account_name: 'Bar Manager', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6300', account_name: 'Payroll Taxes & Benefits', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '6310', account_name: 'Employer FICA', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6320', account_name: 'FUTA', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6330', account_name: 'SUTA', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6340', account_name: 'Workers Compensation', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6350', account_name: 'Health Insurance', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6360', account_name: '401k Match', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '6370', account_name: 'Employee Meals', qbo_account_type: 'Expense', qbo_detail_type: 'PayrollExpenses', category: 'Labor', parent_account_number: '6300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7000', account_name: 'Occupancy', qbo_account_type: 'Expense', qbo_detail_type: 'RentOrLeaseOfBuildings', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'rent' },
  { account_number: '7010', account_name: 'Rent', qbo_account_type: 'Expense', qbo_detail_type: 'RentOrLeaseOfBuildings', category: 'Operating', parent_account_number: '7000', is_parent: false, account_level: 2, kpi_mapping: 'rent' },
  { account_number: '7020', account_name: 'CAM Charges', qbo_account_type: 'Expense', qbo_detail_type: 'RentOrLeaseOfBuildings', category: 'Operating', parent_account_number: '7000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7030', account_name: 'Property Tax', qbo_account_type: 'Expense', qbo_detail_type: 'TaxesPaid', category: 'Operating', parent_account_number: '7000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7040', account_name: 'Property Insurance', qbo_account_type: 'Expense', qbo_detail_type: 'Insurance', category: 'Operating', parent_account_number: '7000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7100', account_name: 'Utilities', qbo_account_type: 'Expense', qbo_detail_type: 'Utilities', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'utilities' },
  { account_number: '7110', account_name: 'Electric', qbo_account_type: 'Expense', qbo_detail_type: 'Utilities', category: 'Operating', parent_account_number: '7100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7120', account_name: 'Gas', qbo_account_type: 'Expense', qbo_detail_type: 'Utilities', category: 'Operating', parent_account_number: '7100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7130', account_name: 'Water & Sewer', qbo_account_type: 'Expense', qbo_detail_type: 'Utilities', category: 'Operating', parent_account_number: '7100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7140', account_name: 'Trash Removal', qbo_account_type: 'Expense', qbo_detail_type: 'Utilities', category: 'Operating', parent_account_number: '7100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7150', account_name: 'Internet & Phone', qbo_account_type: 'Expense', qbo_detail_type: 'Utilities', category: 'Operating', parent_account_number: '7100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7200', account_name: 'Marketing & Advertising', qbo_account_type: 'Expense', qbo_detail_type: 'AdvertisingPromotional', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'marketing' },
  { account_number: '7210', account_name: 'Social Media Ads', qbo_account_type: 'Expense', qbo_detail_type: 'AdvertisingPromotional', category: 'Operating', parent_account_number: '7200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7220', account_name: 'Print Advertising', qbo_account_type: 'Expense', qbo_detail_type: 'AdvertisingPromotional', category: 'Operating', parent_account_number: '7200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7230', account_name: 'Promotions', qbo_account_type: 'Expense', qbo_detail_type: 'AdvertisingPromotional', category: 'Operating', parent_account_number: '7200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7240', account_name: 'Photography & Design', qbo_account_type: 'Expense', qbo_detail_type: 'AdvertisingPromotional', category: 'Operating', parent_account_number: '7200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7300', account_name: 'Repairs & Maintenance', qbo_account_type: 'Expense', qbo_detail_type: 'RepairMaintenance', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '7310', account_name: 'Equipment Repairs', qbo_account_type: 'Expense', qbo_detail_type: 'RepairMaintenance', category: 'Operating', parent_account_number: '7300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7320', account_name: 'Building Maintenance', qbo_account_type: 'Expense', qbo_detail_type: 'RepairMaintenance', category: 'Operating', parent_account_number: '7300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7330', account_name: 'HVAC Maintenance', qbo_account_type: 'Expense', qbo_detail_type: 'RepairMaintenance', category: 'Operating', parent_account_number: '7300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7340', account_name: 'Cleaning & Janitorial', qbo_account_type: 'Expense', qbo_detail_type: 'RepairMaintenance', category: 'Operating', parent_account_number: '7300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7400', account_name: 'Professional Services', qbo_account_type: 'Expense', qbo_detail_type: 'LegalProfessionalFees', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '7410', account_name: 'Accounting Fees', qbo_account_type: 'Expense', qbo_detail_type: 'LegalProfessionalFees', category: 'Operating', parent_account_number: '7400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7420', account_name: 'Legal Fees', qbo_account_type: 'Expense', qbo_detail_type: 'LegalProfessionalFees', category: 'Operating', parent_account_number: '7400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7430', account_name: 'Consulting Fees', qbo_account_type: 'Expense', qbo_detail_type: 'LegalProfessionalFees', category: 'Operating', parent_account_number: '7400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7440', account_name: 'IT Services', qbo_account_type: 'Expense', qbo_detail_type: 'LegalProfessionalFees', category: 'Operating', parent_account_number: '7400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7500', account_name: 'Operating Supplies', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '7510', account_name: 'Cleaning Supplies', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: '7500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7520', account_name: 'Office Supplies', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: '7500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7530', account_name: 'Uniforms', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: '7500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7540', account_name: 'Linen & Laundry', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: '7500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7600', account_name: 'Technology & Software', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '7610', account_name: 'POS Fees', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: '7600', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7620', account_name: 'Scheduling Software', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: '7600', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7630', account_name: 'Accounting Software', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: '7600', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7640', account_name: 'Reservation System', qbo_account_type: 'Expense', qbo_detail_type: 'OfficeGeneralAdministrativeExpenses', category: 'Operating', parent_account_number: '7600', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7700', account_name: 'Insurance', qbo_account_type: 'Expense', qbo_detail_type: 'Insurance', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '7710', account_name: 'General Liability', qbo_account_type: 'Expense', qbo_detail_type: 'Insurance', category: 'Operating', parent_account_number: '7700', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7720', account_name: 'Liquor Liability', qbo_account_type: 'Expense', qbo_detail_type: 'Insurance', category: 'Operating', parent_account_number: '7700', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7730', account_name: 'Business Interruption', qbo_account_type: 'Expense', qbo_detail_type: 'Insurance', category: 'Operating', parent_account_number: '7700', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7800', account_name: 'Licenses & Permits', qbo_account_type: 'Expense', qbo_detail_type: 'LicensesFees', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '7810', account_name: 'Liquor License', qbo_account_type: 'Expense', qbo_detail_type: 'LicensesFees', category: 'Operating', parent_account_number: '7800', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7820', account_name: 'Health Permits', qbo_account_type: 'Expense', qbo_detail_type: 'LicensesFees', category: 'Operating', parent_account_number: '7800', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7830', account_name: 'Business License', qbo_account_type: 'Expense', qbo_detail_type: 'LicensesFees', category: 'Operating', parent_account_number: '7800', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7840', account_name: 'Music License (ASCAP/BMI)', qbo_account_type: 'Expense', qbo_detail_type: 'LicensesFees', category: 'Operating', parent_account_number: '7800', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7900', account_name: 'Miscellaneous', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Operating', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '7910', account_name: 'Bank Fees', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Operating', parent_account_number: '7900', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7920', account_name: 'Dues & Subscriptions', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Operating', parent_account_number: '7900', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '7930', account_name: 'Travel & Meals', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Operating', parent_account_number: '7900', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8000', account_name: 'Credit Card Processing', qbo_account_type: 'Expense', qbo_detail_type: 'BankCharges', category: 'Other', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '8010', account_name: 'Visa/MC Fees', qbo_account_type: 'Expense', qbo_detail_type: 'BankCharges', category: 'Other', parent_account_number: '8000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8020', account_name: 'Amex Fees', qbo_account_type: 'Expense', qbo_detail_type: 'BankCharges', category: 'Other', parent_account_number: '8000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8030', account_name: 'Other CC Fees', qbo_account_type: 'Expense', qbo_detail_type: 'BankCharges', category: 'Other', parent_account_number: '8000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8100', account_name: 'Bank & Service Fees', qbo_account_type: 'Expense', qbo_detail_type: 'BankCharges', category: 'Other', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '8110', account_name: 'Bank Service Charges', qbo_account_type: 'Expense', qbo_detail_type: 'BankCharges', category: 'Other', parent_account_number: '8100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8120', account_name: 'NSF Fees', qbo_account_type: 'Expense', qbo_detail_type: 'BankCharges', category: 'Other', parent_account_number: '8100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8130', account_name: 'Wire Transfer Fees', qbo_account_type: 'Expense', qbo_detail_type: 'BankCharges', category: 'Other', parent_account_number: '8100', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8200', account_name: 'Third-Party Delivery Fees', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Other', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: 'third_party_fees' },
  { account_number: '8210', account_name: 'DoorDash Fees', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Other', parent_account_number: '8200', is_parent: false, account_level: 2, kpi_mapping: 'doordash_fees' },
  { account_number: '8220', account_name: 'UberEats Fees', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Other', parent_account_number: '8200', is_parent: false, account_level: 2, kpi_mapping: 'ubereats_fees' },
  { account_number: '8230', account_name: 'Grubhub Fees', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Other', parent_account_number: '8200', is_parent: false, account_level: 2, kpi_mapping: 'grubhub_fees' },
  { account_number: '8240', account_name: 'Postmates Fees', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Other', parent_account_number: '8200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8250', account_name: 'Other Delivery Fees', qbo_account_type: 'Expense', qbo_detail_type: 'OtherMiscellaneousServiceCost', category: 'Other', parent_account_number: '8200', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8300', account_name: 'Depreciation & Amortization', qbo_account_type: 'Expense', qbo_detail_type: 'Depreciation', category: 'Other', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '8310', account_name: 'Depreciation Expense', qbo_account_type: 'Expense', qbo_detail_type: 'Depreciation', category: 'Other', parent_account_number: '8300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8320', account_name: 'Amortization Expense', qbo_account_type: 'Expense', qbo_detail_type: 'Amortization', category: 'Other', parent_account_number: '8300', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8400', account_name: 'Interest Expense', qbo_account_type: 'Expense', qbo_detail_type: 'InterestPaid', category: 'Other', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '8410', account_name: 'Loan Interest', qbo_account_type: 'Expense', qbo_detail_type: 'InterestPaid', category: 'Other', parent_account_number: '8400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8420', account_name: 'CC Interest', qbo_account_type: 'Expense', qbo_detail_type: 'InterestPaid', category: 'Other', parent_account_number: '8400', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8500', account_name: 'Other Income/Expense', qbo_account_type: 'Other Income', qbo_detail_type: 'OtherMiscellaneousIncome', category: 'Other', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '8510', account_name: 'Gain/Loss on Asset Sale', qbo_account_type: 'Other Income', qbo_detail_type: 'OtherMiscellaneousIncome', category: 'Other', parent_account_number: '8500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '8520', account_name: 'Miscellaneous Income', qbo_account_type: 'Other Income', qbo_detail_type: 'OtherMiscellaneousIncome', category: 'Other', parent_account_number: '8500', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '9000', account_name: 'Inter-Company', qbo_account_type: 'Other Expense', qbo_detail_type: 'OtherMiscellaneousExpense', category: 'Multi-Unit', parent_account_number: null, is_parent: true, account_level: 1, kpi_mapping: null },
  { account_number: '9010', account_name: 'Management Fee Allocation', qbo_account_type: 'Other Expense', qbo_detail_type: 'OtherMiscellaneousExpense', category: 'Multi-Unit', parent_account_number: '9000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '9020', account_name: 'Marketing Allocation', qbo_account_type: 'Other Expense', qbo_detail_type: 'OtherMiscellaneousExpense', category: 'Multi-Unit', parent_account_number: '9000', is_parent: false, account_level: 2, kpi_mapping: null },
  { account_number: '9030', account_name: 'Corporate Overhead', qbo_account_type: 'Other Expense', qbo_detail_type: 'OtherMiscellaneousExpense', category: 'Multi-Unit', parent_account_number: '9000', is_parent: false, account_level: 2, kpi_mapping: null },
]

const restaurantTypes = ['cafe', 'fsr', 'bar', 'qsr', 'fine-dining', 'multi-unit']

async function seedCOA() {
  console.log('Starting detailed COA seed...\n')

  for (const type of restaurantTypes) {
    const { error: deleteError } = await supabase
      .from('coa_template_accounts')
      .delete()
      .eq('restaurant_type', type)

    if (deleteError) {
      console.error(`Failed to clear ${type}:`, deleteError.message)
      process.exit(1)
    }
  }
  console.log('Cleared existing accounts\n')

  for (const type of restaurantTypes) {
    const accounts: COAAccountInsert[] = masterCOA.map((acc, index) => ({
      restaurant_type: type,
      account_number: acc.account_number,
      account_name: acc.account_name,
      qbo_account_type: acc.qbo_account_type,
      qbo_detail_type: acc.qbo_detail_type,
      category: acc.category,
      notes: null,
      parent_account_number: acc.parent_account_number,
      is_parent: acc.is_parent,
      account_level: acc.account_level,
      kpi_mapping: acc.kpi_mapping,
      order_index: index,
    }))

    const { error } = await supabase.from('coa_template_accounts').insert(accounts)

    if (error) {
      console.error(`${type}:`, error.message)
      process.exit(1)
    }
    console.log(`${type}: ${accounts.length} accounts`)
  }

  console.log('\nDone. Total:', masterCOA.length * restaurantTypes.length, 'accounts')
}

seedCOA().catch((err) => {
  console.error(err)
  process.exit(1)
})
