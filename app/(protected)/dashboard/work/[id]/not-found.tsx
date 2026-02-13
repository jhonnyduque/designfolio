// app/(protected)/dashboard/work/[id]/not-found.tsx
import Link from "next/link"

export default function WorkNotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-7 h-7 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900">Obra no encontrada</h2>
      <p className="mt-2 text-sm text-gray-500">
        Esta obra no existe o no está disponible.
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
