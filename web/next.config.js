/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    instrumentationHook: true,
  },
  async redirects() {
    return [
      {
        source: '/standards',
        destination: '/movements',
        permanent: true,
      },
      {
        source: '/standards/:path*',
        destination: '/movements/:path*',
        permanent: true,
      },
      {
        source: '/platforms',
        destination: '/technology-services',
        permanent: true,
      },
      {
        source: '/platforms/:path*',
        destination: '/technology-services/:path*',
        permanent: true,
      },
      // Unified developer platform redirects
      {
        source: '/docs',
        destination: '/developers/reference/specification',
        permanent: true,
      },
      {
        source: '/playground',
        destination: '/developers/playground',
        permanent: true,
      },
      {
        source: '/dashboard/developers',
        destination: '/developers/dashboard',
        permanent: true,
      },
      {
        source: '/dashboard/developers/keys',
        destination: '/developers/dashboard/keys',
        permanent: true,
      },
      {
        source: '/dashboard/developers/usage',
        destination: '/developers/dashboard/usage',
        permanent: true,
      },
    ]
  },
}


module.exports = nextConfig
