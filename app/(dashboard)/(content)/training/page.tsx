import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GraduationCap, Lock, CheckCircle, Clock, BookOpen, ChevronRight } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'

export const dynamic = 'force-dynamic'

export default async function TrainingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('training_completed').eq('id', user.id).single()

  const { data: modules } = await supabase
    .from('training_modules')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  const moduleList = modules ?? []
  const moduleIds = moduleList.map((m) => m.id)

  const { data: progress } = await supabase
    .from('training_progress')
    .select('module_id, is_completed')
    .eq('user_id', user.id)
    .in('module_id', moduleIds)

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('module_id, score, passed')
    .eq('user_id', user.id)
    .in('module_id', moduleIds)

  const completedSet = new Set((progress ?? []).filter((p) => p.is_completed).map((p) => p.module_id))
  const bestScoreByModule: Record<string, number> = {}
  for (const a of attempts ?? []) {
    const s = Number(a.score)
    if (bestScoreByModule[a.module_id] == null || s > bestScoreByModule[a.module_id]) {
      bestScoreByModule[a.module_id] = s
    }
  }

  let lastCompletedIndex = -1
  for (let i = 0; i < moduleList.length; i++) {
    if (completedSet.has(moduleList[i].id)) lastCompletedIndex = i
    else break
  }
  const nextAvailableIndex = lastCompletedIndex + 1
  const completedCount = lastCompletedIndex + 1

  return (
    <div className="px-4 py-4 lg:px-8 lg:py-6 max-w-4xl page-content">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link href="/home" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-white">Training</span>
      </nav>

      <div className="flex items-center gap-4 mb-6">
        <div className="p-2.5 rounded-xl bg-amber-600/20 shrink-0">
          <GraduationCap className="w-8 h-8 text-amber-400" />
        </div>
        <div className="page-title-block min-w-0">
          <h1 className="text-2xl font-semibold text-white">Training Center</h1>
          <p className="text-slate-400 text-base">Complete all modules and quizzes to get certified.</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 overflow-hidden">
        <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Progress overview</h2>
        <ProgressBar
          value={moduleList.length ? (completedCount / moduleList.length) * 100 : 0}
          label="Overall progress"
          valueLabel={`${completedCount} of ${moduleList.length} modules completed`}
          variant="indigo"
        />
      </div>

      <ul className="space-y-2">
        {moduleList.map((mod, index) => {
          const isCompleted = completedSet.has(mod.id)
          const isLocked = index > nextAvailableIndex
          const score = bestScoreByModule[mod.id]
          const scorePct = score != null ? Math.round(score) : null

          if (isLocked) {
            return (
              <li key={mod.id} className="rounded-lg border border-slate-800/50 bg-slate-800/30 px-3 py-2 flex items-center gap-2 opacity-75 overflow-hidden">
                <div className="w-7 h-7 rounded-md bg-slate-600 flex items-center justify-center shrink-0 text-slate-400 font-semibold text-xs">
                  {index + 1}
                </div>
                <div className="p-1.5 rounded-md bg-slate-600 shrink-0">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-medium text-slate-400 truncate">{mod.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{mod.description || 'Complete the previous module to unlock.'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    {mod.estimated_minutes} min
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-600 text-slate-400 text-[10px] font-medium shrink-0">🔒 Locked</span>
              </li>
            )
          }

          return (
            <li key={mod.id} className="overflow-hidden">
              <Link
                href={`/training/${mod.slug}`}
                className="rounded-lg border border-slate-800/50 bg-slate-800/30 px-3 py-2 flex items-center gap-2 hover:border-indigo-500/50 hover:bg-slate-800 transition block overflow-hidden"
              >
                <div className="w-7 h-7 rounded-md bg-slate-700 flex items-center justify-center shrink-0 text-white font-semibold text-xs">
                  {index + 1}
                </div>
                <div className={`p-1.5 rounded-md shrink-0 ${isCompleted ? 'bg-green-600/20' : 'bg-amber-600/20'}`}>
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-medium text-white truncate">{mod.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{mod.description || 'Training module'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    {mod.estimated_minutes} min
                    {scorePct != null && (
                      <span className="ml-1">Quiz: {scorePct}%</span>
                    )}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${isCompleted ? 'bg-green-600/20 text-green-400' : 'bg-amber-600/20 text-amber-400'}`}>
                  {isCompleted ? '✅ Completed' : '📖 Available'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 text-center">
        {profile?.training_completed ? (
          <Link
            href="/certificate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            <CheckCircle className="w-5 h-5" />
            View certificate
          </Link>
        ) : (
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-500 cursor-not-allowed"
            title="Complete all modules and pass the quizzes to unlock your certificate"
          >
            <Lock className="w-5 h-5 shrink-0" />
            <span>View certificate</span>
            <span className="text-slate-500 text-sm font-normal">— Complete all modules to unlock</span>
          </div>
        )}
      </div>
    </div>
  )
}
