export const TRACK_PAYROLL_SLUG = 'payroll'
export const TRACK_POS_SLUG = 'pos'

export const PAYROLL_TRACK = {
  slug: TRACK_PAYROLL_SLUG,
  title: 'Payroll for Restaurants',
  description: 'Wages, tips, overtime, payroll registers, and payroll in the weekly close',
  track_number: 4,
  order_index: 3,
} as const

export const POS_TRACK = {
  slug: TRACK_POS_SLUG,
  title: 'POS Systems',
  description: 'Square, Toast, Clover, and the restaurant software ecosystem',
  track_number: 3,
  order_index: 2,
} as const
