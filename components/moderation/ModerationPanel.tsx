// components/moderation/ModerationPanel.tsx
"use client"

import { useState, useCallback } from "react"
import { useModeration } from "@/hooks/useModeration"
import { WorkPreview } from "./WorkPreview"
import { InviteCodesManager } from "./InviteCodesManager"

type Tab = "queue" | "history" | "invites"

export function ModerationPanel() {
  const { queue, history, loading, error, stats, approve, reject, refresh } =
    useModeration()
  const [tab, setTab] = useState<Tab>("queue")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const handleApprove = useCallback(
    async (workId: string) => {
      setActionLoading(workId)
      setFeedback(null)
      const result = await approve(workId)
      setActionLoading(null)
      if (result.success) {
        setFeedback({ type: "success", message: "Obra aprobada. Aparecerá en el feed tras el próximo refresh." })
        setTimeout(() => setFeedback(null), 4000)
      } else {
        setFeedback({ type: "error", message: result.error ?? "Error al aprobar" })
      }
    },
    [approve]
  )

  const handleReject = useCallback(
    async (workId: string, note: string) => {
      setActionLoading(workId)
      setFeedback(null)
      const result = await reject(workId, note)
      setActionLoading(null)
      if (result.success) {
        setFeedback({ type: "success", message: "Obra rechazada. El autor fue notificado." })
        setTimeout(() => setFeedback(null), 4000)
      } else {
        setFeedback({ type: "error", message: result.error ?? "Error al rechazar" })
      }
    },
    [reject]
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Moderación</h1>
        <p className="mt-1 text-sm text-gray-500">
          Revisa y aprueba las obras enviadas por la comunidad.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pendientes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-xs text-gray-500 mt-0.5">Aprobadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
          <p className="text-xs text-gray-500 mt-0.5">Rechazadas</p>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setTab("queue")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            tab === "queue"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Cola ({stats.pending})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            tab === "history"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Historial
        </button>
        <button
          onClick={() => setTab("invites")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            tab === "invites"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Invitaciones
        </button>
        <button
          onClick={refresh}
          disabled={loading}
          className="ml-auto px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ↻ Refrescar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={refresh}
            className="mt-1 text-sm font-medium text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Queue tab */}
      {tab === "queue" && (
        <>
          {loading && queue.length === 0 && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 animate-pulse"
                >
                  <div className="aspect-video bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                    <div className="h-5 w-2/3 bg-gray-100 rounded" />
                    <div className="h-3 w-full bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && queue.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                No hay obras pendientes
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Todas las obras han sido revisadas.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {queue.map((work) => (
              <WorkPreview
                key={work.id}
                work={work}
                onApprove={() => handleApprove(work.id)}
                onReject={(note) => handleReject(work.id, note)}
                loading={actionLoading === work.id}
              />
            ))}
          </div>
        </>
      )}

      {/* History tab */}
      {tab === "history" && (
        <>
          {history.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400 text-sm">
                No hay acciones de moderación registradas.
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {history.map((entry) => {
                const isApprove = entry.type === "work_approved"
                return (
                  <div key={entry.id} className="p-4 flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isApprove
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {isApprove ? "✓" : "✗"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        Obra{" "}
                        <span
                          className={`font-medium ${
                            isApprove ? "text-green-700" : "text-red-600"
                          }`}
                        >
                          {isApprove ? "aprobada" : "rechazada"}
                        </span>
                      </p>
                      {entry.payload?.note && (
                        <p className="mt-0.5 text-xs text-gray-500 italic">
                          &ldquo;{entry.payload.note}&rdquo;
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(entry.created_at).toLocaleString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Invites tab */}
      {tab === "invites" && <InviteCodesManager />}
    </div>
  )
}
