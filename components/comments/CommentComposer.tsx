"use client"

import { useCallback, useRef, useState, type ChangeEvent } from "react"

type Props = {
  posting: boolean
  cooldownSeconds: number
  error: string | null
  onSubmit: (content: string) => Promise<boolean>
}

/** Formulario directo: comentario y publicar. */
export function CommentComposer({ posting, cooldownSeconds, error, onSubmit }: Props) {
  const [content, setContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const trimmedContent = content.trim()
  const isValid = trimmedContent.length > 0
  const isDisabled = posting || !isValid || cooldownSeconds > 0

  const resizeTextarea = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"

    const styles = window.getComputedStyle(textarea)
    const lineHeight = Number.parseFloat(styles.lineHeight)
    const paddingTop = Number.parseFloat(styles.paddingTop)
    const paddingBottom = Number.parseFloat(styles.paddingBottom)
    const borderTop = Number.parseFloat(styles.borderTopWidth)
    const borderBottom = Number.parseFloat(styles.borderBottomWidth)

    const maxHeight =
      (Number.isFinite(lineHeight) ? lineHeight : 20) * 3 +
      paddingTop +
      paddingBottom +
      borderTop +
      borderBottom

    const nextHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${nextHeight}px`
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden"
  }, [])

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
    resizeTextarea(event.target)
  }, [resizeTextarea])

  const handleSubmit = useCallback(async () => {
    if (isDisabled) return

    if (await onSubmit(trimmedContent)) {
      setContent("")
      window.requestAnimationFrame(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.style.height = "auto"
        textarea.style.overflowY = "hidden"
      })
    }
  }, [isDisabled, onSubmit, trimmedContent])

  return (
    <div className="mb-6 space-y-3">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        rows={1}
        maxLength={2000}
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
        placeholder="Escribe un comentario..."
        className="block w-full resize-none overflow-y-hidden rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-body-sm text-gray-900 outline-none placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />

      {cooldownSeconds > 0 && (
        <p className="text-meta text-amber-600">
          Espera {cooldownSeconds}s antes de publicar otro comentario.
        </p>
      )}

      {error && (
        <p role="alert" className="text-meta text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="rounded-lg bg-gray-900 px-4 py-1.5 text-action text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {posting ? "Publicando..." : cooldownSeconds > 0 ? `Espera ${cooldownSeconds}s` : "Publicar"}
        </button>
      </div>
    </div>
  )
}
