import { type ReactElement } from "react"
import Link from "next/link"

export interface CollectionCardProps {
  title: string
  image: { src: string; alt: string }
  href: string
}

export function CollectionCard({
  title,
  image,
  href,
}: CollectionCardProps): ReactElement {
  return (
    <Link
      href={href}
      className="group relative flex items-end overflow-hidden aspect-[3/4] bg-ink/5"
      aria-label={`Shop ${title} collection`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${image.src})` }}
        role="img"
        aria-label={image.alt}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
      <div className="relative z-10 p-5">
        <h3 className="text-base font-semibold text-canvas">{title}</h3>
      </div>
    </Link>
  )
}
