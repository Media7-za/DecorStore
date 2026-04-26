import { EditorialHero } from "@/components/home/EditorialHero"
import { FeaturedCollections, type FeaturedCollection } from "@/components/home/FeaturedCollections"
import { ShopByRoom, type Room } from "@/components/home/ShopByRoom"
import { CuratedProducts, type CuratedProduct } from "@/components/home/CuratedProducts"
import { MakerStory } from "@/components/home/MakerStory"
import { StyleQuizCta } from "@/components/home/StyleQuizCta"
import { JournalPreview, type JournalPost } from "@/components/home/JournalPreview"
import { TrustStrip } from "@/components/home/TrustStrip"

// Placeholder images — replace with real CDN URLs in Phase 3
const IMG_PORTRAIT = "https://placehold.co/800x1000/D6CFC8/6B7280?text=DecorStore"
const IMG_SQUARE = "https://placehold.co/800x800/D6CFC8/6B7280?text=DecorStore"

const COLLECTIONS: FeaturedCollection[] = [
  {
    id: "c1",
    title: "Living Room",
    image: { src: IMG_PORTRAIT, alt: "Living room collection — sofas, cushions, and side tables" },
    href: "/collections/living-room",
  },
  {
    id: "c2",
    title: "Bedroom",
    image: { src: IMG_PORTRAIT, alt: "Bedroom collection — bedding, lighting, and decor" },
    href: "/collections/bedroom",
  },
  {
    id: "c3",
    title: "Lighting",
    image: { src: IMG_PORTRAIT, alt: "Lighting collection — pendants, floor lamps, and sconces" },
    href: "/collections/lighting",
  },
  {
    id: "c4",
    title: "Decor Objects",
    image: { src: IMG_PORTRAIT, alt: "Decor objects — ceramics, vases, and art" },
    href: "/collections/decor-objects",
  },
]

const ROOMS: Room[] = [
  {
    id: "r1",
    title: "Lounge",
    image: { src: IMG_SQUARE, alt: "Styled lounge interior" },
    href: "/rooms/lounge",
  },
  {
    id: "r2",
    title: "Bedroom",
    image: { src: IMG_SQUARE, alt: "Styled bedroom interior" },
    href: "/rooms/bedroom",
  },
  {
    id: "r3",
    title: "Dining",
    image: { src: IMG_SQUARE, alt: "Styled dining room interior" },
    href: "/rooms/dining",
  },
  {
    id: "r4",
    title: "Office",
    image: { src: IMG_SQUARE, alt: "Styled home office interior" },
    href: "/rooms/office",
  },
]

const PRODUCTS: CuratedProduct[] = [
  {
    id: "p1",
    title: "Woven Rattan Pendant",
    price: "R 1 250",
    image: { src: IMG_SQUARE, alt: "Woven rattan pendant light — natural material, warm glow" },
  },
  {
    id: "p2",
    title: "Linen Throw Cushion",
    price: "R 450",
    image: { src: IMG_SQUARE, alt: "Natural linen throw cushion in oatmeal" },
  },
  {
    id: "p3",
    title: "Ceramic Bud Vase",
    price: "R 280",
    image: { src: IMG_SQUARE, alt: "Handmade ceramic bud vase with matte glaze" },
  },
  {
    id: "p4",
    title: "Solid Oak Side Table",
    price: "R 3 800",
    image: { src: IMG_SQUARE, alt: "Solid oak side table with tapered legs" },
  },
]

const JOURNAL_POSTS: JournalPost[] = [
  {
    id: "j1",
    title: "How to Layer Textures in a Neutral Living Room",
    description:
      "Depth without colour — the art of mixing materials in a considered space.",
    image: {
      src: IMG_PORTRAIT,
      alt: "Close-up of layered linen, rattan, and ceramic textures in a neutral room",
    },
    href: "/journal/layer-textures",
    badge: "Design Guide",
  },
  {
    id: "j2",
    title: "Meet the Maker: Thandi's Ceramic Studio",
    description:
      "A Cape Town ceramicist on slow craft, imperfection, and the beauty of everyday objects.",
    image: {
      src: IMG_PORTRAIT,
      alt: "Hands shaping clay on a wheel in a sunlit Cape Town studio",
    },
    href: "/journal/thandi-ceramics",
    badge: "Maker Story",
  },
  {
    id: "j3",
    title: "The 10-Item Shelfie Formula That Always Works",
    description:
      "Curation principles borrowed from gallery design, scaled for the home.",
    image: {
      src: IMG_PORTRAIT,
      alt: "Styled shelf with curated ceramics, books, and a trailing plant",
    },
    href: "/journal/shelfie-formula",
  },
]

export default function HomePage(): JSX.Element {
  return (
    <main>
      <EditorialHero
        title="Design your space with intention"
        subtitle="Handcrafted decor for modern South African homes"
        primaryCta={{ label: "Shop Collection", href: "/collections" }}
        secondaryCta={{ label: "Take Style Quiz", href: "/style-quiz" }}
      />

      <FeaturedCollections collections={COLLECTIONS} />

      <ShopByRoom rooms={ROOMS} />

      <CuratedProducts label="Selected for your space" products={PRODUCTS} />

      <MakerStory
        overline="The Makers"
        title="Every piece tells a story of craft"
        body="We work directly with South African artisans and small studios who make things with their hands. No mass production — just thoughtful objects built to last and designed to feel at home."
        cta={{ label: "Meet the makers", href: "/makers" }}
        image={{
          src: IMG_PORTRAIT,
          alt: "Artisan hands shaping a ceramic vessel in a sunlit studio",
        }}
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
