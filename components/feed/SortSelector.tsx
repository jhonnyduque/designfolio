// components/feed/SortSelector.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import type { SortOption } from "@/types/feed"
import { SORT_OPTIONS } from "@/types/feed"

interface SortSelectorProps {
  current: SortOption
  onChange: (sort: SortOption) => void
}

const sortKeys = Object.keys(SORT_OPTIONS) as SortOption[]

export function SortSelector({ current, onChange }: SortSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
      >
        {SORT_OPTIONS[current].label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
          {sortKeys.map((key) => (
            <button
              key={key}
              onClick={() => {
                onChange(key)
                setOpen(false)
              }}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                key === current
                  ? "text-gray-900 font-medium bg-gray-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {SORT_OPTIONS[key].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
