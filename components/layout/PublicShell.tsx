// components/layout/PublicShell.tsx
import type { ReactNode } from "react"
import { PublicHeader } from "@/components/layout/PublicHeader"
import { PublicFooter } from "@/components/layout/PublicFooter"
import type { SesionPublica } from "@/components/layout/PublicMenu"
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner"
import type { CookieConsent } from "@/lib/cookie-consent"

/**
 * El armazón de la parte pública: cabecera, contenido y pie.
 *
 * No aporta nada visible. Su único trabajo es que todas las páginas públicas
 * compartan la misma guía horizontal, de modo que al pasar del feed a una
 * legal el logotipo y el texto no se muevan de sitio.
 *
 * El aire vertical no se decide aquí: una legal necesita más respiro que el
 * feed, y eso es asunto de cada página. Lo que no puede cambiar es dónde
 * empieza y acaba el contenido.
 */
export function PublicShell({
  sesion,
  cookieConsent,
  children,
}: {
  sesion: SesionPublica
  cookieConsent: CookieConsent
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-[#1e1e1e]">
      <PublicHeader sesion={sesion} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <CookieConsentBanner initialConsent={cookieConsent} />
    </div>
  )
}
