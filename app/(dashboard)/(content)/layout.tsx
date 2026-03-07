import { createClient } from '@/lib/supabase/server'
import { CopyProtection } from '@/components/CopyProtection'
import { Watermark } from '@/components/Watermark'
import { ContentLayoutClient } from '@/components/kb/ContentLayoutClient'
import type { Section } from '@/lib/types'

export default async function ContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ''

  const { data: sections } = await supabase
    .from('kb_sections')
    .select('*')
    .order('order_index', { ascending: true })
  const sectionsData: Section[] = sections ?? []

  return (
    <CopyProtection>
      {email && <Watermark email={email} />}
      <ContentLayoutClient sections={sectionsData}>
        {children}
      </ContentLayoutClient>
    </CopyProtection>
  )
}
