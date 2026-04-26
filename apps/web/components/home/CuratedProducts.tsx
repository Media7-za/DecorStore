import { ProductCard, SectionHeader } from "@decorstore/ui"

export interface CuratedProduct {
  id: string
  title: string
  price: string
  image: { src: string; alt: string }
}

interface CuratedProductsProps {
  label: string
  products: CuratedProduct[]
}

export function CuratedProducts({
  label,
  products,
}: CuratedProductsProps): JSX.Element {
  return (
    <section aria-label={label} className="py-12 md:py-20 bg-canvas">
      <div className="max-w-[1280px] mx-auto px-6">
        <SectionHeader
          title={label}
          subtitle="Carefully chosen for quality and craftsmanship"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} title={p.title} price={p.price} image={p.image} />
          ))}
        </div>
      </div>
    </section>
  )
}
