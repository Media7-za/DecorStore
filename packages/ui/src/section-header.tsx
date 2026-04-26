import { type ReactElement } from "react"

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  className = "",
}: SectionHeaderProps): ReactElement {
  return (
    <div className={`mb-10 md:mb-14 ${className}`.trim()}>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-muted max-w-[60ch] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
