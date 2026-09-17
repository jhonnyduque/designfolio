// components/auth/RegisterForm.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { CaptchaField, useCaptchaEnabled } from "@/components/security/CaptchaField"

export function RegisterForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaEnabled = useCaptchaEnabled()
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const code = inviteCode.trim()
    if (!code) {
      setError("El código de invitación es obligatorio para la beta.")
      setLoading(false)
      return
    }

    if (captchaEnabled && !captchaToken) {
      setError("Completa la verificación de seguridad.")
      setLoading(false)
      return
    }

    const name = fullName.trim() || email.split("@")[0]

    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-designfolio-invite": code,
        },
        body: JSON.stringify({ email, password, name, captchaToken, callbackURL: `${window.location.origin}/login` }),
      })
      if (!response.ok) {
        throw new Error("Código de invitación inválido, expirado o ya utilizado. Verifica tu código e intenta de nuevo.")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Revisa tu email</h2>
        <p className="mt-2 text-sm text-gray-500">
          Te enviamos un enlace de confirmación a <strong>{email}</strong>.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
        >
          Volver al login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="lg:hidden mb-8">
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          Design<span className="text-gray-400">folio</span>
        </span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Crear cuenta</h2>
      <p className="mt-2 text-sm text-gray-500">
        Únete a la comunidad. Necesitas un código de invitación.
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="invite"
            className="block text-sm font-medium text-gray-700"
          >
            Código de invitación
          </label>
          <input
            id="invite"
            type="text"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors font-mono tracking-wider"
            placeholder="ABCD1234"
            maxLength={12}
          />
        </div>

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre completo
            <span className="text-gray-400 font-normal"> (opcional)</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
            placeholder="Tu nombre real"
          />
        </div>

        <div>
          <label
            htmlFor="regEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="regEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="regPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <PasswordInput
            id="regPassword"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <CaptchaField onToken={setCaptchaToken} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
