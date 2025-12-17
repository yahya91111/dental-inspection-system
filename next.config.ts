import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

// Disable PWA in development to avoid Turbopack conflict
const isDev = process.env.NODE_ENV === 'development'

export default isDev ? nextConfig : (async () => {
  // @ts-expect-error - next-pwa doesn't have TypeScript types
  const withPWA = (await import('next-pwa')).default
  return withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
  })(nextConfig)
})()
