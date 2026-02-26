import type { Metadata } from "next"
import Link from "next/link"
import { BlogCodeBlock } from "../_components/BlogCodeBlock"

export const metadata: Metadata = {
  title: "How We Normalized 67 Child Safety Laws into 45 API Rule Categories | Phosra",
  description:
    "A technical deep-dive into the Phosra Child Safety Spec (PCSS): how we read every provision of 67 child safety laws across 7 jurisdictions and distilled them into a single enforceable taxonomy of 45 rule categories.",
  openGraph: {
    title: "How We Normalized 67 Child Safety Laws into 45 API Rule Categories",
    description:
      "A technical deep-dive into the Phosra Child Safety Spec (PCSS): how we read every provision of 67 child safety laws across 7 jurisdictions and distilled them into a single enforceable taxonomy of 45 rule categories.",
    type: "article",
    publishedTime: "2026-02-25T00:00:00.000Z",
    authors: ["Phosra"],
  },
}

export default function PCSSBlogPost() {
  return (
    <article className="py-16 sm:py-24">
      <div className="mx-auto max-w-[720px] px-6">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <time dateTime="2026-02-25">February 25, 2026</time>
            <span className="text-border">|</span>
            <span>Technical Deep-Dive</span>
            <span className="text-border">|</span>
            <span>15 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15] mb-6 font-[family-name:var(--font-display)]">
            How We Normalized 67 Child Safety Laws into 45 API Rule Categories
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The Phosra Child Safety Spec (PCSS) is an open specification that maps every child safety law we could find to a single, machine-readable taxonomy. This is the technical story of how we built it.
          </p>
        </header>

        {/* Divider */}
        <div className="h-px bg-border mb-12" />

        {/* Opening */}
        <section className="mb-12">
          <p className="text-foreground/90 leading-relaxed mb-6">
            My 7-year-old got a Nintendo Switch for his birthday. I sat down to configure parental controls and spent 45 minutes in Nintendo&apos;s app. Then I realized I also needed to update YouTube, Netflix, Roblox, the iPad, and the WiFi router. Each platform has its own parental control system. Nintendo uses a custom age-based rating. Apple uses content descriptors plus app-level restrictions. YouTube&apos;s &ldquo;Restricted Mode&rdquo; is a single toggle &mdash; on or off. Netflix has its own maturity ratings that don&apos;t map to any other system. None of these platforms share a vocabulary for what &ldquo;age-appropriate&rdquo; means, and none of them can import settings from each other.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-6">
            As an engineer, I recognized this as a normalization problem &mdash; the same class of issue as timezones before the Olson database, or payment processing before Stripe. N platforms, each with their own schema for child safety, and no interoperability layer.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            It gets worse at the regulatory level. There are now 67 child safety laws across 7 jurisdictions &mdash; US federal, US state, EU, UK, Asia-Pacific, Americas, and Middle East & Africa. Each law defines its own requirements for content filtering, screen time, privacy, algorithmic safety, and parental consent. A platform operating globally needs to comply with all of them simultaneously, but there is no shared language between KOSA&apos;s &ldquo;duty of care&rdquo; requirements and the EU Digital Services Act&apos;s &ldquo;systemic risk mitigation&rdquo; obligations, even when they mandate functionally identical controls.
          </p>
        </section>

        {/* Section 1 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-display)]">
            67 Laws, 60+ Platforms, No Shared Language
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            The compliance fragmentation problem is worse than most engineers realize. Consider three laws that all address algorithmic recommendations for minors:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-foreground/90 mb-6">
            <li>
              <strong>KOSA</strong> (US Federal) requires platforms to let minors &ldquo;opt out of personalized algorithmic recommendations&rdquo; and disable addictive design features like autoplay and notification streaks by default.
            </li>
            <li>
              <strong>EU Digital Services Act</strong> requires &ldquo;very large online platforms&rdquo; to assess systemic risks to minors and prohibits profiling-based recommendations for minors when they&apos;re aware a user is a child.
            </li>
            <li>
              <strong>California SB 976</strong> (the Protecting Our Kids from Social Media Addiction Act) bans platforms from serving addictive feeds to minors without parental consent and restricts notifications during school hours and overnight.
            </li>
          </ul>
          <p className="text-foreground/90 leading-relaxed mb-6">
            Three different laws, three different legal frameworks, three different enforcement mechanisms &mdash; but they all boil down to two technical controls: disable algorithmic feeds and limit addictive design patterns. A developer building compliance for a social media app has to read all three laws, understand the nuances, and implement what is effectively the same feature three different ways, because each law uses different terminology and defines different thresholds.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-6">
            Now multiply that across 67 laws. The Kids Online Safety and Media Act (KOSMA) adds algorithmic audit requirements. Virginia&apos;s SB 854 mandates notification curfews. New York&apos;s SAFE for Kids Act requires usage timer notifications. COPPA 2.0 bans targeted advertising to minors. Every US state that has passed a children&apos;s code or age-appropriate design code adds its own variation of the same core protections.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            The industry needs what the timezone world got with the IANA Time Zone Database: a single, maintained, machine-readable mapping that normalizes the mess. That is what PCSS is.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-display)]">
            From Legal Text to JSON: The Rule Category Taxonomy
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            The core of PCSS is a taxonomy of 45 rule categories. These aren&apos;t arbitrary &mdash; every one of them was derived by reading every provision of every law in our registry and identifying the distinct, enforceable technical controls they require. When multiple laws mandate the same control, that control gets a single category. When a law introduces a genuinely new requirement, we add a new category.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-4">
            The 45 categories are organized into 11 domains:
          </p>

          {/* Rule categories table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Domain</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Rule Categories</th>
                </tr>
              </thead>
              <tbody className="font-[family-name:var(--font-mono)] text-xs">
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Content</td>
                  <td className="px-4 py-3 text-foreground/80">content_rating, content_block_title, content_allow_title, content_allowlist_mode, content_descriptor_block</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Time</td>
                  <td className="px-4 py-3 text-foreground/80">time_daily_limit, time_scheduled_hours, time_per_app_limit, time_downtime</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Purchases</td>
                  <td className="px-4 py-3 text-foreground/80">purchase_approval, purchase_spending_cap, purchase_block_iap</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Social</td>
                  <td className="px-4 py-3 text-foreground/80">social_contacts, social_chat_control, social_multiplayer</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Web Filtering</td>
                  <td className="px-4 py-3 text-foreground/80">web_safesearch, web_category_block, web_custom_allowlist, web_custom_blocklist, web_filter_level</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Privacy</td>
                  <td className="px-4 py-3 text-foreground/80">privacy_location, privacy_profile_visibility, privacy_data_sharing, privacy_account_creation</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Monitoring</td>
                  <td className="px-4 py-3 text-foreground/80">monitoring_activity, monitoring_alerts</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Algorithmic Safety</td>
                  <td className="px-4 py-3 text-foreground/80">algo_feed_control, addictive_design_control</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Notifications</td>
                  <td className="px-4 py-3 text-foreground/80">notification_curfew, usage_timer_notification</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Advertising & Data</td>
                  <td className="px-4 py-3 text-foreground/80">targeted_ad_block, dm_restriction, age_gate, data_deletion_request, geolocation_opt_in</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Compliance & Safety</td>
                  <td className="px-4 py-3 text-foreground/80">csam_reporting, library_filter_compliance, ai_minor_interaction, social_media_min_age, image_rights_minor</td>
                </tr>
                <tr className="bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground font-sans text-sm">Legislation (2025)</td>
                  <td className="px-4 py-3 text-foreground/80">parental_consent_gate, parental_event_notification, screen_time_report, commercial_data_ban, algorithmic_audit</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-foreground/90 leading-relaxed mb-6">
            Each law in our registry maps to one or more of these categories. Here is what a real law entry looks like in our system &mdash; this is the actual KOSA entry from our{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">LawEntry</code> type:
          </p>

          <BlogCodeBlock
            language="json"
            filename="law-registry.ts — KOSA entry"
            code={`{
  "id": "kosa",
  "shortName": "KOSA",
  "fullName": "Kids Online Safety Act",
  "jurisdiction": "United States (Federal)",
  "jurisdictionGroup": "us-federal",
  "country": "US",
  "status": "passed",
  "statusLabel": "Passed Senate (Jul 2024)",
  "summary": "Establishes a duty of care for platforms, requiring
    them to disable addictive features and algorithmic
    feeds for minors by default.",
  "keyProvisions": [
    "Duty of care requiring platforms to prevent and
     mitigate harms to minors",
    "Strongest default privacy settings for minors
     must be enabled by default",
    "Minors must be able to opt out of algorithmic
     recommendations",
    "Platforms must disable addictive design features
     by default for minors",
    "FTC enforcement authority with civil penalties
     up to $50,000 per violation",
    "Annual independent audits of platform compliance"
  ],
  "ruleCategories": [
    "algo_feed_control",
    "addictive_design_control",
    "targeted_ad_block",
    "algorithmic_audit"
  ],
  "platforms": ["Netflix", "YouTube", "TikTok", "Instagram"],
  "ageThreshold": "All minors",
  "penaltyRange": "Up to $50,000 per violation"
}`}
          />

          <p className="text-foreground/90 leading-relaxed mb-6">
            The <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">ruleCategories</code> field is the critical bridge. It tells any consuming system exactly which technical controls this law requires, using a vocabulary shared by every law in the registry. When KOSA says &ldquo;minors must be able to opt out of algorithmic recommendations,&rdquo; that maps to <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">algo_feed_control</code>. When it says &ldquo;disable addictive design features,&rdquo; that maps to <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">addictive_design_control</code>. A developer who implements support for these two rule categories is simultaneously compliant with the equivalent provisions in KOSA, the EU DSA, California SB 976, and every other law that mandates the same controls.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            Why 45 categories and not 30 or 100? Because we started from the legal text, not from engineering convenience. We read every provision of every law and asked: &ldquo;Does this require a technical control that is genuinely distinct from every other category we already have?&rdquo; If yes, we added a new category. If the provision could be satisfied by an existing category, we mapped it there. The result is a taxonomy that is as small as possible while covering every enforceable requirement across all 67 laws. We expect the number to grow as new legislation passes &mdash; the five most recent categories (parental_consent_gate, parental_event_notification, screen_time_report, commercial_data_ban, algorithmic_audit) were added to cover 2025 legislation.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-display)]">
            The Platform Adapter Interface
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            A taxonomy of rule categories is useful for reading comprehension, but it doesn&apos;t enforce anything by itself. To actually apply rules to a platform, we need an adapter layer. In Phosra&apos;s architecture, every platform implements a single Go interface:
          </p>

          <BlogCodeBlock
            language="go"
            filename="provider/adapter.go"
            code={`// Adapter is the core interface all platforms implement.
type Adapter interface {
    Info() PlatformInfo
    Capabilities() []Capability
    ValidateAuth(ctx context.Context, auth AuthConfig) error
    EnforcePolicy(ctx context.Context, req EnforcementRequest) (
        *EnforcementResult, error,
    )
    GetCurrentConfig(ctx context.Context, auth AuthConfig) (
        map[string]any, error,
    )
    RevokePolicy(ctx context.Context, auth AuthConfig) error
    SupportsWebhooks() bool
    RegisterWebhook(ctx context.Context, auth AuthConfig,
        callbackURL string) error
}`}
          />

          <p className="text-foreground/90 leading-relaxed mb-6">
            The key method is <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">Capabilities()</code>. Each adapter declares what it can do &mdash; not which rule categories it supports, but which capabilities it has. This is an important distinction. A <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">Capability</code> is a cluster of related rule categories that a platform can handle natively. For example, the <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">web_filtering</code> capability covers five rule categories: <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">web_filter_level</code>, <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">web_category_block</code>, <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">web_custom_allowlist</code>, <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">web_custom_blocklist</code>, and <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">web_safesearch</code>.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-6">
            Here is a concrete example. The NextDNS adapter declares four capabilities:
          </p>

          <BlogCodeBlock
            language="go"
            filename="adapters/nextdns/adapter.go"
            code={`func (a *Adapter) Info() provider.PlatformInfo {
    return provider.PlatformInfo{
        ID:          "nextdns",
        Name:        "NextDNS",
        Category:    domain.PlatformCategoryDNS,
        Tier:        domain.ComplianceLevelCompliant,
        Description: "DNS-level content filtering and parental controls",
        AuthType:    "api_key",
    }
}

func (a *Adapter) Capabilities() []provider.Capability {
    return []provider.Capability{
        provider.CapWebFiltering,
        provider.CapSafeSearch,
        provider.CapCustomBlocklist,
        provider.CapCustomAllowlist,
    }
}`}
          />

          <p className="text-foreground/90 leading-relaxed mb-6">
            NextDNS can filter web content, enforce safe search, and manage custom block and allow lists. It cannot set screen time limits, manage in-app purchases, or control social features &mdash; those capabilities don&apos;t exist at the DNS layer. When the engine encounters a rule like <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">time_daily_limit</code> targeting a child who has NextDNS connected, it knows immediately that NextDNS can&apos;t handle it and routes the rule elsewhere.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            This capability-based routing is what makes PCSS work as a universal spec. You don&apos;t need to know the specific API of every platform. You declare rules using the 45-category taxonomy, and the engine figures out which platform can enforce each rule. If no connected platform supports a given rule category natively, the engine routes it to one of Phosra&apos;s own services as a fallback.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-display)]">
            Split-Brain Enforcement
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            The hardest problem in the system is what we call &ldquo;split-brain enforcement.&rdquo; When a parent sets a policy for their child, the rules need to be enforced across every connected platform. But not every platform can handle every rule. The CompositeEngine solves this by splitting each rule set into two buckets: rules the native platform adapter handles, and rules that Phosra&apos;s services handle.
          </p>

          <BlogCodeBlock
            language="go"
            filename="engine/composite.go"
            code={`// RouteRules splits rules between native provider and Phosra services.
// For each enabled rule, it checks if the adapter's capabilities cover it.
// If yes -> NativeRules. If no -> routes to the appropriate Phosra service.
func (e *CompositeEngine) RouteRules(
    adapter provider.Adapter,
    rules []domain.PolicyRule,
) *RuleRouting {
    routing := &RuleRouting{
        PhosraRules: make(map[string][]domain.PolicyRule),
    }

    adapterCaps := adapter.Capabilities()

    for _, rule := range rules {
        if !rule.Enabled {
            continue
        }

        // Check if the adapter natively supports this rule
        nativelySupported := false
        for _, cap := range adapterCaps {
            if matchesCapability(rule.Category, cap) {
                nativelySupported = true
                break
            }
        }

        if nativelySupported {
            routing.NativeRules = append(routing.NativeRules, rule)
        } else {
            // Route to the appropriate Phosra service
            svcName, ok := e.categoryToSvc[rule.Category]
            if ok {
                routing.PhosraRules[svcName] =
                    append(routing.PhosraRules[svcName], rule)
            }
        }
    }

    return routing
}`}
          />

          <p className="text-foreground/90 leading-relaxed mb-6">
            The engine is initialized with 9 Phosra services, each responsible for a subset of rule categories that platforms commonly lack native support for:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Service</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">notification</td>
                  <td className="px-4 py-3 text-foreground/80">Curfew notifications, usage timer alerts, parental event notifications</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">analytics</td>
                  <td className="px-4 py-3 text-foreground/80">Activity monitoring, alerts, screen time reporting</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">age_verification</td>
                  <td className="px-4 py-3 text-foreground/80">Age gates, parental consent gates, social media minimum age enforcement</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">content_classify</td>
                  <td className="px-4 py-3 text-foreground/80">Content rating, descriptor blocking, allowlist mode</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">privacy_consent</td>
                  <td className="px-4 py-3 text-foreground/80">Data deletion requests, data sharing opt-outs, profile visibility</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">compliance_attest</td>
                  <td className="px-4 py-3 text-foreground/80">CSAM reporting, library filter compliance, AI interaction rules, algorithmic audits</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">social</td>
                  <td className="px-4 py-3 text-foreground/80">Contact management, chat controls, DM restrictions, multiplayer settings</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">location</td>
                  <td className="px-4 py-3 text-foreground/80">Location tracking, geolocation opt-in enforcement</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-foreground/80">purchase</td>
                  <td className="px-4 py-3 text-foreground/80">Purchase approval workflows, spending caps, IAP blocking</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-foreground/90 leading-relaxed mb-6">
            This split-brain architecture solves a real problem. Consider a family that has NextDNS for web filtering, Apple Screen Time for device management, and YouTube connected directly. When the parent enables a policy with <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">web_safesearch</code>, <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">time_daily_limit</code>, and <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">algo_feed_control</code>, the engine routes each rule to the right handler:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
            <li><code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">web_safesearch</code> goes to NextDNS (native capability)</li>
            <li><code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">time_daily_limit</code> goes to Apple Screen Time (native capability)</li>
            <li><code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">algo_feed_control</code> goes to YouTube (native capability via algorithmic safety)</li>
          </ul>
          <p className="text-foreground/90 leading-relaxed">
            If the parent also enables <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">notification_curfew</code> and none of the connected platforms support it natively, the engine routes it to Phosra&apos;s notification service, which handles the curfew scheduling itself and sends push notifications to the child&apos;s registered devices. The parent doesn&apos;t need to know which platform handles which rule. The policy is expressed once in PCSS, and the engine does the routing.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-display)]">
            The Compliance Graph
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            The real power of PCSS emerges when you see the three-way mapping as a graph. On one side, you have laws. In the middle, you have rule categories. On the other side, you have platform capabilities. Every law maps to a set of rule categories. Every capability maps to a set of rule categories. A platform is compliant with a law if, for every rule category that law requires, at least one connected platform (or Phosra service) has a capability that covers it.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-6">
            The capability-to-rule mapping is defined in the engine&apos;s <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">matchesCapability</code> function. Here is the full mapping:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Capability</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Rule Categories Covered</th>
                </tr>
              </thead>
              <tbody className="font-[family-name:var(--font-mono)] text-xs">
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-foreground/80">content_rating</td>
                  <td className="px-4 py-3 text-foreground/80">content_rating, content_block_title, content_allow_title, content_allowlist_mode, content_descriptor_block</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-foreground/80">time_limit</td>
                  <td className="px-4 py-3 text-foreground/80">time_daily_limit, time_per_app_limit</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-foreground/80">scheduled_hours</td>
                  <td className="px-4 py-3 text-foreground/80">time_scheduled_hours, time_downtime</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-foreground/80">purchase_control</td>
                  <td className="px-4 py-3 text-foreground/80">purchase_approval, purchase_spending_cap, purchase_block_iap</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-foreground/80">web_filtering</td>
                  <td className="px-4 py-3 text-foreground/80">web_filter_level, web_category_block, web_custom_allowlist, web_custom_blocklist</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-foreground/80">safe_search</td>
                  <td className="px-4 py-3 text-foreground/80">web_safesearch</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-foreground/80">social_control</td>
                  <td className="px-4 py-3 text-foreground/80">social_contacts, social_chat_control, social_multiplayer, dm_restriction</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-foreground/80">location_tracking</td>
                  <td className="px-4 py-3 text-foreground/80">privacy_location, geolocation_opt_in</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-foreground/80">activity_monitoring</td>
                  <td className="px-4 py-3 text-foreground/80">monitoring_activity, monitoring_alerts, screen_time_report</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-foreground/80">privacy_control</td>
                  <td className="px-4 py-3 text-foreground/80">privacy_profile_visibility, privacy_data_sharing, privacy_account_creation, data_deletion_request</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-foreground/80">algorithmic_safety</td>
                  <td className="px-4 py-3 text-foreground/80">algo_feed_control, addictive_design_control, algorithmic_audit</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-foreground/80">notification_control</td>
                  <td className="px-4 py-3 text-foreground/80">notification_curfew, usage_timer_notification, parental_event_notification</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-foreground/80">ad_data_control</td>
                  <td className="px-4 py-3 text-foreground/80">targeted_ad_block, commercial_data_ban</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-3 text-foreground/80">age_verification</td>
                  <td className="px-4 py-3 text-foreground/80">age_gate, parental_consent_gate, social_media_min_age</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground/80">compliance_reporting</td>
                  <td className="px-4 py-3 text-foreground/80">csam_reporting, library_filter_compliance, ai_minor_interaction, image_rights_minor</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-foreground/90 leading-relaxed mb-6">
            This graph is what makes compliance auditable. Given any law, you can programmatically ask: &ldquo;Which rule categories does this law require? For each of those categories, which of the family&apos;s connected platforms have a capability that covers it? What is the compliance gap?&rdquo; The answer is always computable because every edge in the graph is explicit in the data.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            For platforms building their own compliance, the graph works in reverse. A platform can ask: &ldquo;Given my declared capabilities, which laws am I already covering, and which rule categories am I missing?&rdquo; This turns the open-ended question of &ldquo;are we compliant?&rdquo; into a specific, enumerable list of gaps to close.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-display)]">
            The PCSS v1.0 Spec
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            PCSS defines a spec format for enforcement requests and responses. An enforcement request describes a set of rules to apply for a child, expressed using the 45-category taxonomy. Here is the request format:
          </p>

          <BlogCodeBlock
            language="json"
            filename="PCSS Enforcement Request"
            code={`// PCSS Enforcement Request
{
  "rules": [
    {
      "category": "web_safesearch",
      "enabled": true,
      "config": { "enabled": true }
    },
    {
      "category": "time_daily_limit",
      "enabled": true,
      "config": { "minutes": 120 }
    },
    {
      "category": "algo_feed_control",
      "enabled": true,
      "config": { "mode": "chronological" }
    },
    {
      "category": "notification_curfew",
      "enabled": true,
      "config": {
        "start": "21:00",
        "end": "07:00",
        "timezone": "America/Chicago"
      }
    }
  ],
  "auth_config": {
    "api_key": "...",
    "extra_params": { "profile_id": "abc123" }
  },
  "child_name": "Emma",
  "child_age": 10
}`}
          />

          <p className="text-foreground/90 leading-relaxed mb-6">
            The response reports exactly what happened &mdash; which rules were applied, which were skipped (because the platform doesn&apos;t support them), and which failed:
          </p>

          <BlogCodeBlock
            language="json"
            filename="PCSS Enforcement Response"
            code={`// PCSS Enforcement Response
{
  "rules_applied": 3,
  "rules_skipped": 1,
  "rules_failed": 0,
  "details": {
    "web_safesearch": "applied",
    "time_daily_limit": "applied",
    "algo_feed_control": "applied",
    "notification_curfew": {
      "routed_to": "phosra_notification_service",
      "status": "applied"
    }
  },
  "message": "3 rules applied natively, 1 routed to Phosra services"
}`}
          />

          <p className="text-foreground/90 leading-relaxed mb-6">
            The <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">EnforcementRequest</code> and <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">EnforcementResult</code> types are defined in our Go provider package. The request contains the rules (each with a category, enabled flag, and JSON config), authentication credentials, and optional child metadata. The response is a simple accounting of what happened, with per-rule details for debugging and audit trails.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            We chose this format specifically because it is platform-agnostic. The request doesn&apos;t mention NextDNS or Apple or YouTube. It speaks only in terms of rule categories. The adapter translates rule categories into platform-specific API calls. This means a PCSS-compatible request can be sent to any adapter without modification &mdash; the adapter decides which rules it can handle and reports back.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-display)]">
            What We&apos;re Open-Sourcing
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            We believe the taxonomy and the law data should be public infrastructure. The specific problem &mdash; &ldquo;what does KOSA require, technically?&rdquo; &mdash; should not require a lawyer and three months of work for every platform to answer independently. The PCSS spec repo contains:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
            <li><strong>The PCSS specification</strong> &mdash; The 45-category taxonomy with descriptions and domain groupings</li>
            <li><strong>The full law registry</strong> &mdash; All 67 laws with metadata, rule category mappings, key provisions, and jurisdiction data</li>
            <li><strong>The capability mapping</strong> &mdash; 18 capabilities and their rule category coverage</li>
            <li><strong>A reference adapter interface</strong> &mdash; The Go Adapter and Capability types for building compliant platform integrations</li>
          </ul>
          <p className="text-foreground/90 leading-relaxed mb-6">
            What remains proprietary is the enforcement engine (the CompositeEngine, the 9 Phosra services, the actual platform adapters, and the production API). We think this is the right split: the data and the spec should be open; the infrastructure that makes it fast and reliable is the product.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            The spec is versioned. PCSS v1.0 ships with 45 categories and 67 laws. When new legislation passes, we add categories and law entries and bump the version. Contributions to the law registry are welcome &mdash; we know there are child safety laws in jurisdictions we haven&apos;t covered yet.
          </p>
        </section>

        {/* Section 8 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-display)]">
            Help Us Build This
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            PCSS is an attempt to solve a coordination problem. The fragmentation of child safety compliance is costing the industry enormous amounts of duplicated work, and the children it is meant to protect are getting inconsistent coverage depending on which platforms they use. A shared, open taxonomy can fix this, but only if the industry adopts it.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-6">
            We are looking for feedback from three groups: platform engineers who have to implement these controls, compliance teams who have to audit them, and parents who have to live with the patchwork results. If you have built parental controls for a platform, we want to know what we got wrong in the taxonomy. If you have read a child safety law we haven&apos;t covered, we want to add it. If you are a parent who spends too many hours configuring controls on six different devices, we want to hear what matters most to you.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            Check out the{" "}
            <Link href="/compliance" className="text-brand-green hover:underline">
              Phosra Compliance Hub
            </Link>{" "}
            to explore all 67 laws and their rule category mappings. The PCSS spec and law data are available on{" "}
            <a
              href="https://github.com/phosra/pcss-spec"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-green hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </section>

        {/* Footer divider */}
        <div className="h-px bg-border mb-8" />

        {/* Author/footer area */}
        <footer className="text-sm text-muted-foreground">
          <p>
            Published by the Phosra team &mdash; February 25, 2026
          </p>
          <p className="mt-2">
            Questions or feedback?{" "}
            <a
              href="https://github.com/phosra/pcss-spec/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-green hover:underline"
            >
              Open an issue on GitHub
            </a>{" "}
            or reach out at{" "}
            <a href="mailto:hello@phosra.com" className="text-brand-green hover:underline">
              hello@phosra.com
            </a>
            .
          </p>
        </footer>
      </div>
    </article>
  )
}
