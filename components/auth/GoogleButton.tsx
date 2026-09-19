// components/auth/GoogleButton.tsx
"use client"

import { useState } from "react"

/**
 * Acceso con Google.
 *
 * Cuando se usa para registrarse, antes de salir hacia Google se guarda el
 * código de invitación en una cookie firmada: la cabecera que usa el registro
 * por correo no sobrevive al desvío, y sin el código cualquiera con una cuenta
 * de Google entraría saltándose la beta cerrada.
 */
type Props = {
  /** En registro se exige código; en inicio de sesión no, porque la cuenta ya existe. */
  inviteCode?: string
  requireInvite?: boolean
  onError: (message: string) => void
}

export function GoogleButton({ inviteCode, requireInvite = false, onError }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    onError("")

    if (requireInvite && !inviteCode?.trim()) {
      onError("Escribe tu código de invitación antes de continuar con Google.")
      return
    }

    setLoading(true)
    try {
      if (requireInvite && inviteCode) {
        const stored = await fetch("/api/auth/invite-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: inviteCode.trim() }),
        })
        if (!stored.ok) {
          const data = await stored.json().catch(() => null)
          throw new Error(data?.error ?? "No se pudo preparar el registro con Google.")
        }
      }

      const response = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          callbackURL: `${window.location.origin}/dashboard`,
          errorCallbackURL: `${window.location.origin}/login?error=google`,
        }),
      })
      const data = (await response.json()) as { url?: string; message?: string }
      if (!response.ok || !data.url) {
        throw new Error(data.message ?? "No se pudo iniciar el acceso con Google.")
      }

      window.location.href = data.url
    } catch (err) {
      onError(err instanceof Error ? err.message : "No se pudo continuar con Google.")
      setLoading(false)
    }
  }

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-meta text-gray-400">o</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-action text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
          <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 010-4.22V7.05H2.18a11 11 0 000 9.9l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" />
        </svg>
        {loading ? "Conectando..." : "Continuar con Google"}
      </button>
    </>
  )
}
