"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const words = ["privado.", "exclusivo.", "especial.", "para ti."]

export default function Page() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 4500) // 3s visibles aprox + transición
    return () => clearInterval(interval)
  }, [])

  const works = [
    {
      id: 1,
      title: "Arte con AI",
      author: "Jhonny Duque",
      image:
        "https://oeuvimrjpftqphkhuqyg.supabase.co/storage/v1/object/public/works/570744ab-1fe0-4bbb-b0c3-d3e9b0c9f8a9/04a59139-f775-43a7-be7f-219c7bf27bc9/0-1770986537515.png"
    },
    {
      id: 2,
      title: "Perfil de Linkedin",
      author: "Fullerton Chile",
      image:
        "https://oeuvimrjpftqphkhuqyg.supabase.co/storage/v1/object/public/works/6acfb214-82f6-4f7a-bb37-8b9c72efebc4/51273fca-fca6-47cc-b311-06e33dd229a5/0-1771027589455.png"
    },
    {
      id: 3,
      title: "Creatividades",
      author: "Jhonny Duque",
      image:
        "https://oeuvimrjpftqphkhuqyg.supabase.co/storage/v1/object/public/works/570744ab-1fe0-4bbb-b0c3-d3e9b0c9f8a9/d839d516-54e7-4810-a494-35cbbaaf0b44/1-1770935977243.png"
    }
  ]

  return (
    <>
      {/* Fuente solo en esta página */}
      <link
        href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap"
        rel="stylesheet"
      />

      <main className="min-h-screen bg-black text-white">

        {/* HEADER */}
        <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
          <img
            src="https://jhonnyduque.com/wp-content/uploads/2025/05/Simbolo-Blanco-8.png"
            alt="Designfolio"
            className="h-8"
          />

          <div className="flex items-center gap-6 text-sm">
            <a
              href="/login"
              className="text-white/70 hover:text-white transition"
            >
              Iniciar sesión
            </a>

            <a
              href="mailto:jhonnydp78@gmail.com"
              className="px-6 py-2 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition"
            >
              Quiero pertenecer
            </a>
          </div>
        </header>

        {/* HERO */}
        <section className="px-6 pt-28 pb-24 text-center max-w-5xl mx-auto">

          <h1
            className="text-4xl md:text-7xl leading-tight"
            style={{ fontFamily: "Marcellus, serif" }}
          >
            Estamos construyendo algo{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={words[index]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block"
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p className="mt-8 text-white/50 text-lg max-w-2xl mx-auto">
            Un espacio donde el criterio importa más que el algoritmo.
          </p>

        </section>

        {/* GRID 3 COLUMNAS */}
        <section className="px-6 pb-32 max-w-7xl mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

            {works.map((work) => (
              <motion.div
                key={work.id}
                whileHover={{ scale: 1.02 }}
                className="group relative rounded-3xl overflow-hidden bg-neutral-900"
              >
                <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
                  <img
                    src={work.image}
                    alt={work.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />

                  <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition">

                    {/* AUTOR — protagonista */}
                    <p className="text-lg font-semibold text-white tracking-tight">
                      {work.author}
                    </p>

                    {/* TÍTULO — secundario */}
                    <h3 className="text-sm text-white/60 mt-1">
                      {work.title}
                    </h3>

                  </div>

                </div>
              </motion.div>
            ))}

          </div>

        </section>

        {/* FOOTER */}
        <footer className="text-center pb-10 text-white/30 text-xs tracking-widest uppercase">
          By invitation only
        </footer>

      </main>
    </>
  )
}
