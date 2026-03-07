'use client'

import Link from 'next/link'

export interface TeamMemberProgress {
  id: string
  fullName: string
  email: string
  role: string
  trainingCompleted: boolean
  progressPercent: number
  currentModuleTitle: string | null
  quizAvgScore: number | null
}

interface TeamProgressProps {
  members: TeamMemberProgress[]
}

export function TeamProgress({ members }: TeamProgressProps) {
  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-800/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="px-4 py-3 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Team member
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Progress
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/60">
                <td className="px-4 py-3">
                  <Link
                    href="/admin/team"
                    className="text-base font-medium text-white hover:text-slate-200"
                  >
                    {m.fullName}
                  </Link>
                  <p className="text-sm text-slate-500 mt-0.5">{m.email}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${m.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-400 tabular-nums w-10">
                      {m.progressPercent}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {m.trainingCompleted ? (
                    <span className="text-green-500 font-medium">Certified</span>
                  ) : m.currentModuleTitle ? (
                    <span>{m.currentModuleTitle}</span>
                  ) : (
                    <span>Not started</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-800/50">
        <Link
          href="/admin/team"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          View full team →
        </Link>
      </div>
    </div>
  )
}
