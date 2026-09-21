"use client"

import { useEffect, useRef } from "react"
import type { FeedItem } from "@/types/feed"
import { CommentExperience } from "@/components/comments/CommentExperience"

type Props = {
  item: FeedItem
  initialCount: number
  onClose: () => void
  onCountChange: (count: number) => void
}

/** Comentarios sobre el feed: sheet en móvil y diálogo centrado en escritorio. */
export function FeedCommentsSheet({ item, initialCount, onClose, onCountChange }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [onClose])

  return <div className="fixed inset-0 z-50 flex items-end bg-black/35 md:items-center md:justify-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="feed-comments-title" className="max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl md:max-h-[80vh] md:max-w-xl md:rounded-2xl md:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="min-w-0"><p className="truncate text-body-sm font-semibold text-gray-900">{item.author_full_name}</p><p className="truncate text-meta text-gray-500">{item.title}</p></div>
        <button ref={closeButtonRef} type="button" onClick={onClose} className="ml-4 grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900" aria-label="Cerrar comentarios">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div id="feed-comments-title" className="sr-only">Comentarios de {item.title}</div>
      <CommentExperience workId={item.id} initialCount={initialCount} open onOpen={() => undefined} onCountChange={onCountChange} compact />
    </section>
  </div>
}
