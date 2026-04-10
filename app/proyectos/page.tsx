import Image from "next/image"
import Link from "next/link"
import { Feed } from "@/components/feed/Feed"

export default function PublicProjectsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center justify-between px-6 md:px-10">
          <Link href="/" aria-label="Inicio" className="inline-flex items-center">
            <Image
              src="/brand/logo-jd.png"
              alt="Jhonny Duque"
              width={36}
              height={36}
              className="h-9 w-9"
            />
          </Link>
          <Link
            href="https://jhonnyduque.com/proyectos/"
            target="_blank"
            rel="noreferrer"
            className="brand-pill inline-flex items-center px-4 py-1.5 text-xs font-semibold text-white hover:opacity-95"
          >
            Volver a jhonnyduque.com
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1500px] px-6 py-5 md:px-10 md:py-6">
        <Feed />
      </section>
    </main>
  )
}
