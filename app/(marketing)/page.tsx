import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { Feed } from "@/components/feed/Feed"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { PublicMenu, type SesionPublica } from "@/components/layout/PublicMenu"

/**
 * Leer la sesión obliga a servir esta página bajo demanda en lugar de
 * prerenderizarla. Cuesta poco: las obras ya se piden al cargar, así que lo
 * estático aquí era solo el armazón.
 */
async function sesionActual(): Promise<SesionPublica> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [perfil] = await getDb()
    .select({ username: profiles.username, fullName: profiles.fullName, avatarUrl: profiles.avatarUrl })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!perfil) return null
  return { nombre: perfil.fullName, username: perfil.username, avatarUrl: perfil.avatarUrl }
}

/**
 * La portada pública: el feed de la comunidad, servido en la raíz.
 *
 * Antes esto era un `redirect("/proyectos")`, de modo que quien escribía el
 * dominio acababa en otra dirección antes de ver nada. Ahora la raíz es el
 * destino y `/proyectos` es la que reenvía aquí, para que las direcciones que
 * ya circulan sigan funcionando.
 *
 * Las obras sueltas se quedan en `/proyectos/<slug>`: esas URL están
 * publicadas y romperlas no aporta nada.
 */
export default async function PublicFeedPage() {
  const sesion = await sesionActual()

  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1500px] px-6 md:px-10">
          <div className="mx-auto flex h-14 w-full max-w-[935px] items-center justify-between">
            <Link href="/" aria-label="Designfolio" className="inline-flex items-center">
              <Image
                src="/brand/simbolo-logo.webp"
                alt="Designfolio"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            </Link>

            <PublicMenu sesion={sesion} />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1500px] px-6 py-5 md:px-10 md:py-6">
        <Feed />
      </section>

      <div className="hidden md:block">
        <PublicFooter />
      </div>
    </main>
  )
}
