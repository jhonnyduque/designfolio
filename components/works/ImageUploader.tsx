// components/works/ImageUploader.tsx
"use client"

import { useCallback, useRef } from "react"
import { WORK_LIMITS } from "@/types/work"

interface ImageUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function ImageUploader({ files, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      const accepted = Array.from(newFiles).filter(
        (f) =>
          validTypes.includes(f.type) &&
          f.size <= WORK_LIMITS.IMAGE_MAX_SIZE_BYTES
      )
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

  const canAdd = files.length < WORK_LIMITS.IMAGES_MAX

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
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              Arrastra imágenes aquí
            </span>{" "}
            o haz click para seleccionar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WebP o GIF · Máximo {WORK_LIMITS.IMAGE_MAX_SIZE_MB}MB ·
            Hasta {WORK_LIMITS.IMAGES_MAX} imágenes
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${file.size}-${i}`}
              className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${i + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay con controles */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {/* Mover izquierda */}
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, i - 1)}
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white"
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
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white"
                    title="Mover después"
                  >
                    →
                  </button>
                )}
                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center text-white hover:bg-red-500"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>

              {/* Order badge */}
              {i === 0 && (
                <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/90 text-gray-700 px-1.5 py-0.5 rounded">
                  Portada
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter */}
      {files.length > 0 && (
        <p className="text-xs text-gray-400">
          {files.length} de {WORK_LIMITS.IMAGES_MAX} imágenes
          {files.length < WORK_LIMITS.IMAGES_MIN &&
            ` · Mínimo ${WORK_LIMITS.IMAGES_MIN}`}
        </p>
      )}
    </div>
  )
}
