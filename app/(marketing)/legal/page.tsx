import Link from "next/link";

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
    <div className="public-container flex h-full flex-col justify-center py-12 md:py-0">
      <div className="public-measure">
        <h1 className="text-page-title mb-10">Información legal</h1>
        <ul className="flex flex-col">
          {enlaces.map(({ href, texto, descripcion }) => (
            <li key={href}>
              <div className="py-3">
                <span className="block text-subsection text-[#1e1e1e] mb-1">
                  {texto}
                </span>
                <span className="text-body-sm text-[#6b6b70]">
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
  );
}
