import { redirect } from "next/navigation"

/**
 * El feed vive ahora en la raíz. Esta dirección se queda reenviando porque ya
 * circula por ahí: está enlazada desde jhonnyduque.com y aparece en el
 * formulario de publicación. Romperla no arreglaría nada.
 *
 * El reenvío es temporal (307) a propósito, para no dejar la redirección
 * grabada en el navegador de nadie mientras esto se termina de asentar.
 */
export default function ProyectosPage() {
  redirect("/")
}
