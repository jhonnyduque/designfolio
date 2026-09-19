// components/auth/ResetPasswordForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/auth/PasswordInput"

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    setLoading(true)
    try {
      const token = new URLSearchParams(window.location.search).get("token")
      if (!token) throw new Error("El enlace de recuperación es inválido o ya expiró.")
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      })
      if (!response.ok) throw new Error("No se pudo actualizar la contraseña. Solicita un enlace nuevo.")
      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-page-title text-gray-900">Nueva contraseña</h2>
      <p className="mt-2 text-body-sm text-gray-500">
        Ingresa tu nueva contraseña.
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-body-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-label text-gray-700">
            Nueva contraseña
          </label>
          <PasswordInput
            id="newPassword"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-label text-gray-700">
            Confirmar contraseña
          </label>
          <PasswordInput
            id="confirmPassword"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
            placeholder="Repite la contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gray-900 text-white text-action rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Actualizando..." : "Establecer contraseña"}
        </button>
      </form>
    </div>
  )
}
