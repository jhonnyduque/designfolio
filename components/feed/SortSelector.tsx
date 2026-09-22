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
        className="flex items-center gap-1.5 py-2 px-2 text-action text-[#2a2a30] transition-colors hover:text-black whitespace-nowrap"
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
        <div className="ui-menu-panel absolute right-0 z-20 mt-2 w-max max-w-[calc(100vw-2rem)] rounded-lg border border-black/10 bg-white shadow-lg">
          {sortKeys.map((key) => (
            <button
              key={key}
              onClick={() => {
                onChange(key)
                setOpen(false)
              }}
              className={`ui-menu-row w-full whitespace-nowrap px-4 text-left text-nav transition-colors hover:bg-black/5 ${
                key === current ? "text-[#1e1e1e]" : "text-[#4f4f57]"
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
