// app/(protected)/DashboardShell.tsx
"use client"

import { type ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { NotificationBell } from "@/components/notifications/NotificationBell"

/**
 * Barra lateral en lugar de pestañas horizontales.
 *
 * Había nueve destinos apretados en una cabecera, que en pantallas estrechas se
 * desbordaban. La lateral los ordena, deja sitio para contadores y separa lo de
 * administrar la plataforma de lo que es de la propia cuenta.
 */

type Item = { href: string; label: string; icon: ReactNode; badge?: number; exact?: boolean }

const icono = (d: string) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)

const ICONOS = {
  inicio: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z",
  verificar: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  publicaciones: "M4 4h16v16H4zM4 9h16M9 20V9",
  miembros: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8zM22 21v-2a4 4 0 00-3-3.87",
  invitaciones: "M3 5h18v14H3zM3 7l9 6 9-6",
  taxonomia: "M20.6 13.4L11 3.8V3H3v8h.8l9.6 9.6a2 2 0 002.8 0l4.4-4.4a2 2 0 000-2.8z",
  proyectos: "M3 7h7l2 2h9v10a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z",
  ajustes: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09A1.65 1.65 0 0015 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.14.63.67 1.1 1.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z",
  nuevo: "M12 5v14M5 12h14",
  menu: "M4 7h16M4 12h16M4 17h16",
  cerrar: "M6 6l12 12M18 6L6 18",
}

export function DashboardShell({
  email,
  isFounder = false,
  pendingCount = 0,
  children,
}: {
  email: string
  isFounder?: boolean
  pendingCount?: number
  children: ReactNode
}) {
  const { signOut } = useAuth()
  const pathname = usePathname()
  const [cajonAbierto, setCajonAbierto] = useState(false)

  // Al navegar se cierra el cajón: en móvil queda tapando el contenido.
  useEffect(() => { setCajonAbierto(false) }, [pathname])

  const plataforma: Item[] = isFounder
    ? [
        { href: "/dashboard", label: "Inicio", icon: icono(ICONOS.inicio), exact: true },
        { href: "/dashboard/moderation", label: "Verificación", icon: icono(ICONOS.verificar), badge: pendingCount, exact: true },
        { href: "/dashboard/moderation/publicaciones", label: "Publicaciones", icon: icono(ICONOS.publicaciones) },
        { href: "/dashboard/moderation/miembros", label: "Miembros", icon: icono(ICONOS.miembros) },
        { href: "/dashboard/moderation/invitaciones", label: "Invitaciones", icon: icono(ICONOS.invitaciones) },
        { href: "/dashboard/moderation/taxonomy", label: "Taxonomía", icon: icono(ICONOS.taxonomia) },
      ]
    : [{ href: "/dashboard", label: "Inicio", icon: icono(ICONOS.inicio), exact: true }]

  const cuenta: Item[] = [
    { href: "/dashboard/my-works", label: "Mis proyectos", icon: icono(ICONOS.proyectos) },
    { href: "/dashboard/settings", label: "Ajustes", icon: icono(ICONOS.ajustes) },
  ]

  const activo = (item: Item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const Enlace = ({ item }: { item: Item }) => (
    <Link
      href={item.href}
      aria-current={activo(item) ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] transition-colors ${
        activo(item)
          ? "bg-gray-100 font-medium text-gray-900"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span className="shrink-0 opacity-75">{item.icon}</span>
      <span className="truncate">{item.label}</span>
      {item.badge ? (
        <span className="ml-auto rounded-full bg-gray-900 px-1.5 text-[11px] leading-[1.5] tabular-nums text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  )

  const contenidoLateral = (
    <>
      <Link href="/dashboard" className="flex items-baseline gap-2 px-2.5 pb-5 pt-1">
        <span className="text-base font-bold tracking-tight text-gray-900">
          Design<span className="text-gray-400">folio</span>
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Beta
        </span>
      </Link>

      <Link
        href="/dashboard/new"
        className="mb-4 flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-gray-800"
      >
        {icono(ICONOS.nuevo)} Nuevo proyecto
      </Link>

      {isFounder && (
        <p className="px-2.5 pb-1.5 pt-1 text-[11px] uppercase tracking-[0.06em] text-gray-400">
          Plataforma
        </p>
      )}
      <nav className="flex flex-col gap-0.5">
        {plataforma.map((item) => <Enlace key={item.href} item={item} />)}
      </nav>

      <p className="px-2.5 pb-1.5 pt-4 text-[11px] uppercase tracking-[0.06em] text-gray-400">
        Mi cuenta
      </p>
      <nav className="flex flex-col gap-0.5">
        {cuenta.map((item) => <Enlace key={item.href} item={item} />)}
      </nav>

      <div className="mt-auto border-t border-gray-200 pt-3">
        <p className="truncate px-2.5 text-[12.5px] text-gray-500" title={email}>{email}</p>
        <button
          onClick={signOut}
          className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabecera solo en móvil, donde la lateral no cabe */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setCajonAbierto(true)}
          aria-label="Abrir menú"
          className="-ml-2 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          {icono(ICONOS.menu)}
        </button>
        <Link href="/dashboard" className="text-base font-bold tracking-tight text-gray-900">
          Design<span className="text-gray-400">folio</span>
        </Link>
        <NotificationBell />
      </header>

      {/* Cajón lateral en móvil */}
      {cajonAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/20"
            onClick={() => setCajonAbierto(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[252px] flex-col border-r border-gray-200 bg-white p-3">
            <button
              onClick={() => setCajonAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {icono(ICONOS.cerrar)}
            </button>
            {contenidoLateral}
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Lateral fija en escritorio */}
        <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 flex-col border-r border-gray-200 bg-white p-3 lg:flex">
          {contenidoLateral}
        </aside>

        <div className="min-w-0 flex-1">
          {/* La campana vive arriba a la derecha solo en escritorio */}
          <div className="hidden justify-end px-9 pt-6 lg:flex">
            <NotificationBell />
          </div>
          <main className="mx-auto max-w-[1180px] px-4 pb-20 pt-6 sm:px-6 lg:px-9 lg:pt-2">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
