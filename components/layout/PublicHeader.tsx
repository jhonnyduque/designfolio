// components/layout/PublicHeader.tsx
import Image from "next/image"
import Link from "next/link"
import { PublicMenu, type SesionPublica } from "@/components/layout/PublicMenu"

/**
 * La cabecera de todas las páginas públicas.
 *
 * Antes cada página se dibujaba la suya: el feed y las legales llevaban una
 * copia literal del mismo bloque, y el detalle de proyecto una distinta, con
 * otro logotipo y sin menú. Copiar un header es la forma más segura de que un
 * día dejen de parecerse.
 *
 * Se apoya en `public-container`, así que el logotipo cae exactamente sobre el
 * borde izquierdo del contenido y el menú sobre el derecho, en todas las
 * páginas y en todos los anchos.
 */
export function PublicHeader({ sesion }: { sesion: SesionPublica }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
      <div className="public-container flex h-14 items-center justify-between">
        <Link href="/" aria-label="Designfolio" className="inline-flex items-center">
          <Image
            src="/brand/simbolo-logo.webp"
            alt="Designfolio"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </Link>

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
