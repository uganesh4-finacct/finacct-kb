'use client'

import { useCallback, useState, useEffect } from 'react'

const STORAGE_KEY = 'finacct-search-recent'
const MAX_RECENT = 5

export interface RecentSearchItem {
  query: string
  timestamp: number
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([])

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      const parsed = raw ? (JSON.parse(raw) as RecentSearchItem[]) : []
      setRecentSearches(Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [])
    } catch {
      setRecentSearches([])
    }
  }, [])

  const saveRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim().slice(0, 200)
    if (!trimmed) return
    setRecentSearches((prev) => {
      const updated = [
        { query: trimmed, timestamp: Date.now() },
        ...prev.filter((s) => s.query.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_RECENT)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }, [])

  return { recentSearches, saveRecentSearch }
}

export function formatSearchTimeAgo(timestamp: number): string {
  const d = new Date(timestamp)
  const now = Date.now()
  const diffMs = now - timestamp
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString()
}
