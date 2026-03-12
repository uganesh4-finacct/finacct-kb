import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrainingModuleView } from './TrainingModuleView'

export const dynamic = 'force-dynamic'

export default async function TrainingModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const resolved = await searchParams
  const fullReview = resolved?.fullReview === 'true'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: module } = await supabase
    .from('training_modules')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!module) notFound()

  const { data: allModules } = await supabase
    .from('training_modules')
    .select('id, title, slug, order_index')
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  const list = allModules ?? []
  const currentIndex = list.findIndex((m) => m.id === module.id)
  const prevModule = currentIndex > 0 ? list[currentIndex - 1] : null
  const nextModule = currentIndex >= 0 && currentIndex < list.length - 1 ? list[currentIndex + 1] : null

  if (currentIndex > 0 && prevModule) {
    const { data: prevProgress } = await supabase
      .from('training_progress')
      .select('is_completed')
      .eq('user_id', user.id)
      .eq('module_id', prevModule.id)
      .single()
    if (!prevProgress?.is_completed) notFound()
  }

  const { data: progressRows } = await supabase
    .from('training_progress')
    .select('module_id, is_completed')
    .eq('user_id', user.id)

  const completedSet = new Set(
    (progressRows ?? [])
      .filter((r) => r.is_completed)
      .map((r) => r.module_id)
  )

  const journeyModules = list.map((m, index) => {
    const completed = completedSet.has(m.id)
    const locked = index > 0 && !completedSet.has(list[index - 1]?.id)
    return {
      id: m.id,
      title: m.title,
      slug: m.slug,
      orderIndex: m.order_index ?? index,
      completed,
      locked,
    }
  })

  const { count: questionCount } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
    .eq('module_id', module.id)

  const { data: quizProgressRow } = await supabase
    .from('quiz_progress')
    .select('current_question_index, question_ids')
    .eq('user_id', user.id)
    .eq('module_id', module.id)
    .maybeSingle()
  const totalFromProgress = Array.isArray(quizProgressRow?.question_ids) ? quizProgressRow.question_ids.length : 0
  const quizProgress =
    quizProgressRow && totalFromProgress > 0
      ? {
          currentIndex: quizProgressRow.current_question_index ?? 0,
          totalQuestions: totalFromProgress,
        }
      : null

  const content = module.content as import('@/components/TipTapContent').TipTapNode | null

  return (
    <TrainingModuleView
      moduleNumber={currentIndex + 1}
      totalModules={list.length}
      moduleId={module.id}
      title={module.title}
      description={module.description ?? ''}
      estimatedMinutes={module.estimated_minutes ?? 20}
      questionCount={questionCount ?? 7}
      passScore={80}
      content={content}
      moduleSlug={module.slug}
      previousModule={prevModule ? { slug: prevModule.slug, title: prevModule.title } : undefined}
      nextModule={nextModule ? { slug: nextModule.slug, title: nextModule.title } : undefined}
      journeyModules={journeyModules}
      fullReview={fullReview}
      quizProgress={quizProgress}
    />
  )
}
