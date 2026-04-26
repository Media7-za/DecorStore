export interface ProductCardProps {
  title: string
  price: string
  image: { src: string; alt: string }
}

export function ProductCard({ title, price, image }: ProductCardProps): JSX.Element {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-ink/5 mb-4">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${image.src})` }}
          role="img"
          aria-label={image.alt}
        />
      </div>
      <h3 className="text-sm font-medium text-ink leading-snug mb-1">{title}</h3>
      <p className="text-sm text-muted">{price}</p>
    </article>
  )
}
