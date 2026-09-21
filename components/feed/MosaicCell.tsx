// components/feed/MosaicCell.tsx
"use client"

import type { FeedItem } from "@/types/feed"
import { ZoomableMedia } from "@/components/feed/ZoomableMedia"
import { FeedVideo } from "@/components/feed/FeedVideo"

/**
 * Una celda de la rejilla, para ordenador y tablet.
 *
 * Sin marco, sin padding y sin una letra encima de la foto: el título y el
 * autor aparecen al abrir el proyecto, que es donde hay sitio para leerlos.
 * Al pasar el ratón se oscurece y salen las dos cifras sobre las que se actúa
 * —me gusta y comentarios—; las vistas van fijas abajo porque no dependen de
 * que alguien pase por encima.
 *
 * Los avisos de la esquina son macizos a propósito: un trazo de dos píxeles
 * desaparece sobre una foto clara, una mancha blanca con sombra se lee siempre.
 */

const esVideo = (medio: { type?: string | null } | undefined) =>
  Boolean(medio?.type?.startsWith("video/"))

const cifra = (n: number) => n.toLocaleString("es-ES")

type Props = {
  item: FeedItem
  commentsCount?: number
  onOpenComments?: (item: FeedItem) => void
}

export function MosaicCell({ item, commentsCount = item.comments_count, onOpenComments }: Props) {
  const medios = item.images ?? []
  // La portada es la primera imagen real: si el proyecto abre con vídeo, una
  // etiqueta <img> apuntando a un .mp4 deja un recuadro vacío.
  const portada = medios.find((m) => !esVideo(m)) ?? medios[0] ?? null
  const tieneVideo = medios.some(esVideo)

  return (
    <div className="group relative block aspect-[1080/1350] overflow-hidden bg-gray-200">
      {portada ? (
        esVideo(portada) ? (
          <FeedVideo src={portada.url} poster={portada.posterUrl} className="h-full w-full object-cover" />
        ) : (
          <ZoomableMedia src={portada.url} alt="" className="h-full w-full object-cover" />
        )
      ) : null}

      {/* Aviso de contenido. El velo lo tapa al pasar el ratón, a propósito:
          se apaga con la foto en lugar de flotar por encima. */}
      {(tieneVideo || medios.length > 1) && (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 leading-none [filter:drop-shadow(0_1px_2px_rgba(0,0,0,.28))]"
        >
          {tieneVideo ? (
            <svg width="19" height="19" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="4.5" fill="#fff" />
              <path d="M10 8.6v6.8l5.6-3.4z" fill="#1e1e1e" />
            </svg>
          ) : (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path d="M8.5 2.5h9A4 4 0 0 1 21.5 6.5v9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
              <rect x="2.5" y="6.5" width="15" height="15" rx="3.5" fill="#fff" />
            </svg>
          )}
        </span>
      )}

      {item.views_count > 0 && (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 text-meta font-semibold leading-none tabular-nums text-white [filter:drop-shadow(0_1px_2px_rgba(0,0,0,.38))]">
          <Ojo />
          {cifra(item.views_count)}
        </span>
      )}

      <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/40 text-body font-bold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="inline-flex items-center gap-1.5">
          <Corazon />
          {cifra(item.likes_count)}
        </span>
        <button type="button" onClick={() => onOpenComments?.(item)} className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={`Abrir comentarios, ${cifra(commentsCount)} comentarios`}>
          <Bocadillo />
          {cifra(commentsCount)}
        </button>
      </div>
    </div>
  )
}

function Ojo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.8-6.4 10-6.4S22 12 22 12s-3.8 6.4-10 6.4S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

function Corazon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-7.5-4.9-9.3-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.3 12c-1.8 4.1-9.3 9-9.3 9z" />
    </svg>
  )
}

function Bocadillo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 4-4h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
    </svg>
  )
}
