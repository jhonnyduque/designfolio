// components/feed/FeedPost.tsx
"use client"

import { useCallback, useRef, useState, type TouchEvent } from "react"
import Link from "next/link"
import type { FeedItem } from "@/types/feed"
import { LikeButton } from "@/components/works/LikeButton"

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

const UMBRAL_DESLIZAMIENTO = 35

export function FeedPost({ item }: { item: FeedItem }) {
  const medios = item.images ?? []
  const [indice, setIndice] = useState(0)
  const inicioX = useRef<number | null>(null)
  const finX = useRef<number | null>(null)

  const varios = medios.length > 1
  const actual = medios[indice] ?? null
  const destino = `/proyectos/${item.slug ?? item.id}`

  const alTocar = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!varios) return
    inicioX.current = e.changedTouches[0]?.clientX ?? null
    finX.current = null
  }, [varios])

  const alArrastrar = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!varios) return
    finX.current = e.changedTouches[0]?.clientX ?? null
  }, [varios])

  const alSoltar = useCallback(() => {
    if (!varios || inicioX.current == null || finX.current == null) return
    const recorrido = inicioX.current - finX.current
    if (recorrido > UMBRAL_DESLIZAMIENTO) setIndice((p) => (p === medios.length - 1 ? 0 : p + 1))
    if (recorrido < -UMBRAL_DESLIZAMIENTO) setIndice((p) => (p === 0 ? medios.length - 1 : p - 1))
    inicioX.current = null
    finX.current = null
  }, [varios, medios.length])

  return (
    <article>
      <header className="flex items-center gap-2.5 px-3 py-2.5">
        {item.author_avatar_url ? (
          <img src={item.author_avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray-200 text-[12px] font-bold text-gray-500">
            {item.author_full_name?.charAt(0) ?? "?"}
          </span>
        )}
        <Link href={`/dashboard/profile/${item.author_username}`} className="min-w-0 leading-tight">
          <span className="block truncate text-[13.5px] font-semibold text-gray-900">
            {item.author_full_name}
          </span>
          <span className="block truncate text-[12px] text-gray-500">{item.category}</span>
        </Link>
      </header>

      <div
        className="relative aspect-[4/5] bg-gray-200"
        onTouchStart={alTocar}
        onTouchMove={alArrastrar}
        onTouchEnd={alSoltar}
      >
        <Link href={destino} className="block h-full w-full">
          {actual ? (
            esVideo(actual) ? (
              <video src={actual.url} controls playsInline preload="metadata" className="h-full w-full bg-gray-900 object-contain" />
            ) : (
              <img src={actual.url} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
            )
          ) : null}
        </Link>

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
        <LikeButton workId={item.id} initialCount={item.likes_count} />
        <Link href={destino} className="inline-flex items-center gap-1.5 text-gray-900">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.3 8.3 0 0 1 3.6 11.5a8.4 8.4 0 0 1 8.9-8.4 8.4 8.4 0 0 1 8.5 8.4z" />
          </svg>
          <span className="text-[13.5px] font-semibold tabular-nums">{cifra(item.comments_count)}</span>
        </Link>
      </div>

      <div className="px-3 pb-4 pt-0.5 text-[13.5px] leading-normal">
        <Link href={destino} className="block">
          <span className="mr-1.5 font-semibold text-gray-900">{item.author_full_name}</span>
          <span className="text-gray-900">{item.title}</span>
        </Link>
        {item.views_count > 0 && (
          <p className="mt-1 text-[13px] text-gray-500 tabular-nums">{cifra(item.views_count)} vistas</p>
        )}
      </div>
    </article>
  )
}
