import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateCertificate } from '@/lib/certificate-actions'
import { CertificateDownload } from '@/components/CertificateDownload'
import { CertificatePrint } from '@/components/CertificatePrint'
import { CertificateEmailButton } from '@/components/CertificateEmailButton'

export const dynamic = 'force-dynamic'

const SIGNER_NAME = 'FinAcct Controller'
const SIGNER_TITLE = 'Academy Director'

export default async function CertificatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name, training_completed').eq('id', user.id).single()
  if (!profile?.training_completed) redirect('/training')

  const { count: totalModulesCount } = await supabase
    .from('training_modules')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
  const totalModules = totalModulesCount ?? 0

  const { data: cert, error } = await getOrCreateCertificate()
  if (error || !cert) redirect('/training')

  const modulesCompleted = (cert as { modules_completed?: number | null }).modules_completed ?? 0
  if (totalModules > 0 && modulesCompleted < totalModules) redirect('/training')

  const issuedDate = new Date(cert.issued_at)
  const issuedFormatted = issuedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const fullName = profile.full_name || user.email?.split('@')[0] || 'User'
  const averageScore = cert.average_score != null ? Number(cert.average_score).toFixed(1) : '—'
  const modulesLabel = totalModules > 0 ? totalModules : modulesCompleted

  return (
    <div className="min-h-screen bg-slate-900 p-6 lg:p-8">
      <nav className="no-print flex items-center gap-2 text-sm text-slate-400 mb-6 max-w-5xl mx-auto">
        <Link href="/home" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/training" className="hover:text-white">Training</Link>
        <span>/</span>
        <span className="text-white">Certificate</span>
      </nav>

      <div className="no-print flex flex-col items-center gap-4 mb-8 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <CertificateDownload />
          <CertificateEmailButton />
          <CertificatePrint />
        </div>
        <Link href="/training" className="text-slate-400 hover:text-white text-sm font-medium">
          ← Back to Training
        </Link>
      </div>

      <div className="max-w-5xl mx-auto flex justify-center">
        <div
          id="certificate"
          className="bg-white rounded-xl shadow-2xl max-w-4xl mx-auto certificate-pdf-source"
          style={{ width: '800px', minHeight: '560px', paddingTop: '6px' }}
        >
          {/* Gradient top border — visible margin so PDF capture doesn't clip */}
          <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-t-xl" />

          <div className="p-12 pt-10 pb-10 flex flex-col">
            {/* Logo — extra top padding so PDF capture doesn't clip */}
            <div className="flex justify-center mb-8 pt-2">
              <img
                src="/logo-light.png"
                alt="FinAcct360 Academy"
                width={180}
                height={60}
                className="object-contain w-[180px] h-[60px]"
              />
            </div>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-orange-300" />
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-orange-300" />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-serif text-center text-slate-800 mb-2">
              Certificate of Completion
            </h1>
            <p className="text-center text-slate-500 mb-8">
              This certifies that
            </p>

            {/* Name */}
            <div className="text-center mb-8">
              <div className="inline-block">
                <p className="text-3xl font-serif font-bold text-slate-900 mb-1">
                  {fullName}
                </p>
                <div className="h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" />
              </div>
            </div>

            {/* Description */}
            <p className="text-center text-slate-600 max-w-lg mx-auto mb-10">
              has successfully completed the <span className="font-semibold text-slate-800">FinAcct360 Academy</span> Restaurant Accounting Training Program
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mb-10">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-3xl font-bold text-orange-500">{modulesLabel}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">Modules</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-3xl font-bold text-orange-500">{averageScore}%</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">Avg Score</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-xl font-bold text-orange-500">{issuedFormatted}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">Certified</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-8" />

            {/* Signature */}
            <div className="flex justify-between items-end">
              <div>
                <p className="font-serif text-lg text-slate-800">{SIGNER_NAME}</p>
                <p className="text-sm text-slate-500">{SIGNER_TITLE}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-mono">{cert.certificate_number}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Valid for 12 months
                </p>
              </div>
            </div>
          </div>

          {/* Gradient bottom border */}
          <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
        </div>
      </div>
    </div>
  )
}
