// components/onboarding/OnboardingForm.tsx
"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { useOnboarding } from "@/hooks/useOnboarding"
import {
  PROFILE_CATEGORIES,
  CAREER_YEARS,
  PROFILE_LIMITS,
} from "@/types/profile"

type Step = 1 | 2 | 3

export function OnboardingForm({ currentName }: { currentName: string }) {
  // Step 1: Identity
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [fullName, setFullName] = useState(
    currentName === "New User" ? "" : currentName
  )
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle")

  // Step 2: About
  const [bio, setBio] = useState("")
  const [school, setSchool] = useState("")
  const [careerYear, setCareerYear] = useState("")

  // Step 3: Categories
  const [categories, setCategories] = useState<string[]>([])

  const [step, setStep] = useState<Step>(1)
  const fileRef = useRef<HTMLInputElement>(null)
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { save, checkUsername, step: saveStep, progress, error } = useOnboarding()

  const bioLen = bio.length
  const isSaving = saveStep !== "idle" && saveStep !== "error"

  // ─── Avatar ───
  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > PROFILE_LIMITS.AVATAR_MAX_SIZE_BYTES) {
        alert(`La imagen supera ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB`)
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    },
    []
  )

  // ─── Username check with debounce ───
  const handleUsernameChange = useCallback(
    (value: string) => {
      // Sanitize: lowercase, no spaces, alphanumeric + underscore
      const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, "")
      setUsername(clean)
      setUsernameStatus("idle")

      if (usernameTimer.current) clearTimeout(usernameTimer.current)

      if (clean.length >= PROFILE_LIMITS.USERNAME_MIN) {
        setUsernameStatus("checking")
        usernameTimer.current = setTimeout(async () => {
          const available = await checkUsername(clean)
          setUsernameStatus(available ? "available" : "taken")
        }, 500)
      }
    },
    [checkUsername]
  )

  // ─── Category toggle ───
  const toggleCategory = useCallback((cat: string) => {
    setCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat)
      if (prev.length >= PROFILE_LIMITS.CATEGORIES_MAX) return prev
      return [...prev, cat]
    })
  }, [])

  // ─── Validation ───
  const canStep2 =
    fullName.trim().length >= 2 &&
    username.length >= PROFILE_LIMITS.USERNAME_MIN &&
    usernameStatus === "available"

  const canStep3 =
    bioLen >= PROFILE_LIMITS.BIO_MIN &&
    bioLen <= PROFILE_LIMITS.BIO_MAX &&
    school.trim().length > 0 &&
    careerYear !== ""

  const canSubmit =
    categories.length >= PROFILE_LIMITS.CATEGORIES_MIN &&
    categories.length <= PROFILE_LIMITS.CATEGORIES_MAX

  // ─── Submit ───
  function handleSubmit() {
    if (!canSubmit || isSaving) return
    save(
      {
        username,
        full_name: fullName.trim(),
        avatar_url: null, // Will be set by upload
        bio: bio.trim(),
        school: school.trim(),
        career_year: careerYear,
        categories,
      },
      avatarFile
    )
  }

  // ─── Success ───
  if (saveStep === "done") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-green-600"
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
        <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido!</h2>
        <p className="mt-2 text-gray-500">
          Tu perfil está listo. Redirigiendo al dashboard...
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Completa tu perfil
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Paso {step} de 3 · Solo toma un minuto
        </p>
      </div>

      {/* Steps bar */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-gray-900" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ═══ STEP 1: Identity ═══ */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors group"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <svg
                    className="w-8 h-8 text-gray-300 group-hover:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              )}
            </button>
            <p className="text-xs text-gray-400">
              JPG, PNG o WebP · Máx {PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB
            </p>
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
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
              placeholder="Tu nombre real"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                maxLength={PROFILE_LIMITS.USERNAME_MAX}
                className="block w-full rounded-lg border border-gray-300 pl-7 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                placeholder="tu_username"
              />
              {/* Status indicator */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && (
                  <svg
                    className="w-4 h-4 text-gray-400 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {usernameStatus === "available" && (
                  <svg
                    className="w-4 h-4 text-green-500"
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
                )}
                {usernameStatus === "taken" && (
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </span>
            </div>
            {usernameStatus === "taken" && (
              <p className="mt-1 text-xs text-red-500">
                Ese usuario ya está en uso
              </p>
            )}
            {username.length > 0 &&
              username.length < PROFILE_LIMITS.USERNAME_MIN && (
                <p className="mt-1 text-xs text-gray-400">
                  Mínimo {PROFILE_LIMITS.USERNAME_MIN} caracteres
                </p>
              )}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!canStep2}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* ═══ STEP 2: About ═══ */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={PROFILE_LIMITS.BIO_MAX}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors resize-none"
              placeholder="Cuéntale a la comunidad quién eres, qué te inspira y qué tipo de diseño te apasiona..."
            />
            <p
              className={`mt-1 text-xs text-right ${
                bioLen >= PROFILE_LIMITS.BIO_MIN && bioLen <= PROFILE_LIMITS.BIO_MAX
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
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
              placeholder="Universidad de Buenos Aires, etc."
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

          {/* Nav */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canStep3}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: Categories ═══ */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿En qué te especializas?
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Elige {PROFILE_LIMITS.CATEGORIES_MIN}–
              {PROFILE_LIMITS.CATEGORIES_MAX} categorías
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
                    className={`px-4 py-2 text-sm rounded-full border transition-colors ${
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

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <div className="flex items-center gap-3">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-500">
                    {fullName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{fullName}</p>
                <p className="text-xs text-gray-500">@{username}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">{school} · {careerYear}</p>
            <p className="text-xs text-gray-500 italic line-clamp-2">
              {bio}
            </p>
          </div>

          {/* Saving state */}
          {isSaving && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
              <svg
                className="w-4 h-4 text-gray-500 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm text-gray-600">{progress}</span>
            </div>
          )}

          {/* Nav */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isSaving}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors"
            >
              ← Atrás
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSaving}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Guardando..." : "Completar perfil"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
