// components/moderation/WorksManager.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  adminDeleteWorkAction,
  getAdminWorksAction,
  setWorkArchivedAction,
  type AdminWorkRow,
} from "@/lib/server/actions/admin"
import { Button, EmptyState, Tabs } from "@/components/ui/Panel"
import { Scroller } from "@/components/ui/Scroller"
import { coverUrl, soloVideo } from "@/lib/works/cover"

type Filtro = "approved" | "archived" | "all"
type Columna = "title" | "author_name" | "views_count" | "likes_count" | "comments_count" | "created_at"

const COLUMNAS: { key: Columna; label: string; numerica?: boolean; ancho?: string }[] = [
  { key: "title", label: "Proyecto" },
  { key: "author_name", label: "Autor", ancho: "w-[170px]" },
  { key: "views_count", label: "Vistas", numerica: true, ancho: "w-[80px]" },
  { key: "likes_count", label: "Likes", numerica: true, ancho: "w-[72px]" },
  { key: "comments_count", label: "Coment.", numerica: true, ancho: "w-[82px]" },
  { key: "created_at", label: "Fecha", ancho: "w-[104px]" },
]

export function WorksManager() {
  const [works, setWorks] = useState<AdminWorkRow[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>("approved")
  const [busqueda, setBusqueda] = useState("")
  const [enCurso, setEnCurso] = useState<string | null>(null)
  const [confirmar, setConfirmar] = useState<{ id: string; title: string } | null>(null)

  // La ordenación por defecto es la más reciente primero, que es lo que se
  // espera al abrir una lista de publicaciones.
  const [orden, setOrden] = useState<{ col: Columna; desc: boolean }>({ col: "created_at", desc: true })

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setWorks(await getAdminWorksAction("all"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las publicaciones.")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const archivar = useCallback(async (id: string, archivado: boolean) => {
    setEnCurso(id)
    setError(null)
    const r = await setWorkArchivedAction(id, archivado)
    if (r.success) setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, archived: archivado } : w)))
    else setError(r.error ?? "No se pudo archivar.")
    setEnCurso(null)
  }, [])

  const eliminar = useCallback(async (id: string) => {
    setEnCurso(id)
    setError(null)
    const r = await adminDeleteWorkAction(id)
    if (r.success) setWorks((prev) => prev.filter((w) => w.id !== id))
    else setError(r.error ?? "No se pudo eliminar.")
    setEnCurso(null)
    setConfirmar(null)
  }, [])

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    const filtradas = works.filter((w) => {
      if (filtro === "approved" && (w.moderation_status !== "approved" || w.archived)) return false
      if (filtro === "archived" && !w.archived) return false
      if (!termino) return true
      return (
        w.title.toLowerCase().includes(termino) ||
        w.author_name.toLowerCase().includes(termino) ||
        w.category.toLowerCase().includes(termino)
      )
    })

    return [...filtradas].sort((a, b) => {
      const x = a[orden.col]
      const y = b[orden.col]
      const comparacion = typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y), "es")
      return orden.desc ? -comparacion : comparacion
    })
  }, [works, filtro, busqueda, orden])

  const ordenarPor = (col: Columna) =>
    setOrden((prev) => (prev.col === col ? { col, desc: !prev.desc } : { col, desc: true }))

  const contar = (f: Filtro) =>
    works.filter((w) =>
      f === "approved" ? w.moderation_status === "approved" && !w.archived
        : f === "archived" ? w.archived
          : true,
    ).length

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filtro}
          onChange={(v) => setFiltro(v as Filtro)}
          items={[
            { value: "approved", label: "Publicadas", count: contar("approved") },
            { value: "archived", label: "Archivadas", count: contar("archived") },
            { value: "all", label: "Todas", count: works.length },
          ]}
        />
      </div>

      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por título, autor o categoría"
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-1.5 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900"
      />

      {error && <p className="mb-4 text-[13px] text-red-700">{error}</p>}

      {cargando ? (
        <p className="py-8 text-[13px] text-gray-500">Cargando…</p>
      ) : visibles.length === 0 ? (
        <EmptyState
          title={busqueda ? "Sin resultados" : "Nada por aquí"}
          text={busqueda ? "Prueba con otro término." : "Las publicaciones aprobadas aparecerán en esta lista."}
        />
      ) : (
        <Scroller>
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="w-[52px] py-2.5" />
                {COLUMNAS.map((c) => (
                  <th key={c.key} className={`py-2.5 pr-3 text-[11.5px] font-normal ${c.ancho ?? ""}`}>
                    <button
                      type="button"
                      onClick={() => ordenarPor(c.key)}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-gray-900 ${
                        orden.col === c.key ? "text-gray-900" : "text-gray-400"
                      } ${c.numerica ? "tabular-nums" : ""}`}
                    >
                      {c.label}
                      {/* La flecha solo aparece en la columna activa: seis flechas
                          grises a la vez son ruido, no información. */}
                      {orden.col === c.key && (
                        <span aria-hidden="true" className="text-[9px] leading-none">
                          {orden.desc ? "▾" : "▴"}
                        </span>
                      )}
                    </button>
                  </th>
                ))}
                <th className="w-[150px] py-2.5" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((w) => (
                <tr key={w.id} className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-50/60">
                  <td className="py-2.5 pr-3">
                    <span
                      className="flex h-[30px] w-10 items-center justify-center rounded bg-gray-200 bg-cover bg-center text-[9px] text-gray-500"
                      style={coverUrl(w.images) ? { backgroundImage: `url(${coverUrl(w.images)})` } : undefined}
                      aria-hidden="true"
                    >
                      {soloVideo(w.images) && "VIDEO"}
                    </span>
                  </td>
                  <td className="max-w-0 py-2.5 pr-3 text-[13px]">
                    <Link href={`/dashboard/work/${w.id}`} className="block truncate font-medium text-gray-900 hover:underline">
                      {w.title}
                    </Link>
                    <span className="mt-0.5 block truncate text-[12px] text-gray-500">
                      {w.category}
                      {w.archived && " · archivada"}
                      {w.moderation_status === "pending_review" && " · en verificación"}
                      {w.moderation_status === "rejected" && " · rechazada"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-[13px] text-gray-500">
                    <span className="block truncate">{w.author_name}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-[13px] tabular-nums text-gray-500">{w.views_count}</td>
                  <td className="py-2.5 pr-3 text-[13px] tabular-nums text-gray-500">{w.likes_count}</td>
                  <td className="py-2.5 pr-3 text-[13px] tabular-nums text-gray-500">{w.comments_count}</td>
                  <td className="py-2.5 pr-3 text-[13px] tabular-nums text-gray-500">
                    {new Date(w.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <Button onClick={() => archivar(w.id, !w.archived)} disabled={enCurso === w.id}>
                        {w.archived ? "Restaurar" : "Archivar"}
                      </Button>
                      <Button onClick={() => setConfirmar({ id: w.id, title: w.title })} disabled={enCurso === w.id}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroller>
      )}

      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-[14px] font-medium text-gray-900">Eliminar «{confirmar.title}»</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              Se borra junto con sus likes y comentarios, y no se puede deshacer. La decisión queda registrada
              en el historial.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setConfirmar(null)}>Cancelar</Button>
              <Button variant="primary" onClick={() => eliminar(confirmar.id)} disabled={enCurso === confirmar.id}>
                {enCurso === confirmar.id ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
