import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getQuizLockStatus, getQuizProgress } from '@/lib/training-actions'
import { QuizClient } from './QuizClient'

export const dynamic = 'force-dynamic'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: module } = await supabase
    .from('training_modules')
    .select('id, title, slug, estimated_minutes')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!module) notFound()

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('module_id', module.id)
    .order('order_index', { ascending: true })

  if (!questions?.length) notFound()

  const { data: mod } = await supabase.from('training_modules').select('order_index').eq('id', module.id).single()
  const { data: allMods } = await supabase
    .from('training_modules')
    .select('id')
    .eq('is_published', true)
    .order('order_index', { ascending: true })
  const moduleList = allMods ?? []
  const currentIndex = moduleList.findIndex((m: { id: string }) => m.id === module.id)
  const moduleNumber = currentIndex >= 0 ? currentIndex + 1 : 1
  const totalModules = moduleList.length
  const { data: nextList } = await supabase
    .from('training_modules')
    .select('slug, title')
    .eq('is_published', true)
    .gt('order_index', mod?.order_index ?? -1)
    .order('order_index', { ascending: true })
    .limit(1)
  const nextModule = nextList?.[0] ?? null
  const nextModuleSlug = nextModule?.slug ?? null
  const nextModuleTitle = nextModule?.title ?? null

  const lockStatus = await getQuizLockStatus(module.id)
  const initialProgress = await getQuizProgress(module.id)

  return (
    <div className="max-w-4xl px-8 py-6 lg:px-12 lg:py-6 mx-auto">
      <div className="max-w-2xl page-content mx-auto">
        <QuizClient
          moduleId={module.id}
          moduleTitle={module.title}
          moduleSlug={module.slug}
          moduleNumber={moduleNumber}
          totalModules={totalModules}
          estimatedMinutes={module.estimated_minutes ?? 20}
          questions={questions}
          nextModuleSlug={nextModuleSlug}
          nextModuleTitle={nextModuleTitle}
          lockStatus={lockStatus}
          initialProgress={initialProgress}
        />
      </div>
    </div>
  )
}
