import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. Seed SiteConfig
  const siteConfigs = [
    { key: "vatRate", value: "0.15" },
    { key: "freeShippingThreshold", value: "2500" },
    { key: "stockLowThreshold", value: "3" },
  ];

  console.log("Seeding SiteConfig...");
  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  // 2. Seed BlogAuthor
  console.log("Seeding BlogAuthors and BlogPosts...");
  const author = await prisma.blogAuthor.upsert({
    where: { id: "cl-author-1" }, // Using a fixed ID for stability in seed
    update: {},
    create: {
      id: "cl-author-1",
      name: "Eleanor Vance",
      bio: "Interior designer and lead editor at DecorStore with over 15 years of experience in luxury home aesthetics.",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
    },
  });

  // 3. Seed BlogPosts
  const posts = [
    {
      id: "cl-post-1",
      title: "The Art of Minimalist Luxury",
      slug: "the-art-of-minimalist-luxury",
      body: "Minimalism doesn't have to be cold. In this guide, we explore how to combine clean lines with warm textures to create a space that feels both modern and inviting...",
      featuredImage:
        "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=1200&q=80",
      seoTitle: "Minimalist Luxury Interior Design Guide | DecorStore",
      seoDescription:
        "Learn how to master minimalist luxury in your home with our expert tips on textures, colors, and furniture selection.",
      publishedAt: new Date(),
      authorId: author.id,
    },
    {
      id: "cl-post-2",
      title: "Choosing the Perfect Palette for 2026",
      slug: "perfect-palette-2026",
      body: "Colors are the soul of a room. This year, we're seeing a shift towards earthy tones, deep greens, and subtle metallic accents. Discover how to transform your living space...",
      featuredImage:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      seoTitle: "Interior Design Color Trends 2026 | DecorStore",
      seoDescription:
        "Discover the most influential color palettes for interior design in 2026. From earthy tones to deep greens.",
      publishedAt: new Date(),
      authorId: author.id,
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
