'use client'

interface ProgressRingProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({
  completed,
  total,
  size = 120,
  strokeWidth = 10,
  className = '',
}: ProgressRingProps) {
  const percent = total > 0 ? Math.min(100, (completed / total) * 100) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-green-500 transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-2xl font-semibold text-white tabular-nums">
        {completed}<span className="text-slate-500 font-normal">/{total}</span>
      </span>
    </div>
  )
}
