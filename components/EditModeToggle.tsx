'use client'

import { useCallback } from 'react'

interface EditModeToggleProps {
  onEdit: () => void
  visible: boolean
}

/**
 * Floating "Edit" button (bottom-right), shown only when user can edit and not already editing.
 */
export function EditModeToggle({ onEdit, visible }: EditModeToggleProps) {
  if (!visible) return null

  return (
    <button
      type="button"
      onClick={onEdit}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 no-print"
      aria-label="Edit article"
    >
      <span aria-hidden>✏️</span>
      Edit
    </button>
  )
}
