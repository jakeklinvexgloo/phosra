/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
    ]
  },
}


module.exports = nextConfig
