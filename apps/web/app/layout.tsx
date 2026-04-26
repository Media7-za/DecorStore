import { type ReactElement, type ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DecorStore — Handcrafted Decor for Modern South African Homes",
  description:
    "Curated decor and furniture for the design-conscious home. Shop collections, explore spaces, and find your style.",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}): ReactElement {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-canvas text-ink antialiased`}>
        {children}
      </body>
    </html>
  )
}
