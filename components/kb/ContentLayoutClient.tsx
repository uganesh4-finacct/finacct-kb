'use client'

import type { Section } from '@/lib/types'

interface ContentLayoutClientProps {
  sections: Section[]
  children: React.ReactNode
}

export function ContentLayoutClient({ sections, children }: ContentLayoutClientProps) {
  return <>{children}</>
}
