'use client'

import Link from 'next/link'
import { FileText, FolderOpen, UserPlus, Users, BarChart3, Plus } from 'lucide-react'
import { TeamProgress, type TeamMemberProgress } from './TeamProgress'
import { ActivityFeed, type ActivityItem } from './ActivityFeed'

export type { TeamMemberProgress, ActivityItem }

export interface AdminHomeProps {
  fullName: string
  greeting: string
  stats: {
    totalTeam: number
    certified: number
    inTraining: number
    notStarted: number
  }
  teamMembers: TeamMemberProgress[]
  recentActivity: ActivityItem[]
}

export function AdminHome({
  fullName,
  greeting,
  stats,
  teamMembers,
  recentActivity,
}: AdminHomeProps) {
  const statCards = [
    { label: 'Total team', value: stats.totalTeam, icon: Users, href: '/admin/team' },
    { label: 'Certified', value: stats.certified, icon: Users, href: '/admin/team' },
    { label: 'In training', value: stats.inTraining, icon: FileText, href: '/admin/team' },
    { label: 'Not started', value: stats.notStarted, icon: Users, href: '/admin/team' },
  ]

  const quickActions = [
    { label: 'Add Article', href: '/admin/articles/new', icon: Plus },
    { label: 'Add User', href: '/admin/team?add=1', icon: UserPlus },
    { label: 'Manage Sections', href: '/admin/sections', icon: FolderOpen },
    { label: 'View Analytics', href: '/admin', icon: BarChart3 },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-white">
          {greeting}, {fullName}
        </h1>
        <p className="text-slate-400 mt-1 text-base font-normal">
          Team overview and quick actions.
        </p>
      </header>

      {/* Team overview stats */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
          Team overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 hover:border-slate-600 transition-colors"
            >
              <p className="text-sm text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Team progress table */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
          Team progress
        </h2>
        <TeamProgress members={teamMembers} />
      </section>

      {/* Quick actions */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 hover:border-slate-600 transition-colors flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-slate-700/50 text-slate-400">
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-base font-medium text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
          Recent activity
        </h2>
        <div className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-4">
          <ActivityFeed items={recentActivity} />
        </div>
      </section>
    </div>
  )
}
