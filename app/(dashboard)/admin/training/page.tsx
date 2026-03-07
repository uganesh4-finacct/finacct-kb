'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getTrainingModulesAdmin } from '../actions'
import type { TrainingModule } from '@/lib/types'
import { Plus, Pencil, Clock } from 'lucide-react'

export default function AdminTrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrainingModulesAdmin().then((r) => {
      if (r.data) setModules(r.data)
      setLoading(false)
    })
  }, [])

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Training Modules</h1>
        <Link
          href="/admin/training/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          <Plus className="w-5 h-5" />
          New Module
        </Link>
      </div>

      <div className="rounded-xl border-slate-800/50 bg-slate-800/30 overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-400">Loading…</div>
        ) : modules.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No training modules yet. Create one to get started.
          </div>
        ) : (
          <ul className="divide-y divide-slate-700">
            {modules.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/training/${m.id}`}
                  className="flex items-center justify-between px-4 py-4 hover:bg-slate-700/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{m.title}</span>
                    <span className="text-slate-500 text-sm">{m.slug}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${m.is_published ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                      {m.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-slate-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {m.estimated_minutes} min
                    </span>
                    <Pencil className="w-4 h-4 text-slate-500" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
