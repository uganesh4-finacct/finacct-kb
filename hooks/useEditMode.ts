'use client'

import { useState, useCallback } from 'react'

export function useEditMode(initial = false) {
  const [isEditing, setIsEditing] = useState(initial)
  const startEditing = useCallback(() => setIsEditing(true), [])
  const stopEditing = useCallback(() => setIsEditing(false), [])
  return { isEditing, startEditing, stopEditing, setIsEditing }
}
