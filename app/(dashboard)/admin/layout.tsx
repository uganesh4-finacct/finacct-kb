import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from './AdminNav'
import type { UserRole } from '@/lib/types'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = (profile?.role ?? 'accountant') as UserRole
  if (role !== 'admin' && role !== 'editor') redirect('/home')

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminNav role={role} />
      {children}
    </div>
  )
}
