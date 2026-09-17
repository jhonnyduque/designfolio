// app/(protected)/dashboard/moderation/invitaciones/page.tsx
import { PageHeader } from "@/components/ui/Panel"
import { InviteCodesManager } from "@/components/moderation/InviteCodesManager"

export default function Page() {
  return (
    <div>
      <PageHeader title="Invitaciones" subtitle="Genera códigos para dar acceso. Solo se ven una vez: en la base queda únicamente su huella." />
      <InviteCodesManager />
    </div>
  )
}
