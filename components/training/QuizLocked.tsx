'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'

function formatTimeRemaining(until: Date): string {
  const now = new Date()
  const ms = until.getTime() - now.getTime()
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

interface QuizLockedProps {
  nextRetryAt: string
  moduleSlug: string
}

export function QuizLocked({ nextRetryAt, moduleSlug }: QuizLockedProps) {
  const until = new Date(nextRetryAt)
  const [timeRemaining, setTimeRemaining] = useState(() => formatTimeRemaining(until))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(until))
    }, 1000)
    return () => clearInterval(interval)
  }, [until])

  return (
    <div className="max-w-xl mx-auto text-center py-12">
      <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock size={40} className="text-slate-500" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Quiz Temporarily Locked</h2>
      <p className="text-slate-400 mb-6">
        You&apos;ve used all 3 attempts. Take time to review the material.
      </p>

      <div className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-slate-800/50">
        <p className="text-slate-500 mb-2">Next attempt available in:</p>
        <p className="text-2xl font-bold text-white tabular-nums">{timeRemaining}</p>
      </div>

      <p className="text-slate-500 mb-4">Or complete a full module review to unlock:</p>

      <Link href={`/training/${moduleSlug}?fullReview=true`}>
        <button
          type="button"
          className="px-6 py-3 border border-green-600 text-green-500 rounded-xl hover:bg-green-600 hover:text-white font-medium transition-colors"
        >
          Start Full Review
        </button>
      </Link>
    </div>
  )
}
