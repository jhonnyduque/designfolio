// components/profile/EditProfileForm.tsx
"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uploadAvatar } from "@/lib/supabase/avatar"
import {
  PROFILE_CATEGORIES,
  CAREER_YEARS,
  PROFILE_LIMITS,
} from "@/types/profile"
import type { UserProfile } from "@/types/profile"

interface EditProfileFormProps {
  profile: UserProfile
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bio, setBio] = useState(profile.bio ?? "")
  const [school, setSchool] = useState(profile.school ?? "")
  const [careerYear, setCareerYear] = useState(profile.career_year ?? "")
  const [categories, setCategories] = useState<string[]>(
    profile.categories ?? []
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const bioLen = bio.length

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > PROFILE_LIMITS.AVATAR_MAX_SIZE_BYTES) {
        setError(`La imagen supera ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB`)
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    },
    []
  )

  const toggleCategory = useCallback((cat: string) => {
    setCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat)
      if (prev.length >= PROFILE_LIMITS.CATEGORIES_MAX) return prev
      return [...prev, cat]
    })
  }, [])

  const isValid =
    fullName.trim().length >= 2 &&
    bioLen >= PROFILE_LIMITS.BIO_MIN &&
    bioLen <= PROFILE_LIMITS.BIO_MAX &&
    categories.length >= PROFILE_LIMITS.CATEGORIES_MIN &&
    categories.length <= PROFILE_LIMITS.CATEGORIES_MAX

  async function handleSave() {
    if (!isValid || saving) return
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      let avatarUrl = profile.avatar_url

      // Upload new avatar if changed
      if (avatarFile) {
        const result = await uploadAvatar(avatarFile, profile.id)
        if (result.error) throw new Error(result.error)
        avatarUrl = result.url
      }

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
          bio: bio.trim(),
          school: school.trim() || null,
          career_year: careerYear || null,
          categories,
        })
        .eq("id", profile.id)

      if (updateErr) throw updateErr

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Editar perfil</h1>
      <p className="mt-1 text-sm text-gray-500">
        Actualiza tu información pública.
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Perfil actualizado correctamente.
        </div>
      )}

      <div className="mt-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors group flex-shrink-0"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-lg font-bold text-gray-400">
                  {fullName.charAt(0)}
                </span>
              </div>
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Cambiar foto
            </button>
            <p className="text-xs text-gray-400 mt-0.5">
              JPG, PNG o WebP · Máx {PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
          />
        </div>

        {/* Username (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="mt-1 flex items-center gap-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
            <span>@</span>
            <span>{profile.username}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            El username no se puede cambiar.
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={PROFILE_LIMITS.BIO_MAX}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none transition-colors"
            placeholder="Cuéntale a la comunidad quién eres..."
          />
          <p
            className={`mt-1 text-xs text-right ${
              bioLen >= PROFILE_LIMITS.BIO_MIN &&
              bioLen <= PROFILE_LIMITS.BIO_MAX
                ? "text-green-600"
                : bioLen > 50
                  ? "text-amber-500"
                  : "text-gray-400"
            }`}
          >
            {bioLen}/{PROFILE_LIMITS.BIO_MIN}–{PROFILE_LIMITS.BIO_MAX}
          </p>
        </div>

        {/* School */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Universidad / Escuela
          </label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
          />
        </div>

        {/* Career year */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Año / Etapa
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CAREER_YEARS.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setCareerYear(year)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  careerYear === year
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especialidades
          </label>
          <p className="text-xs text-gray-400 mb-2">
            {PROFILE_LIMITS.CATEGORIES_MIN}–{PROFILE_LIMITS.CATEGORIES_MAX}{" "}
            categorías
          </p>
          <div className="flex flex-wrap gap-2">
            {PROFILE_CATEGORIES.map((cat) => {
              const selected = categories.includes(cat)
              const disabled =
                !selected &&
                categories.length >= PROFILE_LIMITS.CATEGORIES_MAX
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : disabled
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Save */}
        <div className="pt-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
