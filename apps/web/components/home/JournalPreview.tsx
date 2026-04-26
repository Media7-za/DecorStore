import { CTAButton, EditorialCard, SectionHeader } from "@decorstore/ui"

export interface JournalPost {
  id: string
  title: string
  description: string
  image: { src: string; alt: string }
  href: string
  badge?: string
}

interface JournalPreviewProps {
  posts: JournalPost[]
}

export function JournalPreview({ posts }: JournalPreviewProps): JSX.Element {
  return (
    <section aria-label="Journal" className="py-12 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10 md:mb-14">
          <SectionHeader
            title="From the Journal"
            subtitle="Design thinking, space guides, and maker stories"
            className="mb-0"
          />
          <CTAButton href="/journal" variant="ghost" label="View all" />
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <EditorialCard
              key={post.id}
              title={post.title}
              description={post.description}
              image={post.image}
              cta={{ label: "Read more", href: post.href }}
              badge={post.badge}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
