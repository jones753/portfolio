/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:4000"
    return [
      {
        source: "/api/github/:path*",
        destination: `${backendUrl}/api/github/:path*`,
      },
      {
        source: "/api/spotify/:path*",
        destination: `${backendUrl}/api/spotify/:path*`,
      },
      {
        source: "/api/now-playing",
        destination: `${backendUrl}/api/spotify/now-playing`,
      },
    ]
  },
}

export default nextConfig
