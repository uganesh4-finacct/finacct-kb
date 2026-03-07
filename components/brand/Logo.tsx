'use client'

import Link from 'next/link'
import { LogoIcon } from './LogoIcon'

export type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  showText?: boolean
  /** If set, wraps icon + text in a link to this href (e.g. /home) */
  href?: string
  className?: string
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
} as const

export function Logo({ size = 'md', showText = true, href, className = '' }: LogoProps) {
  const iconSize = sizeMap[size]
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex-shrink-0 text-green-500">
        <LogoIcon size={iconSize} />
      </span>
      {showText && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white leading-tight truncate">
            FinAcct360
          </span>
          <span className="text-xs text-slate-400 leading-tight truncate">
            Knowledge Base
          </span>
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
