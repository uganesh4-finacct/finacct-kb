import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateCertificate } from '@/lib/certificate-actions'
import { CertificateDownload } from '@/components/CertificateDownload'
import { CertificatePrint } from '@/components/CertificatePrint'

export const dynamic = 'force-dynamic'

export default async function CertificatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name, training_completed').eq('id', user.id).single()
  if (!profile?.training_completed) redirect('/training')

  const { data: cert, error } = await getOrCreateCertificate()
  if (error || !cert) redirect('/training')

  const issuedDate = new Date(cert.issued_at)
  const issuedFormatted = issuedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const refresherDue = new Date(issuedDate)
  refresherDue.setMonth(refresherDue.getMonth() + 6)
  const refresherFormatted = refresherDue.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const fullName = profile.full_name || user.email?.split('@')[0] || 'User'
  const averageScore = cert.average_score != null ? Number(cert.average_score).toFixed(1) : '—'

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
          <CertificatePrint />
        </div>
        <Link href="/training" className="text-slate-400 hover:text-white text-sm font-medium">
          ← Back to Training
        </Link>
      </div>

      {/* Certificate: landscape, ~800×600, light background for print */}
      <div className="max-w-5xl mx-auto flex justify-center">
        <div
          id="certificate"
          className="bg-[#fafaf9] text-slate-900 rounded-2xl shadow-2xl overflow-hidden border-[12px] border-transparent bg-clip-padding"
          style={{
            width: '800px',
            minHeight: '560px',
            boxShadow: 'inset 0 0 0 2px #d4a574, inset 0 0 0 6px #fafaf9',
          }}
        >
          <div className="p-10 h-full flex flex-col">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo-dark.png"
                alt="FinAcct360"
                width={160}
                height={48}
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-center font-serif text-3xl font-bold tracking-wide text-slate-800 mb-1">
              CERTIFICATE OF COMPLETION
            </h1>
            <p className="text-center text-slate-600 text-sm mb-6">This certifies that</p>
            <p className="text-center font-serif text-3xl font-semibold text-slate-800 mb-2">{fullName}</p>
            <p className="text-center text-slate-600 text-base mb-8">
              has successfully completed the FinAcct360 Knowledge Base Training Program
            </p>

            {/* Stat boxes */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">10</p>
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Modules Completed</p>
              </div>
              <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">{averageScore}%</p>
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Average Score</p>
              </div>
              <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 text-center">
                <p className="text-lg font-bold text-indigo-600">{issuedFormatted}</p>
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Certified</p>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mb-6">
              Certificate No. {cert.certificate_number}
            </p>

            {/* Signature line */}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="w-48 h-10 border-b border-slate-400 mb-1" />
              <p className="text-xs font-medium text-slate-600">FinAcct Controller</p>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Valid for 12 months • Refresher due: {refresherFormatted}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
