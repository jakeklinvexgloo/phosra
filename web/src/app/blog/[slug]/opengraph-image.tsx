import { ImageResponse } from "next/og"
import { getBlogPost, BLOG_POSTS, BLOG_CATEGORY_CONFIG } from "@/lib/blog"

export const runtime = "edge"
export const alt = "Blog - Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return BLOG_POSTS.filter((p) => !p.hasCustomPage).map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)
  const title = post?.title ?? params.slug.replace(/-/g, " ")
  const date = post?.date ?? ""
  const category = post ? BLOG_CATEGORY_CONFIG[post.category].label : ""

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0D1B2A 0%, #132D46 50%, #0D1B2A 100%)",
          padding: "60px",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #00D47E, transparent)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 16,
            gap: 16,
          }}
        >
          {category && (
            <div
              style={{
                background: "rgba(0, 212, 126, 0.15)",
                color: "#00D47E",
                fontSize: 20,
                padding: "6px 16px",
                borderRadius: 6,
                display: "flex",
              }}
            >
              {category}
            </div>
          )}
          {date && (
            <div
              style={{
                color: "#64748b",
                fontSize: 20,
                display: "flex",
              }}
            >
              {date}
            </div>
          )}
        </div>

        <div
          style={{
            color: "white",
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.2,
            display: "flex",
          }}
        >
          {title.length > 80 ? title.slice(0, 77) + "..." : title}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 60,
            color: "#64748b",
            fontSize: 20,
            display: "flex",
          }}
        >
          phosra.com
        </div>
      </div>
    ),
    { ...size }
  )
}
