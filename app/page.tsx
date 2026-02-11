import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      
      {/* Logo */}
      <div className="mb-12">
        <Image
          src="https://jhonnyduque.com/wp-content/uploads/2025/05/Simbolo-Logo_1-8.png"
          alt="Jhonny Duque Logo"
          width={80}
          height={80}
          priority
        />
      </div>

      {/* Headline */}
      <h1 className="text-4xl font-semibold tracking-tight text-black md:text-5xl">
        Estamos construyendo algo especial.
      </h1>

      {/* Subheadline */}
      <p className="mt-6 text-lg text-zinc-600">
        Acceso anticipado por invitación.
      </p>

      {/* CTA */}
      <button className="mt-10 rounded-full bg-black px-8 py-4 text-white transition hover:bg-zinc-800">
        Solicitar invitación
      </button>

    </div>
  );
}
