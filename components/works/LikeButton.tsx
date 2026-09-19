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
  const { liked, count, toggle, loading, error } = useLike(workId, initialCount)

  const isMd = size === "md"

  return (
    <div className="inline-flex flex-col">
      <button
        onClick={(e) => {
          e.preventDefault() // Prevent Link navigation if inside a card
          e.stopPropagation()
          toggle()
        }}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 transition-all ${
          isMd ? "text-body-sm" : "text-meta"
        } ${
          // Negro hasta que hay like. El rojo significa "le he dado", así que
          // no se enciende por pasar el ratón por encima.
          liked ? "text-red-500" : "text-gray-900"
        } disabled:opacity-70`}
        aria-label={liked ? "Quitar like" : "Dar like"}
      >
        {/* En tamaño grande comparte fila con el icono de comentarios, así que
            comparte también medida y grosor: 24px de lienzo y trazo de 1.7. */}
        <svg
          className={`${isMd ? "w-6 h-6" : "w-3.5 h-3.5"} transition-transform ${
            liked ? "scale-110" : ""
          }`}
          fill={liked ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={liked ? 0 : isMd ? 1.7 : 1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        {/* La cifra también tiene que emparejar con la del icono vecino, o el
            corazón queda en negrita junto a un número desvaído. */}
        <span className={isMd ? "text-body-sm font-semibold tabular-nums" : liked ? "font-medium" : ""}>
          {count}
        </span>
      </button>
      {error && <span className="mt-1 text-helper text-red-500">{error}</span>}
    </div>
  )
}
