import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/DashboardShell'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import type { Profile, Section, UserRole } from '@/lib/types'

// Ensure profile/role are always fresh (no cached layout)
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[DashboardLayout] Profile fetch error:', profileError.message, 'for user', user.id)
  }

  const profileData = profile as Profile | null
  const rawRole = (profileData?.role as string | undefined)?.toLowerCase()
  const validRoles: UserRole[] = ['admin', 'editor', 'accountant', 'trainee']
  const role: UserRole = rawRole && validRoles.includes(rawRole as UserRole) ? (rawRole as UserRole) : 'accountant'

  if (process.env.NODE_ENV === 'development') {
    console.log('[DashboardLayout] User role:', role, '| Source: profiles table | profile:', profileData ? 'found' : 'null', '| rawRole:', rawRole ?? 'undefined')
  }

  const email = user.email ?? ''
  const fullName = profileData?.full_name ?? null

  const { data: sections } = await supabase
    .from('kb_sections')
    .select('*')
    .order('order_index', { ascending: true })

  const sectionsData: Section[] = sections ?? []

  return (
    <>
      <KeyboardShortcuts />
      <DashboardShell
        email={email}
        fullName={fullName}
        role={role}
        sections={sectionsData}
      >
        {children}
      </DashboardShell>
    </>
  )
}
