// app/(protected)/dashboard/moderation/publicaciones/page.tsx
import { PageHeader } from "@/components/ui/Panel"
import { WorksManager } from "@/components/moderation/WorksManager"

export default function Page() {
  return (
    <div>
      <PageHeader title="Publicaciones" subtitle="Todo lo publicado en la plataforma. Puedes archivar lo que no deba seguir visible o eliminarlo del todo." />
      <WorksManager />
    </div>
  )
}
