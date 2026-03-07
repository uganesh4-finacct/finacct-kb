'use client'

import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export interface QuickRefColumn {
  label: string
  value: string
  status?: 'good' | 'warning' | 'bad' | 'neutral'
}

export interface QuickRefCardProps {
  title: string
  columns: QuickRefColumn[]
  footer?: string
  className?: string
}

export function QuickRefCard({ title, columns, footer, className = '' }: QuickRefCardProps) {
  return (
    <div
      className={`
        rounded-xl border border-slate-800/50 bg-slate-800/30 overflow-hidden
        ${className}
      `}
    >
      <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-800/80">
        <h3 className="font-semibold text-white text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="grid divide-x divide-slate-700" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((col, i) => (
          <div key={i} className="px-4 py-3 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{col.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{col.value}</p>
            {col.status && col.status !== 'neutral' && (
              <div className="mt-1.5 flex items-center justify-center gap-1">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    col.status === 'good'
                      ? 'text-emerald-400'
                      : col.status === 'warning'
                        ? 'text-amber-400'
                        : col.status === 'bad'
                          ? 'text-rose-400'
                          : 'text-slate-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    col.status === 'good'
                      ? 'text-emerald-400'
                      : col.status === 'warning'
                        ? 'text-amber-400'
                        : col.status === 'bad'
                          ? 'text-rose-400'
                          : 'text-slate-400'
                  }`}
                >
                  {col.status === 'good' ? 'Target' : col.status === 'warning' ? 'Watch' : col.status === 'bad' ? 'High' : ''}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {footer && (
        <div className="px-4 py-2.5 border-t border-slate-800/50 bg-slate-800/30">
          <p className="text-xs text-slate-400">{footer}</p>
        </div>
      )}
    </div>
  )
}
