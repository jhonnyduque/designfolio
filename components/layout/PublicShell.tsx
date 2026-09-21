// components/layout/PublicShell.tsx
import type { ReactNode } from "react"
import { PublicHeader } from "@/components/layout/PublicHeader"
import { PublicFooter } from "@/components/layout/PublicFooter"
import type { SesionPublica } from "@/components/layout/PublicMenu"
import { PublicSessionProvider } from "@/components/layout/PublicSessionContext"
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner"
import type { CookieConsent } from "@/lib/cookie-consent"

/**
 * El armazón de la parte pública: cabecera, contenido y pie.
 *
 * La sesión pública se comparte también con las superficies cliente del feed
 * para decidir si una publicación pertenece al usuario actual. Las operaciones
 * protegidas continúan validadas por sus APIs.
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
    <PublicSessionProvider sesion={sesion}>
      <div className="flex min-h-screen flex-col bg-canvas text-[#1e1e1e]">
        <PublicHeader sesion={sesion} />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <CookieConsentBanner initialConsent={cookieConsent} />
      </div>
    </PublicSessionProvider>
  )
}
