import { Feed } from "@/components/feed/Feed"

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
 *
 * La cabecera, el pie y la guía horizontal los pone el layout público. Esta
 * página solo decide su aire vertical.
 */
export default function PublicFeedPage() {
  return (
    <div className="public-container py-5 md:py-6">
      <Feed />
    </div>
  )
}
