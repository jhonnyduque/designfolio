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
 */
export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-black/10">
      <div className="mx-auto flex w-full max-w-[935px] flex-col gap-2 px-6 py-8 text-[13px] leading-relaxed text-[#6b6b70] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p>
          <Link href="/" className="font-medium text-[#1e1e1e] hover:underline">
            Designfolio
          </Link>{" "}
          — portafolios de diseñadores emergentes. Cada proyecto pertenece a quien lo firma.
        </p>
        <p className="shrink-0">
          Un proyecto de{" "}
          <a
            href="https://jhonnyduque.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#1e1e1e] hover:underline"
          >
            Jhonny Duque
          </a>
        </p>
      </div>
    </footer>
  )
}
