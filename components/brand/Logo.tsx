'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  showText?: boolean
  /** If set, wraps icon + text in a link to this href (e.g. /home) */
  href?: string
  className?: string
}

const sizeMap = {
  sm: { iconSize: 14, labelSize: 'text-xs' },
  md: { iconSize: 18, labelSize: 'text-sm' },
  lg: { iconSize: 22, labelSize: 'text-base' },
} as const

export function Logo({ size = 'md', showText = true, href, className = '' }: LogoProps) {
  const { iconSize, labelSize } = sizeMap[size]
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5 bg-orange-500 rounded-lg px-2.5 py-2 shrink-0">
        <BookOpen size={iconSize} className="text-white" aria-hidden />
        <span className={`text-white font-bold ${labelSize}`}>FA</span>
      </div>
      {showText && (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-white text-sm leading-tight truncate">FinAcct360</span>
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
