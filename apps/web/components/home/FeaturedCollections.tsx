import { CollectionCard, SectionHeader } from "@decorstore/ui"

export interface FeaturedCollection {
  id: string
  title: string
  image: { src: string; alt: string }
  href: string
}

interface FeaturedCollectionsProps {
  collections: FeaturedCollection[]
}

export function FeaturedCollections({
  collections,
}: FeaturedCollectionsProps): JSX.Element {
  return (
    <section aria-label="Featured collections" className="py-12 md:py-20 bg-canvas">
      <div className="max-w-[1280px] mx-auto px-6">
        <SectionHeader
          title="Shop by Collection"
          subtitle="Thoughtfully assembled for every room and intention"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {collections.map((c) => (
            <CollectionCard key={c.id} title={c.title} image={c.image} href={c.href} />
          ))}
        </div>
      </div>
    </section>
  )
}
