import { CTAButton } from "@decorstore/ui"

interface MakerStoryProps {
  overline: string
  title: string
  body: string
  cta: { label: string; href: string }
  image: { src: string; alt: string }
}

export function MakerStory({
  overline,
  title,
  body,
  cta,
  image,
}: MakerStoryProps) {
  return (
    <section aria-label="Our makers" className="py-12 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent mb-5">
              {overline}
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink leading-tight mb-6">
              {title}
            </h2>
            <p className="text-base text-muted leading-relaxed mb-8 max-w-[52ch]">{body}</p>
            <CTAButton href={cta.href} variant="ghost" label={cta.label} />
          </div>
          <div
            className="aspect-[4/5] bg-ink/5 bg-cover bg-center"
            style={{ backgroundImage: `url(${image.src})` }}
            role="img"
            aria-label={image.alt}
          />
        </div>
      </div>
    </section>
  )
}
