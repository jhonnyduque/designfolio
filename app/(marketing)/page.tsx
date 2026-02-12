import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f7f7f7]">
      
      {/* Header */}
      <header className="w-full px-6 md:px-12 py-6 flex justify-between items-center">
        
        {/* Logo izquierda */}
        <Link href="https://jhonnyduque.com/" target="_blank">
          <Image
            src="https://jhonnyduque.com/wp-content/uploads/2025/05/Simbolo-Logo_1-8.png"
            alt="Jhonny Duque Logo"
            width={50}
            height={50}
            priority
            className="hover:opacity-80 transition"
          />
        </Link>

        {/* Acciones derecha */}
        <div className="flex items-center gap-6 text-sm md:text-base">
          <Link
            href="/login"
            className="font-bold text-black hover:opacity-70 transition"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/register"
            className="text-gray-500 hover:text-black transition"
          >
            Regístrate
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6">
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">
          Estamos construyendo algo especial.
        </h1>

        <p className="mt-6 text-gray-500 text-base md:text-lg">
          Acceso anticipado por invitación.
        </p>

      </section>
    </main>
  );
}
