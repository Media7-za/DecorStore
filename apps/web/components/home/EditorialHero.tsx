import { CTAButton } from "@decorstore/ui"

interface EditorialHeroProps {
  title: string
  subtitle: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
}

export function EditorialHero({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: EditorialHeroProps): JSX.Element {
  return (
    <section
      aria-label="Hero banner"
      className="relative flex min-h-[90svh] items-end overflow-hidden bg-canvas"
    >
      {/* Geometric background accents — decorative only */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-brand/8" />
        <div className="absolute bottom-16 right-[22%] w-44 h-44 rounded-full border border-accent/20" />
        <div className="absolute top-28 left-[8%] w-20 h-20 border border-brand/15 rotate-45" />
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 pb-20 pt-36">
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-[5.5rem] font-semibold tracking-tight text-ink leading-[1.04] mb-6">
            {title}
          </h1>
          <p className="text-lg text-muted mb-10 max-w-[50ch] leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <CTAButton href={primaryCta.href} variant="primary" label={primaryCta.label} />
            <CTAButton href={secondaryCta.href} variant="secondary" label={secondaryCta.label} />
          </div>
        </div>
      </div>
    </section>
  )
}
