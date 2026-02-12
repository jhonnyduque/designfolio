// components/feed/SortSelector.tsx
"use client"

import type { SortOption } from "@/types/feed"
import { SORT_OPTIONS } from "@/types/feed"

interface SortSelectorProps {
  current: SortOption
  onChange: (sort: SortOption) => void
}

const sortKeys = Object.keys(SORT_OPTIONS) as SortOption[]

export function SortSelector({ current, onChange }: SortSelectorProps) {
  return (
    <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Ordenar feed">
      {sortKeys.map((key) => {
        const active = key === current
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all ${
              active
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {SORT_OPTIONS[key].label}
          </button>
        )
      })}
    </div>
  )
}
