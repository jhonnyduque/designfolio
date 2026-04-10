import Image from "next/image"
import Link from "next/link"

const menuLinks = [
  { label: "PROYECTOS", href: "https://jhonnyduque.com/proyectos/" },
  { label: "SERVICIOS", href: "https://jhonnyduque.com/#servicios" },
  { label: "QUIENES SOMOS", href: "https://jhonnyduque.com/#quienes-somos" },
  { label: "CONTACTO", href: "https://jhonnyduque.com/#contacto" },
  { label: "BLOG", href: "https://jhonnyduque.com/blog/" },
]

const categories = [
  "Identidad Visual",
  "Diseno Grafico",
  "Ads Creativos",
  "Social Media",
  "Diseno Web",
]

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e]">
      <header className="relative z-30 mx-auto max-w-[1500px] px-6 pt-10 md:px-10">
        <div className="grid grid-cols-2 items-center gap-4 lg:grid-cols-3">
          <Link href="/" aria-label="Designfolio home" className="justify-self-start">
            <Image src="/brand/logo-jd.png" alt="Jhonny Duque" width={80} height={80} priority />
          </Link>

          <nav className="col-span-2 mt-2 flex items-center justify-center gap-1 px-3 py-2 brand-pill lg:col-span-1 lg:mt-0">
            {menuLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide text-white/95 md:text-xs"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center justify-self-end gap-3 lg:flex">
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-2xl font-semibold hover:bg-black/10"
            >
              f
            </Link>
            <Link
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="text-5xl font-extrabold leading-none hover:opacity-75"
            >
              t
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border-[3px] border-black px-2.5 py-0.5 text-4xl font-bold leading-none hover:opacity-75"
            >
              ig
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 pb-12 pt-16 md:px-10 md:pt-24">
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="pointer-events-none absolute left-1/2 top-[38%] h-[230px] w-[540px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(244,170,124,0.35),rgba(182,222,137,0.28),transparent_65%)] blur-2xl" />
          <h1 className="font-marcellus relative text-5xl leading-[0.98] tracking-tight md:text-7xl lg:text-[112px]">
            Proyectos de Marketing
            <br />
            Digital - Jhonny Duque
          </h1>
          <p className="mx-auto mt-10 max-w-4xl text-lg font-medium uppercase tracking-wide text-[#34343a] md:text-[42px] md:leading-tight md:normal-case md:font-marcellus">
            DISENO WEB / POSICIONAMIENTO ORGANICO / SOCIAL ADS / BRANDING
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/proyectos" className="group inline-flex items-center gap-4 rounded-full bg-[#1d1d21] px-11 py-5 text-2xl font-semibold text-white">
              Ver proyectos
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition group-hover:scale-105">
                ✦
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section
        id="proyectos"
        className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[1.1fr_1.5fr] md:px-10"
      >
        <div className="rounded-3xl border border-black/10 bg-white p-8 md:p-12">
          <h2 className="font-marcellus text-5xl leading-none md:text-7xl">
            Mis Proyectos
          </h2>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-[#5d5d63]">
            Diseno que conecta marcas con personas. Desde identidad visual hasta
            campanas digitales.
          </p>
          <div className="mt-10">
            <Link
              href="#destacados"
              className="brand-cta inline-block px-10 py-4 text-xl font-semibold"
            >
              Ver proyectos
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-0 overflow-hidden rounded-3xl border border-black/10 bg-white">
          {categories.map((category, index) => (
            <button
              key={category}
              type="button"
              className={`group relative min-h-[360px] border-r border-black/10 px-3 py-8 text-left transition hover:bg-black/5 ${index === categories.length - 1 ? "border-r-0" : ""}`}
            >
              <span className="block text-2xl leading-none text-black/55">^</span>
              <span className="mt-3 block [writing-mode:vertical-rl] text-3xl font-semibold leading-none tracking-tight md:text-6xl">
                {category}
              </span>
              <span className="absolute bottom-0 left-0 h-[4px] w-full origin-left scale-x-0 bg-black transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          ))}
        </div>
      </section>

      <section id="destacados" className="mx-auto max-w-[1500px] px-6 pb-24 pt-8 md:px-10">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center md:p-12">
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#5d5d63] md:text-2xl">
            Este espacio es la extension interactiva de tu web principal. La experiencia, tono y
            navegacion fueron alineados para que ambas paginas se sientan una sola marca.
          </p>
          <div className="mt-8">
            <Link
              href="https://jhonnyduque.com/proyectos/"
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full border border-black/15 px-8 py-4 text-lg font-semibold hover:bg-black/5"
            >
              Volver a jhonnyduque.com
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
