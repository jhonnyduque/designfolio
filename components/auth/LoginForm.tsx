// components/auth/LoginForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GoogleButton } from "@/components/auth/GoogleButton"
import { PasswordInput } from "@/components/auth/PasswordInput"

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe: remember }),
      })
      if (!response.ok) {
        const data = await response.json() as { message?: string; code?: string }
        throw new Error(data.code === "EMAIL_NOT_VERIFIED"
          ? "Confirma tu correo antes de iniciar sesión."
          : data.message ?? "Correo o contraseña incorrectos.")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al iniciar sesión"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Mobile logo */}
      <div className="lg:hidden mb-8">
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          Design<span className="text-gray-400">folio</span>
        </span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
      <p className="mt-2 text-sm text-gray-500">
        Ingresa a tu cuenta para acceder a tu portafolio.
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <PasswordInput
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-600">Recordarme</span>
          </label>
          <Link
            href="/forgot"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      {googleEnabled && <GoogleButton onError={setError} />}

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-gray-900 hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}
