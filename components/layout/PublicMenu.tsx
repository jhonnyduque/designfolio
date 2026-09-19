// components/layout/PublicMenu.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

/**
 * El menú de la cabecera pública.
 *
 * Lo que ofrece depende de si hay sesión, porque el feed lo ve tanto quien
 * pasa por aquí de casualidad como quien ya publica. A un visitante anónimo
 * un "cambiar contraseña" no le dice nada; a un miembro, una invitación a
 * registrarse tampoco.
 *
 * No repite la barra lateral del panel: lleva a ella. Mantener dos
 * navegaciones con los mismos destinos es garantía de que un día dejen de
 * coincidir.
 */

export type SesionPublica = {
  nombre: string
  username: string
  avatarUrl: string | null
} | null

export function PublicMenu({ sesion }: { sesion: SesionPublica }) {
  const { signOut } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false)
    }
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false)
    }
    document.addEventListener("mousedown", fuera)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("mousedown", fuera)
      document.removeEventListener("keydown", escape)
    }
  }, [abierto])
  useEffect(() => {
    document.body.classList.toggle('menu-open', abierto)
    return () => document.body.classList.remove('menu-open')
  }, [abierto])

  const destinos = sesion
    ? [
        { href: "/dashboard", texto: "Mi panel" },
        { href: "/dashboard/my-works", texto: "Mis proyectos" },
        { href: "/dashboard/new", texto: "Publicar un proyecto" },
        { href: "/dashboard/settings", texto: "Ajustes" },
      ]
    : [
        { href: "/login", texto: "Iniciar sesión" },
        { href: "/register", texto: "Crear cuenta" },
      ]

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        aria-label="Menú"
        aria-expanded={abierto}
        aria-haspopup="menu"
        onClick={() => setAbierto((v) => !v)}
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors text-[#1e1e1e] hover:bg-black/5`}
      >
        {/* Tres rayas, sin florituras: es el icono que todo el mundo reconoce. */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
        </svg>
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-max max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-black/10 bg-white py-2 shadow-lg"
        >
          {sesion && (
            <div className="flex items-center gap-2.5 border-b border-black/5 px-6 py-2.5">
              {sesion.avatarUrl ? (
                <img src={sesion.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray-200 text-meta font-bold text-gray-500">
                  {sesion.nombre.charAt(0)}
                </span>
              )}
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-body-sm font-semibold text-[#1e1e1e]">{sesion.nombre}</span>
                <span className="block truncate text-meta text-[#6b6b70]">@{sesion.username}</span>
              </span>
            </div>
          )}

          {destinos.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              role="menuitem"
              onClick={() => setAbierto(false)}
              className="block px-6 py-1.5 text-nav text-[#2a2a30] transition-colors hover:bg-black/[.04] hover:text-[#1e1e1e]"
            >
              {d.texto}
            </Link>
          ))}

          {sesion && (
            <>
              <span className="my-1 block border-t border-black/5" />
              <button
                type="button"
                role="menuitem"
                onClick={() => { setAbierto(false); signOut() }}
                className="block w-full px-6 py-1.5 text-left text-nav text-[#6b6b70] transition-colors hover:bg-black/[.04] hover:text-[#1e1e1e]"
              >
                Cerrar sesión
              </button>
            </>
          )}

          <Link
            href="/legal"
            role="menuitem"
            onClick={() => setAbierto(false)}
            className="mt-1 block px-6 pb-1.5 pt-0.5 text-meta text-[#8c8c95] transition-colors hover:text-[#4f4f57]"
          >
            Información legal
          </Link>
        </div>
      )}
    </div>
  )
}
