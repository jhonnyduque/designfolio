// app/(marketing)/page.tsx
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 sm:px-8 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight text-gray-900">
          Design<span className="text-gray-400">folio</span>
        </span>
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Unirme a la beta
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full mb-6">
            Beta cerrada · Solo por invitación
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            Donde tu trabajo
            <br />
            <span className="text-gray-400">habla por ti.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg">
            La comunidad de portafolio para diseñadores emergentes que valora la
            calidad, el feedback profesional y el crecimiento real.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors text-center"
            >
              Solicitar acceso
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-white transition-colors text-center"
            >
              Ya tengo invitación
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Curaduría humana</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Cada obra es revisada antes de publicarse. Solo se muestra trabajo
              de calidad. Tu portafolio está en buena compañía.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Feedback estructurado</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              No likes vacíos. Comentarios con categorías de feedback real:
              concepto, ejecución, tipografía, color, composición.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Reputación real</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Tu reputación crece con la calidad de tu trabajo y tus aportes a
              la comunidad. No con seguidores comprados.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 border-t border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          ¿Cómo funciona?
        </h2>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-4 gap-8 text-center">
          <div>
            <div className="w-10 h-10 bg-gray-100 text-gray-900 font-bold rounded-full flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h4 className="mt-3 font-semibold text-gray-900">Recibe tu invitación</h4>
            <p className="mt-1 text-sm text-gray-500">
              Alguien de la comunidad te invita con un código único.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-gray-100 text-gray-900 font-bold rounded-full flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h4 className="mt-3 font-semibold text-gray-900">Crea tu perfil</h4>
            <p className="mt-1 text-sm text-gray-500">
              Cuéntale a la comunidad quién eres, qué haces y dónde estudias.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-gray-100 text-gray-900 font-bold rounded-full flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h4 className="mt-3 font-semibold text-gray-900">Sube tu trabajo</h4>
            <p className="mt-1 text-sm text-gray-500">
              Publica tus mejores piezas. Un moderador las revisa antes de
              aparecer en el feed.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 bg-gray-100 text-gray-900 font-bold rounded-full flex items-center justify-center mx-auto text-sm">
              4
            </div>
            <h4 className="mt-3 font-semibold text-gray-900">Crece con feedback</h4>
            <p className="mt-1 text-sm text-gray-500">
              Recibe comentarios constructivos y construye tu reputación como
              diseñador.
            </p>
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Para diseñadores que van en serio
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Estudiantes de diseño gráfico, comunicación visual, publicidad y
            carreras creativas en Latinoamérica. Si estás construyendo tu
            portafolio y quieres que tu trabajo sea visto por personas que
            entienden de diseño, este es tu lugar.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Solicitar acceso a la beta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-400">
            © 2026 Designfolio. Beta cerrada.
          </span>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>Hecho para diseñadores emergentes</span>
          </div>
        </div>
      </footer>
    </div>
  )
}