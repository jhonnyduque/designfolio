// components/works/CreateWorkForm.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ImageUploader } from "./ImageUploader"
import { VideoPosterPicker } from "./VideoPosterPicker"
import { TaxonomySelector } from "./TaxonomySelector"
import { useCreateWorkMySql } from "@/hooks/useCreateWorkMySql"
import { useTaxonomy } from "@/hooks/useTaxonomy"
import { WORK_LIMITS } from "@/types/work"
import { normalizeSlug, slugifyProjectTitle } from "@/lib/slug"
import { mediaAspectRatio } from "@/lib/media-aspect"

type PreviewItem = { file: File; url: string; posterUrl?: string }

function PublishPreviewMedia({ item }: { item: PreviewItem }) {
  const isVideo = item.file.type.startsWith("video/")
  const [videoAspectRatio, setVideoAspectRatio] = useState("9 / 16")

  if (!isVideo) {
    return (
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <img src={item.url} alt="Vista previa" className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div className="bg-gray-900 overflow-hidden" style={{ aspectRatio: videoAspectRatio }}>
      <video
        src={item.url}
        poster={item.posterUrl}
        className="block h-full w-full object-contain"
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          setVideoAspectRatio(mediaAspectRatio(event.currentTarget.videoWidth, event.currentTarget.videoHeight))
        }}
      />
    </div>
  )
}

export function CreateWorkForm() {
  const [files, setFiles] = useState<File[]>([])
  const [posterFiles, setPosterFiles] = useState<Map<File, File>>(new Map())
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [slugCheckMessage, setSlugCheckMessage] = useState("")
  const [description, setDescription] = useState("")

  const {
    categories,
    selectedCategory,
    loading: taxonomyLoading,
    error: taxonomyError,
    selectCategory,
  } = useTaxonomy()

  const { publish, step: publishStep, progress, error, wasAutoApproved, reset } = useCreateWorkMySql()

  const descriptionLen = description.length
  const normalizedSlug = normalizeSlug(slug)
  const finalSlugPreview = normalizedSlug || slugifyProjectTitle(title)
  const allVideoPostersReady = files.filter((file) => file.type.startsWith("video/")).every((file) => posterFiles.has(file))
  const canPublish =
    files.length >= WORK_LIMITS.IMAGES_MIN &&
    allVideoPostersReady &&
    title.trim().length >= WORK_LIMITS.TITLE_MIN &&
    title.trim().length <= WORK_LIMITS.TITLE_MAX &&
    descriptionLen >= WORK_LIMITS.DESCRIPTION_MIN &&
    selectedCategory !== "" &&
    slugStatus !== "taken"
  const isPublishing = publishStep !== "idle" && publishStep !== "error"

  async function handlePublish() {
    if (!canPublish || isPublishing) return

    await publish(files, {
      title: title.trim(),
      slug: normalizedSlug,
      description: description.trim(),
      category: selectedCategory,
      tags: [],
    }, posterFiles)
  }

  const previewUrls = useMemo(
    () => files.map((file) => {
      const poster = posterFiles.get(file)
      return {
        file,
        url: URL.createObjectURL(file),
        posterUrl: poster ? URL.createObjectURL(poster) : undefined,
      }
    }),
    [files, posterFiles]
  )

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => {
        URL.revokeObjectURL(item.url)
        if (item.posterUrl) URL.revokeObjectURL(item.posterUrl)
      })
    }
  }, [previewUrls])

  useEffect(() => {
    let isCancelled = false
    const candidate = normalizedSlug || slugifyProjectTitle(title)

    if (!candidate) {
      return
    }

    const timeout = setTimeout(async () => {
      setSlugStatus("checking")
      setSlugCheckMessage("Comprobando disponibilidad del slug...")
      try {
        const response = await fetch(`/api/works/slug?value=${encodeURIComponent(candidate)}`)
        const data = await response.json() as { available?: boolean; error?: string }
        if (isCancelled) return
        if (!response.ok) {
          setSlugStatus("idle")
          setSlugCheckMessage(data.error ?? "No se pudo validar el slug en este momento.")
          return
        }
        if (!data.available) {
          setSlugStatus("taken")
          setSlugCheckMessage("Este slug ya existe. Elige otro.")
        } else {
          setSlugStatus("available")
          setSlugCheckMessage("Slug disponible.")
        }
      } catch {
        if (isCancelled) return
        setSlugStatus("idle")
        setSlugCheckMessage("No se pudo validar el slug en este momento.")
      }
    }, 350)

    return () => {
      isCancelled = true
      clearTimeout(timeout)
    }
  }, [normalizedSlug, title])

  if (publishStep === "done") {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-page-title text-gray-900">
          {wasAutoApproved ? "¡Proyecto publicado!" : "¡Proyecto enviado!"}
        </h2>
        <p className="mt-2 text-gray-500">
          {wasAutoApproved
            ? "Tu proyecto ya está visible en el feed."
            : "Revisamos la primera publicación de cada cuenta. En cuanto la aprobemos, las siguientes se publicarán al instante."}
        </p>
        <Link href="/dashboard" className="mt-6 inline-block px-5 py-2.5 bg-gray-900 text-white text-action rounded-lg hover:bg-gray-800 transition-colors">
          Volver al feed
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-action text-gray-500 hover:text-gray-700 transition-colors">← Volver al feed</Link>
        <h1 className="mt-3 text-page-title text-gray-900">Nueva publicación</h1>
        <p className="mt-1 text-body-sm text-gray-500">Comparte tu proyecto con la comunidad.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-body-sm text-red-700 whitespace-pre-line">{error}</p>
          <button onClick={reset} className="mt-1 text-action text-red-600 hover:text-red-800 underline">Reintentar</button>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <ImageUploader files={files} onChange={(nextFiles) => {
            setFiles(nextFiles)
            setPosterFiles((current) => new Map([...current].filter(([file]) => nextFiles.includes(file))))
          }} />
          {files.filter((file) => file.type.startsWith("video/")).length > 0 && (
            <div className="mt-5 space-y-3">
              {files.filter((file) => file.type.startsWith("video/")).map((file) => (
                <VideoPosterPicker
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  file={file}
                  selected={posterFiles.get(file)}
                  onSelect={(poster) => setPosterFiles((current) => new Map(current).set(file, poster))}
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-label text-gray-700">Título</label>
            <input type="text" value={title} onChange={(e) => {
              const nextTitle = e.target.value
              setTitle(nextTitle)
              if (!slugTouched) setSlug(normalizeSlug(nextTitle))
            }} maxLength={WORK_LIMITS.TITLE_MAX}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
              placeholder="Dale un nombre a tu proyecto" />
            <p className="mt-1 text-meta text-gray-400 text-right">{title.length}/{WORK_LIMITS.TITLE_MAX}</p>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-label text-gray-700">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(normalizeSlug(e.target.value))
              }}
              maxLength={120}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
              placeholder="mi-proyecto"
            />
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-meta text-gray-500 break-all">
                URL final: <span className="font-medium text-gray-700">designfolio.jhonnyduque.com/proyectos/{finalSlugPreview}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(false)
                  setSlug(normalizeSlug(title))
                }}
                className="text-action text-gray-600 hover:text-gray-900"
              >
                Regenerar
              </button>
            </div>
            {slugCheckMessage && (
              <p
                className={`mt-1 text-meta ${ slugStatus === "taken" ? "text-red-600" : slugStatus === "available" ? "text-green-600" : "text-gray-500" }`}
              >
                {slugCheckMessage}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-label text-gray-700">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-body-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors resize-none"
              placeholder={`Describe tu proceso, concepto y decisiones de diseño. Mínimo ${WORK_LIMITS.DESCRIPTION_MIN} caracteres.`} />
            <p className={`mt-1 text-meta text-right ${descriptionLen >= WORK_LIMITS.DESCRIPTION_MIN ? "text-green-600" : descriptionLen > 80 ? "text-amber-500" : "text-gray-400"}`}>
              {descriptionLen}/{WORK_LIMITS.DESCRIPTION_MIN} caracteres mínimos
            </p>
          </div>

          {/* Category — single select pills from DB */}
          <TaxonomySelector
            label="Categoría"
            items={categories}
            selected={selectedCategory}
            mode="single"
            loading={taxonomyLoading}
            onSelect={selectCategory}
          />

          {taxonomyError && (
            <p className="text-body-sm text-red-600">
              Error cargando categorías: {taxonomyError}
            </p>
          )}

        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {previewUrls[0] && (
              <PublishPreviewMedia key={previewUrls[0].url} item={previewUrls[0]} />
            )}
            {previewUrls.length > 1 && (
              <div className="flex gap-1 p-1">
                {previewUrls.slice(1).map((item, i) => (
                  <div key={i} className="w-20 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.file.type.startsWith("video/") ? (
                      <video
                        src={item.url}
                        poster={item.posterUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img src={item.url} alt={`Extra ${i + 2}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="p-5">
              <span className="text-meta font-semibold uppercase tracking-wider text-gray-400">{selectedCategory}</span>
              <h2 className="mt-1 text-section text-gray-900">{title}</h2>
              <p className="mt-2 text-body-sm text-gray-600 whitespace-pre-wrap">{description}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-body-sm text-amber-700">
              Si es tu primera publicación, pasará por una revisión rápida. A partir de la segunda se publican directamente.
            </p>
          </div>

          {isPublishing && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-body-sm text-gray-600 font-medium">{progress}</span>
            </div>
          )}

          <div className="flex justify-end pt-6">
            <button type="button" onClick={handlePublish} disabled={isPublishing || !canPublish}
              className="px-6 py-2.5 bg-gray-900 text-white text-action rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isPublishing ? "Publicando..." : "Publicar proyecto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
