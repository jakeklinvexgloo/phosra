export type BlogCategory = "engineering" | "product" | "company" | "regulatory" | "milestone"

export interface ContentSection {
  type: "paragraph" | "quote" | "heading"
  text: string
  attribution?: string
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  category: BlogCategory
  excerpt: string
  featured?: boolean
  readTime?: string
  content?: ContentSection[]
  hasCustomPage?: boolean
}

export const BLOG_CATEGORY_CONFIG: Record<BlogCategory, { label: string; bg: string; text: string }> = {
  engineering: { label: "Engineering", bg: "bg-brand-green/10", text: "text-brand-green" },
  product: { label: "Product", bg: "bg-accent-teal/10", text: "text-accent-teal" },
  company: { label: "Company", bg: "bg-accent-purple/10", text: "text-accent-purple" },
  regulatory: { label: "Regulatory", bg: "bg-amber-500/10", text: "text-amber-500" },
  milestone: { label: "Milestone", bg: "bg-blue-500/10", text: "text-blue-500" },
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ai-safety-research-launch",
    title: "We Tested 8 AI Chatbots for Child Safety. Here\u2019s What We Found.",
    date: "2026-02-28",
    category: "product",
    featured: true,
    readTime: "8 min read",
    excerpt:
      "Phosra tested ChatGPT, Claude, Gemini, Grok, Character.AI, Copilot, Perplexity, and Replika across 7 safety dimensions and 40 adversarial prompts. The results reveal critical gaps in how AI chatbots protect young users.",
    content: [
      {
        type: "paragraph",
        text: "AI chatbots are the fastest-growing category of technology among young people. ChatGPT reached 100 million users faster than any product in history, and platforms like Character.AI and Replika are explicitly designed for ongoing personal conversation. Kids aren\u2019t just using these tools for homework \u2014 they\u2019re confiding in them, role-playing with them, and treating them as companions. That raises a question the industry has mostly avoided: how safe are these platforms for minors?",
      },
      {
        type: "paragraph",
        text: "We decided to find out. Over the past month, Phosra\u2019s research team systematically tested 8 major AI chatbot platforms \u2014 ChatGPT, Claude, Gemini, Grok, Character.AI, Copilot, Perplexity, and Replika \u2014 across 7 safety dimensions using 40 adversarial prompts designed to probe the boundaries of each system\u2019s protections.",
      },
      {
        type: "heading",
        text: "What We Tested",
      },
      {
        type: "paragraph",
        text: "Our research framework evaluates each platform across seven dimensions: explicit sexual content, self-harm and crisis response, predatory grooming patterns, dangerous activities and substances, emotional manipulation, academic integrity, and age-appropriate content filtering. Each dimension is weighted by severity \u2014 self-harm and predatory grooming carry the highest weight because failures in these categories pose the greatest real-world risk to children.",
      },
      {
        type: "paragraph",
        text: "The 40 test prompts aren\u2019t hypothetical. They\u2019re modeled on real conversations that minors have had with AI chatbots, drawn from public reporting, parental accounts, and safety research. They include multi-turn escalation sequences where a user gradually pushes past safety boundaries, because that\u2019s how real-world circumvention happens.",
      },
      {
        type: "heading",
        text: "Key Findings",
      },
      {
        type: "paragraph",
        text: "The results varied dramatically across platforms. Some platforms demonstrated robust, proactive safety systems that not only blocked harmful content but redirected users to appropriate resources. Others failed on basic protections that should be table stakes. Several platforms that market themselves as safe for younger users showed significant gaps in their safety testing, particularly around multi-turn conversations where initial refusals could be gradually worn down through conversational pressure.",
      },
      {
        type: "paragraph",
        text: "Self-harm and crisis response was the most inconsistent dimension across platforms. Some chatbots immediately recognized distress signals and provided crisis helpline information. Others engaged in extended conversations about self-harm methods before eventually suggesting the user talk to someone. In the worst cases, platforms provided detailed information that could facilitate self-harm when prompted through indirect language.",
      },
      {
        type: "quote",
        text: "The gap between the best and worst platforms is alarming. Some chatbots treat child safety as a core engineering discipline. Others treat it as an afterthought \u2014 a content filter bolted onto a system that wasn\u2019t designed with young users in mind. Parents have no way to tell the difference without testing it themselves, which is exactly what we did.",
        attribution: "Jake Klinvex, Founder & CEO",
      },
      {
        type: "heading",
        text: "The Parental Controls Gap",
      },
      {
        type: "paragraph",
        text: "Beyond content safety, we evaluated each platform\u2019s parental controls, age verification systems, and privacy protections. The findings here are equally concerning. Most platforms rely on self-reported age with no verification, meaning a 12-year-old can access the same unfiltered experience as an adult by simply entering a different birth date. Only a handful of platforms offer any parental oversight tools, and those that do provide limited visibility into what conversations are actually happening.",
      },
      {
        type: "paragraph",
        text: "This is the infrastructure gap that Phosra exists to close. When a platform adopts the Phosra Child Safety Spec, parental controls become interoperable \u2014 parents set rules once, and enforcement works across every connected service. But that only works if platforms build the underlying safety systems that those controls depend on.",
      },
      {
        type: "heading",
        text: "How the Research Portal Works",
      },
      {
        type: "paragraph",
        text: "All of our research is published in full at phosra.com/research/ai-chatbots. Each platform has a detailed profile showing its overall safety grade, dimension-by-dimension scores, individual test results with annotated screenshots, and specific recommendations for improvement. The portal includes an AI research assistant that can answer questions about the data and help parents, educators, and policymakers navigate the findings.",
      },
      {
        type: "paragraph",
        text: "We built the portal to be a public resource, not a paywall. Every data point, every test result, every screenshot is freely accessible. We believe transparency is the fastest path to better safety outcomes \u2014 when platforms know their safety performance is being measured and published, they have a concrete incentive to improve.",
      },
      {
        type: "heading",
        text: "What Comes Next",
      },
      {
        type: "paragraph",
        text: "This is the first wave of Phosra\u2019s AI safety research program. We plan to expand testing to additional platforms, increase the number of test prompts, add new safety dimensions as the technology evolves, and publish regular updates as platforms improve their protections. We\u2019re also developing automated monitoring that will flag regressions in real time \u2014 because safety isn\u2019t a one-time audit, it\u2019s an ongoing discipline.",
      },
      {
        type: "paragraph",
        text: "Explore the full research at phosra.com/research/ai-chatbots. If you\u2019re a platform developer looking to improve your safety posture, the API documentation and integration guides are at phosra.com/docs.",
      },
    ],
  },
  {
    slug: "pcss-v1",
    title: "How We Normalized 67 Child Safety Laws into 45 API Rule Categories",
    date: "2026-02-25",
    category: "engineering",
    excerpt:
      "A technical deep-dive into the PCSS specification \u2014 the rule category taxonomy, platform adapter interface, composite enforcement engine, and the compliance graph that connects laws to platforms.",
    readTime: "15 min read",
    hasCustomPage: true,
  },
  {
    slug: "coppa-rule-deadline-april-2026",
    title: "COPPA 2.0 vs. the FTC\u2019s Amended COPPA Rule: What Actually Matters on April 22",
    date: "2026-02-22",
    category: "regulatory",
    excerpt:
      "Most organizations are confusing COPPA 2.0 \u2014 a bill that hasn\u2019t been signed into law \u2014 with the FTC\u2019s amended COPPA Rule, which takes full effect on April 22, 2026. The enforcement deadline is real, the penalties are severe, and many teams are preparing for the wrong thing.",
    content: [
      {
        type: "paragraph",
        text: "There is a dangerous misconception circulating in boardrooms and compliance departments across the country. Most organizations that serve children online have heard of \"COPPA 2.0\" and assume it's the thing they need to worry about. It isn't \u2014 at least not yet. Senate Bill 836, commonly called COPPA 2.0, has not been signed into law. What has changed is the FTC's amended COPPA Rule, a separate regulatory action that updates the existing Children's Online Privacy Protection Rule with significant new requirements. Full compliance is required by April 22, 2026. That's 59 days from today. The distinction matters because organizations preparing for a bill that hasn't passed are likely overlooking the rule that's already on the books.",
      },
      {
        type: "heading",
        text: "What Changed in the FTC\u2019s Amended COPPA Rule",
      },
      {
        type: "paragraph",
        text: "The amended rule introduces six key requirements that go well beyond the original COPPA framework. First, operators must now obtain separate verifiable parental consent before disclosing a child's personal information to third parties \u2014 blanket consent no longer covers downstream data sharing. Second, organizations must publish written data retention policies in their privacy notices, specifying how long children's data is kept and when it is deleted. Third, the rule requires enhanced direct notice to parents about how their child's data is collected, used, and shared, with more granular detail than previously required. Fourth, any third-party service provider with access to children's data must provide written confirmation of their security measures \u2014 operators are now accountable for the entire data supply chain. Fifth, the definition of personal information has been expanded to include biometric identifiers and government-issued IDs, closing loopholes that some operators relied on. Sixth, the FTC has approved new consent verification methods including knowledge-based authentication questions, facial recognition matching, and a \"text plus\" method that combines SMS verification with additional identity checks.",
      },
      {
        type: "heading",
        text: "The Stakes Are Real",
      },
      {
        type: "paragraph",
        text: "COPPA violations carry penalties of $53,088 per violation, per child, per instance. That number adds up fast. Epic Games paid $520 million to settle COPPA-related charges. YouTube's parent company Google paid $170 million. TikTok was fined $5.7 million in an earlier action. The FTC has publicly stated that COPPA enforcement is a top priority for 2026, and the amended rule gives them substantially more surface area to pursue cases. Organizations that assume they have time or that enforcement will be delayed are making a bet against a regulator that has demonstrated it will act aggressively.",
      },
      {
        type: "quote",
        text: "Every requirement in the amended COPPA Rule maps to an engineering problem that's already been solved. Organizations don't need to build consent management, data retention pipelines, and third-party oversight systems from scratch. The infrastructure exists \u2014 the question is whether teams will adopt it before April 22 or scramble after the first enforcement action.",
        attribution: "Jake Klinvex, Founder & CEO",
      },
      {
        type: "heading",
        text: "How Phosra Maps to Every Requirement",
      },
      {
        type: "paragraph",
        text: "Phosra's API was designed around the full landscape of child safety regulation, and the amended COPPA Rule's requirements map directly to existing enforcement capabilities. The parental_consent_gate rule category handles verifiable parental consent workflows, including the new requirement for separate consent on third-party disclosures. The privacy_data_sharing and commercial_data_ban rules enforce granular controls over how children's data flows to third parties, ensuring operators maintain compliant data-sharing practices. The data_deletion_request rule powers the eraser button functionality that the amended rule contemplates for data retention compliance. The targeted_ad_block rule disables advertising mechanisms that rely on children's personal information. Beyond individual rules, Phosra's compliance attestation system generates the audit trails that regulators expect \u2014 documented proof that consent was obtained, data policies were enforced, and third-party providers were vetted. All of this works across every platform that adopts the Phosra Child Safety Spec, which means organizations don't need to implement compliance logic separately for every service they operate.",
      },
      {
        type: "heading",
        text: "59 Days and Counting",
      },
      {
        type: "paragraph",
        text: "April 22 is not a soft deadline. Organizations that collect data from children under 13, operate websites or apps directed at children, or have actual knowledge that they serve minors need to have their compliance infrastructure in place before that date. The amended COPPA Rule is not a proposal or a recommendation \u2014 it is an enforceable regulation with per-violation penalties that can reach into the hundreds of millions. The full regulatory breakdown, including provision-by-provision analysis and rule category mappings, is available at phosra.com/compliance. For teams ready to integrate, API documentation and quickstart guides are at phosra.com/docs.",
      },
    ],
  },
  {
    slug: "190-platforms-connected",
    title: "Phosra Maps 320+ Platforms in the Kids\u2019 Ecosystem",
    date: "2025-02-10",
    category: "milestone",
    excerpt:
      "Phosra\u2019s platform registry now maps 320+ services kids use daily \u2014 from streaming and social media to gaming and education \u2014 defining the spec each can adopt for interoperable parental controls.",
    content: [
      {
        type: "paragraph",
        text: "Parental controls are only as useful as the platforms they cover. A solution that works on Netflix but not YouTube, or TikTok but not Roblox, forces parents back to the fragmented, platform-by-platform approach that fails most families.",
      },
      {
        type: "paragraph",
        text: "Phosra\u2019s registry now maps over 320 platforms spanning streaming, social media, gaming, education, communication, and web browsing \u2014 including YouTube, Netflix, TikTok, Instagram, Roblox, Minecraft, Discord, and Snapchat. Each platform that adopts the Phosra Child Safety Spec gets instant interoperability with parental control providers and compliance tooling.",
      },
      {
        type: "paragraph",
        text: "For platforms, adopting the spec means compliance-ready parental controls out of the box. For developers building parental control features, a single Phosra integration covers the entire ecosystem. For parents, it means rules that work everywhere. Explore the full platform directory at phosra.com/platforms.",
      },
    ],
  },
  {
    slug: "community-standards-enforcement",
    title: "31 Community Standards, 50,000 Families: Making Pledges Enforceable",
    date: "2025-02-08",
    category: "product",
    excerpt:
      "Phosra now supports 31 community standards \u2014 including Four Norms, Wait Until 8th, and the Surgeon General\u2019s Advisory \u2014 turning voluntary pledges into enforceable configurations.",
    content: [
      {
        type: "paragraph",
        text: "Across the country, parent-led movements are setting standards for children\u2019s technology use. Four Norms, Wait Until 8th, the Surgeon General\u2019s Advisory on Social Media, Common Sense Media guidelines \u2014 these represent the collective wisdom of families, educators, and health professionals about what healthy digital boundaries look like.",
      },
      {
        type: "paragraph",
        text: "The challenge has always been enforcement. A pledge to delay social media until age 16 is meaningful only if parents can actually enforce it across every platform their child encounters. Until now, that required dozens of manual configurations \u2014 one per app, per child, per device.",
      },
      {
        type: "quote",
        text: "When a school adopts Four Norms, every family in that community should be able to enforce those standards with a single click \u2014 not a weekend of configuring settings.",
        attribution: "Jake Klinvex, Founder & CEO",
      },
      {
        type: "paragraph",
        text: "Phosra now supports 31 community standards that collectively reach over 50,000 families and 2,000 schools. Each standard is mapped to specific PCSS rules, so adoption means automatic enforcement across all connected platforms. Explore the full standards library at phosra.com/standards.",
      },
    ],
  },
  {
    slug: "67-laws-tracked",
    title: "Phosra Now Tracks 67 Child Safety Laws Across 25+ Jurisdictions",
    date: "2025-02-05",
    category: "milestone",
    excerpt:
      "Our compliance engine now maps 67 child safety laws \u2014 from KOSA and COPPA 2.0 to the EU Digital Services Act \u2014 to specific enforcement actions across platforms.",
    content: [
      {
        type: "paragraph",
        text: "Child safety legislation is accelerating worldwide. In the United States alone, 22 states have introduced or passed laws governing how platforms must protect minors. Internationally, the EU Digital Services Act, the UK Online Safety Act, and Australia\u2019s Online Safety Act are creating a complex compliance landscape that platforms and parental control providers must navigate.",
      },
      {
        type: "paragraph",
        text: "Phosra\u2019s compliance engine now tracks 67 of these laws across 25+ jurisdictions and maps each one to specific PCSS rule categories. When KOSA requires platforms to disable addictive features for minors, Phosra translates that into concrete enforcement actions on YouTube, TikTok, and Instagram simultaneously \u2014 rather than leaving interpretation to each platform.",
      },
      {
        type: "paragraph",
        text: "The full compliance database is available at phosra.com/compliance, where developers and policy teams can explore each law\u2019s provisions, see how they map to PCSS rules, and access enforcement snippets for their integrations.",
      },
    ],
  },
  {
    slug: "introducing-phosra",
    title: "Introducing Phosra \u2014 Universal Parental Controls Infrastructure",
    date: "2025-02-01",
    category: "company",
    excerpt:
      "Today we\u2019re launching Phosra, the infrastructure layer that lets parents set rules once and enforce them across every platform their kids use.",
    content: [
      {
        type: "paragraph",
        text: "Parents today face an impossible task. Every app their children use \u2014 Netflix, YouTube, TikTok, Roblox, Instagram \u2014 has its own parental controls, its own settings screen, its own mental model. A family with four kids might be managing 30 or more separate configuration panels. Most give up after two or three. That\u2019s not a parenting failure. It\u2019s a systems failure.",
      },
      {
        type: "paragraph",
        text: "Today we\u2019re launching Phosra to fix this. Phosra is an open specification and API that covers 320+ platforms in the kids\u2019 ecosystem. When platforms adopt the spec, parents set rules once and enforcement works everywhere. Parental control providers can plug into Phosra to extend their reach across the entire ecosystem.",
      },
      {
        type: "quote",
        text: "The open banking movement proved that consumers shouldn\u2019t be locked into each bank\u2019s proprietary interface to manage their own money. The same principle applies to how parents protect their children online.",
        attribution: "Jake Klinvex, Founder & CEO",
      },
      {
        type: "paragraph",
        text: "Phosra ships with the Phosra Child Safety Spec (PCSS), an open specification that defines how parental control rules are structured, transmitted, and enforced across platforms. PCSS v1.0 covers 45 rule categories \u2014 from screen time limits and content filtering to age-gated social media access and algorithmic transparency controls.",
      },
      {
        type: "paragraph",
        text: "The platform is available today for developers and enterprise customers. Visit phosra.com/docs for the full API reference and integration guides.",
      },
    ],
  },
  {
    slug: "pcss-v1-specification",
    title: "PCSS v1.0: An Open Specification for Parental Controls",
    date: "2025-01-25",
    category: "product",
    excerpt:
      "The Phosra Child Safety Spec v1.0 defines 45 rule categories for structuring, transmitting, and enforcing parental controls across platforms.",
    content: [
      {
        type: "paragraph",
        text: "Today we\u2019re publishing the Phosra Child Safety Spec (PCSS) v1.0 \u2014 an open specification for how parental control rules should be structured, transmitted, and enforced across digital platforms.",
      },
      {
        type: "paragraph",
        text: "PCSS v1.0 defines 45 rule categories spanning content filtering, screen time management, social media access controls, privacy protections, commercial data restrictions, and algorithmic transparency requirements. The specification is designed to be platform-agnostic, regulation-aware, and extensible.",
      },
      {
        type: "paragraph",
        text: "The spec draws from our analysis of 67 child safety laws worldwide, mapping each regulation\u2019s requirements to specific, enforceable rule types. Platform developers can implement PCSS support through Phosra\u2019s API, enabling their parental control features to interoperate with the broader ecosystem.",
      },
      {
        type: "paragraph",
        text: "The full specification, API reference, and integration guides are available at phosra.com/docs. We welcome feedback from the developer community, policy researchers, and child safety advocates.",
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getRecentPosts(count: number): BlogPost[] {
  return [...BLOG_POSTS]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

export function getFeaturedPost(): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.featured)
}

export function getBlogStats() {
  return {
    total: BLOG_POSTS.length,
    categories: Object.keys(BLOG_CATEGORY_CONFIG).length,
    featured: BLOG_POSTS.filter((p) => p.featured).length,
  }
}

export function searchPosts(query: string): BlogPost[] {
  const q = query.toLowerCase()
  return BLOG_POSTS.filter(
    (post) =>
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q)
  )
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.category === category)
}
