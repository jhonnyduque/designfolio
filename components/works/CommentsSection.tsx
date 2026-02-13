// components/works/CommentsSection.tsx
"use client"

import { useState, useCallback } from "react"
import { useComments } from "@/hooks/useComments"
import { COMMENT_CATEGORIES, COMMENT_MIN_LENGTH } from "@/types/comment"

interface CommentsSectionProps {
  workId: string
  initialCount: number
}

export function CommentsSection({ workId, initialCount }: CommentsSectionProps) {
  const { comments, loading, posting, error, post } = useComments(workId)
  const [content, setContent] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)

  const contentLen = content.length
  const isValid = contentLen >= COMMENT_MIN_LENGTH && categories.length >= 1

  const toggleCategory = useCallback((cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }, [])

  async function handleSubmit() {
    if (!isValid || posting) return
    const success = await post(content.trim(), categories)
    if (success) {
      setContent("")
      setCategories([])
      setShowForm(false)
    }
  }

  function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Ahora"
    if (mins < 60) return `${mins}min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900">
          Comentarios{" "}
          <span className="text-gray-400 font-normal text-sm">
            ({comments.length || initialCount})
          </span>
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3.5 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Comentar
          </button>
        )}
      </div>

      {/* Compose form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Escribe feedback constructivo sobre esta obra. ¿Qué funciona? ¿Qué mejorarías? (mín. 100 caracteres)"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none bg-white"
          />
          <p
            className={`text-xs text-right ${
              contentLen >= COMMENT_MIN_LENGTH
                ? "text-green-600"
                : contentLen > 60
                  ? "text-amber-500"
                  : "text-gray-400"
            }`}
          >
            {contentLen}/{COMMENT_MIN_LENGTH} mín.
          </p>

          {/* Category chips */}
          <div>
            <p className="text-xs text-gray-500 mb-2">
              ¿Sobre qué aspectos es tu feedback? (mín. 1)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    categories.includes(cat)
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowForm(false)
                setContent("")
                setCategories([])
              }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || posting}
              className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-gray-100 rounded" />
                <div className="h-3 w-full bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments list */}
      {!loading && comments.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          Aún no hay comentarios. Sé el primero en dar feedback.
        </p>
      )}

      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {/* Avatar */}
            {comment.author_avatar_url ? (
              <img
                src={comment.author_avatar_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gray-500">
                  {comment.author_full_name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.author_full_name}
                </span>
                <span className="text-xs text-gray-400">
                  {getTimeAgo(comment.created_at)}
                </span>
                {!comment.is_valid && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">
                    Breve
                  </span>
                )}
              </div>

              {/* Categories */}
              <div className="flex gap-1 mt-1">
                {comment.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Content */}
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
