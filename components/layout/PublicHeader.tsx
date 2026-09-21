// components/layout/PublicHeader.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PublicMenu, type SesionPublica } from "@/components/layout/PublicMenu"

/**
 * Cabecera pública de Designfolio.
 *
 * El feed conserva el símbolo de marca. Las vistas secundarias (detalle de
 * proyecto y páginas legales) sustituyen ese símbolo por una navegación clara
 * de regreso al feed: "← Designfolio".
 */
export function PublicHeader({ sesion }: { sesion: SesionPublica }) {
  const pathname = usePathname()
  const showBackToFeed = pathname !== "/" && pathname !== "/proyectos"

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
      <div className="public-container flex h-14 items-center justify-between">
        {showBackToFeed ? (
          <Link
            href="/"
            aria-label="Ir al feed de Designfolio"
            className="inline-flex h-9 items-center gap-2 text-[#1e1e1e] transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span className="text-nav font-semibold">Designfolio</span>
          </Link>
        ) : (
          <Link href="/" aria-label="Designfolio" className="inline-flex items-center">
            <Image
              src="/brand/simbolo-logo.webp"
              alt="Designfolio"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </Link>
        )}

        <div className="flex items-center gap-1">
          {sesion && (
            <Link
              href="/dashboard/new"
              aria-label="Publicar un proyecto"
              className="grid h-9 w-9 place-items-center rounded-lg text-[#1e1e1e] transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
          )}
          <PublicMenu sesion={sesion} />
        </div>
      </div>
    </header>
  )
}
