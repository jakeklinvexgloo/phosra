const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/dashboard/admin/platform-research/\\[platformId\\]': ['../research/**/*'],
    '/api/admin/research/filesystem-scan': ['../research/**/*'],
    '/research/ai-chatbots': ['../research/**/*'],
    '/research/ai-chatbots/\\[platformId\\]': ['../research/**/*'],
    '/research/ai-chatbots/categories/\\[categoryId\\]': ['../research/**/*'],
    '/research/ai-chatbots/dimensions/\\[dimensionId\\]': ['../research/**/*'],
    '/research/ai-chatbots/prompts': ['../research/**/*'],
    '/research/ai-chatbots/compare': ['../research/**/*'],
    '/research/ai-chatbots/phosra-controls': ['../research/**/*'],
    '/research/streaming': ['../research/**/*'],
    '/research/streaming/\\[platformId\\]': ['../research/**/*'],
    '/research/streaming/compare': ['../research/**/*'],
    '/research/streaming/categories': ['../research/**/*'],
    '/research/streaming/categories/\\[categoryId\\]': ['../research/**/*'],
    '/research/compare': ['../research/**/*'],
  },
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
      // AI Safety → Research/AI Chatbots redirects
      {
        source: '/ai-safety',
        destination: '/research/ai-chatbots',
        permanent: true,
      },
      {
        source: '/ai-safety/:path*',
        destination: '/research/ai-chatbots/:path*',
        permanent: true,
      },
      // Streaming Safety → Research/Streaming redirects
      {
        source: '/streaming-safety',
        destination: '/research/streaming',
        permanent: true,
      },
      {
        source: '/streaming-safety/:path*',
        destination: '/research/streaming/:path*',
        permanent: true,
      },
      // Newsroom → Blog redirects
      {
        source: '/newsroom',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/newsroom/:slug',
        destination: '/blog/:slug',
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
