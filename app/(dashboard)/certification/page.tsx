import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyCertificationStatus } from '@/app/actions/certification'
import { CertificationGateList } from '@/components/certification/CertificationGateList'
import { Award, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CertificationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const { data, error } = await getMyCertificationStatus()
  if (error || !data) redirect('/training')

  const fullName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const showCourseworkBanner = data.g1Passed && !data.fullyCertified
  const showFCRABanner = data.fullyCertified

  return (
    <div className="px-4 py-4 lg:px-8 lg:py-6 max-w-2xl page-content mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link href="/home" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-white">Certification</span>
      </nav>

      <div className="flex items-center gap-4 mb-6">
        <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: 'rgba(27, 79, 114, 0.35)' }}>
          <Award className="w-8 h-8" style={{ color: '#E67E22' }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">FCRA Certification</h1>
          <p className="text-slate-400 text-base mt-0.5">
            FinAcct360 Academy — six gates to full certification
          </p>
        </div>
      </div>

      {showCourseworkBanner && (
        <div
          className="mb-6 rounded-xl border p-4"
          style={{ borderColor: 'rgba(230, 126, 34, 0.45)', backgroundColor: 'rgba(230, 126, 34, 0.12)' }}
        >
          <p className="font-semibold text-white">Coursework Complete</p>
          <p className="text-sm text-slate-300 mt-1">
            You have passed all training quizzes (Gate G1). Practical gates G2–G6 require trainer sign-off before your FCRA certificate is issued.
          </p>
        </div>
      )}

      {showFCRABanner && (
        <div
          className="mb-6 rounded-xl border p-4"
          style={{ borderColor: 'rgba(40, 116, 166, 0.5)', backgroundColor: 'rgba(40, 116, 166, 0.15)' }}
        >
          <p className="font-semibold text-white">All Gates Passed</p>
          <p className="text-sm text-slate-300 mt-1">
            {profile?.role === 'accountant'
              ? 'You are FCRA certified. Your certificate is available below.'
              : 'All six gates are complete. Awaiting promotion to Accountant by your program lead.'}
          </p>
          {profile?.role === 'accountant' && (
            <Link
              href="/certificate"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors"
              style={{ backgroundColor: '#E67E22' }}
            >
              View FCRA Certificate
            </Link>
          )}
        </div>
      )}

      {!data.g1Passed && (
        <div className="mb-6 rounded-xl border border-slate-800/50 bg-slate-800/30 p-4">
          <p className="text-sm font-medium text-slate-300">Gate G1 progress</p>
          <p className="text-2xl font-bold text-white mt-1">
            {data.coursework.passed} / {data.coursework.total} modules passed
          </p>
          <p className="text-xs text-slate-500 mt-1">Pass each module quiz at 80% to complete G1 automatically.</p>
          <Link href="/training" className="inline-block mt-3 text-sm font-medium" style={{ color: '#2874A6' }}>
            Continue training →
          </Link>
        </div>
      )}

      <CertificationGateList gates={data.gates} />

      <p className="mt-8 text-center text-xs text-slate-500">
        Questions about your certification path? Contact your program lead.
      </p>
    </div>
  )
}
