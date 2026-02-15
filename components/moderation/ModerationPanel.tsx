"use client"

import { useState, useCallback } from "react"
import { useModeration } from "@/hooks/useModeration"
import { WorkPreview } from "./WorkPreview"
import { InviteCodesManager } from "./InviteCodesManager"
import { UsersManager } from "./UsersManager"
import { WorksManager } from "./WorksManager"
import { TaxonomyPanel } from "./TaxonomyPanel"

type Tab =
  | "queue"
  | "history"
  | "works"
  | "users"
  | "invites"
  | "taxonomy"

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
        setFeedback({
          type: "success",
          message:
            "Obra aprobada. Aparecerá en el feed tras el próximo refresh.",
        })
        setTimeout(() => setFeedback(null), 4000)
      } else {
        setFeedback({
          type: "error",
          message: result.error ?? "Error al aprobar",
        })
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
        setFeedback({
          type: "success",
          message: "Obra rechazada. El autor fue notificado.",
        })
        setTimeout(() => setFeedback(null), 4000)
      } else {
        setFeedback({
          type: "error",
          message: result.error ?? "Error al rechazar",
        })
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
          Gestiona contenido, usuarios y taxonomía del sistema.
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

      {/* Feedback */}
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
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {(
          [
            ["queue", `Cola (${stats.pending})`],
            ["history", "Historial"],
            ["works", "Publicaciones"],
            ["users", "Usuarios"],
            ["invites", "Invitaciones"],
            ["taxonomy", "Taxonomía"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
              tab === key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabs content */}

      {tab === "queue" && (
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
      )}

      {tab === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {history.map((entry) => (
            <div key={entry.id} className="p-4">
              <p className="text-sm text-gray-900">
                {entry.type === "work_approved"
                  ? "Obra aprobada"
                  : "Obra rechazada"}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "works" && <WorksManager />}
      {tab === "users" && <UsersManager />}
      {tab === "invites" && <InviteCodesManager />}
      {tab === "taxonomy" && <TaxonomyPanel />}
    </div>
  )
}
