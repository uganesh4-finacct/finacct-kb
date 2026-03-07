'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sidebarCollapsed'

export function useSidebarState() {
  const [collapsed, setCollapsedState] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        setCollapsedState(JSON.parse(saved))
      } else if (window.innerWidth < 1024) {
        setCollapsedState(true)
      }
    } catch {
      // keep default
    }
  }, [])

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // ignore
    }
  }, [])

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [setCollapsed])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggle()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return { collapsed, setCollapsed, toggle }
}
