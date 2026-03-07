'use client'

interface WatermarkProps {
  email: string
}

export function Watermark({ email }: WatermarkProps) {
  const repetitions = 12
  const rows = Array.from({ length: repetitions }, (_, i) => i)

  return (
    <div
      className="watermark"
      style={{ opacity: 0.025, pointerEvents: 'none' }}
      aria-hidden
    >
      {rows.map((row) => (
        <div
          key={row}
          className="watermark-text absolute whitespace-nowrap"
          style={{
            top: `${row * 18}%`,
            left: `${(row % 3) * 35 - 10}%`,
            color: 'currentColor',
            opacity: 0.025,
            transform: 'rotate(-45deg)',
            fontSize: '12px',
            fontWeight: 500,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {email}
        </div>
      ))}
    </div>
  )
}
