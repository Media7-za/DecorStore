import { type ReactElement } from "react"
import Link from "next/link"

type Variant = "primary" | "secondary" | "ghost"

export interface CTAButtonProps {
  label: string
  href?: string
  variant?: Variant
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand text-canvas border border-brand hover:bg-brand/90",
  secondary:
    "bg-transparent text-ink border border-ink hover:bg-ink hover:text-canvas",
  ghost:
    "bg-transparent text-brand border border-transparent hover:bg-brand/10",
}

const base =
  "inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"

export function CTAButton({
  label,
  href,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: CTAButtonProps): ReactElement {
  const classes = `${base} ${variantClasses[variant]} ${className}`.trim()

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label}>
        {label}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={classes}
    >
      {label}
    </button>
  )
}
