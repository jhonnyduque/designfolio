"use client"

import { useCallback, useState } from "react"
import { useModeration } from "@/hooks/useModeration"
import { PageHeader, Stat, StatLine, Tabs, EmptyState } from "@/components/ui/Panel"
import { Scroller } from "@/components/ui/Scroller"
import { WorkPreview } from "./WorkPreview"

const ACCIONES: Record<string, string> = {
  approve: "Aprobado",
  reject: "Rechazado",
  archive: "Archivado",
  restore: "Restaurado",
  delete: "Eliminado",
}

/** Aprobar y rechazar son las decisiones fuertes; el resto se lee en gris. */
const DESTACADAS = new Set(["approve"])

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

export function ModerationPanel() {
  const { queue, history, loading, error, stats, approve, reject } = useModeration()
  const [vista, setVista] = useState<"cola" | "historial">("cola")
  const [enCurso, setEnCurso] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null)

  const decidir = useCallback(
    async (workId: string, accion: "aprobar" | "rechazar", nota?: string) => {
      setEnCurso(workId)
      setAviso(null)
      const resultado = accion === "aprobar" ? await approve(workId) : await reject(workId, nota ?? "")
      setEnCurso(null)

      if (resultado.success) {
        setAviso({
          tipo: "ok",
          texto: accion === "aprobar"
            ? "Cuenta verificada. Sus próximas publicaciones saldrán directas."
            : "Publicación rechazada. El autor recibió la notificación.",
        })
        setTimeout(() => setAviso(null), 5000)
      } else {
        setAviso({ tipo: "error", texto: resultado.error ?? "No se pudo completar la acción." })
      }
    },
    [approve, reject],
  )

  return (
    <div>
      <PageHeader
        title="Verificación"
        subtitle="Cada cuenta pasa por aquí una sola vez, con su primera publicación. Después publica directamente."
      />

      <StatLine>
        <Stat value={stats.pending} label="pendientes" />
        <Stat value={stats.approved} label="aprobadas" />
        <Stat value={stats.rejected} label="rechazadas" />
      </StatLine>

      {aviso && (
        <p
          role="status"
          className={`mb-5 text-[13px] ${aviso.tipo === "ok" ? "text-gray-900" : "text-red-700"}`}
        >
          {aviso.texto}
        </p>
      )}

      <Tabs
        value={vista}
        onChange={(v) => setVista(v as typeof vista)}
        items={[
          { value: "cola", label: "Cola", count: stats.pending },
          { value: "historial", label: "Historial" },
        ]}
      />

      {error && <p className="py-8 text-[13px] text-red-700">{error}</p>}

      {!error && loading && <p className="py-8 text-[13px] text-gray-500">Cargando…</p>}

      {!error && !loading && vista === "cola" && (
        queue.length === 0 ? (
          <EmptyState
            title="No hay nada pendiente"
            text="Cuando alguien publique por primera vez, su trabajo aparecerá aquí para que lo revises."
          />
        ) : (
          <div className="space-y-6 pt-6">
            {queue.map((work) => (
              <WorkPreview
                key={work.id}
                work={work}
                onApprove={() => decidir(work.id, "aprobar")}
                onReject={(nota) => decidir(work.id, "rechazar", nota)}
                loading={enCurso === work.id}
              />
            ))}
          </div>
        )
      )}

      {!error && !loading && vista === "historial" && (
        history.length === 0 ? (
          <EmptyState
            title="Sin decisiones todavía"
            text="Aquí queda registrada cada aprobación, rechazo y eliminación, con quién la hizo y cuándo."
          />
        ) : (
          <Scroller>
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-[110px] py-2.5 pr-3 text-[11.5px] font-normal text-gray-400">Acción</th>
                  <th className="py-2.5 pr-3 text-[11.5px] font-normal text-gray-400">Proyecto</th>
                  <th className="w-[150px] py-2.5 pr-3 text-[11.5px] font-normal text-gray-400">Responsable</th>
                  <th className="w-[110px] py-2.5 text-[11.5px] font-normal text-gray-400">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entrada) => (
                  <tr key={entrada.id} className="border-b border-gray-200 last:border-0">
                    <td className={`py-3 pr-3 align-top text-[13px] ${DESTACADAS.has(entrada.action) ? "font-medium text-gray-900" : "text-gray-500"}`}>
                      {ACCIONES[entrada.action] ?? entrada.action}
                    </td>
                    <td className="py-3 pr-3 align-top text-[13px]">
                      {entrada.work_title}
                      {entrada.note && <p className="mt-0.5 text-[12px] text-gray-500">{entrada.note}</p>}
                    </td>
                    <td className="py-3 pr-3 align-top text-[13px] text-gray-500">{entrada.actor_name}</td>
                    <td className="py-3 align-top text-[13px] tabular-nums text-gray-500">{fecha(entrada.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroller>
        )
      )}
    </div>
  )
}
