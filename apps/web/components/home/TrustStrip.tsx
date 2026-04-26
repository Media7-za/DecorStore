import { type ReactElement } from "react"
interface TrustItem {
  icon: string
  label: string
  description: string
}

const TRUST_ITEMS: TrustItem[] = [
  { icon: "→", label: "Free Delivery", description: "On orders over R800" },
  { icon: "✓", label: "Secure Checkout", description: "SSL encrypted payments" },
  { icon: "★", label: "Local Craftsmanship", description: "Made in South Africa" },
  { icon: "↺", label: "Easy Returns", description: "30-day return policy" },
]

export function TrustStrip(): ReactElement {
  return (
    <section aria-label="Trust indicators" className="py-10 border-t border-ink/10">
      <div className="max-w-[1280px] mx-auto px-6">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 list-none p-0 m-0">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className="flex flex-col items-center gap-1 text-center">
              <span aria-hidden className="text-2xl text-brand mb-1">
                {item.icon}
              </span>
              <span className="text-sm font-semibold text-ink">{item.label}</span>
              <span className="text-xs text-muted">{item.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
