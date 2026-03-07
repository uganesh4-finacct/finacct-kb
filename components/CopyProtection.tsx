'use client'

import { useEffect, useCallback } from 'react'

interface CopyProtectionProps {
  children: React.ReactNode
}

export function CopyProtection({ children }: CopyProtectionProps) {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
          case 'a':
          case 'p':
          case 's':
            e.preventDefault()
            break
          default:
            break
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className="no-select"
      onContextMenu={handleContextMenu}
      style={{ userSelect: 'none' }}
    >
      {children}
    </div>
  )
}
