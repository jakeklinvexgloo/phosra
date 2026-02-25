const { withSentryConfig } = require("@sentry/nextjs")

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
        source: '/developers/dashboard',
        destination: '/dashboard/developers',
        permanent: true,
      },
      {
        source: '/developers/dashboard/keys',
        destination: '/dashboard/developers/keys',
        permanent: true,
      },
      {
        source: '/developers/dashboard/usage',
        destination: '/dashboard/developers/usage',
        permanent: true,
      },
    ]
  },
}


module.exports = withSentryConfig(nextConfig, {
  // Suppress source map upload warnings when SENTRY_AUTH_TOKEN is not set
  silent: !process.env.SENTRY_AUTH_TOKEN,
  // Don't widen the existing Next.js config
  disableLogger: true,
})
