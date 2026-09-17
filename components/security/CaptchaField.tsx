// components/security/CaptchaField.tsx
"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Widget de Cloudflare Turnstile.
 *
 * No renderiza nada si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` no está definida, de modo
 * que el formulario funciona igual con el CAPTCHA apagado. Ojo: esa variable se
 * incorpora al compilar, así que activarlo requiere una recompilación, no solo
 * reiniciar.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string
      remove: (widgetId: string) => void
    }
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

export function useCaptchaEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
}

export function CaptchaField({ onToken }: { onToken: (token: string | null) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const container = useRef<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!siteKey || !container.current) return

    let widgetId: string | undefined
    let cancelled = false

    function render() {
      if (cancelled || !window.turnstile || !container.current) return
      widgetId = window.turnstile.render(container.current, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => {
          setFailed(true)
          onToken(null)
        },
      })
    }

    if (window.turnstile) {
      render()
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
      if (existing) {
        existing.addEventListener("load", render)
      } else {
        const script = document.createElement("script")
        script.src = SCRIPT_SRC
        script.async = true
        script.onload = render
        script.onerror = () => setFailed(true)
        document.head.appendChild(script)
      }
    }

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [siteKey, onToken])

  if (!siteKey) return null

  return (
    <div>
      <div ref={container} />
      {failed && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          No se pudo cargar la verificación. Recarga la página e inténtalo de nuevo.
        </p>
      )}
    </div>
  )
}
