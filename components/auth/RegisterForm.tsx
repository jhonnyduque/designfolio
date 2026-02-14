// components/auth/RegisterForm.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function RegisterForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

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

    const name = fullName.trim() || email.split("@")[0]

    try {
      // 1. Validate invite code BEFORE creating user
      const { data: isValid, error: valErr } = await supabase.rpc(
        "validate_invite_code",
        { p_code: code }
      )

      if (valErr || !isValid) {
        setError(
          "Código de invitación inválido, expirado o ya utilizado. Verifica tu código e intenta de nuevo."
        )
        setLoading(false)
        return
      }

      // 2. Sign up user
      const { data: signUpData, error: authError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              invite_code: code,
            },
          },
        })

      if (authError) throw authError

      // 3. Claim invite code with the new user's ID
      const userId = signUpData.user?.id
      if (userId) {
        const { data: claimed, error: claimErr } = await supabase.rpc(
          "claim_invite_code",
          { p_code: code, p_user_id: userId }
        )

        if (claimErr || !claimed) {
          // Code was taken between validate and claim (race condition)
          // Very unlikely but handle gracefully
          setError(
            "El código fue reclamado por alguien más. Solicita otro código."
          )
          setLoading(false)
          return
        }
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    const code = inviteCode.trim()
    if (!code) {
      setError("Ingresa tu código de invitación antes de continuar con Google.")
      return
    }

    // Validate code before redirecting
    const { data: isValid } = await supabase.rpc("validate_invite_code", {
      p_code: code,
    })

    if (!isValid) {
      setError(
        "Código de invitación inválido, expirado o ya utilizado."
      )
      return
    }

    // Store invite code in localStorage so we can claim it after OAuth redirect
    localStorage.setItem("df_invite_code", code)

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
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
          <input
            id="regPassword"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase">o</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuar con Google
      </button>

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
