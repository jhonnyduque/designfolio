// components/works/TaxonomySelector.tsx
"use client"

import type { Taxonomy } from "@/types/taxonomy"
import { TAXONOMY_LIMITS } from "@/types/taxonomy"

interface TaxonomySelectorProps {
  label: string
  hint?: string
  items: Taxonomy[]
  selected: string | string[]
  mode: "single" | "multiple"
  loading: boolean
  maxItems?: number
  onSelect: (name: string) => void
}

export function TaxonomySelector({
  label,
  hint,
  items,
  selected,
  mode,
  loading,
  maxItems,
  onSelect,
}: TaxonomySelectorProps) {
  const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : []
  const max = maxItems ?? (mode === "multiple" ? TAXONOMY_LIMITS.MAX_TAGS_PER_WORK : 1)
  const isMaxReached = mode === "multiple" && selectedArray.length >= max

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {label}{" "}
          {hint && <span className="font-normal text-gray-400">{hint}</span>}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}{" "}
        {hint && <span className="font-normal text-gray-400">{hint}</span>}
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selectedArray.some(
            (s) => s.toLowerCase() === item.name.toLowerCase()
          )
          const isDisabled = !isSelected && isMaxReached

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (!isDisabled) onSelect(item.name)
              }}
              disabled={isDisabled}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : isDisabled
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {item.name}
            </button>
          )
        })}

        {items.length === 0 && (
          <p className="text-sm text-gray-400">No hay opciones disponibles.</p>
        )}
      </div>

      {mode === "multiple" && (
        <p className="mt-1.5 text-xs text-gray-400 text-right">
          {selectedArray.length}/{max}
        </p>
      )}
    </div>
  )
}
