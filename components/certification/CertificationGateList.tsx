'use client'

import { Check, Clock, Lock } from 'lucide-react'
import type { GateStatusItem } from '@/lib/certification'

interface CertificationGateListProps {
  gates: GateStatusItem[]
}

export function CertificationGateList({ gates }: CertificationGateListProps) {
  return (
    <ul className="space-y-3">
      {gates.map((item) => {
        const passed = item.status === 'passed'
        return (
          <li
            key={item.gate}
            className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 flex gap-4"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
              style={
                passed
                  ? { backgroundColor: 'rgba(230, 126, 34, 0.2)', color: '#E67E22' }
                  : { backgroundColor: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' }
              }
            >
              {passed ? <Check className="w-5 h-5" /> : item.definition.auto ? <Clock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-500">{item.gate}</span>
                <h3 className="text-sm font-semibold text-white">{item.definition.title}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">{item.definition.description}</p>
              <p className="text-[10px] text-slate-500 mt-1">Signed by: {item.definition.signer}</p>
              {passed ? (
                <p className="text-xs mt-2 font-medium" style={{ color: '#E67E22' }}>
                  Passed
                  {item.signed_at && (
                    <span className="text-slate-500 font-normal">
                      {' '}
                      · {new Date(item.signed_at).toLocaleDateString()}
                      {item.signed_by_name ? ` · ${item.signed_by_name}` : ''}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs mt-2 text-slate-500">
                  {item.definition.auto ? 'In progress — complete all training quizzes' : 'Awaiting sign-off'}
                </p>
              )}
              {item.notes && (
                <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
