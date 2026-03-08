'use client'

import React, { ReactNode } from 'react'
import { 
  Lightbulb, 
  AlertTriangle, 
  FileText, 
  Star,
  User,
  ArrowRight,
  Network,
  GitBranch,
} from 'lucide-react'

interface BoxProps {
  title?: string
  children: ReactNode
}

export function ScenarioBox({ children }: { children: ReactNode }) {
  return (
    <div className="my-8 rounded-2xl bg-gradient-to-r from-blue-500/10 to-slate-800/50 border border-blue-500/20 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 bg-blue-500/10 border-b border-blue-500/20">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-400" />
        </div>
        <span className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Scenario</span>
      </div>
      <div className="px-6 py-5 text-slate-300 leading-relaxed">
        {children}
      </div>
    </div>
  )
}

export function InsightBox({ title, children }: BoxProps) {
  return (
    <div className="my-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-slate-800/50 border border-amber-500/20 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 bg-amber-500/10 border-b border-amber-500/20">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <span className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Key Insight</span>
      </div>
      <div className="px-6 py-5">
        {title && <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>}
        <div className="text-slate-300 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function WarningBox({ title, children }: BoxProps) {
  return (
    <div className="my-8 rounded-2xl bg-gradient-to-r from-rose-500/10 to-slate-800/50 border border-rose-500/20 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 bg-rose-500/10 border-b border-rose-500/20">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <span className="text-sm font-semibold text-rose-400 uppercase tracking-wide">Common Mistake</span>
      </div>
      <div className="px-6 py-5">
        {title && <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>}
        <div className="text-slate-300 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function ExampleBox({ title, children }: BoxProps) {
  return (
    <div className="my-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-slate-800/50 border border-purple-500/20 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 bg-purple-500/10 border-b border-purple-500/20">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-400" />
        </div>
        <span className="text-sm font-semibold text-purple-400 uppercase tracking-wide">Real Example</span>
      </div>
      <div className="px-6 py-5">
        {title && <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>}
        <div className="text-slate-300 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function ProTipBox({ title, children }: BoxProps) {
  return (
    <div className="my-8 rounded-2xl bg-gradient-to-r from-teal-500/10 to-slate-800/50 border border-teal-500/20 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 bg-teal-500/10 border-b border-teal-500/20">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
          <Star className="w-5 h-5 text-teal-400" />
        </div>
        <span className="text-sm font-semibold text-teal-400 uppercase tracking-wide">Pro Tip</span>
      </div>
      <div className="px-6 py-5">
        {title && <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>}
        <div className="text-slate-300 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

interface KPICardProps {
  value: string
  label: string
  sublabel?: string
  status?: 'good' | 'warning' | 'bad' | 'neutral'
  /** Compact style for many cards (e.g. 6 restaurant types) */
  compact?: boolean
}

export function KPICard({ value, label, sublabel, status = 'good', compact = false }: KPICardProps) {
  const statusColors = {
    good: 'from-green-500/20 to-green-500/5 border-green-500/30',
    warning: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    bad: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
    neutral: 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
  }

  if (compact) {
    return (
      <div className={`rounded-xl bg-gradient-to-b ${statusColors[status ?? 'neutral']} border p-2.5 text-center min-w-0 flex flex-col justify-center`}>
        <div className="text-sm font-bold text-white leading-tight">{value}</div>
        <div className="text-[11px] text-slate-300 font-medium leading-snug mt-0.5">{label}</div>
        {sublabel && <div className="text-[10px] text-slate-500 leading-snug mt-0.5">{sublabel}</div>}
      </div>
    )
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-b ${statusColors[status ?? 'neutral']} border p-6 text-center min-w-[180px]`}>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-slate-300 font-medium">{label}</div>
      {sublabel && <div className="text-xs text-slate-500 mt-2">{sublabel}</div>}
    </div>
  )
}

export function KPICardGroup({ cards }: { cards: KPICardProps[] }) {
  return (
    <div className="my-8 flex flex-wrap gap-4 justify-center">
      {cards.map((card, i) => (
        <KPICard key={i} {...card} />
      ))}
    </div>
  )
}

interface ComparisonRow {
  wrong: string
  right: string
}

interface ComparisonTableProps {
  rows: ComparisonRow[]
  leftHeader?: string
  rightHeader?: string
  wrong?: string[]
  right?: string[]
}

export function ComparisonTable({ rows: rowsProp, leftHeader = '❌ Wrong', rightHeader = '✅ Right', wrong, right }: ComparisonTableProps) {
  const rows: ComparisonRow[] =
    wrong && right && wrong.length === right.length
      ? wrong.map((w, i) => ({ wrong: w, right: right[i]! }))
      : rowsProp ?? []
  return (
    <div className="my-8 grid grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-slate-800/50">
      <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-3">
        <span className="text-rose-400 font-semibold">{leftHeader}</span>
      </div>
      <div className="bg-green-500/10 border-b border-green-500/30 px-6 py-3">
        <span className="text-green-400 font-semibold">{rightHeader}</span>
      </div>
      {rows.map((row, i) => (
        <React.Fragment key={i}>
          <div className="bg-rose-500/5 border-b border-slate-800/50/50 px-6 py-4 text-slate-300">
            {row.wrong}
          </div>
          <div className="bg-green-500/5 border-b border-slate-800/50/50 px-6 py-4 text-slate-300">
            {row.right}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

interface Step {
  number?: string
  title: string
  description?: string
}

export function StepFlow({ steps, vertical = false }: { steps: Step[], vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="my-8 pl-4">
        {steps.map((step, i) => (
          <div key={i} className="relative pl-8 pb-8 last:pb-0">
            {i < steps.length - 1 && (
              <div className="absolute left-[11px] top-8 w-0.5 h-full bg-blue-500/30" />
            )}
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {step.number || i + 1}
            </div>
            <div>
              <div className="font-semibold text-white">{step.title}</div>
              {step.description && (
                <div className="text-sm text-slate-400 mt-1">{step.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="my-8 flex flex-wrap items-start gap-4 justify-center">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="bg-slate-800 rounded-xl p-4 text-center min-w-[140px] border border-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white mx-auto mb-2">
              {step.number || i + 1}
            </div>
            <div className="font-semibold text-white text-sm">{step.title}</div>
            {step.description && (
              <div className="text-xs text-slate-400 mt-1">{step.description}</div>
            )}
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  )
}

export function DataTable({ headers, rows }: { headers: string[], rows: string[][] }) {
  return (
    <div className="my-6 table-wrapper">
      <table className="w-full table-standard">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** For TipTapRenderer account_tree node */
export function AccountTree({
  items,
}: {
  items: { id: string; label: string; children?: { id: string; label: string }[] }[]
}) {
  return (
    <div className="my-8 rounded-2xl border border-slate-800/50 bg-slate-800/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-800/80">
        <span className="text-sm font-semibold text-slate-300">Chart of Accounts</span>
      </div>
      <div className="p-4 space-y-1">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-700/30 text-slate-200 font-medium">
              <Network className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono text-blue-300">{item.id}</span>
              <span>{item.label}</span>
            </div>
            {item.children && item.children.length > 0 && (
              <div className="ml-6 mt-1 space-y-1 border-l border-slate-600 pl-3">
                {item.children.map((child) => (
                  <div key={child.id} className="flex items-center gap-2 py-1.5 text-slate-400 text-sm">
                    <GitBranch className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-blue-300/80">{child.id}</span>
                    <span>{child.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** For TipTapRenderer process_flow node */
export function ProcessFlow({ steps }: { steps: string[] }) {
  return (
    <div className="my-8 flex flex-wrap items-center justify-center gap-2">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="bg-slate-800 rounded-xl px-4 py-3 border border-slate-800/50 text-slate-200 text-sm font-medium">
            {step}
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
