import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TipTapContent } from '@/components/TipTapContent'
import { getHeadingsFromContent, type TipTapNode } from '@/lib/tiptap-headings'
import { TrackRead } from '@/components/TrackRead'
import { ArticlePageClient } from '@/components/kb/ArticlePageClient'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; articleSlug: string }>
}) {
  const { slug, articleSlug } = await params
  const supabase = await createClient()
  const { data: section } = await supabase
    .from('kb_sections')
    .select('id, title, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!section) notFound()

  const { data: allArticles } = await supabase
    .from('kb_articles')
    .select('id, title, slug, order_index')
    .eq('section_id', section.id)
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  const articleIndex = allArticles?.findIndex((a) => a.slug === articleSlug) ?? -1
  const article = articleIndex >= 0 ? allArticles![articleIndex] : null
  if (!article) notFound()

  const { data: fullArticle } = await supabase
    .from('kb_articles')
    .select('*')
    .eq('id', article.id)
    .single()

  if (!fullArticle) notFound()

  const content = fullArticle.content as TipTapNode | null
  const headings = getHeadingsFromContent(content)
  const readingMinutes = content
    ? Math.max(2, Math.ceil(JSON.stringify(content).split(/\s+/).length / 200))
    : undefined

  const { data: related } = await supabase
    .from('kb_articles')
    .select('id, title, slug')
    .eq('section_id', section.id)
    .eq('is_published', true)
    .neq('id', article.id)
    .order('updated_at', { ascending: false })
    .limit(5)

  const prevArticle =
    articleIndex > 0
      ? { title: allArticles![articleIndex - 1].title, slug: allArticles![articleIndex - 1].slug }
      : null
  const nextArticle =
    articleIndex >= 0 && articleIndex < allArticles!.length - 1
      ? { title: allArticles![articleIndex + 1].title, slug: allArticles![articleIndex + 1].slug }
      : null

  const showQuickCopy = section.slug === 'chart-of-accounts'

  /** Sections that allow inline editing (Admin or Editor). Client Education is read-only. */
  const EDITABLE_SECTION_SLUGS = [
    'chart-of-accounts',
    'standard-operating-procedures',
    'exception-handling',
    'sample-financials',
    'pos-guides',
  ]
  let canEdit = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const role = (profile?.role as string)?.toLowerCase()
    const isAdminOrEditor = role === 'admin' || role === 'editor'
    /** Inline article edit: admin or editor, and only in editable sections (not client-education). */
    canEdit = isAdminOrEditor && EDITABLE_SECTION_SLUGS.includes(section.slug)
  }

  return (
    <>
      <TrackRead articleId={article.id} />
      <ArticlePageClient
        sectionSlug={section.slug}
        sectionTitle={section.title}
        articleId={article.id}
        articleSlug={fullArticle.slug}
        articleTitle={fullArticle.title}
        articleExcerpt={fullArticle.excerpt}
        headings={headings}
        related={related ?? []}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        showQuickCopy={showQuickCopy}
        readingMinutes={readingMinutes}
        lastUpdated={fullArticle.updated_at ?? null}
        canEdit={canEdit}
        initialContent={content && content.type === 'doc' ? content : null}
      >
        {content && content.type === 'doc' ? (
          <TipTapContent content={content} />
        ) : (
          <p className="text-slate-500">No content yet.</p>
        )}
      </ArticlePageClient>
    </>
  )
}
