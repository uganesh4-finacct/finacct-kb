'use client'

import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_INTERVAL_MS = 30_000

export function useAutoSave<T>(
  key: string,
  value: T,
  options: { enabled?: boolean; intervalMs?: number; serialize?: (v: T) => string; deserialize?: (s: string) => T } = {}
) {
  const { enabled = true, intervalMs = DEFAULT_INTERVAL_MS, serialize = JSON.stringify, deserialize = JSON.parse } = options
  const lastSaved = useRef<string | null>(null)

  const save = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return
    try {
      const str = serialize(value)
      if (str === lastSaved.current) return
      localStorage.setItem(key, str)
      lastSaved.current = str
    } catch {
      // ignore
    }
  }, [key, value, enabled, serialize])

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(save, intervalMs)
    return () => clearInterval(id)
  }, [enabled, intervalMs, save])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key)
      lastSaved.current = null
    } catch {
      // ignore
    }
  }, [key])

  const getDraft = useCallback((): T | null => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      return deserialize(raw) as T
    } catch {
      return null
    }
  }, [key, deserialize])

  return { save, clear, getDraft }
}
