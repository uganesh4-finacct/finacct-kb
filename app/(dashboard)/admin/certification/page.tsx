'use client'

import { useEffect, useState } from 'react'
import {
  getTraineeCertificationMatrix,
  markGatePassed,
  promoteTraineeToAccountant,
} from '@/app/actions/certification'
import { CERTIFICATION_GATE_IDS, type CertificationGateId } from '@/lib/certification-constants'
import { Check, Clock } from 'lucide-react'

type TraineeRow = {
  id: string
  fullName: string
  email: string
  gates: Array<{ gate: CertificationGateId; status: string }>
  coursework: { passed: number; total: number }
  fullyCertified: boolean
}

export default function AdminCertificationPage() {
  const [rows, setRows] = useState<TraineeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<{
    userId: string
    userName: string
    gate: CertificationGateId
  } | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [promoteDialog, setPromoteDialog] = useState<{ userId: string; userName: string } | null>(null)

  async function load() {
    setLoading(true)
    const res = await getTraineeCertificationMatrix()
    if (res.error) setError(res.error)
    else setRows((res.data ?? []) as TraineeRow[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleMarkPassed() {
    if (!dialog) return
    setSubmitting(true)
    setError(null)
    const res = await markGatePassed(dialog.userId, dialog.gate, notes)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error ?? 'Failed')
      return
    }
    setDialog(null)
    setNotes('')
    await load()
    if (res.allPassed && res.userRole === 'trainee') {
      setPromoteDialog({ userId: dialog.userId, userName: res.userName })
    }
  }

  async function handlePromote() {
    if (!promoteDialog) return
    setSubmitting(true)
    const res = await promoteTraineeToAccountant(promoteDialog.userId)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error ?? 'Promotion failed')
      return
    }
    setPromoteDialog(null)
    await load()
  }

  function gateCell(userId: string, userName: string, gate: CertificationGateId, status: string) {
    if (gate === 'G1') {
      return status === 'passed' ? (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'rgba(230, 126, 34, 0.2)' }}>
          <Check className="w-4 h-4" style={{ color: '#E67E22' }} />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50">
          <Clock className="w-4 h-4 text-slate-500" />
        </span>
      )
    }
    if (status === 'passed') {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'rgba(230, 126, 34, 0.2)' }}>
          <Check className="w-4 h-4" style={{ color: '#E67E22' }} />
        </span>
      )
    }
    return (
      <button
        type="button"
        onClick={() => setDialog({ userId, userName, gate })}
        className="px-2 py-1 rounded text-xs font-medium text-slate-300 border border-slate-600 hover:bg-slate-700/50 transition"
      >
        Sign off
      </button>
    )
  }

  if (loading) {
    return <p className="text-slate-400">Loading certification matrix…</p>
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">FCRA Certification Gates</h1>
        <p className="text-slate-400 mt-1">
          Sign off practical gates G2–G6 for trainees. G1 is automatic when all training quizzes are passed.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
      )}

      {rows.length === 0 ? (
        <p className="text-slate-500">No trainees currently in the certification pipeline.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-800/40">
                <th className="px-4 py-3 text-slate-300 font-semibold">Trainee</th>
                <th className="px-3 py-3 text-slate-300 font-semibold text-center">G1</th>
                <th className="px-3 py-3 text-slate-300 font-semibold text-center">G2</th>
                <th className="px-3 py-3 text-slate-300 font-semibold text-center">G3</th>
                <th className="px-3 py-3 text-slate-300 font-semibold text-center">G4</th>
                <th className="px-3 py-3 text-slate-300 font-semibold text-center">G5</th>
                <th className="px-3 py-3 text-slate-300 font-semibold text-center">G6</th>
                <th className="px-4 py-3 text-slate-300 font-semibold">Coursework</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const gateMap = Object.fromEntries(row.gates.map((g) => [g.gate, g.status]))
                return (
                  <tr key={row.id} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{row.fullName}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </td>
                    {CERTIFICATION_GATE_IDS.map((g) => (
                      <td key={g} className="px-3 py-3 text-center">
                        {gateCell(row.id, row.fullName, g, gateMap[g] ?? 'pending')}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-slate-400">
                      {row.coursework.passed}/{row.coursework.total}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-semibold text-white">Sign off {dialog.gate}</h2>
            <p className="text-slate-400 text-sm mt-1">
              Mark <strong className="text-white">{dialog.userName}</strong> as passed for gate {dialog.gate}?
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={3}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                type="button"
                onClick={() => { setDialog(null); setNotes('') }}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkPassed}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-60"
                style={{ backgroundColor: '#E67E22' }}
              >
                {submitting ? 'Saving…' : 'Confirm passed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {promoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-semibold text-white">Promote to Accountant?</h2>
            <p className="text-slate-400 text-sm mt-2">
              <strong className="text-white">{promoteDialog.userName}</strong> has passed all six FCRA gates.
              Promote to Accountant and unlock their FCRA certificate?
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={() => setPromoteDialog(null)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={handlePromote}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-60"
                style={{ backgroundColor: '#1B4F72' }}
              >
                {submitting ? 'Promoting…' : 'Promote to Accountant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
