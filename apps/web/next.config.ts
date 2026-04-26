import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@decorstore/ui"],
  images: {
    remotePatterns: [{ hostname: "placehold.co" }],
  },
}

export default nextConfig
