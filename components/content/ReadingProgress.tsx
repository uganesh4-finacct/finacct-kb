'use client'

interface ReadingProgressProps {
  progress: number
}

/** Thin progress bar at very top of page showing scroll percentage through article. Fixed position, always visible. */
export function ReadingProgress({ progress }: ReadingProgressProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-slate-800 z-30" aria-hidden>
      <div
        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
