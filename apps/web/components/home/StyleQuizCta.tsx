import Link from "next/link"

interface StyleQuizCtaProps {
  title: string
  subtitle: string
  cta: { label: string; href: string }
}

export function StyleQuizCta({
  title,
  subtitle,
  cta,
}: StyleQuizCtaProps) {
  return (
    <section
      aria-label="Style quiz"
      className="relative py-20 md:py-28 bg-brand overflow-hidden"
    >
      {/* Decorative rings */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full border border-canvas/10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full border border-canvas/10 -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-canvas mb-5 leading-tight">
          {title}
        </h2>
        <p className="text-base text-canvas/75 mb-10 max-w-[48ch] mx-auto leading-relaxed">
          {subtitle}
        </p>
        <Link
          href={cta.href}
          aria-label={cta.label}
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide bg-canvas text-brand border border-canvas hover:bg-canvas/90 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas"
        >
          {cta.label}
        </Link>
      </div>
    </section>
  )
}
