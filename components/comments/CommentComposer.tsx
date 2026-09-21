"use client"

import { useCallback, useState } from "react"
import { COMMENT_CATEGORIES, COMMENT_MIN_LENGTH } from "@/types/comment"

type Props = {
  posting: boolean
  cooldownSeconds: number
  error: string | null
  onSubmit: (content: string, categories: string[]) => Promise<boolean>
}

/** Formulario directo: feedback, categoría y publicar. */
export function CommentComposer({ posting, cooldownSeconds, error, onSubmit }: Props) {
  const [content, setContent] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const contentLength = content.length
  const isValid = contentLength >= COMMENT_MIN_LENGTH && categories.length > 0
  const isDisabled = posting || !isValid || cooldownSeconds > 0

  const toggleCategory = useCallback((category: string) => {
    setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])
  }, [])

  const handleSubmit = useCallback(async () => {
    if (isDisabled) return
    if (await onSubmit(content.trim(), categories)) {
      setContent("")
      setCategories([])
    }
  }, [categories, content, isDisabled, onSubmit])

  return <div className="mb-6 space-y-3 rounded-xl bg-gray-50 p-4">
    <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} placeholder="Escribe feedback constructivo sobre esta obra. ¿Qué funciona? ¿Qué mejorarías?" className="block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-body-sm text-gray-900 outline-none placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
    <p className={`text-right text-meta ${contentLength >= COMMENT_MIN_LENGTH ? "text-green-600" : contentLength > 60 ? "text-amber-500" : "text-gray-400"}`}>{contentLength}/{COMMENT_MIN_LENGTH} mín.</p>
    <div><p className="mb-2 text-meta text-gray-500">¿Sobre qué aspectos es tu feedback? (mín. 1)</p><div className="flex flex-wrap gap-1.5">{COMMENT_CATEGORIES.map((category) => <button key={category} type="button" onClick={() => toggleCategory(category)} className={`rounded-full border px-2.5 py-1 text-action transition-colors ${categories.includes(category) ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}>{category}</button>)}</div></div>
    {!isValid && <p className="text-meta text-amber-600">Para publicar: {contentLength < COMMENT_MIN_LENGTH ? `escribe al menos ${COMMENT_MIN_LENGTH} caracteres` : ""}{contentLength < COMMENT_MIN_LENGTH && categories.length < 1 ? ", " : ""}{categories.length < 1 ? "elige mínimo 1 categoría" : ""}.</p>}
    {cooldownSeconds > 0 && <p className="text-meta text-amber-600">Espera {cooldownSeconds}s antes de publicar otro comentario.</p>}
    {error && <p role="alert" className="text-meta text-red-600">{error}</p>}
    <div className="flex justify-end"><button type="button" onClick={handleSubmit} disabled={isDisabled} className="rounded-lg bg-gray-900 px-4 py-1.5 text-action text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40">{posting ? "Publicando..." : cooldownSeconds > 0 ? `Espera ${cooldownSeconds}s` : "Publicar"}</button></div>
  </div>
}
