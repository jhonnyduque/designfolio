// components/works/ImageUploader.tsx
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { WORK_LIMITS } from "@/types/work"

interface ImageUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
}

const ACCEPTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]

function shortFileName(name: string) {
  if (name.length <= 25) return name
  const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")) : ""
  return `${name.slice(0, 20)}...${extension}`
}

function getFileValidationError(file: File) {
  const name = shortFileName(file.name)
  if (!ACCEPTED_MEDIA_TYPES.includes(file.type)) {
    return `"${name}" no tiene un formato válido.`
  }
  const isVideo = file.type.startsWith("video/")
  const maxSize = isVideo ? WORK_LIMITS.VIDEO_MAX_SIZE_BYTES : WORK_LIMITS.IMAGE_MAX_SIZE_BYTES
  if (file.size > maxSize) {
    const maxMB = isVideo ? WORK_LIMITS.VIDEO_MAX_SIZE_MB : WORK_LIMITS.IMAGE_MAX_SIZE_MB
    return `"${name}" es muy pesado (máximo ${maxMB}MB).`
  }
  return null
}

export function ImageUploader({ files, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const replacementInputRef = useRef<HTMLInputElement>(null)
  const replacementIndexRef = useRef<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return
      const errors: string[] = []
      const accepted = Array.from(newFiles).filter((f) => {
        const error = getFileValidationError(f)
        if (error) errors.push(error)
        return !error
      })

      if (files.length + accepted.length > WORK_LIMITS.IMAGES_MAX) {
        errors.push(`Solo puedes mostrar hasta ${WORK_LIMITS.IMAGES_MAX} archivos.`)
      }

      setValidationErrors(errors)
      const combined = [...files, ...accepted].slice(0, WORK_LIMITS.IMAGES_MAX)
      onChange(combined)
    },
    [files, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeFile = useCallback(
    (index: number) => {
      onChange(files.filter((_, i) => i !== index))
    },
    [files, onChange]
  )

  const moveFile = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= files.length) return
      const updated = [...files]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      onChange(updated)
    },
    [files, onChange]
  )

  const openReplacement = useCallback((index: number) => {
    replacementIndexRef.current = index
    replacementInputRef.current?.click()
  }, [])

  const replaceFile = useCallback(
    (newFiles: FileList | null) => {
      const index = replacementIndexRef.current
      replacementIndexRef.current = null
      if (index === null || !newFiles?.[0]) return

      const replacement = newFiles[0]
      const error = getFileValidationError(replacement)
      if (error) {
        setValidationErrors([error])
        return
      }

      const updated = [...files]
      updated[index] = replacement
      setValidationErrors([])
      onChange(updated)
    },
    [files, onChange]
  )

  const canAdd = files.length < WORK_LIMITS.IMAGES_MAX
  const previewUrls = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  )

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [previewUrls])

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {canAdd && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50/50 transition-colors"
        >
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
            />
          </svg>
          <p className="text-body-sm text-gray-500">
            <span className="font-medium text-gray-700">
              Arrastra imágenes o videos aquí
            </span>{" "}
            o haz click para seleccionar
          </p>
          <p className="text-meta text-gray-400 mt-1">
            JPG, PNG, WebP, GIF, MP4, WebM, MOV · Imágenes máx {WORK_LIMITS.IMAGE_MAX_SIZE_MB}MB · Videos máx {WORK_LIMITS.VIDEO_MAX_SIZE_MB}MB ·
            Hasta {WORK_LIMITS.IMAGES_MAX} archivos
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      <input
        ref={replacementInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        onChange={(event) => {
          replaceFile(event.target.files)
          event.currentTarget.value = ""
        }}
        className="hidden"
      />

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previewUrls.map((item, i) => (
            <div
              key={`${item.file.name}-${item.file.size}-${i}`}
              className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={item.url}
                alt={`Preview ${i + 1}`}
                className={`w-full h-full ${item.file.type.startsWith("video/") ? "hidden" : "object-contain"}`}
              />
              {item.file.type.startsWith("video/") && (
                <video
                  src={item.url}
                  className="w-full h-full object-contain"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}

              {/* En móvil no existe hover: los controles permanecen visibles y
                  en escritorio aparecen al pasar el cursor para no tapar la portada. */}
              <div className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                {/* Mover izquierda */}
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, i - 1)}
                    aria-label="Mover antes"
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-gray-700 shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
                    title="Mover antes"
                  >
                    ←
                  </button>
                )}
                {/* Mover derecha */}
                {i < files.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, i + 1)}
                    aria-label="Mover después"
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-gray-700 shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
                    title="Mover después"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openReplacement(i)}
                  aria-label={`Reemplazar archivo ${i + 1}`}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-gray-700 shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
                  title="Reemplazar"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 11a8 8 0 0 0-14.8-4M4 7V3m0 4h4M4 13a8 8 0 0 0 14.8 4M20 17v4m0-4h-4" />
                  </svg>
                </button>
                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Eliminar archivo ${i + 1}`}
                  className="grid h-8 w-8 place-items-center rounded-full bg-red-500/90 text-white shadow-sm transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  title="Eliminar"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13" />
                  </svg>
                </button>
              </div>

              {/* Order badge */}
              {i === 0 && (
                <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/90 text-gray-700 px-1.5 py-0.5 rounded">
                  Portada
                </span>
              )}
              {item.file.type.startsWith("video/") && (
                <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/70 text-white px-1.5 py-0.5 rounded">
                  Video
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter */}
      {files.length > 0 && (
        <p className="text-meta text-gray-400">
          {files.length} de {WORK_LIMITS.IMAGES_MAX} archivos
          {files.length < WORK_LIMITS.IMAGES_MIN &&
            ` · Mínimo ${WORK_LIMITS.IMAGES_MIN}`}
        </p>
      )}

      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-meta font-semibold text-amber-700">
            Algunos archivos no se añadieron:
          </p>
          <ul className="mt-1 space-y-1">
            {validationErrors.slice(0, 4).map((msg, index) => (
              <li key={`${msg}-${index}`} className="text-meta text-amber-700">
                - {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
