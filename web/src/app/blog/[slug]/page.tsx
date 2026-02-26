"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { getBlogPost, getRecentPosts, BLOG_CATEGORY_CONFIG } from "@/lib/blog"

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const post = getBlogPost(slug)

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center">
        <h1 className="text-2xl font-display text-foreground mb-4">Not found</h1>
        <p className="text-muted-foreground mb-8">This post doesn&apos;t exist.</p>
        <Link href="/blog" className="text-brand-green hover:underline text-sm">
          &larr; Back to Blog
        </Link>
      </div>
    )
  }

  // Posts with custom pages (like pcss-v1) are served by their own static route,
  // so this dynamic route only handles posts with inline content sections.
  if (!post.content || post.content.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center">
        <h1 className="text-2xl font-display text-foreground mb-4">{post.title}</h1>
        <p className="text-muted-foreground mb-8">{post.excerpt}</p>
        <Link href="/blog" className="text-brand-green hover:underline text-sm">
          &larr; Back to Blog
        </Link>
      </div>
    )
  }

  const cat = BLOG_CATEGORY_CONFIG[post.category]
  const related = getRecentPosts(4).filter((e) => e.slug !== post.slug).slice(0, 2)

  return (
    <div>
      {/* Header strip */}
      <section className="bg-gradient-to-b from-[#0D1B2A] to-[#0F2035]">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-8"
            >
              <ArrowLeft className="w-3 h-3" /> Blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <time className="text-xs text-white/50 font-mono">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                {cat.label}
              </span>
              {post.readTime && (
                <span className="text-xs text-white/40">{post.readTime}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-display text-white leading-tight">
              {post.title}
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <AnimatedSection>
          <div className="space-y-6">
            {post.content.map((section, i) => {
              if (section.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="border-l-3 border-brand-green pl-6 py-2 my-8"
                  >
                    <p className="text-lg sm:text-xl font-display text-foreground italic leading-relaxed">
                      &ldquo;{section.text}&rdquo;
                    </p>
                    {section.attribution && (
                      <cite className="block text-sm text-muted-foreground mt-3 not-italic">
                        &mdash; {section.attribution}
                      </cite>
                    )}
                  </blockquote>
                )
              }
              if (section.type === "heading") {
                return (
                  <h2 key={i} className="text-xl font-display text-foreground mt-8 mb-2">
                    {section.text}
                  </h2>
                )
              }
              return (
                <p key={i} className="text-base text-muted-foreground leading-relaxed">
                  {section.text}
                </p>
              )
            })}
          </div>
        </AnimatedSection>

        {/* Boilerplate */}
        <AnimatedSection className="mt-16 pt-10 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">About Phosra</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Phosra is an open child safety standard and API. Kids use 320+ apps and platforms {"\u2014"} each with different, fragmented parental controls. Phosra defines a universal spec so platforms can offer interoperable controls and parents can set rules once. We track 78 child safety laws across 25+ jurisdictions. Learn more at{" "}
            <Link href="/" className="text-brand-green hover:underline">phosra.com</Link>.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Press contact:{" "}
            <a href="mailto:press@phosra.com" className="text-brand-green hover:underline">
              press@phosra.com
            </a>
          </p>
        </AnimatedSection>

        {/* Related */}
        {related.length > 0 && (
          <AnimatedSection className="mt-16 pt-10 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-6">
              Related posts
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group block">
                  <div className="plaid-card p-5 h-full transition-shadow hover:shadow-md">
                    <time className="text-xs text-muted-foreground font-mono">
                      {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </time>
                    <h4 className="text-sm font-semibold text-foreground mt-2 group-hover:text-brand-green transition-colors leading-snug">
                      {r.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-3 text-xs text-brand-green">
                      Read <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        )}
      </article>
    </div>
  )
}
