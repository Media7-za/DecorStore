

type BadgeVariant = "default" | "accent"

export interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-brand/15 text-brand",
  accent: "bg-accent/15 text-accent",
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}
