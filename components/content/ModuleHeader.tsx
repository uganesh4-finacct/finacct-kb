'use client'

import { Clock, FileQuestion, Target } from 'lucide-react'

interface ModuleHeaderProps {
  moduleNumber: number
  totalModules: number
  title: string
  description: string
  estimatedMinutes: number
  questionCount: number
  passScore?: number
}

export function ModuleHeader({
  moduleNumber,
  totalModules,
  title,
  description,
  estimatedMinutes,
  questionCount,
  passScore = 80
}: ModuleHeaderProps) {
  return (
    <div className="mb-10">
      <div className="text-sm text-blue-400 font-medium mb-2">
        MODULE {moduleNumber} OF {totalModules}
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-3">
        {title}
      </h1>
      
      <p className="text-lg text-slate-400 mb-6">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-5 py-3 border border-slate-800/50">
          <Clock className="w-5 h-5 text-slate-400" />
          <div>
            <div className="text-white font-semibold">{estimatedMinutes} min</div>
            <div className="text-xs text-slate-500">Est. time</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-5 py-3 border border-slate-800/50">
          <FileQuestion className="w-5 h-5 text-slate-400" />
          <div>
            <div className="text-white font-semibold">{questionCount} Q's</div>
            <div className="text-xs text-slate-500">Quiz</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-5 py-3 border border-slate-800/50">
          <Target className="w-5 h-5 text-slate-400" />
          <div>
            <div className="text-white font-semibold">{passScore}%</div>
            <div className="text-xs text-slate-500">To pass</div>
          </div>
        </div>
      </div>
    </div>
  )
}
