'use client'

/** Icon-only mark for FinAcct360: FA monogram + 360° arc. Use in favicon, app icon, or Logo. */
export function LogoIcon({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Partial circle arc representing 360° (~85% visible) */}
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="85 100"
        className="text-green-500"
      />
      {/* FA monogram */}
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fill="white"
        className="font-bold text-[11px] leading-none"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        FA
      </text>
    </svg>
  )
}
