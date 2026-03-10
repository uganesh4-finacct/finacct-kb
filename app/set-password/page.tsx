import { redirect } from 'next/navigation'
import { getSetPasswordTokenInfo } from '@/app/actions/invite-email'
import { SetPasswordForm } from './SetPasswordForm'

type Props = { searchParams: Promise<{ token?: string }> }

export default async function SetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams
  const result = await getSetPasswordTokenInfo(token ?? null)

  if ('error' in result) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <SetPasswordForm
          token={token!}
          email={result.email}
          fullName={result.fullName}
        />
      </div>
    </div>
  )
}
