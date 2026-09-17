// components/ui/Panel.tsx
"use client"

import type { ReactNode } from "react"
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
