"use client"

import { useState } from "react"
import Link from "next/link"
import type { CookieConsent } from "@/lib/cookie-consent"

export function CookieConsentBanner({ initialConsent }: { initialConsent: CookieConsent }) {
  const [consent, setConsent] = useState(initialConsent)
  const [saving, setSaving] = useState(false)

  if (consent !== "unknown") return null

  async function choose(analytics: boolean) {
    setSaving(true)
    try {
      const response = await fetch("/api/cookies/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analytics }),
      })
      if (response.ok) {
        setConsent(analytics ? "accepted" : "rejected")
        if (analytics) window.dispatchEvent(new Event("designfolio:analytics-consent"))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <aside aria-label="Preferencias de cookies" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg border border-black/10 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-body-sm font-semibold text-[#1e1e1e]">Cookies analíticas</p>
      <p className="mt-1 text-meta leading-relaxed text-[#5f6068]">
        Con tu permiso medimos compartidos de proyectos para ofrecer estadísticas a sus autores. Puedes cambiar tu elección desde la
        {" "}<Link href="/cookies" className="text-[#3f4047] underline">Política de cookies</Link>.
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" disabled={saving} onClick={() => void choose(false)} className="px-3 py-1.5 text-meta font-medium text-[#565861] hover:text-[#1e1e1e] disabled:opacity-50">
          Rechazar
        </button>
        <button type="button" disabled={saving} onClick={() => void choose(true)} className="bg-[#1e1e1e] px-3 py-1.5 text-meta font-medium text-white hover:bg-black disabled:opacity-50">
          Aceptar
        </button>
      </div>
    </aside>
  )
}
