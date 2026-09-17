// components/ui/Scroller.tsx
"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

/**
 * Contenedor con desplazamiento horizontal sin barra visible.
 *
 * En su lugar, el contenido se difumina en el borde donde queda algo oculto. No
 * es un adorno fijo: aparece solo cuando hay más que ver, cambia de lado según
 * la posición, y se apaga al llegar al final. Así la pista de que se puede
 * deslizar la da el propio contenido, sin barras ni instrucciones.
 */
type Borde = "none" | "start" | "end" | "both"

const MASCARAS: Record<Borde, string | undefined> = {
  none: undefined,
  end: "linear-gradient(90deg, #000 0, #000 calc(100% - 44px), transparent 100%)",
  start: "linear-gradient(90deg, transparent 0, #000 44px, #000 100%)",
  both: "linear-gradient(90deg, transparent 0, #000 44px, #000 calc(100% - 44px), transparent 100%)",
}

export function Scroller({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [borde, setBorde] = useState<Borde>("none")

  const actualizar = useCallback(() => {
    const el = ref.current
    if (!el) return
    const maximo = el.scrollWidth - el.clientWidth
    if (maximo <= 1) return setBorde("none")
    const izquierda = el.scrollLeft > 2
    const derecha = el.scrollLeft < maximo - 2
    setBorde(izquierda && derecha ? "both" : izquierda ? "start" : "end")
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    actualizar()
    const observador = new ResizeObserver(actualizar)
    observador.observe(el)
    // También cuando cambia el contenido, no solo el tamaño del contenedor.
    const mutaciones = new MutationObserver(actualizar)
    mutaciones.observe(el, { childList: true, subtree: true })
    return () => {
      observador.disconnect()
      mutaciones.disconnect()
    }
  }, [actualizar])

  const mascara = MASCARAS[borde]

  return (
    <div
      ref={ref}
      onScroll={actualizar}
      className={`overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      style={mascara ? { maskImage: mascara, WebkitMaskImage: mascara } : undefined}
    >
      {children}
    </div>
  )
}
