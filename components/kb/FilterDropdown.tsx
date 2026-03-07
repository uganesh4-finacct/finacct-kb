'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, ChevronDown, Check } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
  color: string
}

const DEFAULT_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Types', color: 'bg-slate-400' },
  { value: 'reference', label: 'Reference', color: 'bg-blue-400' },
  { value: 'guide', label: 'Guides', color: 'bg-green-400' },
  { value: 'checklist', label: 'Checklists', color: 'bg-yellow-400' },
  { value: 'template', label: 'Templates', color: 'bg-purple-400' },
  { value: 'troubleshoot', label: 'Troubleshoot', color: 'bg-red-400' },
]

export interface FilterDropdownProps {
  selectedFilter: string
  onSelect: (value: string) => void
  filters?: FilterOption[]
}

export function FilterDropdown({
  selectedFilter,
  onSelect,
  filters = DEFAULT_FILTERS,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = filters.find((f) => f.value === selectedFilter)?.label ?? selectedFilter

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-800/50 hover:border-slate-600 transition-all"
      >
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-white">{selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-800 border border-slate-800/50 shadow-xl overflow-hidden z-20">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                onSelect(filter.value)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                filter.value === selectedFilter
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${filter.color}`} />
              <span>{filter.label}</span>
              {filter.value === selectedFilter && <Check className="w-4 h-4 ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
