// components/feed/FeedPost.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { FeedItem } from "@/types/feed"
import { LikeButton } from "@/components/works/LikeButton"
import { ShareButton } from "@/components/works/ShareButton"
import { trackView } from "@/lib/client/track-view"
import { ZoomableMedia } from "@/components/feed/ZoomableMedia"
import { FeedVideo } from "@/components/feed/FeedVideo"
import { mediaAspectRatio } from "@/lib/media-aspect"

/**
 * Una publicación del feed vertical, para el móvil.
 *
 * Va a sangre: sin tarjeta, sin borde y sin esquinas redondeadas, con la foto
 * tocando los dos lados de la pantalla. Lo único que separa una publicación de
 * la siguiente es el aire del pie.
 *
 * El carrusel vive aquí, no en la rejilla: se desliza con el dedo y los puntos
 * dicen por dónde vas.
 */

const esVideo = (medio: { type?: string | null } | undefined) =>
  Boolean(medio?.type?.startsWith("video/"))

const cifra = (n: number) => n.toLocaleString("es-ES")

type Props = {
  item: FeedItem
  commentsCount?: number
  onOpenComments?: (item: FeedItem) => void
}

export function FeedPost({ item, commentsCount = item.comments_count, onOpenComments }: Props) {
  const medios = item.images ?? []
  const [indice, setIndice] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [viewsCount, setViewsCount] = useState(item.views_count)
  const [likeToggleRequest, setLikeToggleRequest] = useState(0)
  const articleRef = useRef<HTMLElement | null>(null)
  const varios = medios.length > 1
  const actual = medios[indice] ?? null
  const isCurrentVideo = esVideo(actual)
  const mainMediaStyle = isCurrentVideo
    ? { aspectRatio: mediaAspectRatio(actual?.width, actual?.height) }
    : undefined
  const detailsId = `feed-post-details-${item.id}`
  const fechaPublicacion = new Date(item.published_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const cambiarImagen = useCallback((direction: "next" | "previous") => {
    if (!varios) return
    if (direction === "next") setIndice((p) => (p === medios.length - 1 ? 0 : p + 1))
    if (direction === "previous") setIndice((p) => (p === 0 ? medios.length - 1 : p - 1))
  }, [varios, medios.length])

  const recordView = useCallback(async () => {
    const result = await trackView(item.id, "feed_expand")
    if (result) setViewsCount(result.viewsCount)
    return result
  }, [item.id])

  useEffect(() => {
    const post = articleRef.current
    if (!post) return

    let observer: IntersectionObserver | null = null
    const attemptView = () => {
      void recordView().then((result) => {
        if (result) observer?.unobserve(post)
      })
    }

    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) attemptView()
    }, { threshold: 0.5 })
    observer.observe(post)
    return () => {
      observer?.disconnect()
    }
  }, [recordView])

  const toggleDetails = useCallback(() => {
    setExpanded((wasExpanded) => !wasExpanded)
  }, [])

  return (
    <article id={`post-${item.id}`} ref={articleRef}>
      <header className="flex items-center gap-2.5 px-3 py-2.5">
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
      </header>

      <div className={`relative bg-gray-200 ${isCurrentVideo ? "" : "aspect-[4/5]"}`} style={mainMediaStyle}>
        {actual && (
          isCurrentVideo ? (
            <FeedVideo src={actual.url} poster={actual.posterUrl} className="h-full w-full object-contain" onSwipe={cambiarImagen} onDoubleTap={() => setLikeToggleRequest((value) => value + 1)} />
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

        {varios && (
          <span className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1">
            {medios.map((_, i) => (
              <i
                key={i}
                className={`h-[5px] w-[5px] rounded-full ${i === indice ? "bg-white" : "bg-white/55"}`}
              />
            ))}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3.5 px-3 pb-1 pt-2.5">
        <LikeButton workId={item.id} initialCount={item.likes_count} likeToggleRequest={likeToggleRequest} />
        <button
          type="button"
          onClick={() => onOpenComments?.(item)}
          className="inline-flex items-center gap-1.5 text-gray-900 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          aria-label={`Abrir comentarios, ${cifra(commentsCount)} comentarios`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.3 8.3 0 0 1 3.6 11.5a8.4 8.4 0 0 1 8.9-8.4 8.4 8.4 0 0 1 8.5 8.4z" />
          </svg>
          <span className="text-body-sm font-semibold tabular-nums">{cifra(commentsCount)}</span>
        </button>
        <ShareButton workId={item.id} iconOnly initialCount={item.shares_count} showCount />
        {viewsCount > 0 && (
          <span className="ml-auto text-meta text-gray-500 tabular-nums">{cifra(viewsCount)} vistas</span>
        )}
      </div>

      <div className="px-3 pb-4 pt-0.5 text-body-sm">
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
            onClick={toggleDetails}
          >
            …más
          </button>
          )}
        </div>

        {expanded && (
          <div id={detailsId} className="mt-3 space-y-3 text-gray-600">
            <div>
              <p className="whitespace-pre-wrap">
                {item.description}{" "}
                <button
                  type="button"
                  className="text-meta font-medium text-gray-500 no-underline hover:text-gray-700 focus:text-gray-700"
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                  onClick={toggleDetails}
                >
                  …menos
                </button>
              </p>
            </div>
            <div className="space-y-1 text-meta text-gray-500">
              <time dateTime={item.published_at}>Publicado el {fechaPublicacion}</time>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
