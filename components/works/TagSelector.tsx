// components/works/TagSelector.tsx
"use client"

import { TAG_LIMITS } from "@/types/tag"
import type { Tag } from "@/types/tag"

interface TagSelectorProps {
  /** All active tags from v_tags_active (sorted by usage_count DESC) */
  allTags: Tag[]
  /** Currently selected tag names */
  selectedTags: string[]
  /** Loading state */
  loading: boolean
  /** Whether max tags reached */
  isMaxReached: boolean
  /** Toggle a tag on/off */
  onToggle: (name: string) => void
}

export function TagSelector({
  allTags,
  selectedTags,
  loading,
  isMaxReached,
  onToggle,
}: TagSelectorProps) {
  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tags{" "}
          <span className="font-normal text-gray-400">
            (opcional, max {TAG_LIMITS.MAX_PER_WORK})
          </span>
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-100 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Tags{" "}
        <span className="font-normal text-gray-400">
          (opcional, max {TAG_LIMITS.MAX_PER_WORK})
        </span>
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.some(
            (s) => s.toLowerCase() === tag.name.toLowerCase()
          )
          const isDisabled = !isSelected && isMaxReached

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                if (!isDisabled) onToggle(tag.name)
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
              {tag.name}
            </button>
          )
        })}

        {allTags.length === 0 && (
          <p className="text-sm text-gray-400">
            No hay tags disponibles aún.
          </p>
        )}
      </div>

      <p className="mt-1.5 text-xs text-gray-400 text-right">
        {selectedTags.length}/{TAG_LIMITS.MAX_PER_WORK}
      </p>
    </div>
  )
}
