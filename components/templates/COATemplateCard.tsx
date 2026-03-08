'use client'

import React from 'react'
import {
  Coffee,
  Wine,
  Building2,
  UtensilsCrossed,
  Beef,
  Sandwich,
} from 'lucide-react'

export interface COATemplateAccountRow {
  id: string
  account_number: string
  account_name: string
  qbo_account_type: string
  qbo_detail_type: string
  category: string
  notes: string | null
  order_index: number
}

interface COATemplateCardProps {
  type: string
  title: string
  iconName: string
  accountCount: number
  onClick: () => void
}

const ICON_MAP: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Coffee,
  ForkKnife: UtensilsCrossed,
  BeerStein: Beef,
  Hamburger: Sandwich,
  Wine,
  Buildings: Building2,
}

export function COATemplateCard({ title, iconName, accountCount, onClick }: COATemplateCardProps) {
  const Icon = ICON_MAP[iconName] ?? Building2

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-4 bg-slate-800/50 border border-slate-800/50 rounded-xl hover:border-orange-500/50 hover:bg-slate-800/70 transition-all text-left"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon size={28} className="text-slate-400 shrink-0" aria-hidden />
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      <p className="text-sm text-slate-400">{accountCount} accounts</p>
    </button>
  )
}
