'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ModuleHeaderProps {
  moduleNumber: number
  totalModules: number
  title: string
}

export function ModuleHeader({
  moduleNumber,
  totalModules,
  title,
}: ModuleHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/training"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Training
      </Link>
      <div className="text-sm text-slate-500 mb-1">
        Module {moduleNumber} of {totalModules}
      </div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
    </div>
  )
}
