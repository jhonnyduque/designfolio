// components/works/ShareButton.tsx
"use client"

import { useState, useCallback } from "react"

interface ShareButtonProps {
  workId: string
  size?: "sm" | "md"
}

export function ShareButton({ workId, size = "md" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const url = `${window.location.origin}/dashboard/work/${workId}`
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    },
    [workId]
  )

  const isMd = size === "md"

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 transition-colors ${
        isMd ? "text-sm" : "text-xs"
      } ${copied ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}
      aria-label="Copiar enlace"
    >
      {copied ? (
        <>
          <svg
            className={isMd ? "w-5 h-5" : "w-3.5 h-3.5"}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>Copiado</span>
        </>
      ) : (
        <>
          <svg
            className={isMd ? "w-5 h-5" : "w-3.5 h-3.5"}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
            />
          </svg>
          <span className={isMd ? "" : "hidden sm:inline"}>Compartir</span>
        </>
      )}
    </button>
  )
}
