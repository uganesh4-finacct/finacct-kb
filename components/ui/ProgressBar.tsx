'use client'

interface ProgressBarProps {
  /** Progress 0–100 */
  value: number
  showLabel?: boolean
  /** Custom label (e.g. "Overall progress"); default "Progress" */
  label?: string
  /** Custom value text (e.g. "3 of 13 modules"); overrides percentage when set */
  valueLabel?: string
  /** Compact: thin bar with small value, for cards or inline use */
  compact?: boolean
  className?: string
  /** Fill color: indigo (training) or green (default) */
  variant?: 'default' | 'indigo'
}

export function ProgressBar({
  value,
  showLabel = true,
  label = 'Progress',
  valueLabel,
  compact = false,
  className = '',
  variant = 'default',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  const fillClass =
    variant === 'indigo'
      ? 'bg-indigo-500'
      : 'bg-gradient-to-r from-green-500 to-emerald-400'

  if (compact) {
    return (
      <div className={`flex items-center gap-2 w-full ${className}`}>
        <div
          className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden min-w-0"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full ${fillClass} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums shrink-0 text-right">
          {valueLabel ?? `${Math.round(pct)}%`}
        </span>
      </div>
    )
  }
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">{label}</span>
          <span className="text-white font-medium">{valueLabel ?? `${Math.round(pct)}%`}</span>
        </div>
      )}
      <div
        className="h-2 rounded-full bg-slate-700 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full ${fillClass} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
