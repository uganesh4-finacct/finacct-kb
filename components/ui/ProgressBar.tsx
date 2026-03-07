'use client'

interface ProgressBarProps {
  value: number
  showLabel?: boolean
  /** Compact sticky style: thin bar with small % only, for training module top */
  compact?: boolean
}

export function ProgressBar({ value, showLabel = true, compact = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  if (compact) {
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden min-w-0">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums shrink-0 w-8 text-right">{Math.round(pct)}%</span>
      </div>
    )
  }
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Progress</span>
          <span className="text-green-400 font-medium">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
