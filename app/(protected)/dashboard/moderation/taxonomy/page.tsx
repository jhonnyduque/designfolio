// app/(protected)/dashboard/moderation/taxonomy/page.tsx
import { PageHeader } from "@/components/ui/Panel"
import { TaxonomyPanel } from "@/components/moderation/TaxonomyPanel"

export default function TaxonomyPage() {
  return (
    <div>
      <PageHeader
        title="Taxonomía"
        subtitle="Las categorías y etiquetas que se ofrecen al publicar. Lo que añadas aquí queda disponible de inmediato."
      />
      <TaxonomyPanel />
    </div>
  )
}
