'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface UserCredentialsModalProps {
  email: string
  tempPassword: string
  userName?: string
  onClose: () => void
}

export function UserCredentialsModal({ email, tempPassword, userName, onClose }: UserCredentialsModalProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = `Email: ${email}\nTemporary Password: ${tempPassword}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="rounded-xl bg-slate-800 border border-slate-800/50 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-green-400">✓</span> User Created
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-300">
            {userName ? `Share these credentials with ${userName}:` : 'Share these credentials with the user:'}
          </p>
          <div className="rounded-lg bg-slate-900/80 border border-slate-800/50 p-4 space-y-2 font-mono text-sm">
            <p className="text-slate-300">
              <span className="text-slate-500">Email:</span> {email}
            </p>
            <p className="text-white">
              <span className="text-slate-500">Temporary Password:</span> {tempPassword}
            </p>
          </div>
          <p className="text-xs text-amber-400">
            ⚠️ This password won&apos;t be shown again. User should change it on first login.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Credentials'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
