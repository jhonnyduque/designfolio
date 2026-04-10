import Image from "next/image"
import Link from "next/link"
import { Feed } from "@/components/feed/Feed"

export default function PublicProjectsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-6 md:px-10">
          <Link href="/" aria-label="Inicio" className="inline-flex items-center">
            <Image
              src="/favicon.ico"
              alt="Jhonny Duque"
              width={44}
              height={44}
              className="h-11 w-11 rounded-sm"
            />
          </Link>
          <Link
            href="https://jhonnyduque.com/proyectos/"
            target="_blank"
            rel="noreferrer"
            className="brand-pill inline-flex items-center px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Volver a jhonnyduque.com
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1500px] px-6 py-7 md:px-10 md:py-8">
        <div className="mb-5">
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
