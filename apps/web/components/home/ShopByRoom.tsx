import Link from "next/link"
import { SectionHeader } from "@decorstore/ui"

export interface Room {
  id: string
  title: string
  image: { src: string; alt: string }
  href: string
}

interface ShopByRoomProps {
  rooms: Room[]
}

export function ShopByRoom({ rooms }: ShopByRoomProps): JSX.Element {
  return (
    <section aria-label="Shop by room" className="py-12 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <SectionHeader title="Shop by Room" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={room.href}
              aria-label={`Shop ${room.title}`}
              className="group relative aspect-square overflow-hidden bg-ink/5 flex items-end"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${room.image.src})` }}
                role="img"
                aria-label={room.image.alt}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"
              />
              <p className="relative z-10 p-4 text-sm font-semibold text-canvas tracking-wide">
                {room.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
