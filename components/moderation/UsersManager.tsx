// components/moderation/UsersManager.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getAdminUsersAction, toggleUserActiveAction, type AdminUserRow } from "@/lib/server/actions/admin"
import { Button, EmptyState, Stat, StatLine } from "@/components/ui/Panel"
import { Scroller } from "@/components/ui/Scroller"

export function UsersManager() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [enCurso, setEnCurso] = useState<string | null>(null)
  const [confirmar, setConfirmar] = useState<{ id: string; nombre: string; activar: boolean } | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setUsers(await getAdminUsersAction())
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los miembros.")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const alternar = useCallback(async (id: string, activo: boolean) => {
    setEnCurso(id)
    setError(null)
    const r = await toggleUserActiveAction(id, activo)
    if (r.success) setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: activo } : u)))
    else setError(r.error ?? "No se pudo cambiar el estado.")
    setEnCurso(null)
    setConfirmar(null)
  }, [])

  const visibles = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    if (!t) return users
    return users.filter((u) =>
      u.full_name.toLowerCase().includes(t) ||
      u.username.toLowerCase().includes(t) ||
      (u.email_from_auth ?? "").toLowerCase().includes(t) ||
      (u.school ?? "").toLowerCase().includes(t),
    )
  }, [users, busqueda])

  const activos = users.filter((u) => u.is_active).length

  return (
    <div>
      <StatLine>
        <Stat value={activos} label="activos" />
        <Stat value={users.length - activos} label="desactivados" />
        <Stat value={users.filter((u) => u.pending_count > 0).length} label="sin verificar" />
      </StatLine>

      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, usuario, correo o escuela"
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-1.5 text-body-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900"
      />

      {error && <p className="mb-4 text-body-sm text-red-700">{error}</p>}

      {cargando ? (
        <p className="py-8 text-body-sm text-gray-500">Cargando…</p>
      ) : visibles.length === 0 ? (
        <EmptyState
          title={busqueda ? "Sin resultados" : "Todavía no hay miembros"}
          text={busqueda ? "Prueba con otro término." : "Genera una invitación para que alguien pueda registrarse."}
        />
      ) : (
        <Scroller>
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-meta text-gray-400">
                <th className="py-2.5 pr-3 font-normal">Miembro</th>
                <th className="w-[180px] py-2.5 pr-3 font-normal">Escuela</th>
                <th className="w-[140px] py-2.5 pr-3 font-normal">Publicaciones</th>
                <th className="w-[100px] py-2.5 pr-3 font-normal">Alta</th>
                <th className="w-[130px] py-2.5 font-normal" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((u) => (
                <tr key={u.id} className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-50/60">
                  <td className="max-w-0 py-2.5 pr-3 text-body-sm">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-7 w-7 shrink-0 rounded-full bg-gray-200 bg-cover bg-center"
                        style={u.avatar_url ? { backgroundImage: `url(${u.avatar_url})` } : undefined}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <Link href={`/dashboard/profile/${u.username}`} className="block truncate font-medium text-gray-900 hover:underline">
                          {u.full_name}
                          {u.is_founder && <span className="ml-1.5 text-meta text-gray-400">fundador</span>}
                          {!u.is_active && <span className="ml-1.5 text-meta text-gray-400">desactivado</span>}
                        </Link>
                        <span className="mt-0.5 block truncate text-meta text-gray-500">
                          {u.email_from_auth ?? `@${u.username}`}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-body-sm text-gray-500">
                    <span className="block truncate">{u.school ?? "—"}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-body-sm tabular-nums text-gray-500">
                    {u.approved_count}
                    {u.pending_count > 0 && (
                      <span className="text-gray-900"> · {u.pending_count} sin verificar</span>
                    )}
                    {u.rejected_count > 0 && <span> · {u.rejected_count} rech.</span>}
                  </td>
                  <td className="py-2.5 pr-3 text-body-sm tabular-nums text-gray-500">
                    {new Date(u.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="py-2.5">
                    <div className="flex justify-end">
                      {!u.is_founder && (
                        <Button
                          onClick={() => setConfirmar({ id: u.id, nombre: u.full_name, activar: !u.is_active })}
                          disabled={enCurso === u.id}
                        >
                          {u.is_active ? "Desactivar" : "Reactivar"}
                        </Button>
                      )}
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
            <p className="text-body-sm font-medium text-gray-900">
              {confirmar.activar ? "Reactivar" : "Desactivar"} a {confirmar.nombre}
            </p>
            <p className="mt-1.5 text-body-sm text-gray-500">
              {confirmar.activar
                ? "Volverá a poder entrar y publicar."
                : "No podrá entrar ni publicar. Lo que ya compartió sigue visible; para retirarlo, archívalo desde Publicaciones."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setConfirmar(null)}>Cancelar</Button>
              <Button variant="primary" onClick={() => alternar(confirmar.id, confirmar.activar)} disabled={enCurso === confirmar.id}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
