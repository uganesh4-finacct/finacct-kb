'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, FileText, Target } from 'lucide-react'

const STORAGE_KEY = 'finacct-module-overview-collapsed'

interface ModuleOverviewProps {
  title: string
  whatYoullLearn: string[]
  whyItMatters: string
  estimatedMinutes: number
  questionCount: number
  passScore: number
  passRateNote?: string
}

export function ModuleOverview({
  title,
  whatYoullLearn,
  whyItMatters,
  estimatedMinutes,
  questionCount,
  passScore,
  passRateNote,
}: ModuleOverviewProps) {
  // Always start expanded when coming to the module screen
  const [collapsed, setCollapsed] = useState(false)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const stored = raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
      stored[title] = next
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {}
  }

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-800/30 overflow-hidden transition-all duration-300 ease-out">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-700/30 transition-colors"
        aria-expanded={!collapsed}
      >
        <h2 className="text-xl font-semibold text-white">Module overview</h2>
        {collapsed ? (
          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
        ) : (
          <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
        )}
      </button>
      {!collapsed && (
        <div className="px-6 pb-6 pt-0 border-t border-slate-800/50 animate-[fadeIn_0.3s_ease]">
          <div className="space-y-6">
            {whatYoullLearn.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">What you&apos;ll learn</h3>
                <ul className="list-disc list-inside text-base text-slate-300 space-y-1">
                  {whatYoullLearn.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {whyItMatters && (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Why it matters</h3>
                <p className="text-base text-slate-400 leading-relaxed">{whyItMatters}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{estimatedMinutes} min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>{questionCount} quiz questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Target className="w-4 h-4 text-slate-500" />
                <span>{passScore}% to pass</span>
              </div>
              {passRateNote && (
                <p className="text-sm text-slate-500 w-full">{passRateNote}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
