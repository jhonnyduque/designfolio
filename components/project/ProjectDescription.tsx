type Props = { children: string }

/** Texto público del proyecto; su espaciado vive aquí para feed, sheet y modal. */
export function ProjectDescription({ children }: Props) {
  return <p className="mt-5 whitespace-pre-wrap text-body text-gray-600">{children}</p>
}
