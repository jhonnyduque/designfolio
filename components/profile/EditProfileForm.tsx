// components/profile/EditProfileForm.tsx
"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { PROFILE_LIMITS } from "@/types/profile"
import type { UserProfile } from "@/types/profile"
import { faltasDelPerfil } from "@/lib/profile-validation"
import { sanitizeUsernameInput } from "@/lib/username"

interface EditProfileFormProps {
  profile: UserProfile
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const [username, setUsername] = useState(profile.username)
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [fullName, setFullName] = useState(profile.full_name)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bio, setBio] = useState(profile.bio ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const usernameChanged = username !== profile.username
  const faltas = faltasDelPerfil({ fullName, bio })

  const usernameReady =
    !usernameChanged ||
    (
      username.length >= PROFILE_LIMITS.USERNAME_MIN &&
      username.length <= PROFILE_LIMITS.USERNAME_MAX &&
      usernameStatus === "available"
    )

  const isValid = faltas.length === 0 && usernameReady


  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > PROFILE_LIMITS.AVATAR_MAX_SIZE_BYTES) {
      setError(`La imagen supera ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB`)
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }, [])

  const handleUsernameChange = useCallback((value: string) => {
    const clean = sanitizeUsernameInput(value)
    setUsername(clean)
    setUsernameStatus("idle")
    setSuccess(false)

    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    if (clean === profile.username) return

    if (
      clean.length >= PROFILE_LIMITS.USERNAME_MIN &&
      clean.length <= PROFILE_LIMITS.USERNAME_MAX
    ) {
      setUsernameStatus("checking")
      usernameTimer.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/profile/username?value=${encodeURIComponent(clean)}`)
          const data = await response.json() as { available?: boolean }
          setUsernameStatus(response.ok && data.available ? "available" : "taken")
        } catch {
          setUsernameStatus("taken")
        }
      }, 450)
    }
  }, [profile.username])

  async function handleSave() {
    if (!isValid || saving) return
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      let avatarUrl = profile.avatar_url

      if (avatarFile) {
        const formData = new FormData()
        formData.set("avatar", avatarFile)
        const upload = await fetch("/api/profile", { method: "POST", body: formData })
        if (!upload.ok) {
          const data = await upload.json().catch(() => ({})) as { error?: string }
          throw new Error(data.error ?? "No se pudo subir el avatar.")
        }
        avatarUrl = (await upload.json() as { url: string }).url
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          fullName: fullName.trim(),
          avatarUrl,
          bio: bio.trim(),
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? "No se pudo guardar el perfil.")
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-page-title text-gray-900">Editar perfil</h1>
      <p className="mt-1 text-body-sm text-gray-500">Tu identidad pública en Designfolio.</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-body-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-body-sm text-green-700">Perfil actualizado correctamente.</div>
      )}

      <div className="mt-6 space-y-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-100 transition-colors hover:border-gray-400"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-section text-gray-400">{fullName.charAt(0)}</span>
              </div>
            )}
          </button>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="text-action text-gray-900 hover:underline">
              Cambiar foto
            </button>
            <p className="mt-0.5 text-meta text-gray-400">JPG, PNG o WebP · Máx {PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
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
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-10 text-body-sm text-gray-900 outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === "checking" && <span className="text-meta text-gray-400">…</span>}
              {usernameChanged && usernameStatus === "available" && <span className="text-body-sm text-green-600">✓</span>}
              {usernameChanged && usernameStatus === "taken" && <span className="text-body-sm text-red-500">×</span>}
            </span>
          </div>
          <p className={`mt-1 text-meta ${usernameChanged && usernameStatus === "taken" ? "text-red-500" : "text-gray-400"}`}>
            {usernameChanged && usernameStatus === "taken"
              ? "Ese nombre no está disponible."
              : `${PROFILE_LIMITS.USERNAME_MIN}–${PROFILE_LIMITS.USERNAME_MAX} caracteres · letras, números y _`}
          </p>
        </div>

        <div>
          <label className="block text-label text-gray-700">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-label text-gray-700">
            Bio <span className="font-normal text-gray-400">(opcional)</span>
          </label>
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
              className="col-start-1 row-start-1 h-full min-h-[42px] max-h-[83px] w-full resize-none overflow-y-auto rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 outline-none transition-colors placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              placeholder="Cuéntale a la comunidad quién eres..."
            />
          </div>
          <p className="mt-1 text-right text-meta text-gray-400">
            Máx. {PROFILE_LIMITS.BIO_MAX} caracteres
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="rounded-lg bg-gray-900 px-6 py-2.5 text-action text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button onClick={() => router.back()} className="px-4 py-2.5 text-action text-gray-500 transition-colors hover:text-gray-700">
            Cancelar
          </button>
        </div>

        {!isValid && faltas.length > 0 && (
          <p className="text-meta text-gray-500">Para guardar, {faltas.join(" · ")}.</p>
        )}
      </div>
    </div>
  )
}
