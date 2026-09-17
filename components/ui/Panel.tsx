// components/ui/Panel.tsx
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Scroller } from "@/components/ui/Scroller"

/**
 * Piezas compartidas del panel de administración.
 *
 * Existen para que todas las secciones hablen el mismo idioma visual sin repetir
 * clases: un solo encabezado, una sola forma de presentar cifras, unas pestañas
 * y un estado vacío. El lenguaje es sobrio a propósito —negro, tres grises y
 * blanco— porque el color debe venir del contenido, no de la interfaz.
 */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/**
 * Cifras en una línea de texto, no en tarjetas.
 *
 * Tres tarjetas con números gigantes de colores ocupan media pantalla para decir
 * lo mismo que cabe en un renglón.
 */
export function StatLine({ children }: { children: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-baseline gap-x-5 gap-y-2">{children}</div>
}

export function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      {/* Un cero no merece el mismo peso visual que un número real. */}
      <b className={`text-[17px] font-semibold tabular-nums tracking-[-0.01em] ${value === 0 ? "text-gray-400" : "text-gray-900"}`}>
        {value}
      </b>
      <span className="text-[13px] text-gray-500">{label}</span>
    </span>
  )
}

type TabItem = { value: string; label: string; count?: number }

export function Tabs({
  value,
  onChange,
  items,
}: {
  value: string
  onChange: (value: string) => void
  items: TabItem[]
}) {
  return (
    <Scroller className="border-b border-gray-200">
      <div className="flex">
        {items.map((item) => {
          const activo = item.value === value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              aria-selected={activo}
              role="tab"
              className={`relative shrink-0 whitespace-nowrap px-3.5 pb-3 pt-2.5 text-[13.5px] transition-colors ${
                activo ? "font-medium text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <span className="ml-1.5 text-[11.5px] tabular-nums text-gray-400">{item.count}</span>
              )}
              {activo && <span className="absolute inset-x-3.5 -bottom-px h-[1.5px] bg-gray-900" />}
            </button>
          )
        })}
      </div>
    </Scroller>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="px-5 py-16 text-center">
      <p className="text-[14px] font-medium text-gray-900">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[42ch] text-[13px] leading-relaxed text-gray-500">{text}</p>
    </div>
  )
}

export type AccionFila = {
  label: string
  onClick: () => void
  disabled?: boolean
  /** Para lo que no se puede deshacer. Es el único sitio donde entra el rojo. */
  destructiva?: boolean
}

const ANCHO_MENU = 176

/**
 * Las acciones de una fila, plegadas tras un botón de tres puntos.
 *
 * Cuatro botones repetidos en cada fila compiten con el contenido y obligan a
 * la tabla a ser más ancha de lo que necesita. Plegadas, la fila vuelve a ser
 * sobre lo que trata; el menú solo aparece cuando alguien lo pide.
 */
export function RowMenu({ acciones, label = "Acciones" }: { acciones: AccionFila[]; label?: string }) {
  // El menú se dibuja en un portal porque la tabla vive dentro de Scroller, y
  // su overflow recortaría (y difuminaría) cualquier cosa posicionada dentro.
  const [posicion, setPosicion] = useState<{ top: number; left: number } | null>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const abierto = posicion !== null

  // 32px por opción (py-1.5 + línea de 13px) más el relleno del contenedor.
  const alto = acciones.length * 32 + 8

  const abrir = () => {
    const r = disparador.current?.getBoundingClientRect()
    if (!r) return
    // Se abre hacia arriba si abajo no cabe, y nunca se sale por la derecha.
    const haciaArriba = r.bottom + alto > window.innerHeight - 8
    setPosicion({
      top: haciaArriba ? r.top - alto - 4 : r.bottom + 4,
      left: Math.max(8, Math.min(r.right - ANCHO_MENU, window.innerWidth - ANCHO_MENU - 8)),
    })
  }

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      const destino = e.target as Node
      if (!menu.current?.contains(destino) && !disparador.current?.contains(destino)) setPosicion(null)
    }
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPosicion(null)
    }
    // Al desplazar, el menú dejaría de apuntar a su fila: se cierra.
    const cerrar = () => setPosicion(null)
    document.addEventListener("mousedown", fuera)
    document.addEventListener("keydown", teclado)
    window.addEventListener("scroll", cerrar, true)
    window.addEventListener("resize", cerrar)
    return () => {
      document.removeEventListener("mousedown", fuera)
      document.removeEventListener("keydown", teclado)
      window.removeEventListener("scroll", cerrar, true)
      window.removeEventListener("resize", cerrar)
    }
  }, [abierto])

  if (acciones.length === 0) return null

  return (
    <div className="flex justify-end">
      <button
        ref={disparador}
        type="button"
        aria-label={label}
        aria-expanded={abierto}
        aria-haspopup="menu"
        onClick={() => (abierto ? setPosicion(null) : abrir())}
        className={`flex h-[26px] w-[26px] items-center justify-center rounded-md text-[15px] leading-none transition-colors ${
          abierto ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        ⋮
      </button>

      {abierto &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            style={{ top: posicion.top, left: posicion.left, width: ANCHO_MENU }}
            className="fixed z-50 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {acciones.map((accion) => (
              <button
                key={accion.label}
                type="button"
                role="menuitem"
                disabled={accion.disabled}
                onClick={() => {
                  setPosicion(null)
                  accion.onClick()
                }}
                className={`block w-full px-3 py-1.5 text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  accion.destructiva
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {accion.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}

/** Botón sobrio, en sus dos únicas variantes. */
export function Button({
  children,
  variant = "secondary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const base = "h-[30px] shrink-0 rounded-md px-3 text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
  const estilo =
    variant === "primary"
      ? "bg-gray-900 text-white hover:bg-gray-800"
      : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
  return (
    <button {...props} className={`${base} ${estilo} ${props.className ?? ""}`}>
      {children}
    </button>
  )
}
