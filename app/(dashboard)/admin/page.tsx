import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, FolderOpen, Users, Eye, Plus, UserPlus, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [articlesRes, sectionsRes, profilesRes, readsRes, recentRes] = await Promise.all([
    supabase.from('kb_articles').select('*', { count: 'exact', head: true }),
    supabase.from('kb_sections').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('kb_reads')
      .select('*', { count: 'exact', head: true })
      .gte('read_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('kb_articles')
      .select(`
        id,
        title,
        slug,
        updated_at,
        section_id,
        kb_sections ( title, slug )
      `)
      .order('updated_at', { ascending: false })
      .limit(8),
  ])

  const totalArticles = articlesRes.count ?? 0
  const totalSections = sectionsRes.count ?? 0
  const teamMembers = profilesRes.count ?? 0
  const readsThisWeek = readsRes.count ?? 0
  const rawRecent = recentRes.data ?? []
  const recentArticles: Array<{
    id: string
    title: string
    slug: string
    updated_at: string
    section_id: string
    kb_sections: { title: string; slug: string } | null
  }> = rawRecent.map((a: { id: string; title: string; slug: string; updated_at: string; section_id: string; kb_sections?: unknown }) => {
    const sec = a.kb_sections
    const section = Array.isArray(sec) ? sec[0] : sec
    const kb_sections = section && typeof section === 'object' && section !== null && 'title' in section && 'slug' in section
      ? { title: String((section as { title: string }).title), slug: String((section as { slug: string }).slug) }
      : null
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      updated_at: a.updated_at,
      section_id: a.section_id,
      kb_sections,
    }
  })

  const stats = [
    { label: 'Total Articles', value: totalArticles, icon: FileText, href: '/admin/articles' },
    { label: 'Sections', value: totalSections, icon: FolderOpen, href: '/admin/sections' },
    { label: 'Team Members', value: teamMembers, icon: Users, href: '/admin/team' },
    { label: 'Reads This Week', value: readsThisWeek, icon: Eye, href: '/admin' },
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-5 hover:border-indigo-500/50 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-600/20">
                <stat.icon className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-800/50 bg-slate-800/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            {recentArticles.length === 0 ? (
              <li className="text-slate-500 text-sm">No articles yet.</li>
            ) : (
              recentArticles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-700/50 transition group"
                  >
                    <span className="text-white font-medium group-hover:text-indigo-300">{a.title}</span>
                    <span className="text-slate-400 text-sm">
                      {a.kb_sections?.title ?? 'Section'} · {new Date(a.updated_at).toLocaleDateString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2" />
                  </Link>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/admin/articles"
            className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            View all articles →
          </Link>
        </div>

        <div className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/articles/new"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
            >
              <Plus className="w-5 h-5" />
              New Article
            </Link>
            <Link
              href="/admin/sections?add=1"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-slate-600 hover:bg-slate-700/50 text-white font-medium transition"
            >
              <FolderOpen className="w-5 h-5" />
              New Section
            </Link>
            <Link
              href="/admin/team?add=1"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-slate-600 hover:bg-slate-700/50 text-white font-medium transition"
            >
              <UserPlus className="w-5 h-5" />
              Add Team Member
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
