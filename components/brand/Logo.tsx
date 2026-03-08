'use client'

import Link from 'next/link'

export type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  showText?: boolean
  /** If set, wraps icon + text in a link to this href (e.g. /home) */
  href?: string
  className?: string
}

const sizeMap = {
  sm: { box: 'w-7 h-7', text: 'text-sm' },
  md: { box: 'w-9 h-9', text: 'text-lg' },
  lg: { box: 'w-11 h-11', text: 'text-xl' },
} as const

export function Logo({ size = 'md', showText = true, href, className = '' }: LogoProps) {
  const { box, text } = sizeMap[size]
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${box} bg-green-500 rounded-lg flex items-center justify-center shrink-0`}>
        <span className={`text-white font-bold ${text}`}>FA</span>
      </div>
      {showText && (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-white leading-tight truncate">FinAcct360</span>
          <span className="text-xs text-slate-400 leading-tight truncate">Academy</span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 rounded-lg">
        {content}
      </Link>
    )
  }

  return content
}
