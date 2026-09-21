type Props = {
  title: string
  category: string
  publishedAt: string
}

/** Cabecera pública del proyecto, independiente de la superficie que la contiene. */
export function ProjectHeader({ title, category, publishedAt }: Props) {
  const publishedDate = new Date(publishedAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <h1 className="text-page-title text-gray-900">{title}</h1>
      <div className="mt-2 flex items-center gap-3 text-meta text-gray-400">
        <span className="uppercase font-semibold tracking-wider">{category}</span>
        <span>·</span>
        <span>{publishedDate}</span>
      </div>
    </>
  )
}
