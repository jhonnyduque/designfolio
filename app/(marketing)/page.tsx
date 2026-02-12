"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["especial.", "secreto.", "privado.", "inevitable."];

export default function LandingPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Glow sutil */}
      <div className="absolute inset-0 bg-glow" />

      {/* Header */}
      <header className="relative z-10 w-full px-6 md:px-12 py-8 flex justify-between items-center">

        <Link href="https://jhonnyduque.com" target="_blank">
          <Image
            src="https://jhonnyduque.com/wp-content/uploads/2025/05/Simbolo-Blanco-8.png"
            alt="Logo"
            width={40}
            height={40}
            className="opacity-90 hover:opacity-100 transition"
          />
        </Link>

        <div className="flex items-center gap-6 text-sm tracking-wide">
          <Link href="/login" className="text-white/70 hover:text-white transition">
            Iniciar sesión
          </Link>

          <Link
            href="/register"
            className="px-5 py-2 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all duration-300"
          >
            Quiero pertenecer
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col justify-center items-center text-center px-6 h-[80vh]">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-marcellus text-4xl md:text-6xl lg:text-7xl font-normal leading-tight max-w-4xl"
        >
          Estamos construyendo algo{" "}
          <motion.span
            key={index}
            initial={{ opacity: 0, filter: "blur(12px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
            className="text-white/90"
          >
            {words[index]}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-8 text-white/40 text-base md:text-lg max-w-md leading-relaxed"
        >
          <span className="block">
            No es una plataforma más.
          </span>
          <span className="block">
            Es una comunidad privada en modo lanzamiento.
          </span>
        </motion.p>

      </section>

      <div className="absolute bottom-8 w-full text-center text-xs text-white/20 tracking-widest">
        BY INVITATION ONLY
      </div>

    </main>
  );
}
