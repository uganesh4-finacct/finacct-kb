'use client'

import { useEffect, useState } from 'react'
import {
  getTeamProfiles,
  getQuizStatsByUser,
  createUserDirect,
  updateUserProfile,
  resetUserPassword,
  deleteUser,
} from '../actions'
import type { Profile, UserRole } from '@/lib/types'
import { UserTable } from '@/components/admin/UserTable'
import { InviteUserModal } from '@/components/admin/InviteUserModal'
import { EditUserModal } from '@/components/admin/EditUserModal'
import { UserCredentialsModal } from '@/components/admin/UserCredentialsModal'
import { UserPlus } from 'lucide-react'

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [quizStats, setQuizStats] = useState<Record<string, { avgScore: number; failedCount: number }>>({})
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; tempPassword: string; userName?: string } | null>(null)
  const [editProfile, setEditProfile] = useState<Profile | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  async function load() {
    const [profRes, statsRes] = await Promise.all([getTeamProfiles(), getQuizStatsByUser()])
    if (profRes.data) setProfiles(profRes.data)
    if (statsRes.data) setQuizStats(statsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleInviteSubmit(data: { fullName: string; email: string; role: UserRole }) {
    const formData = new FormData()
    formData.set('full_name', data.fullName)
    formData.set('email', data.email)
    formData.set('role', data.role)
    return createUserDirect(formData)
  }

  function handleInviteSuccess(email: string, tempPassword: string, userName?: string) {
    setCredentials({ email, tempPassword, userName })
    load()
  }

  function handleInviteSuccessWrap(email: string, tempPassword: string, fullName?: string) {
    handleInviteSuccess(email, tempPassword, fullName)
  }

  async function handleSaveProfile(userId: string, updates: { full_name?: string; role?: UserRole; is_active?: boolean }) {
    return updateUserProfile(userId, updates)
  }

  async function handleResetPassword(userId: string) {
    return resetUserPassword(userId)
  }

  function handleCredentialsShown(email: string, tempPassword: string, userName?: string) {
    setCredentials({ email, tempPassword, userName })
  }

  async function handleDeleteConfirm(userId: string) {
    const res = await deleteUser(userId)
    setDeleteConfirmId(null)
    if (res.ok) {
      setProfiles((prev) => prev.filter((p) => p.id !== userId))
    } else {
      alert(res.error)
    }
  }

  if (loading) {
    return (
      <div className="text-slate-400">Loading team members…</div>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Team Members</h1>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Invite User
        </button>
      </div>

      <UserTable
        profiles={profiles}
        quizStats={quizStats}
        onEdit={setEditProfile}
        onDelete={(p) => setDeleteConfirmId(p.id)}
        deleteConfirmId={deleteConfirmId}
        onConfirmDelete={handleDeleteConfirm}
        onCancelDelete={() => setDeleteConfirmId(null)}
      />

      {inviteOpen && (
        <InviteUserModal
          onClose={() => setInviteOpen(false)}
          onSubmit={handleInviteSubmit}
          onSuccess={handleInviteSuccessWrap}
        />
      )}

      {credentials && (
        <UserCredentialsModal
          email={credentials.email}
          tempPassword={credentials.tempPassword}
          userName={credentials.userName}
          onClose={() => setCredentials(null)}
        />
      )}

      {editProfile && (
        <EditUserModal
          profile={editProfile}
          onClose={() => setEditProfile(null)}
          onSave={handleSaveProfile}
          onResetPassword={handleResetPassword}
          onCredentialsShown={handleCredentialsShown}
        />
      )}
    </>
  )
}
