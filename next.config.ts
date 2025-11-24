import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  // output: "standalone", Uncomment this line if using docker
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "dev.api.bigumroh.com" },
      { hostname: "dev.api.umrohaku.com" },
      { hostname: "api.bigumroh.com" },
      { hostname: "api.umrohaku.com" },
      { hostname: "dev.bigumroh.com" },
      { hostname: "dev.umrohaku.com" },
      { hostname: "bigumroh.com" },
      { hostname: "umrohaku.com" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "img.youtube.com" },
      { hostname: "i.ytimg.com" },
    ],
  },
  devIndicators: { position: "bottom-left" },
  generateBuildId: async () => {
    return "sai-production"
  },
}

export default nextConfig
