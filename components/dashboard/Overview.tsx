// components/dashboard/Overview.tsx
import Link from "next/link"
import type { Metrica, Resumen } from "@/lib/works/overview"

/**
 * Portada del panel para la cuenta fundadora.
 *
 * Responde "¿qué necesita mi atención?" antes que "¿qué hay de nuevo?". El feed
 * sigue existiendo, pero deja de ser lo primero: para operar la plataforma lo
 * urgente es la cola, no las novedades.
 */

const ACCIONES: Record<string, string> = {
  approve: "Aprobado",
  reject: "Rechazado",
  archive: "Archivado",
  restore: "Restaurado",
  delete: "Eliminado",
}

function variacion({ valor, previo }: Metrica) {
  if (previo === 0) return valor === 0 ? null : { texto: "sin referencia", tono: "gris" as const }
  const porcentaje = Math.round(((valor - previo) / previo) * 100)
  if (porcentaje === 0) return { texto: "igual", tono: "gris" as const }
  return {
    texto: `${porcentaje > 0 ? "+" : ""}${porcentaje}%`,
    tono: porcentaje > 0 ? ("sube" as const) : ("baja" as const),
  }
}

const TONOS = { sube: "text-emerald-700", baja: "text-red-700", gris: "text-gray-400" }

function Metrica({
  label,
  valor,
  delta,
  pie,
}: {
  label: string
  valor: number
  delta?: { texto: string; tono: keyof typeof TONOS } | null
  pie: string
}) {
  return (
    <div className="bg-white p-4 sm:px-[18px]">
      <p className="text-[12.5px] text-gray-500">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2.5">
        <span className="text-[25px] font-semibold leading-none tracking-[-0.025em] tabular-nums text-gray-900">
          {valor}
        </span>
        {delta && <span className={`text-[12px] tabular-nums ${TONOS[delta.tono]}`}>{delta.texto}</span>}
      </div>
      <p className="mt-1.5 text-[11.5px] text-gray-400">{pie}</p>
    </div>
  )
}

/** Días si lleva más de 48 horas; horas si es reciente. */
function espera(horas: number) {
  if (horas >= 48) return `${Math.floor(horas / 24)} d`
  return `${horas} h`
}

export function Overview({ resumen }: { resumen: Resumen }) {
  const { publicadas, comentarios, miembros, invitaciones, pendientes, decisiones } = resumen

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-gray-900">Inicio</h1>
          <p className="mt-1 text-[13px] text-gray-500">Resumen de la actividad de Designfolio.</p>
        </div>
        <span className="text-[12.5px] text-gray-500">Últimos 7 días</span>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-gray-200 bg-gray-200 lg:grid-cols-4">
        <Metrica
          label="Publicadas"
          valor={publicadas.valor}
          delta={variacion(publicadas)}
          pie={`${publicadas.previo} la semana anterior`}
        />
        <Metrica
          label="Comentarios"
          valor={comentarios.valor}
          delta={variacion(comentarios)}
          pie={`${comentarios.previo} la semana anterior`}
        />
        <Metrica
          label="Miembros activos"
          valor={miembros.activos}
          delta={miembros.nuevos > 0 ? { texto: `+${miembros.nuevos} nuevos`, tono: "gris" } : null}
          pie={`de ${miembros.total} cuentas · 30 días`}
        />
        <Metrica
          label="Invitaciones libres"
          valor={invitaciones.libres}
          pie={`${invitaciones.canjeadas} canjeadas · ${invitaciones.caducadas} caducadas`}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-7">

        <section>
          <div className="mb-2.5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-gray-900">
                Esperando verificación
                {pendientes.total > 0 && (
                  <span className="ml-1 font-normal tabular-nums text-gray-400">{pendientes.total}</span>
                )}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-gray-500">
                Primera publicación de cada cuenta.
                {pendientes.esperaMaxima > 0 && ` La más antigua lleva ${espera(pendientes.esperaMaxima)}.`}
              </p>
            </div>
            {pendientes.total > 0 && (
              <Link
                href="/dashboard/moderation"
                className="shrink-0 whitespace-nowrap border-b border-gray-300 pb-px text-[13px] text-gray-900 transition-colors hover:border-gray-900"
              >
                Ver todas
              </Link>
            )}
          </div>

          {pendientes.items.length === 0 ? (
            <p className="border-t border-gray-200 py-8 text-[13px] text-gray-500">
              Nada pendiente. Cuando alguien publique por primera vez, aparecerá aquí.
            </p>
          ) : (
            <div className="border-t border-gray-200">
              {pendientes.items.map((item) => (
                <Link
                  key={item.id}
                  href="/dashboard/moderation"
                  className="flex items-center gap-3 border-b border-gray-200 py-3 transition-colors hover:bg-gray-50/60"
                >
                  <span
                    className="h-[33px] w-11 shrink-0 rounded bg-gray-200 bg-cover bg-center"
                    style={item.imagen ? { backgroundImage: `url(${item.imagen})` } : undefined}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-gray-900">{item.titulo}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-gray-500">
                      {item.autor} · {item.categoria}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11.5px] tabular-nums text-gray-400">{espera(item.horas)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-2.5 flex items-start justify-between gap-4">
            <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-gray-900">Últimas decisiones</h2>
            {decisiones.length > 0 && (
              <Link
                href="/dashboard/moderation"
                className="shrink-0 whitespace-nowrap border-b border-gray-300 pb-px text-[13px] text-gray-900 transition-colors hover:border-gray-900"
              >
                Historial
              </Link>
            )}
          </div>

          {decisiones.length === 0 ? (
            <p className="border-t border-gray-200 py-8 text-[13px] text-gray-500">
              Aquí quedará el registro de cada decisión que tomes.
            </p>
          ) : (
            <div className="border-t border-gray-200">
              {decisiones.map((d) => (
                <div key={d.id} className="border-b border-gray-200 py-2.5 text-[13px]">
                  <p>
                    <span className={d.accion === "approve" ? "font-medium text-gray-900" : "text-gray-500"}>
                      {ACCIONES[d.accion] ?? d.accion}
                    </span>
                    <span className="text-gray-400"> · </span>
                    {d.proyecto}
                  </p>
                  <p className="mt-0.5 text-[12px] text-gray-500">
                    {d.responsable} ·{" "}
                    {new Date(d.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    {d.nota && ` · ${d.nota}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
