import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/", "/login", "/investors/", "/deck/", "/check/"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/", "/login", "/investors/", "/deck/", "/check/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/", "/login", "/investors/", "/deck/", "/check/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/", "/login", "/investors/", "/deck/", "/check/"],
      },
    ],
    sitemap: "https://www.phosra.com/sitemap.xml",
  }
}
