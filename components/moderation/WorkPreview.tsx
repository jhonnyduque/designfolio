// components/moderation/WorkPreview.tsx
"use client"

import { useState } from "react"
import type { ModerationWork } from "@/types/moderation"

interface WorkPreviewProps {
  work: ModerationWork
  onApprove: () => void
  onReject: (note: string) => void
  loading: boolean
}

export function WorkPreview({
  work,
  onApprove,
  onReject,
  loading,
}: WorkPreviewProps) {
  const [showReject, setShowReject] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [rejectError, setRejectError] = useState("")

  const timeAgo = getTimeAgo(work.created_at)

  function handleReject() {
    if (rejectNote.trim().length < 10) {
      setRejectError("La nota debe tener al menos 10 caracteres")
      return
    }
    setRejectError("")
    onReject(rejectNote.trim())
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Images */}
      <div className="grid grid-cols-1">
        {/* Main image */}
        {work.images?.[0] && (
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img
              src={work.images[0].url}
              alt={work.title}
              className="w-full h-full object-contain bg-gray-50"
            />
          </div>
        )}

        {/* Thumbnails */}
        {work.images.length > 1 && (
          <div className="flex gap-1 p-2 bg-gray-50 overflow-x-auto">
            {work.images.map((img, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-gray-200"
              >
                <img
                  src={img.url}
                  alt={`${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="uppercase font-semibold tracking-wider">
            {work.category}
          </span>
          <span>·</span>
          <span>{timeAgo}</span>
          <span>·</span>
          <span>{work.images.length} imagen{work.images.length !== 1 ? "es" : ""}</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900">{work.title}</h2>

        <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {work.description}
        </p>

        {/* Tags */}
        {work.tags && work.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {work.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
          {work.author_avatar_url ? (
            <img
              src={work.author_avatar_url}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">
                {work.author_full_name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {work.author_full_name}
            </p>
            <p className="text-xs text-gray-400">
              @{work.author_username} · Nivel {work.author_reputation_level}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 bg-gray-50 border-t border-gray-200">
        {!showReject ? (
          <div className="flex gap-3">
            <button
              onClick={onApprove}
              disabled={loading}
              className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Procesando..." : "✓ Aprobar"}
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={loading}
              className="flex-1 py-2.5 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              ✗ Rechazar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Motivo del rechazo
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Explica al autor por qué se rechaza esta obra (mín. 10 caracteres)..."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            />
            {rejectError && (
              <p className="text-xs text-red-600">{rejectError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Procesando..." : "Confirmar rechazo"}
              </button>
              <button
                onClick={() => {
                  setShowReject(false)
                  setRejectNote("")
                  setRejectError("")
                }}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `Hace ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}
