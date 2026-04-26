
import Link from "next/link"
import { Badge } from "./badge"

export interface EditorialCardProps {
  title: string
  description?: string
  image: { src: string; alt: string }
  cta?: { label: string; href: string }
  badge?: string
}

export function EditorialCard({
  title,
  description,
  image,
  cta,
  badge,
}: EditorialCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
        {badge && (
          <div className="absolute top-4 left-4 z-10">
            <Badge label={badge} variant="accent" />
          </div>
        )}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${image.src})` }}
          role="img"
          aria-label={image.alt}
        />
      </div>
      <div className="flex flex-col flex-1 pt-5">
        <h3 className="text-base font-semibold text-ink leading-snug mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted leading-relaxed mb-4 flex-1">{description}</p>
        )}
        {cta && (
          <Link
            href={cta.href}
            className="text-sm font-medium text-brand hover:text-accent transition-colors"
            aria-label={`${cta.label} — ${title}`}
          >
            {cta.label} →
          </Link>
        )}
      </div>
    </article>
  )
}
