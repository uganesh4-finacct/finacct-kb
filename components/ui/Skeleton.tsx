'use client'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-800 rounded ${className}`}
      aria-hidden
    />
  )
}
