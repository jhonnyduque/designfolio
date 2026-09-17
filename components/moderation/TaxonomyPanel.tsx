// components/moderation/TaxonomyPanel.tsx
"use client"

import { useMemo, useState } from "react"
import { useTaxonomyAdmin } from "@/hooks/useTaxonomyAdmin"
import { Button, EmptyState, RowMenu, Stat, StatLine, Tabs } from "@/components/ui/Panel"
import { Scroller } from "@/components/ui/Scroller"
import type { TaxonomyAdmin } from "@/types/taxonomy"

type Tipo = "category" | "tag"
type Filtro = "all" | "active" | "inactive" | "archived"

type Dialogo =
  | { tipo: "crear" }
  | { tipo: "renombrar"; item: TaxonomyAdmin }
  | { tipo: "fusionar"; origen: TaxonomyAdmin }
  | { tipo: "archivar"; item: TaxonomyAdmin }
  | null

/** Solo el estado sobre el que hay que actuar merece contraste. */
function etiquetaEstado(item: TaxonomyAdmin) {
  if (item.is_archived) return { texto: "Archivada", clase: "text-gray-400" }
  if (!item.is_active) return { texto: "Oculta", clase: "font-medium text-gray-900" }
  return { texto: "En uso", clase: "text-gray-500" }
}

const FILTROS: [Filtro, string][] = [
  ["all", "Todas"],
  ["active", "En uso"],
  ["inactive", "Ocultas"],
  ["archived", "Archivadas"],
]

export function TaxonomyPanel() {
  const { items, loading, create, rename, toggle, archive, restore, merge, reorder } = useTaxonomyAdmin()

  const [tipo, setTipo] = useState<Tipo>("category")
  const [filtro, setFiltro] = useState<Filtro>("all")
  const [busqueda, setBusqueda] = useState("")
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [texto, setTexto] = useState("")
  const [destino, setDestino] = useState("")
  const [enCurso, setEnCurso] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const delTipo = useMemo(() => items.filter((i) => i.type === tipo), [items, tipo])

  const visibles = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    return delTipo.filter((i) => {
      const coincide = !t || i.name.toLowerCase().includes(t) || i.slug.includes(t)
      const pasaFiltro =
        filtro === "all" ||
        (filtro === "active" && i.is_active && !i.is_archived) ||
        (filtro === "inactive" && !i.is_active && !i.is_archived) ||
        (filtro === "archived" && i.is_archived)
      return coincide && pasaFiltro
    })
  }, [delTipo, busqueda, filtro])

  const enUso = delTipo.filter((i) => i.is_active && !i.is_archived).length
  const ocultas = delTipo.filter((i) => !i.is_active && !i.is_archived).length
  const archivadas = delTipo.filter((i) => i.is_archived).length

  const candidatas = delTipo.filter(
    (i) => !i.is_archived && i.is_active && (dialogo?.tipo === "fusionar" ? i.id !== dialogo.origen.id : true),
  )

  const singular = tipo === "category" ? "categoría" : "etiqueta"
  const plural = tipo === "category" ? "categorías" : "etiquetas"

  function notificar(mensaje: string) {
    setAviso(mensaje)
    setTimeout(() => setAviso(null), 5000)
  }

  /** Todas las operaciones comparten el mismo ciclo: bloquear, ejecutar, avisar. */
  async function ejecutar(
    operacion: () => Promise<{ success: boolean; error?: string }>,
    exito: string,
  ) {
    setEnCurso(true)
    const r = await operacion()
    setEnCurso(false)
    if (r.success) {
      notificar(exito)
      setDialogo(null)
      setTexto("")
      setDestino("")
    } else {
      notificar(r.error ?? "La operación no se pudo completar.")
    }
  }

  if (loading) return <p className="py-8 text-[13px] text-gray-500">Cargando…</p>

  return (
    <div>
      <Tabs
        value={tipo}
        onChange={(v) => {
          setTipo(v as Tipo)
          setFiltro("all")
          setBusqueda("")
        }}
        items={[
          { value: "category", label: "Categorías", count: items.filter((i) => i.type === "category").length },
          { value: "tag", label: "Etiquetas", count: items.filter((i) => i.type === "tag").length },
        ]}
      />

      <div className="mt-5">
        <StatLine>
          <Stat value={enUso} label="en uso" />
          <Stat value={ocultas} label="ocultas" />
          <Stat value={archivadas} label="archivadas" />
        </StatLine>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={`Buscar ${plural}`}
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900"
        />
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as Filtro)}
          className="h-[34px] rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-900 outline-none transition-colors focus:border-gray-900"
        >
          {FILTROS.map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          className="ml-auto"
          onClick={() => {
            setDialogo({ tipo: "crear" })
            setTexto("")
          }}
        >
          Nueva {singular}
        </Button>
      </div>

      {aviso && (
        <p role="status" className="mb-4 flex items-center justify-between gap-3 text-[13px] text-gray-700">
          <span>{aviso}</span>
          <button type="button" onClick={() => setAviso(null)} className="text-[12px] text-gray-400 hover:text-gray-900">
            Cerrar
          </button>
        </p>
      )}

      {visibles.length === 0 ? (
        <EmptyState
          title={busqueda || filtro !== "all" ? "Sin resultados" : `Todavía no hay ${plural}`}
          text={
            busqueda || filtro !== "all"
              ? "Prueba con otro término o cambia el filtro."
              : `Crea una ${singular} y aparecerá al instante en el formulario de publicación.`
          }
        />
      ) : (
        <Scroller>
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[11.5px] font-normal text-gray-400">
                {tipo === "category" && <th className="w-[58px] py-2.5 pr-3 font-normal">Orden</th>}
                <th className="py-2.5 pr-3 font-normal">Nombre</th>
                <th className="w-[76px] py-2.5 pr-3 font-normal">Obras</th>
                <th className="w-[96px] py-2.5 pr-3 font-normal">Estado</th>
                <th className="w-[44px] py-2.5 font-normal" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((item) => {
                const estado = etiquetaEstado(item)
                return (
                  <tr key={item.id} className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-50/60">
                    {tipo === "category" && (
                      <td className="py-2.5 pr-3 text-[13px] tabular-nums text-gray-500">
                        {item.is_archived ? "—" : item.sort_order}
                      </td>
                    )}
                    <td className="max-w-0 py-2.5 pr-3 text-[13px]">
                      <span className={`block truncate ${item.is_archived ? "text-gray-400" : "font-medium text-gray-900"}`}>
                        {item.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-gray-500">
                        {item.slug}
                        {item.created_by_name && ` · la creó ${item.created_by_name}`}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-[13px] tabular-nums text-gray-500">{item.usage_count}</td>
                    <td className={`py-2.5 pr-3 text-[13px] ${estado.clase}`}>{estado.texto}</td>
                    <td className="py-2.5">
                      <RowMenu
                        label={`Acciones de ${item.name}`}
                        acciones={
                          item.is_archived
                            ? [
                                {
                                  label: "Restaurar",
                                  disabled: enCurso,
                                  onClick: () => ejecutar(() => restore(item.id), `«${item.name}» restaurada`),
                                },
                              ]
                            : [
                                {
                                  label: "Renombrar",
                                  disabled: enCurso,
                                  onClick: () => {
                                    setDialogo({ tipo: "renombrar", item })
                                    setTexto(item.name)
                                  },
                                },
                                {
                                  label: item.is_active ? "Ocultar al publicar" : "Volver a ofrecer",
                                  disabled: enCurso,
                                  onClick: () =>
                                    ejecutar(
                                      () => toggle(item.id, !item.is_active),
                                      item.is_active
                                        ? `«${item.name}» ya no se ofrece`
                                        : `«${item.name}» vuelve a ofrecerse`,
                                    ),
                                },
                                // El orden solo existe para las categorías.
                                ...(tipo === "category"
                                  ? [
                                      {
                                        label: "Subir en el orden",
                                        disabled: enCurso,
                                        onClick: () => ejecutar(() => reorder(item.id, "up"), `«${item.name}» subió`),
                                      },
                                      {
                                        label: "Bajar en el orden",
                                        disabled: enCurso,
                                        onClick: () => ejecutar(() => reorder(item.id, "down"), `«${item.name}» bajó`),
                                      },
                                    ]
                                  : []),
                                {
                                  label: "Fusionar con otra",
                                  disabled: enCurso,
                                  onClick: () => {
                                    setDialogo({ tipo: "fusionar", origen: item })
                                    setDestino("")
                                  },
                                },
                                {
                                  label: "Archivar",
                                  disabled: enCurso,
                                  onClick: () => setDialogo({ tipo: "archivar", item }),
                                },
                              ]
                        }
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Scroller>
      )}

      {dialogo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5">
            {dialogo.tipo === "crear" && (
              <>
                <p className="text-[14px] font-medium text-gray-900">Nueva {singular}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                  Quedará disponible de inmediato en el formulario de publicación.
                </p>
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Nombre"
                  autoFocus
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && texto.trim().length >= 2) {
                      ejecutar(() => create(tipo, texto.trim()), `«${texto.trim()}» creada`)
                    }
                  }}
                  className="mt-4 w-full rounded-md border border-gray-300 px-3 py-1.5 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <Button onClick={() => setDialogo(null)}>Cancelar</Button>
                  <Button
                    variant="primary"
                    disabled={enCurso || texto.trim().length < 2}
                    onClick={() => ejecutar(() => create(tipo, texto.trim()), `«${texto.trim()}» creada`)}
                  >
                    {enCurso ? "Creando…" : "Crear"}
                  </Button>
                </div>
              </>
            )}

            {dialogo.tipo === "renombrar" && (
              <>
                <p className="text-[14px] font-medium text-gray-900">Renombrar «{dialogo.item.name}»</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                  Las {dialogo.item.usage_count} obras que la usan pasan al nombre nuevo.
                </p>
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  autoFocus
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && texto.trim()) {
                      ejecutar(() => rename(dialogo.item.id, texto.trim()), `Ahora se llama «${texto.trim()}»`)
                    }
                  }}
                  className="mt-4 w-full rounded-md border border-gray-300 px-3 py-1.5 text-[13px] text-gray-900 outline-none transition-colors focus:border-gray-900"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <Button onClick={() => setDialogo(null)}>Cancelar</Button>
                  <Button
                    variant="primary"
                    disabled={enCurso || !texto.trim()}
                    onClick={() => ejecutar(() => rename(dialogo.item.id, texto.trim()), `Ahora se llama «${texto.trim()}»`)}
                  >
                    {enCurso ? "Guardando…" : "Guardar"}
                  </Button>
                </div>
              </>
            )}

            {dialogo.tipo === "fusionar" && (
              <>
                <p className="text-[14px] font-medium text-gray-900">Fusionar «{dialogo.origen.name}»</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                  Sus {dialogo.origen.usage_count} obras se mueven al destino y esta {singular} desaparece. No se puede
                  deshacer.
                </p>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="mt-4 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] text-gray-900 outline-none transition-colors focus:border-gray-900"
                >
                  <option value="">Elige el destino</option>
                  {candidatas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.usage_count} obras
                    </option>
                  ))}
                </select>
                <div className="mt-5 flex justify-end gap-2">
                  <Button onClick={() => setDialogo(null)}>Cancelar</Button>
                  <Button
                    variant="primary"
                    disabled={enCurso || !destino}
                    onClick={() =>
                      ejecutar(
                        () => merge(dialogo.origen.id, destino),
                        `«${dialogo.origen.name}» quedó fusionada`,
                      )
                    }
                  >
                    {enCurso ? "Fusionando…" : "Fusionar"}
                  </Button>
                </div>
              </>
            )}

            {dialogo.tipo === "archivar" && (
              <>
                <p className="text-[14px] font-medium text-gray-900">Archivar «{dialogo.item.name}»</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                  Deja de ofrecerse al publicar. Las {dialogo.item.usage_count} obras que ya la usan la conservan, y
                  puedes restaurarla cuando quieras.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button onClick={() => setDialogo(null)}>Cancelar</Button>
                  <Button
                    variant="primary"
                    disabled={enCurso}
                    onClick={() => ejecutar(() => archive(dialogo.item.id), `«${dialogo.item.name}» archivada`)}
                  >
                    {enCurso ? "Archivando…" : "Archivar"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
