// components/works/LikeButton.tsx
"use client"

import { useLike } from "@/hooks/useLike"

interface LikeButtonProps {
  workId: string
  initialCount: number
  size?: "sm" | "md"
}

export function LikeButton({
  workId,
  initialCount,
  size = "md",
}: LikeButtonProps) {
  const { liked, count, toggle, loading } = useLike(workId, initialCount)

  const isMd = size === "md"

  return (
    <button
      onClick={(e) => {
        e.preventDefault() // Prevent Link navigation if inside a card
        e.stopPropagation()
        toggle()
      }}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 transition-all ${
        isMd ? "text-sm" : "text-xs"
      } ${
        liked
          ? "text-red-500"
          : "text-gray-400 hover:text-red-400"
      } disabled:opacity-70`}
      aria-label={liked ? "Quitar like" : "Dar like"}
    >
      <svg
        className={`${isMd ? "w-5 h-5" : "w-3.5 h-3.5"} transition-transform ${
          liked ? "scale-110" : ""
        }`}
        fill={liked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span className={liked ? "font-medium" : ""}>{count}</span>
    </button>
  )
}
