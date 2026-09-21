// components/feed/PublicPost.tsx
"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { FeedItem } from "@/types/feed"
import { LikeButton } from "@/components/works/LikeButton"
import { ShareButton } from "@/components/works/ShareButton"
import { FeedCommentsSheet } from "@/components/feed/FeedCommentsSheet"
import { OwnerPostMenu } from "@/components/feed/OwnerPostMenu"
import { usePublicSession } from "@/components/layout/PublicSessionContext"
import { ZoomableMedia } from "@/components/feed/ZoomableMedia"
import { FeedVideo } from "@/components/feed/FeedVideo"
import { mediaAspectRatio } from "@/lib/media-aspect"
import { trackView } from "@/lib/client/track-view"
import { DETAIL_VIEW_DELAY_MS } from "@/lib/views"

const esVideo = (medio: { type?: string | null } | undefined) =>
  Boolean(medio?.type?.startsWith("video/"))

const cifra = (n: number) => n.toLocaleString("es-ES")

type Props = {
  item: FeedItem
}

/**
 * Vista pública de una publicación compartida.
 *
 * Conserva el lenguaje del feed: autor, medio a sangre, acciones y descripción.
 * Los comentarios se abren con el mismo sheet/modal usado por el feed general.
 */
export function PublicPost({ item }: Props) {
  const router = useRouter()
  const sesion = usePublicSession()
  const medios = item.images ?? []
  const [indice, setIndice] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [viewsCount, setViewsCount] = useState(item.views_count)
  const [commentsCount, setCommentsCount] = useState(item.comments_count)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [likeToggleRequest, setLikeToggleRequest] = useState(0)

  const varios = medios.length > 1
  const actual = medios[indice] ?? null
  const isCurrentVideo = esVideo(actual)
  const isOwner = Boolean(sesion?.id && sesion.id === item.author_id)
  const mainMediaStyle = isCurrentVideo
    ? { aspectRatio: mediaAspectRatio(actual?.width, actual?.height) }
    : undefined
  const detailsId = `public-post-details-${item.id}`
  const sharePath = `/proyectos/${item.slug ?? item.id}`
  const fechaPublicacion = new Date(item.published_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const cambiarImagen = useCallback((direction: "next" | "previous") => {
    if (!varios) return
    if (direction === "next") setIndice((p) => Math.min(p + 1, medios.length - 1))
    if (direction === "previous") setIndice((p) => Math.max(p - 1, 0))
  }, [varios, medios.length])

  const puedeAnterior = varios && indice > 0
  const puedeSiguiente = varios && indice < medios.length - 1

  useEffect(() => {
    let timer: number | null = null

    const scheduleView = () => {
      if (timer) window.clearTimeout(timer)
      if (document.visibilityState !== "visible") return

      timer = window.setTimeout(() => {
        void trackView(item.id, "detail_page").then((result) => {
          if (result) setViewsCount(result.viewsCount)
        })
      }, DETAIL_VIEW_DELAY_MS)
    }

    scheduleView()
    document.addEventListener("visibilitychange", scheduleView)

    return () => {
      if (timer) window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", scheduleView)
    }
  }, [item.id])

  return (
    <div className="mx-auto w-full max-w-[720px] md:py-6">
      <article>
        <header className="flex items-center gap-2.5 px-3 py-2.5 md:px-0">
          {item.author_avatar_url ? (
            <img src={item.author_avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray-200 text-meta font-bold text-gray-500">
              {item.author_full_name?.charAt(0) ?? "?"}
            </span>
          )}
          <Link href={`/dashboard/profile/${item.author_username}`} className="min-w-0 leading-tight">
            <span className="block truncate text-body-sm font-semibold text-gray-900">
              {item.author_full_name}
            </span>
            <span className="block truncate text-meta text-gray-500">{item.category}</span>
          </Link>

          {isOwner && (
            <OwnerPostMenu
              workId={item.id}
              onRemoved={() => router.replace("/")}
            />
          )}
        </header>

        <div className={`relative bg-gray-200 ${isCurrentVideo ? "" : "aspect-[4/5]"}`} style={mainMediaStyle}>
          {actual && (
            isCurrentVideo ? (
              <FeedVideo
                src={actual.url}
                poster={actual.posterUrl}
                className="h-full w-full object-contain"
                onSwipe={cambiarImagen}
                onDoubleTap={() => setLikeToggleRequest((value) => value + 1)}
              />
            ) : (
              <ZoomableMedia
                src={actual.url}
                alt={item.title}
                onSwipe={cambiarImagen}
                onDoubleTap={() => setLikeToggleRequest((value) => value + 1)}
                enablePinch
                className="h-full w-full object-cover"
              />
            )
          )}

          {puedeAnterior && (
            <button
              type="button"
              onClick={() => cambiarImagen("previous")}
              aria-label="Ver elemento anterior"
              className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/90 text-gray-900 backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          {puedeSiguiente && (
            <button
              type="button"
              onClick={() => cambiarImagen("next")}
              aria-label="Ver elemento siguiente"
              className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/90 text-gray-900 backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          )}
        </div>

        {varios && (
          <div className="flex h-5 items-center justify-center gap-1 bg-canvas" aria-label={`Elemento ${indice + 1} de ${medios.length}`}>
            {medios.map((_, i) => (
              <i
                key={i}
                className={`h-[5px] w-[5px] rounded-full ${i === indice ? "bg-gray-900" : "bg-gray-300"}`}
              />
            ))}
          </div>
        )}

        <div className={`flex items-center gap-3.5 px-3 pb-1 md:px-0 ${varios ? "pt-1" : "pt-2.5"}`}>
          <LikeButton workId={item.id} initialCount={item.likes_count} likeToggleRequest={likeToggleRequest} />
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="inline-flex items-center gap-1.5 text-gray-900 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            aria-label={`Abrir comentarios, ${cifra(commentsCount)} comentarios`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.3 8.3 0 0 1 3.6 11.5a8.4 8.4 0 0 1 8.9-8.4 8.4 8.4 0 0 1 8.5 8.4z" />
            </svg>
            <span className="text-body-sm font-semibold tabular-nums">{cifra(commentsCount)}</span>
          </button>
          <ShareButton workId={item.id} pathOverride={sharePath} iconOnly initialCount={item.shares_count} showCount />
          {viewsCount > 0 && (
            <span className="ml-auto text-meta text-gray-500 tabular-nums">{cifra(viewsCount)} vistas</span>
          )}
        </div>

        <div className="px-3 pb-7 pt-0.5 text-body-sm md:px-0">
          <div>
            <span className="inline">
              <span className="mr-1.5 font-semibold text-gray-900">{item.author_full_name}</span>
              <span className="text-gray-900">{item.title}</span>
            </span>{!expanded && " "}
            {!expanded && (
              <button
                type="button"
                className="text-meta font-medium text-gray-500 no-underline hover:text-gray-700 focus:text-gray-700"
                aria-expanded={expanded}
                aria-controls={detailsId}
                onClick={() => setExpanded(true)}
              >
                …más
              </button>
            )}
          </div>

          {expanded && (
            <div id={detailsId} className="mt-3 space-y-3 text-gray-600">
              <p className="whitespace-pre-wrap">
                {item.description}{" "}
                <button
                  type="button"
                  className="text-meta font-medium text-gray-500 no-underline hover:text-gray-700 focus:text-gray-700"
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                  onClick={() => setExpanded(false)}
                >
                  …menos
                </button>
              </p>
              <div className="space-y-1 text-meta text-gray-500">
                <time dateTime={item.published_at}>Publicado el {fechaPublicacion}</time>
              </div>
            </div>
          )}
        </div>
      </article>

      {commentsOpen && (
        <FeedCommentsSheet
          item={item}
          initialCount={commentsCount}
          onClose={() => setCommentsOpen(false)}
          onCountChange={setCommentsCount}
        />
      )}
    </div>
  )
}
