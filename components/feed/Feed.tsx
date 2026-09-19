// components/feed/Feed.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { useFeed } from "@/hooks/useFeed"
import { SortSelector } from "./SortSelector"
import { MosaicCell } from "./MosaicCell"
import { FeedPost } from "./FeedPost"

/**
 * El feed tiene dos formas, y las decide el ancho de la pantalla:
 *
 *   ≥768px · rejilla de tres columnas en 1080×1350, encajonada en 935px.
 *            Es la pantalla de explorar: muchas piezas de un vistazo.
 *   <768px · feed vertical a sangre, una publicación a la vez. Es lo que
 *            funciona con el teléfono en la mano.
 *
 * El reparto va con `md:` de Tailwind, no con JavaScript: así no hay salto
 * entre lo que pinta el servidor y lo que ve el navegador, ni un parpadeo
 * mientras se decide cuál toca.
 */
function Skeleton() {
  return <div className="aspect-[1080/1350] animate-pulse bg-gray-200" />
}

export function Feed() {
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    sortBy,
    setSortBy,
    search,
    setSearch,
    loadMore,
    refresh,
  } = useFeed()

  const centinela = useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when opening search on mobile
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  /**
   * Carga la página siguiente cuando el final del listado asoma.
   *
   * El margen de 600px la pide antes de que el usuario toque fondo, para que
   * las obras nuevas ya estén ahí cuando llegue. `loadMore` ignora las
   * llamadas mientras hay una en curso, así que no hace falta más guardia.
   */
  useEffect(() => {
    const diana = centinela.current
    if (!diana || !hasMore) return

    const observador = new IntersectionObserver(
      ([entrada]) => { if (entrada.isIntersecting) loadMore() },
      { rootMargin: "600px 0px" },
    )
    observador.observe(diana)
    return () => observador.disconnect()
  }, [hasMore, loadMore])

  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value)
    }, 350)
  }

  function handleClearSearch() {
    setSearchInput("")
    setSearch("")
    setSearchOpen(false)
  }

  return (
    <section>
      {/* Header */}
      <div className="mb-5 mx-auto w-full max-w-[935px] flex flex-col gap-4">
        {/* Title */}
        <h2 className="font-marcellus text-3xl leading-none text-[#1e1e1e] md:text-4xl">
          Proyectos
        </h2>

        {/* Tabs and Actions Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Tabs */}
          <div className={`items-center gap-4 sm:gap-6 ${searchOpen || search ? 'hidden sm:flex' : 'flex'}`}>
            <button className="text-[15px] font-medium text-[#1e1e1e] border-b-2 border-black pb-2">
              Para ti
            </button>
            <button className="text-[15px] font-medium text-[#8c8c95] hover:text-[#1e1e1e] pb-2 transition-colors border-b-2 border-transparent">
              Siguiendo
            </button>
          </div>

          {/* Actions (Search + Sort) */}
          <div className={`flex items-center gap-1 h-[40px] ${searchOpen || search ? 'w-full sm:w-auto' : ''}`}>
            {/* Collapsed Search Icon */}
            {!searchOpen && !search && (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-[#1e1e1e] hover:bg-black/5 transition-colors shrink-0 [.menu-open_&]:invisible"
                aria-label="Buscar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            )}

            {/* Expanded Search bar */}
            {(searchOpen || search) && (
              <div className="flex w-full sm:w-auto items-center relative animate-in fade-in slide-in-from-right-4 duration-200">
                <svg className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onBlur={() => { if (!searchInput) setSearchOpen(false) }}
                  placeholder="Buscar proyectos..."
                  className="w-full sm:w-[260px] pl-9 pr-8 py-2 text-sm font-medium bg-white border border-black/10 rounded-full text-[#2a2a30] placeholder:text-[#8c8c95] focus:border-black/25 focus:ring-0 outline-none transition-all"
                />
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Sort dropdown */}
            <div className={`${searchOpen || search ? 'hidden sm:block' : 'block'}`}>
              <SortSelector current={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>

        {/* Active search indicator */}
        {search && (
          <button
            onClick={handleClearSearch}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            Resultados para &ldquo;{search}&rdquo;
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Carga inicial: la rejilla solo a partir de tablet, como el contenido */}
      {loading && items.length === 0 && (
        <div className="mx-auto hidden w-full max-w-[935px] grid-cols-3 gap-1 md:grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <>
          {/* Ordenador y tablet: rejilla de tres, encajonada en 935px */}
          <div className="mx-auto hidden w-full max-w-[935px] grid-cols-3 gap-1 md:grid">
            {items.map((item) => (
              <MosaicCell key={item.id} item={item} />
            ))}
          </div>

          {/* Móvil: feed vertical a sangre. El margen negativo cancela el
              padding lateral de la página para que la foto llegue al borde. */}
          <div className="-mx-6 flex flex-col gap-5 md:hidden">
            {items.map((item) => (
              <FeedPost key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Aún no hay proyectos publicados</p>
          <p className="text-gray-400 text-sm mt-1">
            Sé el primero en compartir tu trabajo con la comunidad.
          </p>
        </div>
      )}

      {/* Se carga solo al llegar abajo. El centinela es invisible: quien se
          desplaza ya está pidiendo más, no hace falta que además lo pulse.
          Como el catálogo es finito, se llega al final y el pie queda
          alcanzable —que es lo que rompería un scroll verdaderamente infinito. */}
      {hasMore && items.length > 0 && (
        <>
          <div ref={centinela} aria-hidden="true" className="h-px" />
          <div className="flex h-16 items-center justify-center" role="status" aria-live="polite">
            {loadingMore && (
              <svg className="h-5 w-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <span className="sr-only">{loadingMore ? "Cargando más proyectos" : ""}</span>
          </div>
        </>
      )}

    </section>
  )
}
