import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Section } from '@/lib/types'
import { getGreeting } from '@/lib/greeting'
import { SECTION_DISPLAY_ORDER } from '@/lib/sections'
import { TraineeHome } from '@/components/home/TraineeHome'
import { AccountantHome } from '@/components/home/AccountantHome'
import type { FrequentlyUsedItem, ContinueReadingItem, SectionCardItem } from '@/components/home/AccountantHome'
import { AdminHome } from '@/components/home/AdminHome'
import type { TeamMemberProgress, ActivityItem } from '@/components/home/AdminHome'
import { UpdatesSidebar, type UpdateItem } from '@/components/home/UpdatesSidebar'
import type { ModuleStep } from '@/components/home/ModuleJourney'

export const dynamic = 'force-dynamic'

type RecentArticleRow = {
  id: string
  title: string
  slug: string
  updated_at: string
  section_id: string
  kb_sections: { slug: string; title: string } | null
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const profileData: Profile | null = profile
  const rawRole = (profileData?.role as string | undefined)?.toLowerCase()
  const validRoles = ['admin', 'accountant', 'trainee'] as const
  const role = rawRole && validRoles.includes(rawRole) ? rawRole : 'accountant'
  const isTrainee = role === 'trainee'
  const isAdmin = role === 'admin'
  const fullName = profileData?.full_name?.trim() || user.email?.split('@')[0] || 'User'
  const greeting = getGreeting()

  // Recently updated articles for sidebar (all roles)
  const { data: recentArticles } = await supabase
    .from('kb_articles')
    .select(`
      id, title, slug, updated_at, section_id,
      kb_sections ( slug, title )
    `)
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(12)

  const updateItems: UpdateItem[] = ((recentArticles ?? []) as unknown as RecentArticleRow[])
    .filter((a) => a.kb_sections != null)
    .map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      sectionSlug: a.kb_sections!.slug,
      sectionTitle: a.kb_sections!.title,
      updatedAt: a.updated_at,
    }))

  // ---- ADMIN HOME ----
  if (isAdmin) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: modules } = await supabase
      .from('training_modules')
      .select('id, title, slug, order_index')
      .eq('is_published', true)
      .order('order_index', { ascending: true })

    const moduleList = modules ?? []
    const totalModules = moduleList.length

    const { data: progressRows } = await supabase
      .from('training_progress')
      .select('user_id, module_id, is_completed')
      .eq('is_completed', true)

    const completedByUser: Record<string, Set<string>> = {}
    for (const p of progressRows ?? []) {
      if (!completedByUser[p.user_id]) completedByUser[p.user_id] = new Set()
      completedByUser[p.user_id].add(p.module_id)
    }

    const { data: quizAttempts } = await supabase
      .from('quiz_attempts')
      .select('user_id, score')

    const avgScoreByUser: Record<string, number[]> = {}
    for (const a of quizAttempts ?? []) {
      if (!avgScoreByUser[a.user_id]) avgScoreByUser[a.user_id] = []
      avgScoreByUser[a.user_id].push(Number(a.score))
    }

    const certified = profiles?.filter((p) => p.training_completed).length ?? 0
    const inTraining =
      profiles?.filter((p) => p.role === 'trainee' && !p.training_completed && (completedByUser[p.id]?.size ?? 0) > 0).length ?? 0
    const notStarted =
      profiles?.filter((p) => p.role === 'trainee' && !p.training_completed && (completedByUser[p.id]?.size ?? 0) === 0).length ?? 0

    const teamMembers: TeamMemberProgress[] = (profiles ?? []).map((p) => {
      const completed = completedByUser[p.id]?.size ?? 0
      const progressPercent = totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0
      let currentModuleTitle: string | null = null
      if (p.role === 'trainee' && !p.training_completed && moduleList.length > 0) {
        const completedIds = completedByUser[p.id]
        for (const m of moduleList) {
          if (!completedIds?.has(m.id)) {
            currentModuleTitle = m.title
            break
          }
        }
      }
      const scores = avgScoreByUser[p.id]
      const quizAvg = scores?.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
      return {
        id: p.id,
        fullName: p.full_name || p.email || 'User',
        email: p.email,
        role: p.role,
        trainingCompleted: p.training_completed ?? false,
        progressPercent,
        currentModuleTitle,
        quizAvgScore: quizAvg != null ? Math.round(quizAvg) : null,
      }
    })

    // Recent activity
    const activityItems: ActivityItem[] = []
    const { data: recentUpdated } = await supabase
      .from('kb_articles')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5)
    for (const a of recentUpdated ?? []) {
      activityItems.push({
        id: `art-${a.id}`,
        type: 'article_edit',
        title: a.title,
        meta: 'Article updated',
        href: `/admin/articles/${a.id}`,
        at: a.updated_at,
      })
    }
    const { data: recentQuiz } = await supabase
      .from('quiz_attempts')
      .select('id, attempted_at, score')
      .order('attempted_at', { ascending: false })
      .limit(3)
    for (const q of recentQuiz ?? []) {
      activityItems.push({
        id: `quiz-${q.id}`,
        type: 'quiz_complete',
        title: `Quiz attempt`,
        meta: `${Math.round(Number(q.score))}%`,
        at: q.attempted_at,
      })
    }
    activityItems.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    const recentActivity = activityItems.slice(0, 10)

    return (
      <div className="flex flex-col lg:flex-row lg:items-start min-h-0 flex-1 gap-6">
        <div className="flex-1 min-w-0 px-8 py-6 overflow-y-auto">
          <AdminHome
            fullName={fullName}
            greeting={greeting}
            stats={{
              totalTeam: profiles?.length ?? 0,
              certified,
              inTraining,
              notStarted,
            }}
            teamMembers={teamMembers}
            recentActivity={recentActivity}
          />
        </div>
        <UpdatesSidebar items={updateItems} viewAllHref="/admin/articles" />
      </div>
    )
  }

  // ---- TRAINEE HOME ----
  if (isTrainee) {
    const { data: mods } = await supabase
      .from('training_modules')
      .select('id, title, slug, description, order_index, estimated_minutes')
      .eq('is_published', true)
      .order('order_index', { ascending: true })

    const moduleList = mods ?? []
    const totalModules = moduleList.length

    let completedCount = 0
    let nextModule: { slug: string; title: string; description: string | null } | null = null
    let hoursCompleted = 0
    let avgQuizScore: number | null = null
    const completedIds = new Set<string>()

    if (totalModules > 0 && user) {
      const { data: prog } = await supabase
        .from('training_progress')
        .select('module_id, is_completed, time_spent_seconds')
        .eq('user_id', user.id)
      for (const p of prog ?? []) {
        if (p.is_completed) completedIds.add(p.module_id)
        hoursCompleted += (p.time_spent_seconds ?? 0) / 3600
      }
      completedCount = moduleList.filter((m) => completedIds.has(m.id)).length
      for (const m of moduleList) {
        if (!completedIds.has(m.id)) {
          nextModule = { slug: m.slug, title: m.title, description: m.description }
          break
        }
      }

      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('user_id', user.id)
      if (attempts?.length) {
        const sum = attempts.reduce((s, a) => s + Number(a.score), 0)
        avgQuizScore = sum / attempts.length
      }
    }

    const totalMinutes = moduleList.reduce((s, m) => s + (m.estimated_minutes ?? 0), 0)
    const completedMinutes = moduleList
      .filter((m) => completedIds.has(m.id))
      .reduce((s, m) => s + (m.estimated_minutes ?? 0), 0)
    const hoursRemaining = Math.max(0, (totalMinutes - completedMinutes) / 60)

    const moduleSteps: ModuleStep[] = moduleList.map((m, index) => {
      const isCompleted = completedIds.has(m.id)
      const isCurrent = !isCompleted && index === completedCount
      const isLocked = index > completedCount
      return {
        id: m.id,
        slug: m.slug,
        title: m.title,
        orderIndex: m.order_index,
        isCompleted,
        isCurrent,
        isLocked,
      }
    })

    const quickAccess = [
      { title: 'Training Center', href: '/training', description: 'View all modules and your progress' },
      { title: 'COA Quick Reference', href: '/training', description: 'Unlock after certification' },
      { title: 'Sample P&Ls', href: '/training', description: 'Unlock after certification' },
    ]

    return (
      <div className="flex flex-col lg:flex-row lg:items-start min-h-0 flex-1 gap-6">
        <div className="flex-1 min-w-0 px-8 py-6 overflow-y-auto">
          <TraineeHome
            fullName={fullName}
            greeting={greeting}
            completedCount={completedCount}
            totalModules={totalModules}
            nextModule={nextModule}
            moduleSteps={moduleSteps}
            hoursCompleted={Math.round(hoursCompleted * 10) / 10}
            hoursRemaining={Math.round(hoursRemaining * 10) / 10}
            avgQuizScore={avgQuizScore != null ? Math.round(avgQuizScore) : null}
            quickAccess={quickAccess}
          />
        </div>
        <UpdatesSidebar items={[]} viewAllHref="/search" />
      </div>
    )
  }

  // ---- ACCOUNTANT HOME ----
  const { data: sections } = await supabase
    .from('kb_sections')
    .select('id, title, slug, icon')
    .eq('is_published', true)
    .eq('is_training_section', false)
    .order('order_index', { ascending: true })

  const sectionList = (sections ?? []) as Section[]
  const sectionIds = sectionList.map((s) => s.id)

  const { data: articleCounts } = await supabase
    .from('kb_articles')
    .select('section_id')
    .eq('is_published', true)
    .in('section_id', sectionIds.length ? sectionIds : [''])

  const countBySection: Record<string, number> = {}
  for (const a of articleCounts ?? []) {
    countBySection[a.section_id] = (countBySection[a.section_id] ?? 0) + 1
  }

  const sectionsForBrowse: SectionCardItem[] = sectionList.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    articleCount: countBySection[s.id] ?? 0,
    icon: s.icon ?? 'book',
  })).sort((a, b) => {
    const ai = SECTION_DISPLAY_ORDER.indexOf(a.slug as (typeof SECTION_DISPLAY_ORDER)[number])
    const bi = SECTION_DISPLAY_ORDER.indexOf(b.slug as (typeof SECTION_DISPLAY_ORDER)[number])
    if (ai >= 0 && bi >= 0) return ai - bi
    if (ai >= 0) return -1
    if (bi >= 0) return 1
    return 0
  })

  const { data: reads } = await supabase
    .from('kb_reads')
    .select('article_id')
    .eq('user_id', user.id)
    .not('article_id', 'is', null)

  const readCountByArticle: Record<string, number> = {}
  for (const r of reads ?? []) {
    readCountByArticle[r.article_id] = (readCountByArticle[r.article_id] ?? 0) + 1
  }
  const topArticleIds = Object.entries(readCountByArticle)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => id)

  let frequentlyUsed: FrequentlyUsedItem[] = []
  if (topArticleIds.length > 0) {
    const { data: articles } = await supabase
      .from('kb_articles')
      .select(`
        id, title, slug, content,
        kb_sections ( slug )
      `)
      .in('id', topArticleIds)
      .eq('is_published', true)
    for (const a of (articles ?? []) as unknown as Array<{ id: string; title: string; slug: string; content: unknown; kb_sections: { slug: string } | null }>) {
      if (!a.kb_sections) continue
      const words = a.content ? JSON.stringify(a.content).split(/\s+/).length : 0
      const readTime = Math.max(2, Math.ceil(words / 200))
      frequentlyUsed.push({
        id: a.id,
        title: a.title,
        href: `/section/${a.kb_sections.slug}/${a.slug}`,
        readTime,
        visitCount: readCountByArticle[a.id],
      })
    }
    frequentlyUsed = frequentlyUsed.sort((a, b) => (readCountByArticle[b.id] ?? 0) - (readCountByArticle[a.id] ?? 0))
  }

  const { data: lastReads } = await supabase
    .from('kb_reads')
    .select(`
      article_id, read_at,
      kb_articles ( id, title, slug, kb_sections ( slug ) )
    `)
    .eq('user_id', user.id)
    .not('article_id', 'is', null)
    .order('read_at', { ascending: false })
    .limit(3)

  function formatTimeAgo(dateStr: string): string {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  const continueReading: ContinueReadingItem[] = []
  for (const r of (lastReads ?? []) as unknown as Array<{
    article_id: string
    read_at: string
    kb_articles: { id: string; title: string; slug: string; kb_sections: { slug: string } | null } | null
  }>) {
    const a = r.kb_articles
    if (!a?.kb_sections) continue
    continueReading.push({
      id: a.id,
      title: a.title,
      href: `/section/${a.kb_sections.slug}/${a.slug}`,
      readAt: r.read_at,
      timeAgo: formatTimeAgo(r.read_at),
    })
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start min-h-0 flex-1 gap-6">
      <div className="flex-1 min-w-0 px-8 py-6 overflow-y-auto">
        <AccountantHome
          fullName={fullName}
          greeting={greeting}
          frequentlyUsed={frequentlyUsed}
          continueReading={continueReading}
          sections={sectionsForBrowse}
        />
      </div>
      <UpdatesSidebar items={updateItems} viewAllHref="/search" />
    </div>
  )
}
