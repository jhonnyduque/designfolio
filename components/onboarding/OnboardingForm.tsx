// components/onboarding/OnboardingForm.tsx
"use client"

import { useCallback, useRef, useState } from "react"
import { useOnboarding } from "@/hooks/useOnboarding"
import { useAuth } from "@/hooks/useAuth"
import { PROFILE_LIMITS } from "@/types/profile"
import { sanitizeUsernameInput } from "@/lib/username"

export function OnboardingForm({ currentName }: { currentName: string }) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [fullName, setFullName] = useState(currentName === "New User" ? "" : currentName)
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [bio, setBio] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { save, checkUsername, step, progress, error } = useOnboarding()
  const { signOut } = useAuth()

  const isSaving = step !== "idle" && step !== "error"
  const canSubmit =
    fullName.trim().length >= 2 &&
    username.length >= PROFILE_LIMITS.USERNAME_MIN &&
    username.length <= PROFILE_LIMITS.USERNAME_MAX &&
    usernameStatus === "available" &&
    bio.length <= PROFILE_LIMITS.BIO_MAX


  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > PROFILE_LIMITS.AVATAR_MAX_SIZE_BYTES) {
      alert(`La imagen supera ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB`)
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }, [])

  const handleUsernameChange = useCallback((value: string) => {
    const clean = sanitizeUsernameInput(value)
    setUsername(clean)
    setUsernameStatus("idle")

    if (usernameTimer.current) clearTimeout(usernameTimer.current)

    if (
      clean.length >= PROFILE_LIMITS.USERNAME_MIN &&
      clean.length <= PROFILE_LIMITS.USERNAME_MAX
    ) {
      setUsernameStatus("checking")
      usernameTimer.current = setTimeout(async () => {
        const available = await checkUsername(clean)
        setUsernameStatus(available ? "available" : "taken")
      }, 450)
    }
  }, [checkUsername])

  function handleSubmit() {
    if (!canSubmit || isSaving) return
    void save({
      username,
      full_name: fullName.trim(),
      avatar_url: null,
      bio: bio.trim(),
    }, avatarFile)
  }

  if (step === "done") {
    return (
      <div className="py-12 text-center">
        <h2 className="text-page-title text-gray-900">¡Bienvenido!</h2>
        <p className="mt-2 text-gray-500">Tu perfil está listo. Redirigiendo...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={signOut} className="text-action text-gray-400 transition-colors hover:text-gray-600">
          Cerrar sesión
        </button>
      </div>

      <div className="mb-7 text-center">
        <h1 className="text-page-title text-gray-900">Completa tu perfil</h1>
        <p className="mt-1 text-body-sm text-gray-500">Elige cómo quieres aparecer en Designfolio.</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-body-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-100 transition-colors hover:border-gray-400"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-page-title text-gray-400">{fullName.charAt(0) || "?"}</span>
              </div>
            )}
          </button>
          <p className="text-meta text-gray-400">Foto opcional · JPG, PNG o WebP · Máx {PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
        </div>

        <div>
          <label className="block text-label text-gray-700">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 outline-none transition-colors placeholder-gray-400 focus:border-gray-900"
            placeholder="Tu nombre real"
          />
        </div>

        <div>
          <label className="block text-label text-gray-700">Nombre de usuario</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm text-gray-400">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              maxLength={PROFILE_LIMITS.USERNAME_MAX}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-10 text-body-sm text-gray-900 outline-none transition-colors placeholder-gray-400 focus:border-gray-900"
              placeholder="tu_usuario"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === "checking" && <span className="text-meta text-gray-400">…</span>}
              {usernameStatus === "available" && <span className="text-body-sm text-green-600">✓</span>}
              {usernameStatus === "taken" && <span className="text-body-sm text-red-500">×</span>}
            </span>
          </div>
          <p className={`mt-1 text-meta ${usernameStatus === "taken" ? "text-red-500" : "text-gray-400"}`}>
            {usernameStatus === "taken"
              ? "Ese nombre no está disponible."
              : `${PROFILE_LIMITS.USERNAME_MIN}–${PROFILE_LIMITS.USERNAME_MAX} caracteres · letras, números y _`}
          </p>
        </div>

        <div>
          <label className="block text-label text-gray-700">Bio <span className="font-normal text-gray-400">(opcional)</span></label>
          <div className="mt-1 grid max-h-[83px] min-h-[42px] overflow-hidden">
            <div
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 min-h-[42px] max-h-[83px] overflow-hidden whitespace-pre-wrap break-words border border-transparent px-3 py-2.5 text-body-sm"
            >
              {`${bio}\u200b`}
            </div>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={1}
              maxLength={PROFILE_LIMITS.BIO_MAX}
              className="col-start-1 row-start-1 h-full min-h-[42px] max-h-[83px] w-full resize-none overflow-y-auto rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 outline-none transition-colors placeholder-gray-400 focus:border-gray-900"
              placeholder="Cuéntale a la comunidad quién eres..."
            />
          </div>
          <p className="mt-1 text-right text-meta text-gray-400">
            Máx. {PROFILE_LIMITS.BIO_MAX} caracteres
          </p>
        </div>

        {isSaving && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-body-sm text-gray-600">{progress}</div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSaving}
          className="w-full rounded-lg bg-gray-900 px-6 py-2.5 text-action text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? "Guardando..." : "Completar perfil"}
        </button>
      </div>
    </div>
  )
}
