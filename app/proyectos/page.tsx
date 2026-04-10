import Link from "next/link"
import { Feed } from "@/components/feed/Feed"

export default function PublicProjectsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-6 md:px-10">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            Designfolio
          </Link>
          <Link
            href="https://jhonnyduque.com/proyectos/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-black/70 hover:text-black"
          >
            Volver a jhonnyduque.com
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1500px] px-6 py-10 md:px-10">
        <div className="mb-8">
          <h1 className="font-marcellus text-4xl leading-none md:text-6xl">
            Proyectos
          </h1>
          <p className="mt-3 max-w-3xl text-base text-black/65 md:text-lg">
            Explora las cards con trabajos publicados en Designfolio.
          </p>
        </div>
        <Feed />
      </section>
    </main>
  )
}
