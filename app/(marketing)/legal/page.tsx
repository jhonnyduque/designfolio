import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import Image from "next/image";
import { PublicMenu } from "@/components/layout/PublicMenu";

export const metadata = { title: "Información legal - Designfolio" };

const enlaces = [
  {
    href: "/aviso-legal",
    texto: "Aviso legal",
    descripcion: "Información sobre el titular de Designfolio, condiciones generales y responsabilidades.",
  },
  {
    href: "/privacidad",
    texto: "Privacidad",
    descripcion: "Cómo tratamos y protegemos tus datos personales y qué derechos puedes ejercer.",
  },
  {
    href: "/terminos",
    texto: "Términos",
    descripcion: "Las reglas para utilizar Designfolio, publicar proyectos e interactuar con la comunidad.",
  },
  {
    href: "/cookies",
    texto: "Cookies",
    descripcion: "Qué tecnologías utilizamos, para qué sirven y cómo puedes gestionarlas.",
  },
];

export default function LegalIndexPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e] flex flex-col">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1500px] px-6 md:px-10">
          <div className="mx-auto flex h-14 w-full max-w-[935px] items-center justify-between">
            <Link href="/" aria-label="Designfolio" className="inline-flex items-center">
              <Image src="/brand/simbolo-logo.webp" alt="Designfolio" width={36} height={36} className="h-9 w-9 object-contain" />
            </Link>
            <PublicMenu sesion={null} />
          </div>
        </div>
      </header>
      <div className="flex-1 w-full flex flex-col justify-center md:justify-center px-6 py-12 md:py-0">
        <div className="mx-auto w-full max-w-[700px]">
        <h1 className="text-3xl font-marcellus mb-10">Información legal</h1>
        <ul className="flex flex-col">
          {enlaces.map(({ href, texto, descripcion }) => (
            <li key={href}>
              <div className="py-3">
                <span className="block text-[15px] font-semibold text-[#1e1e1e] mb-1">
                  {texto}
                </span>
                <span className="text-[13.5px] leading-relaxed text-[#6b6b70]">
                  {descripcion}{" "}
                  <Link
                    href={href}
                    className="font-medium text-[#1e1e1e] hover:underline"
                  >
                    Leer más →
                  </Link>
                </span>
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
