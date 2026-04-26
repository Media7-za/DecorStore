import { type ReactElement } from "react"
import { EditorialHero } from "@/components/home/EditorialHero"
import { FeaturedCollections } from "@/components/home/FeaturedCollections"
import { ShopByRoom } from "@/components/home/ShopByRoom"
import { CuratedProducts } from "@/components/home/CuratedProducts"
import { MakerStory } from "@/components/home/MakerStory"
import { StyleQuizCta } from "@/components/home/StyleQuizCta"
import { JournalPreview } from "@/components/home/JournalPreview"
import { TrustStrip } from "@/components/home/TrustStrip"
import {
  FEATURED_COLLECTIONS,
  ROOMS,
  PRODUCTS,
  JOURNAL_POSTS,
} from "@/lib/mock/homepage"

export default function HomePage(): ReactElement {
  return (
    <main>
      <EditorialHero
        title="Design your space with intention"
        subtitle="Handcrafted decor for modern South African homes"
        primaryCta={{ label: "Shop Collection", href: "/collections" }}
        secondaryCta={{ label: "Take Style Quiz", href: "/style-quiz" }}
      />
      <FeaturedCollections collections={FEATURED_COLLECTIONS} />
      <ShopByRoom rooms={ROOMS} />
      <CuratedProducts label="Selected for your space" products={PRODUCTS} />
      <MakerStory
        overline="The Makers"
        title="Every piece tells a story of craft"
        body="We work directly with South African artisans and small studios who make things with their hands. No mass production — just thoughtful objects built to last and designed to feel at home."
        cta={{ label: "Meet the makers", href: "/makers" }}
        image={{ src: "https://placehold.co/800x1000/D6CFC8/6B7280?text=DecorStore", alt: "Artisan hands shaping a ceramic vessel in a sunlit studio" }}
      />
      <StyleQuizCta
        title="Find your style in 60 seconds"
        subtitle="Answer a few questions and we'll surface the pieces that fit your space and aesthetic."
        cta={{ label: "Take the quiz", href: "/style-quiz" }}
      />
      <JournalPreview posts={JOURNAL_POSTS} />
      <TrustStrip />
    </main>
  )
}
