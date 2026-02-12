// components/works/CreateWorkForm.tsx
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ImageUploader } from "./ImageUploader"
import { useCreateWork } from "@/hooks/useCreateWork"
import { WORK_CATEGORIES, WORK_LIMITS } from "@/types/work"

type Step = "images" | "details" | "preview"

export function CreateWorkForm() {
  // Form state
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [step, setStep] = useState<Step>("images")

  // Publish hook
  const { publish, step: publishStep, progress, error, reset } = useCreateWork()

  // Derived
  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, WORK_LIMITS.TAGS_MAX),
    [tagsInput]
  )
  const descriptionLen = description.length
  const canGoToDetails = files.length >= WORK_LIMITS.IMAGES_MIN
  const canGoToPreview =
    title.trim().length >= WORK_LIMITS.TITLE_MIN &&
    title.trim().length <= WORK_LIMITS.TITLE_MAX &&
    descriptionLen >= WORK_LIMITS.DESCRIPTION_MIN &&
    category !== ""
  const isPublishing = publishStep !== "idle" && publishStep !== "error"

  // Handlers
  function handlePublish() {
    if (!canGoToPreview || isPublishing) return
    publish(files, {
      title: title.trim(),
      description: description.trim(),
      category,
      tags,
    })
  }

  // ─── Publishing overlay ─────────────────────────────
  if (publishStep === "done") {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">¡Obra enviada!</h2>
        <p className="mt-2 text-gray-500">
          Tu obra fue enviada a revisión. Aparecerá en el feed una vez aprobada.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Volver al feed
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Volver al feed
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Nueva Obra</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comparte tu trabajo con la comunidad.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-8">
        {(["images", "details", "preview"] as Step[]).map((s, i) => {
          const labels = ["Imágenes", "Detalles", "Vista previa"]
          const isCurrent = step === s
          const isPast =
            (s === "images" && (step === "details" || step === "preview")) ||
            (s === "details" && step === "preview")
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (isPast) setStep(s)
              }}
              disabled={!isPast && !isCurrent}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isCurrent
                  ? "text-gray-900"
                  : isPast
                    ? "text-gray-500 hover:text-gray-700 cursor-pointer"
                    : "text-gray-300 cursor-default"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  isCurrent
                    ? "bg-gray-900 text-white"
                    : isPast
                      ? "bg-gray-200 text-gray-600"
                      : "bg-gray-100 text-gray-300"
                }`}
              >
                {isPast ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{labels[i]}</span>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={reset}
            className="mt-1 text-sm font-medium text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ═══ STEP 1: Images ═══ */}
      {step === "images" && (
        <div>
          <ImageUploader files={files} onChange={setFiles} />
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => setStep("details")}
              disabled={!canGoToDetails}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente: Detalles
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: Details ═══ */}
      {step === "details" && (
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={WORK_LIMITS.TITLE_MAX}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
              placeholder="Dale un nombre a tu obra"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {title.length}/{WORK_LIMITS.TITLE_MAX}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors resize-none"
              placeholder="Describe tu proceso, concepto y decisiones de diseño. Mínimo 120 caracteres."
            />
            <p
              className={`mt-1 text-xs text-right ${
                descriptionLen >= WORK_LIMITS.DESCRIPTION_MIN
                  ? "text-green-600"
                  : descriptionLen > 80
                    ? "text-amber-500"
                    : "text-gray-400"
              }`}
            >
              {descriptionLen}/{WORK_LIMITS.DESCRIPTION_MIN} caracteres mínimos
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {WORK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    category === cat
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
              placeholder="minimalismo, branding, logotipo (separados por coma)"
            />
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep("images")}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Imágenes
            </button>
            <button
              type="button"
              onClick={() => setStep("preview")}
              disabled={!canGoToPreview}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Vista previa
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: Preview ═══ */}
      {step === "preview" && (
        <div>
          {/* Preview card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Main image */}
            {files[0] && (
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={URL.createObjectURL(files[0])}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Additional images */}
            {files.length > 1 && (
              <div className="flex gap-1 p-1">
                {files.slice(1).map((f, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0"
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt={`Extra ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="p-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {category}
              </span>
              <h2 className="mt-1 text-xl font-bold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              Tu obra será enviada a revisión antes de aparecer en el feed.
              Recibirás una notificación cuando sea aprobada.
            </p>
          </div>

          {/* Publishing state */}
          {isPublishing && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
              <svg
                className="w-5 h-5 text-gray-500 animate-spin"
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
              <span className="text-sm text-gray-600 font-medium">
                {progress}
              </span>
            </div>
          )}

          {/* Nav */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => setStep("details")}
              disabled={isPublishing}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors"
            >
              ← Editar
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPublishing ? "Publicando..." : "Publicar obra"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
