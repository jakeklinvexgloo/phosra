"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"
import { ENDPOINTS, getEndpointsBySection } from "@/lib/docs/endpoints"
import { EndpointCard } from "@/components/docs/EndpointCard"
import { NEW_CATEGORIES } from "@/lib/docs/categories"

function Keyword({ children }: { children: string }) {
  return <strong className="text-brand-green font-bold">{children}</strong>
}

export function SpecificationView() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (scrollHeight > 0) {
        setScrollProgress(Math.min(window.scrollY / scrollHeight, 1))
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1`

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-[hsl(var(--brand-green))] z-50 transition-[width] duration-150 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <div className="space-y-12 overflow-x-hidden">
        {/* Preamble */}
        <section id="preamble">
          <div className="bg-accent/5 border border-accent/20 rounded p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Phosra Child Safety Standard (PCSS) v1.0</h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              This document defines the <strong className="text-foreground">Phosra Child Safety Standard (PCSS)</strong>, an open technical framework
              for technology platforms that serve minors. Platforms <Keyword>SHOULD</Keyword> implement this standard
              to align with emerging child safety regulations and industry best practices.
            </p>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              PCSS establishes a universal policy framework spanning 45 safety categories across 12 domains: Content, Time, Purchase,
              Social, Web, Privacy, Monitoring, Algorithmic Safety, Notifications, Advertising &amp; Data, and Access Control.
              Platforms <Keyword>SHALL</Keyword> expose compliance endpoints that accept policy
              enforcement requests from the Phosra Enforcement Engine.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This standard is published by Phosra and designed to align with current and emerging child safety regulations.
              Platforms adopting this standard position themselves ahead of regulatory requirements.
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-green">45</p>
                <p className="text-xs text-muted-foreground">Policy Categories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-green">5</p>
                <p className="text-xs text-muted-foreground">Rating Systems</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-green">15</p>
                <p className="text-xs text-muted-foreground">Regulated Platforms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-green">3</p>
                <p className="text-xs text-muted-foreground">Compliance Levels</p>
              </div>
            </div>
          </div>
        </section>

        {/* RFC 2119 */}
        <section id="rfc2119" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">RFC 2119 Keywords</h2>
          <div className="bg-card rounded border border-border p-6">
            <p className="text-sm text-muted-foreground mb-4">
              The key words &quot;MUST&quot;, &quot;MUST NOT&quot;, &quot;REQUIRED&quot;, &quot;SHALL&quot;, &quot;SHALL NOT&quot;, &quot;SHOULD&quot;,
              &quot;SHOULD NOT&quot;, &quot;RECOMMENDED&quot;, &quot;MAY&quot;, and &quot;OPTIONAL&quot; in this document are to be
              interpreted as described in <a href="https://www.rfc-editor.org/rfc/rfc2119" className="text-brand-green hover:underline" target="_blank" rel="noopener noreferrer">RFC 2119</a>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 p-3 rounded"><Keyword>MUST</Keyword> / <Keyword>REQUIRED</Keyword> / <Keyword>SHALL</Keyword> — Absolute requirement</div>
              <div className="bg-muted/50 p-3 rounded"><Keyword>SHOULD</Keyword> / <Keyword>RECOMMENDED</Keyword> — Strong recommendation, may be deviated from with justification</div>
              <div className="bg-muted/50 p-3 rounded"><Keyword>MAY</Keyword> / <Keyword>OPTIONAL</Keyword> — Truly optional behavior</div>
              <div className="bg-muted/50 p-3 rounded"><Keyword>MUST NOT</Keyword> / <Keyword>SHALL NOT</Keyword> — Absolute prohibition</div>
            </div>
          </div>
        </section>

        {/* Section 1: Platform Authentication */}
        <section id="auth" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">1. Platform Authentication</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              All regulated platforms <Keyword>MUST</Keyword> authenticate using JWT bearer tokens. The authentication system
              implements refresh token rotation with SHA-256 hashing for security.
            </p>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Access Token</h4>
                <p className="text-xs text-muted-foreground">Platforms <Keyword>MUST</Keyword> include a valid JWT in the Authorization header. Tokens expire after 15 minutes.</p>
                <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto mt-2">{`Authorization: Bearer <access_token>`}</pre>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Token Rotation</h4>
                <p className="text-xs text-muted-foreground">Platforms <Keyword>MUST</Keyword> implement token rotation. Each refresh request returns a new token pair and revokes the previous refresh token. Platforms <Keyword>MUST NOT</Keyword> reuse expired refresh tokens.</p>
              </div>
            </div>
          </div>
          {/* Auth endpoint cards */}
          <div className="mt-6">
            {getEndpointsBySection("Auth").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 2: Protected Families */}
        <section id="families" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">2. Protected Families</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              The family data model <Keyword>SHALL</Keyword> support multiple guardians per family unit with role-based access control.
              Child profiles <Keyword>MUST</Keyword> include birth date for age-based policy computation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Owner</h4>
                <p className="text-xs text-muted-foreground">Full administrative control. <Keyword>MAY</Keyword> delete the family unit.</p>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Parent</h4>
                <p className="text-xs text-muted-foreground"><Keyword>MAY</Keyword> manage children, policies, and compliance links.</p>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Guardian</h4>
                <p className="text-xs text-muted-foreground">Read-only access. <Keyword>MUST NOT</Keyword> modify policies or compliance links.</p>
              </div>
            </div>
          </div>
          {/* Families + Children endpoint cards */}
          <div className="mt-6">
            {getEndpointsBySection("Families").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
            {getEndpointsBySection("Children").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 2.1: Family Members */}
        <section id="members" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">2.1 Family Members</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Families support multi-guardian access with role-based permissions. Members <Keyword>MAY</Keyword> be
              added to share access to children, policies, and enforcement controls. The family data model supports
              co-parenting, caregiver delegation, and institutional use cases.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Owner</h4>
                <p className="text-xs text-muted-foreground">Full administrative control. <Keyword>MAY</Keyword> add/remove members, manage all policies, and delete the family.</p>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Parent</h4>
                <p className="text-xs text-muted-foreground"><Keyword>MAY</Keyword> manage children, modify policies, trigger enforcement, and view reports.</p>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Guardian</h4>
                <p className="text-xs text-muted-foreground">Read-only access. <Keyword>MAY</Keyword> view policies and reports. <Keyword>MUST NOT</Keyword> modify rules.</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            {getEndpointsBySection("Family Members").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 3: Safety Policies */}
        <section id="policies" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">3. Safety Policies</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Safety policies define protection rules for each child. Each policy contains rules across 45 categories spanning 12 domains.
              Platforms <Keyword>MUST</Keyword> implement enforcement for all categories they claim capability in.
              Rules are stored as JSONB with category-specific schemas.
            </p>
            <p className="text-sm text-muted-foreground">
              Policies transition through states: <code className="bg-muted px-1 rounded text-xs text-foreground">draft</code> →
              <code className="bg-muted px-1 rounded text-xs text-foreground">active</code> →
              <code className="bg-muted px-1 rounded text-xs text-foreground">paused</code>.
              Only <code className="bg-muted px-1 rounded text-xs text-foreground">active</code> policies <Keyword>SHALL</Keyword> be enforced on platforms.
            </p>
          </div>
          {/* Policies + Policy Rules endpoint cards */}
          <div className="mt-6">
            {getEndpointsBySection("Policies").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
            {getEndpointsBySection("Policy Rules").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 3.1: 45 Mandatory Policy Categories */}
        <section id="policy-categories" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">3.1 45 Mandatory Policy Categories</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              PCSS v1.0 defines 45 policy categories across 12 domains. The 19 new legislation-driven categories
              are backed by specific child safety laws and <Keyword>MUST</Keyword> be enforced by all compliant platforms.
            </p>
            <div className="space-y-3">
              {NEW_CATEGORIES.map((cat) => (
                <div key={cat.name} className="bg-muted/30 rounded p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div>
                      <code className="text-sm font-mono text-brand-green font-medium">{cat.name}</code>
                      <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:flex-shrink-0">
                      {cat.laws.split(", ").map(law => (
                        <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20 whitespace-nowrap">
                          {law}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-accent/5 border border-accent/20 rounded p-4">
              <p className="text-sm text-foreground">
                See the <a href="#rule-categories" className="text-brand-green font-medium hover:underline">complete API reference below</a> for full JSON schemas, field constraints, age-based defaults, platform support, and code examples for all 45 categories.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Regulated Platforms */}
        <section id="platforms" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">4. Regulated Platforms</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              All technology platforms serving minors <Keyword>SHALL</Keyword> register with the Phosra platform registry.
              Each platform declares its category, compliance level, supported capabilities, and authentication mechanism.
            </p>
            {/* Provider endpoint cards */}
            <div className="my-4">
              {getEndpointsBySection("Providers").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-success/5 border border-success/20 rounded p-4">
                <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-2 py-1 rounded-full text-xs font-bold border border-success/30">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  COMPLIANT
                </span>
                <p className="text-sm text-muted-foreground mt-3 mb-2">Full API enforcement. Real-time policy push.</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>NextDNS</li>
                  <li>CleanBrowsing</li>
                  <li>Android / Google Family Link</li>
                </ul>
              </div>
              <div className="bg-warning/5 border border-warning/20 rounded p-4">
                <span className="inline-flex items-center gap-1.5 bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-bold border border-warning/30">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  PROVISIONAL
                </span>
                <p className="text-sm text-muted-foreground mt-3 mb-2">Limited API. Partial enforcement capability.</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>Microsoft Family Safety</li>
                  <li>Apple Screen Time (MDM)</li>
                </ul>
              </div>
              <div className="bg-muted/50 border border-border rounded p-4">
                <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold border border-border">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  PENDING COMPLIANCE
                </span>
                <p className="text-sm text-muted-foreground mt-3 mb-2">No API. Manual compliance instructions provided.</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>Netflix, Disney+, Prime Video, YouTube</li>
                  <li>Hulu, Max, Roku</li>
                  <li>Xbox, PlayStation, Nintendo</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Compliance Verification */}
        <section id="compliance" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">5. Compliance Verification</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Platforms <Keyword>MUST</Keyword> establish a compliance link to prove they can receive enforcement instructions.
              Credentials are encrypted with AES-256-GCM at rest. Platforms <Keyword>SHALL</Keyword> support periodic re-verification.
            </p>
            <div className="bg-accent/5 border border-accent/20 rounded p-4">
              <p className="text-sm text-foreground"><strong>Credential Security:</strong> All platform credentials <Keyword>MUST</Keyword> be encrypted using AES-256-GCM before storage. Plaintext credentials <Keyword>MUST NOT</Keyword> be logged or stored unencrypted at any point in the pipeline.</p>
            </div>
            {/* Connection endpoint cards */}
            <div className="mt-2">
              {getEndpointsBySection("Connections").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 5.1: Compliance Links */}
        <section id="compliance-links" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">5.1 Compliance Links</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Compliance links connect a child to a specific platform for enforcement. Each link stores encrypted
              platform credentials (AES-256-GCM) and tracks verification status, supported capabilities, and enforcement history.
              Platforms <Keyword>MUST</Keyword> be re-verified when credentials are rotated.
            </p>
            <div className="bg-accent/5 border border-accent/20 rounded p-4">
              <p className="text-sm text-foreground"><strong>Lifecycle:</strong> Create link → Verify credentials → Enforce rules → Monitor health → Re-verify on rotation</p>
            </div>
          </div>
          <div className="mt-6">
            {getEndpointsBySection("Compliance Links").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 5.2: Quick Setup API */}
        <section id="quick-setup" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">5.2 Quick Setup API</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              The Quick Setup API provides a single-call onboarding flow that creates a family (if needed), registers a child,
              generates all 45 age-appropriate policy rules, and activates the policy. This endpoint <Keyword>SHOULD</Keyword> be
              the primary entry point for parent-facing applications.
            </p>
            <div className="bg-muted/30 rounded p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Endpoint</h4>
              <p className="text-xs font-mono text-muted-foreground"><span className="text-emerald-400">POST</span> /setup/quick</p>
            </div>
            <div className="bg-muted/30 rounded p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Request Body</h4>
              <pre className="bg-zinc-900 text-blue-400 rounded p-3 text-xs overflow-x-auto">
{`{
  "family_id": "uuid (optional — omit to create new family)",
  "family_name": "string (optional — used when creating new family)",
  "child_name": "string (required)",
  "birth_date": "YYYY-MM-DD (required)",
  "strictness": "recommended | strict | relaxed"
}`}
              </pre>
            </div>
            <div className="bg-muted/30 rounded p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Response</h4>
              <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto">
{`{
  "family": { "id": "...", "name": "..." },
  "child": { "id": "...", "name": "Emma", "birth_date": "2019-03-15" },
  "policy": { "id": "...", "status": "active" },
  "rules": [ ... ],  // ~20-25 enabled rules
  "age_group": "child",
  "max_ratings": { "mpaa": "PG", "tv": "TV-Y7", "esrb": "E" },
  "rule_summary": {
    "screen_time_minutes": 90,
    "bedtime_hour": 20,
    "web_filter_level": "strict",
    "content_rating": "PG",
    "total_rules_enabled": 22
  }
}`}
              </pre>
            </div>
            <div className="bg-accent/5 border border-accent/20 rounded p-4">
              <p className="text-sm text-foreground">
                <strong>Strictness levels:</strong> <code className="bg-muted px-1 rounded text-xs">recommended</code> uses age-appropriate
                defaults. <code className="bg-muted px-1 rounded text-xs">strict</code> reduces screen time by 30% and tightens timer intervals.
                <code className="bg-muted px-1 rounded text-xs">relaxed</code> increases screen time by 30% and extends timer intervals.
              </p>
            </div>
          </div>
          <div className="mt-6">
            {getEndpointsBySection("Quick Setup").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 6: Policy Enforcement */}
        <section id="enforcement" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">6. Policy Enforcement</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              The Phosra Enforcement Engine fans out policy rules to all verified platforms concurrently.
              Platforms <Keyword>MUST</Keyword> accept enforcement requests and report per-rule results.
              Enforcement jobs track status as: <code className="bg-muted px-1 rounded text-xs text-foreground">pending</code> →
              <code className="bg-muted px-1 rounded text-xs text-foreground">running</code> →
              <code className="bg-muted px-1 rounded text-xs text-foreground">completed</code> / <code className="bg-muted px-1 rounded text-xs text-foreground">partial</code> / <code className="bg-muted px-1 rounded text-xs text-foreground">failed</code>.
            </p>
            <div className="bg-accent/5 border border-accent/20 rounded p-4">
              <p className="text-sm text-foreground"><strong>Enforcement flow:</strong> Trigger enforcement → Job created → Fan out to platforms → Collect per-provider results → Retry failures</p>
            </div>
          </div>
          {/* Enforcement + Sync endpoint cards */}
          <div className="mt-6">
            {getEndpointsBySection("Enforcement").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
            {getEndpointsBySection("Sync").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 7: Content Rating Standard */}
        <section id="ratings" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">7. Content Rating Standard</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              PCSS defines a unified content rating framework spanning 5 international rating systems.
              Platforms <Keyword>MUST</Keyword> map their internal content ratings to the nearest PCSS equivalent.
              Cross-system equivalences <Keyword>SHALL</Keyword> be computed with a confidence score (0-1).
            </p>
            {/* Ratings endpoint cards */}
            <div className="my-2">
              {getEndpointsBySection("Ratings").map((ep) => (
                <EndpointCard key={ep.id} endpoint={ep} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 8: Event Notifications */}
        <section id="webhooks" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">8. Event Notifications</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Platforms <Keyword>SHOULD</Keyword> register webhook endpoints to receive real-time enforcement notifications.
              All webhook payloads <Keyword>MUST</Keyword> be signed using HMAC-SHA256 with the webhook secret.
              Platforms <Keyword>MUST</Keyword> verify the <code className="bg-muted px-1 rounded text-xs text-foreground">X-Phosra-Signature</code> header before processing.
            </p>
            <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto">
{`# Signature verification
signature = HMAC-SHA256(webhook_secret, request_body)
# Compare with X-Phosra-Signature header (hex-encoded)`}
            </pre>
            <div className="bg-accent/5 border border-accent/20 rounded p-4">
              <p className="text-sm text-foreground"><strong>Supported events:</strong>{" "}
                <code className="bg-muted px-1 rounded text-xs">enforcement.completed</code>{" "}
                <code className="bg-muted px-1 rounded text-xs">enforcement.failed</code>{" "}
                <code className="bg-muted px-1 rounded text-xs">policy.updated</code>{" "}
                <code className="bg-muted px-1 rounded text-xs">policy.activated</code>{" "}
                <code className="bg-muted px-1 rounded text-xs">compliance.verified</code>{" "}
                <code className="bg-muted px-1 rounded text-xs">compliance.failed</code>
              </p>
            </div>
          </div>
          <div className="mt-6">
            {getEndpointsBySection("Webhooks").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 9: Compliance Levels */}
        <section id="levels" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">9. Compliance Levels</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Each platform is classified into one of three compliance levels. Platforms <Keyword>MUST</Keyword> progress toward
              full compliance. Regression from Compliant to a lower level <Keyword>SHALL</Keyword> trigger regulatory review.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-success/5 border border-success/20 rounded p-5">
                <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-2 py-1 rounded-full text-xs font-bold border border-success/30">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  COMPLIANT
                </span>
                <h3 className="font-medium text-foreground mt-3 mb-2">Full API Enforcement</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Platform <Keyword>MUST</Keyword> accept all enforcement requests via API</li>
                  <li>Platform <Keyword>MUST</Keyword> report per-rule enforcement results</li>
                  <li>Platform <Keyword>MUST</Keyword> support credential validation</li>
                  <li>Platform <Keyword>SHOULD</Keyword> support webhook notifications</li>
                </ul>
              </div>
              <div className="bg-warning/5 border border-warning/20 rounded p-5">
                <span className="inline-flex items-center gap-1.5 bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-bold border border-warning/30">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  PROVISIONAL
                </span>
                <h3 className="font-medium text-foreground mt-3 mb-2">Limited API Access</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Platform <Keyword>MUST</Keyword> provide at least read access to safety settings</li>
                  <li>Platform <Keyword>SHOULD</Keyword> accept write requests for supported capabilities</li>
                  <li>Platform <Keyword>MUST</Keyword> document unsupported enforcement categories</li>
                </ul>
              </div>
              <div className="bg-muted/50 border border-border rounded p-5">
                <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold border border-border">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  PENDING COMPLIANCE
                </span>
                <h3 className="font-medium text-foreground mt-3 mb-2">Manual Compliance</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Platform <Keyword>MUST</Keyword> provide documented safety configuration steps</li>
                  <li>Platform <Keyword>SHALL</Keyword> publish a public API roadmap within 12 months</li>
                  <li>Platform <Keyword>MUST NOT</Keyword> remain at Pending level beyond 24 months</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Enforcement Timeline */}
        <section id="timeline" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">10. Enforcement Timeline</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              The following timeline governs the transition to mandatory PCSS compliance for all regulated platforms.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3 sm:gap-4 items-start">
                <div className="w-16 sm:w-24 flex-shrink-0 sm:text-right">
                  <span className="text-xs font-bold text-brand-green bg-accent/10 px-2 py-1 rounded">Phase 1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Voluntary Adoption</h4>
                  <p className="text-xs text-muted-foreground">Platforms <Keyword>MAY</Keyword> register and begin compliance integration. Early adopters receive Compliant certification.</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 items-start">
                <div className="w-16 sm:w-24 flex-shrink-0 sm:text-right">
                  <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded">Phase 2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Platform Registration</h4>
                  <p className="text-xs text-muted-foreground">Platforms serving minors <Keyword>SHOULD</Keyword> register with the PCSS platform registry to track compliance status.</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 items-start">
                <div className="w-16 sm:w-24 flex-shrink-0 sm:text-right">
                  <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded">Phase 3</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Full Enforcement</h4>
                  <p className="text-xs text-muted-foreground">All platforms <Keyword>MUST</Keyword> achieve at least Provisional compliance. Platforms at Pending <Keyword>SHALL</Keyword> face regulatory review and potential enforcement action.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* API Base URL */}
        <section id="api-base" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">API Base URL</h2>
          <div className="bg-card rounded border border-border p-6">
            <p className="text-sm text-muted-foreground mb-4">All PCSS API endpoints are served under:</p>
            <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs overflow-x-auto">{API_BASE}</pre>
            <p className="text-sm text-muted-foreground mt-4">Platforms <Keyword>MUST</Keyword> use HTTPS in production environments. HTTP <Keyword>MAY</Keyword> be used only in development.</p>
          </div>
        </section>

        {/* Section 12: Parent Experience */}
        <section id="parent-experience" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">12. Parent Experience</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Phosra provides a guided Quick Setup flow that enables parents to protect their children across
              all regulated platforms in under one minute. The three-step wizard handles family creation, age-based
              policy generation, and platform verification.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-accent/5 border border-accent/20 rounded p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-foreground font-bold text-lg flex items-center justify-center mx-auto mb-3">1</div>
                <h4 className="font-medium text-foreground mb-1">Tell Us About Your Child</h4>
                <p className="text-xs text-muted-foreground">Enter name, birth date, and choose a protection level (Recommended, Strict, or Relaxed).</p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-foreground font-bold text-lg flex items-center justify-center mx-auto mb-3">2</div>
                <h4 className="font-medium text-foreground mb-1">Review Protections</h4>
                <p className="text-xs text-muted-foreground">See plain-language summary cards for screen time, content ratings, web filtering, social controls, privacy, and algorithm safety.</p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-foreground font-bold text-lg flex items-center justify-center mx-auto mb-3">3</div>
                <h4 className="font-medium text-foreground mb-1">Connect Platforms</h4>
                <p className="text-xs text-muted-foreground">Verify compliance on platforms with a progress indicator. Enforce with one click after connecting.</p>
              </div>
            </div>
            <div className="bg-muted/30 rounded p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">What Gets Created</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Family (if not already created)</li>
                <li>Child profile with age computation</li>
                <li>Active safety policy with ~20-25 enabled rules across all 45 categories</li>
                <li>Age-appropriate content ratings across 5 rating systems</li>
                <li>Legislation-compliant rules for algorithmic safety, notifications, advertising, and data privacy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 13: Community Standards */}
        <section id="standards" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">13. Community Standards</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Phosra supports <strong className="text-foreground">community standards</strong> (also called movements) — curated rule sets based
              on expert guidance, research, and advocacy organizations. Parents <Keyword>MAY</Keyword> adopt one or
              more standards for each child to automatically generate matching policy rules.
            </p>
            <p className="text-sm text-muted-foreground">
              Standards provide a &quot;one-click&quot; way to align with community guidelines like the
              <strong className="text-foreground"> Four Norms</strong> from Jonathan Haidt&apos;s Anxious Generation,
              <strong className="text-foreground"> Wait Until 8th</strong>, or
              <strong className="text-foreground"> Common Sense Media</strong> age ratings.
              When adopted, the standard&apos;s rules are merged into the child&apos;s active policy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Expert Standards</h4>
                <p className="text-xs text-muted-foreground">Research-backed rule sets from child development experts and psychologists.</p>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Community Pledges</h4>
                <p className="text-xs text-muted-foreground">Grassroots movements like Wait Until 8th and Smartphone Free Childhood.</p>
              </div>
              <div className="bg-muted/30 rounded p-4">
                <h4 className="font-medium text-foreground mb-1">Organization Guidelines</h4>
                <p className="text-xs text-muted-foreground">Recommendations from AAP, Common Sense Media, and other organizations.</p>
              </div>
            </div>
            <div className="bg-accent/5 border border-accent/20 rounded p-4">
              <p className="text-sm text-foreground">
                Browse all available standards at <a href="/standards" className="text-brand-green font-medium hover:underline">/standards</a>.
                The Phosra API currently includes <strong>31 community standards</strong> spanning expert guidance, parenting pledges, and organizational recommendations.
              </p>
            </div>
          </div>
          <div className="mt-6">
            {getEndpointsBySection("Community Standards").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Section 14: Parental Control Sources */}
        <section id="sources" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">14. Parental Control Sources</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Phosra maintains a registry of <strong className="text-foreground">21 parental control applications and services</strong> that
              can be connected as <em>sources</em> — apps parents already use to manage their children&apos;s devices.
              Unlike target platforms that Phosra pushes rules <em>to</em>, sources are apps that Phosra integrates
              <em> with</em> to push rules <em>through</em>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-success/5 border border-success/20 rounded p-4">
                <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-2 py-1 rounded-full text-xs font-bold border border-success/30">Public API</span>
                <p className="text-xs text-muted-foreground mt-2">Direct API integration. Phosra pushes rules automatically via documented REST endpoints.</p>
                <p className="text-xs text-foreground mt-1">Qustodio, Apple Screen Time (MDM), Google Family Link</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded p-4">
                <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full text-xs font-bold border border-blue-500/30">Managed API</span>
                <p className="text-xs text-muted-foreground mt-2">Integration with platforms offering documented APIs. Phosra translates rules into each platform&apos;s native format.</p>
                <p className="text-xs text-foreground mt-1">Platforms with REST or MDM APIs</p>
              </div>
              <div className="bg-muted/50 border border-border rounded p-4">
                <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold border border-border">No API</span>
                <p className="text-xs text-muted-foreground mt-2">Guided setup mode. Phosra generates step-by-step instructions for manual configuration.</p>
                <p className="text-xs text-foreground mt-1">Net Nanny, Norton Family, Kaspersky, Circle</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded p-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full text-xs font-bold border border-amber-500/30">Undocumented</span>
                <p className="text-xs text-muted-foreground mt-2">Identified integration points. Availability may vary.</p>
                <p className="text-xs text-foreground mt-1">Bark Phone</p>
              </div>
            </div>
            <div className="bg-accent/5 border border-accent/20 rounded p-4">
              <p className="text-sm text-foreground">
                Each source is mapped to Phosra&apos;s 45 rule categories with <strong>full</strong>, <strong>partial</strong>, or <strong>none</strong> support
                per capability. Browse all sources with their capability matrices at{" "}
                <a href="/parental-controls" className="text-brand-green font-medium hover:underline">/parental-controls</a>.
              </p>
            </div>
            <div className="bg-muted/30 rounded p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Source API Pattern</h4>
              <div className="text-xs font-mono space-y-1 text-muted-foreground">
                <p><span className="text-emerald-400">POST</span> /v1/sources — Connect a parental control app to a child</p>
                <p><span className="text-emerald-400">POST</span> /v1/sources/{'{'}sourceID{'}'}/sync — Push all rules to source</p>
                <p><span className="text-emerald-400">POST</span> /v1/sources/{'{'}sourceID{'}'}/rules — Push individual capability</p>
                <p><span className="text-blue-400">GET</span> /v1/sources/{'{'}sourceID{'}'}/guide/{'{'}category{'}'} — Get guided setup steps (no-API sources)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 15: Family Reports */}
        <section id="reports" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">15. Family Reports</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              The reporting API provides family-level overviews of enforcement status, compliance health, and
              per-child statistics. Reports <Keyword>SHOULD</Keyword> be used by parent-facing applications to
              surface the current protection state at a glance.
            </p>
          </div>
          <div className="mt-6">
            {getEndpointsBySection("Reports").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* API Reference: Feedback */}
        <section id="feedback" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Feedback</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Anonymous feedback endpoint for collecting user experience data. No authentication required.
            </p>
          </div>
          <div className="mt-6">
            {getEndpointsBySection("Feedback").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* API Reference: Apple Device Sync */}
        <section id="apple-device-sync" className="border-t border-border/50 pt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Apple Device Sync</h2>
          <div className="bg-card rounded border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Native iOS integration endpoints for Apple Screen Time enforcement via FamilyControls,
              ManagedSettings, and DeviceActivity frameworks. Devices register with parent authorization,
              pull versioned policies with <code className="text-xs bg-muted px-1 py-0.5 rounded">304 Not Modified</code> support,
              and report per-category enforcement results back to the API.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-3">
                <span className="text-xs font-bold text-emerald-500">Device Registration</span>
                <p className="text-xs text-muted-foreground mt-1">Parent-authenticated CRUD for managing child devices and capabilities</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded p-3">
                <span className="text-xs font-bold text-blue-500">Policy Sync</span>
                <p className="text-xs text-muted-foreground mt-1">Versioned policy pull with APNs silent push notifications on changes</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded p-3">
                <span className="text-xs font-bold text-amber-500">Enforcement Reports</span>
                <p className="text-xs text-muted-foreground mt-1">Per-category enforcement status reporting with framework context</p>
              </div>
            </div>
          </div>

          {/* APNs Silent Push Payload */}
          <div id="apns-push-payload" className="mt-8 bg-card rounded border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                APNs Silent Push Payload
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                When a policy is updated, Phosra sends a silent push notification to all active devices registered for that child.
                Your app <Keyword>MUST</Keyword> handle this in <code className="text-xs bg-muted px-1 py-0.5 rounded">application(_:didReceiveRemoteNotification:fetchCompletionHandler:)</code> and
                trigger a policy refresh via <code className="text-xs bg-muted px-1 py-0.5 rounded">GET /device/policy</code>.
              </p>
            </div>
            <div className="p-6 space-y-5">
              {/* Payload JSON */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Push Payload</h4>
                <div className="bg-zinc-900 rounded p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                  <pre>{`{
  "aps": {
    "content-available": 1
  },
  "phosra": {
    "event": "policy.updated",
    "version": 3
  }
}`}</pre>
                </div>
              </div>

              {/* Field descriptions */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fields</h4>
                <div className="border border-border rounded divide-y divide-border text-sm">
                  <div className="flex px-4 py-2.5">
                    <code className="text-xs text-blue-400 font-mono w-52 flex-shrink-0">aps.content-available</code>
                    <span className="text-xs text-muted-foreground">Always <code className="bg-muted px-1 py-0.5 rounded">1</code> — marks this as a silent/background push. No alert, sound, or badge.</span>
                  </div>
                  <div className="flex px-4 py-2.5">
                    <code className="text-xs text-blue-400 font-mono w-52 flex-shrink-0">phosra.event</code>
                    <span className="text-xs text-muted-foreground">Event type. Currently always <code className="bg-muted px-1 py-0.5 rounded">&quot;policy.updated&quot;</code>.</span>
                  </div>
                  <div className="flex px-4 py-2.5">
                    <code className="text-xs text-blue-400 font-mono w-52 flex-shrink-0">phosra.version</code>
                    <span className="text-xs text-muted-foreground">The new policy version number. Compare with your cached version — if higher, call <code className="bg-muted px-1 py-0.5 rounded">GET /device/policy</code>.</span>
                  </div>
                </div>
              </div>

              {/* APNs Headers */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">APNs HTTP/2 Headers (Server → Apple)</h4>
                <div className="border border-border rounded divide-y divide-border text-sm">
                  <div className="flex px-4 py-2.5">
                    <code className="text-xs text-emerald-400 font-mono w-52 flex-shrink-0">apns-push-type</code>
                    <span className="text-xs text-muted-foreground"><code className="bg-muted px-1 py-0.5 rounded">background</code></span>
                  </div>
                  <div className="flex px-4 py-2.5">
                    <code className="text-xs text-emerald-400 font-mono w-52 flex-shrink-0">apns-priority</code>
                    <span className="text-xs text-muted-foreground"><code className="bg-muted px-1 py-0.5 rounded">5</code> — required for silent push (priority 10 would require an alert)</span>
                  </div>
                  <div className="flex px-4 py-2.5">
                    <code className="text-xs text-emerald-400 font-mono w-52 flex-shrink-0">apns-topic</code>
                    <span className="text-xs text-muted-foreground">Your app&apos;s bundle ID (e.g. <code className="bg-muted px-1 py-0.5 rounded">com.downtime.downtime</code>)</span>
                  </div>
                </div>
              </div>

              {/* Swift handler example */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Swift Handler Example</h4>
                <div className="bg-zinc-900 rounded p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                  <pre>{`func application(
  _ application: UIApplication,
  didReceiveRemoteNotification userInfo: [AnyHashable: Any],
  fetchCompletionHandler handler: @escaping (UIBackgroundFetchResult) -> Void
) {
  guard let phosra = userInfo["phosra"] as? [String: Any],
        let event = phosra["event"] as? String,
        event == "policy.updated",
        let version = phosra["version"] as? Int else {
    handler(.noData)
    return
  }

  // Only refresh if the pushed version is newer than our cached version
  guard version > PolicyCache.shared.currentVersion else {
    handler(.noData)
    return
  }

  Task {
    do {
      let policy = try await PhosraAPI.fetchPolicy()
      PolicyEnforcer.shared.apply(policy)
      handler(.newData)
    } catch {
      handler(.failed)
    }
  }
}`}</pre>
                </div>
              </div>

              {/* Important notes */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded p-4">
                <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Important</h4>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>Enable <strong>Background Modes → Remote notifications</strong> in your Xcode project capabilities.</li>
                  <li>Silent push is best-effort — iOS may throttle or delay delivery. Always implement periodic polling as a fallback (recommended: every 15 minutes via <code className="bg-muted px-1 py-0.5 rounded">BGAppRefreshTask</code>).</li>
                  <li>The push is sent to <strong>all active devices</strong> for the child, not just the device that last polled.</li>
                  <li>If the device token changes (e.g. after app reinstall), update it via <code className="bg-muted px-1 py-0.5 rounded">PUT /devices/{'{'}deviceID{'}'}</code> with the new <code className="bg-muted px-1 py-0.5 rounded">apns_token</code>.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {getEndpointsBySection("Apple Device Sync").map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* Page footer */}
        <div className="border-t border-border/50 mt-12 pt-8 pb-4 text-center text-xs text-muted-foreground">
          Phosra Child Safety Standard (PCSS) v1.0
        </div>
      </div>

      {/* Scroll-to-top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-[hsl(var(--brand-green))] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </>
  )
}
