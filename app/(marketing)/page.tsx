"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const words = ["selecto.", "exclusivo.", "con criterio.", "para creadores."];

const heroImages = [
  "https://oeuvimrjpftqphkhuqyg.supabase.co/storage/v1/object/public/works/570744ab-1fe0-4bbb-b0c3-d3e9b0c9f8a9/04a59139-f775-43a7-be7f-219c7bf27bc9/0-1770986537515.png",
  "https://oeuvimrjpftqphkhuqyg.supabase.co/storage/v1/object/public/works/6acfb214-82f6-4f7a-bb37-8b9c72efebc4/51273fca-fca6-47cc-b311-06e33dd229a5/0-1771027589455.png",
  "https://oeuvimrjpftqphkhuqyg.supabase.co/storage/v1/object/public/works/570744ab-1fe0-4bbb-b0c3-d3e9b0c9f8a9/d839d516-54e7-4810-a494-35cbbaaf0b44/1-1770935977243.png",
];

const sampleWorks = [
  { id: 1, title: "Arte con AI", author: "Jhonny Duque", image: heroImages[0] },
  { id: 2, title: "Perfil de Linkedin", author: "Fullerton Chile", image: heroImages[1] },
  { id: 3, title: "Creatividades", author: "Jhonny Duque", image: heroImages[2] },
];

export default function MarketingPage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [heroBg, setHeroBg] = useState("");

  useEffect(() => {
    const randomImg = heroImages[Math.floor(Math.random() * heroImages.length)];
    setHeroBg(randomImg);

    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Marcellus&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <main className="min-h-screen bg-black text-white font-['Inter'] overflow-x-hidden">
        {/* Header con logo */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 md:px-12 py-5 sm:py-6 md:py-8 flex justify-between items-center"
        >
          <img
            src="https://jhonnyduque.com/wp-content/uploads/2025/05/Simbolo-Blanco-8.png"
            alt="Designfolio"
            className="h-9 sm:h-10 md:h-12 object-contain"
          />

          <Link
            href="/login"
            className="text-sm sm:text-base text-white/80 hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
        </motion.header>

        {/* Hero */}
        <section
          className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-12 text-center pt-16 sm:pt-20 md:pt-0"
          style={{
            backgroundImage: heroBg ? `url(${heroBg})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/65 to-black pointer-events-none" />

          <div className="relative z-10 max-w-4xl lg:max-w-5xl w-full">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight"
              style={{ fontFamily: "Marcellus, serif" }}
            >
              Designfolio
              <br />
              <span className="text-white/95">
                Un espacio{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.7 }}
                    className="inline-block"
                  >
                    {words[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-6 sm:mt-8 md:mt-10 text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Portafolios reales. Feedback profesional. Comunidad selecta.
              <br className="hidden sm:block" />
              Solo por invitación — para quienes toman en serio su oficio.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8"
            >
              <Link
                href="/join"
                className="px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 rounded-full bg-white text-black font-medium text-base sm:text-lg tracking-wide hover:bg-white/90 transition-all shadow-2xl shadow-black/40 w-full sm:w-auto max-w-xs"
              >
                Solicitar acceso
              </Link>

              <Link
                href="/vision"
                className="text-white/70 hover:text-white transition-colors text-base sm:text-lg font-light flex items-center gap-2"
              >
                Conoce nuestra visión <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Grid */}
        <section className="px-5 sm:px-8 md:px-12 py-16 sm:py-20 md:py-28 lg:py-32 bg-black">
          <div className="max-w-[95%] sm:max-w-[92%] md:max-w-[90%] lg:max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {sampleWorks.map((work, i) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.12 }}
                  whileHover={{ scale: 1.03 }}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 shadow-2xl shadow-black/50 aspect-[4/5] w-full mx-auto"
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 translate-y-4 sm:translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-base sm:text-lg md:text-xl font-medium text-white">{work.author}</p>
                    <p className="text-sm sm:text-base md:text-lg text-white/80 mt-1">{work.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 sm:py-16 md:py-20 text-center text-white/40 text-sm sm:text-base px-5">
          <p>
            Al registrarse, acepta nuestros{" "}
            <Link href="/legal/terms" className="text-white/60 hover:text-white/80 underline">
              Términos
            </Link>
            ,{" "}
            <Link href="/legal/acceptable-use" className="text-white/60 hover:text-white/80 underline">
              Uso aceptable
            </Link>{" "}
            y{" "}
            <Link href="/legal/privacy" className="text-white/60 hover:text-white/80 underline">
              Política de privacidad
            </Link>
            .
          </p>
        </footer>
      </main>
    </>
  );
}