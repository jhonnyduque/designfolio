// app/(protected)/dashboard/moderation/miembros/page.tsx
import { PageHeader } from "@/components/ui/Panel"
import { UsersManager } from "@/components/moderation/UsersManager"

export default function Page() {
  return (
    <div>
      <PageHeader title="Miembros" subtitle="Las cuentas registradas. Desactivar una le impide publicar sin borrar lo que ya compartió." />
      <UsersManager />
    </div>
  )
}
