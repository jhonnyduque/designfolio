// components/layout/PublicFooter.tsx
import Link from "next/link"

/**
 * Pie de las páginas públicas.
 *
 * Sustituye a la llamada comercial que había al final del feed. Esa frase
 * —"si quieres una propuesta visual con este nivel de detalle, hablemos"—
 * aparecía debajo de obras que son de los miembros, no de quien la firmaba.
 *
 * Aquí solo se dice qué es este sitio y quién lo mantiene. La autoría de la
 * plataforma no es la autoría de lo que se publica en ella, y conviene que se
 * note la diferencia.
 *
 * Usa `public-container`, de modo que sus dos extremos caen sobre la misma
 * vertical que el logotipo de la cabecera y que el contenido de la página.
 */
export function PublicFooter() {
  return (
    <footer className="border-t border-black/10">
      <div className="public-container">

        {/* ── MÓVIL (oculto en sm+) ── */}
        <div className="flex flex-col gap-4 py-4 text-body-sm text-[#6b6b70] sm:hidden">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-[#1e1e1e]">Designfolio</span>
            <span>Un proyecto de Jhonny Duque</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Link href="/aviso-legal" className="hover:text-[#1e1e1e] hover:underline transition-colors">Aviso legal</Link>
            <Link href="/privacidad" className="hover:text-[#1e1e1e] hover:underline transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-[#1e1e1e] hover:underline transition-colors">Términos</Link>
            <Link href="/cookies" className="hover:text-[#1e1e1e] hover:underline transition-colors">Cookies</Link>
          </div>
        </div>

        {/* ── DESKTOP (visible en sm+) ── */}
        <div className="hidden w-full sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-6 py-4 text-body-sm text-[#6b6b70]">
          <p>
            <span className="font-medium text-[#1e1e1e]">Designfolio</span> — Un proyecto de Jhonny Duque
          </p>
          <p className="shrink-0 flex items-center gap-2">
            <Link href="/aviso-legal" className="hover:text-[#1e1e1e] hover:underline transition-colors">Aviso legal</Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacidad" className="hover:text-[#1e1e1e] hover:underline transition-colors">Privacidad</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terminos" className="hover:text-[#1e1e1e] hover:underline transition-colors">Términos</Link>
            <span aria-hidden="true">·</span>
            <Link href="/cookies" className="hover:text-[#1e1e1e] hover:underline transition-colors">Cookies</Link>
          </p>
        </div>

      </div>
    </footer>
  )
}
