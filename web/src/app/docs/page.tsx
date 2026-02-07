"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const API_BASE = "http://localhost:8080/api/v1"

const sections = [
  { id: "preamble", title: "Preamble" },
  { id: "rfc2119", title: "RFC 2119 Keywords" },
  { id: "auth", title: "1. Platform Authentication" },
  { id: "families", title: "2. Protected Families" },
  { id: "policies", title: "3. Safety Policies" },
  { id: "policy-categories", title: "3.1 Policy Categories" },
  { id: "platforms", title: "4. Regulated Platforms" },
  { id: "compliance", title: "5. Compliance Verification" },
  { id: "quick-setup", title: "5.1 Quick Setup API" },
  { id: "enforcement", title: "6. Policy Enforcement" },
  { id: "ratings", title: "7. Content Rating Standard" },
  { id: "webhooks", title: "8. Event Notifications" },
  { id: "levels", title: "9. Compliance Levels" },
  { id: "timeline", title: "10. Enforcement Timeline" },
  { id: "legislation", title: "11. Legislative Compliance" },
  { id: "parent-experience", title: "12. Parent Experience" },
]

const PLATFORM_NAMES = ["NextDNS", "CleanBrowsing", "Android", "Apple MDM", "Microsoft"] as const


const NEW_CATEGORIES = [
  { name: "algo_feed_control", desc: "Control algorithmic feed recommendations; enforce chronological mode for minors", laws: "KOSA, KOSMA, CA SB 976, EU DSA" },
  { name: "addictive_design_control", desc: "Disable infinite scroll, autoplay, streaks, like counts, and daily rewards", laws: "KOSA, CT SB 3, EU DSA, UK OSA" },
  { name: "notification_curfew", desc: "Suppress notifications during defined quiet hours (e.g., 20:00-07:00)", laws: "VA SB 854, NY SAFE for Kids" },
  { name: "usage_timer_notification", desc: "Periodic usage reminders at configurable intervals (15/30/45/60 min)", laws: "MN HF 2, TN HB 1891" },
  { name: "targeted_ad_block", desc: "Block all targeted/behavioral advertising for minors", laws: "COPPA 2.0, EU DSA, India DPDPA" },
  { name: "dm_restriction", desc: "Restrict direct messaging: none, contacts_only, or everyone", laws: "CT SB 3, UK OSA" },
  { name: "age_gate", desc: "Require age verification before platform access", laws: "KOSMA, FL HB 3, Australia Online Safety Act" },
  { name: "data_deletion_request", desc: "Enable one-click data deletion request for child accounts", laws: "COPPA 2.0, NY NYCDPA" },
  { name: "geolocation_opt_in", desc: "Default geolocation sharing to off; require explicit opt-in", laws: "CT SB 3, MD Kids Code, COPPA update" },
]

interface LegislationEntry {
  id: string
  law: string
  summary: string
  jurisdiction: string
  introduced: string
  stage: string
  categories: string[]
  keyProvisions: string[]
}

interface RecipeStep {
  number: number
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  description: string
  requestBody?: string
  responseBody?: string
  whatHappens: string
}

interface Recipe {
  id: string
  title: string
  summary: string
  icon: string
  tags: string[]
  scenario: string
  actors: string[]
  flowDiagram: string
  steps: RecipeStep[]
  keyTeachingPoint: string
}

const LEGISLATION_REFERENCE: LegislationEntry[] = [
  {
    id: "kosa",
    law: "KOSA (Kids Online Safety Act)",
    summary: "Federal bill requiring platforms to provide minors with options to protect their information and disable addictive product features. Establishes a duty of care for covered platforms.",
    jurisdiction: "United States (Federal)",
    introduced: "2023 (S. 1409, 118th Congress)",
    stage: "Passed Senate (Jul 2024); pending House action",
    categories: ["algo_feed_control", "addictive_design_control", "targeted_ad_block"],
    keyProvisions: [
      "Duty of care requiring platforms to prevent and mitigate harms to minors",
      "Strongest default privacy settings for minors must be enabled by default",
      "Minors must be able to opt out of algorithmic recommendations",
      "Platforms must disable addictive design features (autoplay, notifications, rewards) by default for minors",
      "FTC enforcement authority with civil penalties up to $50,000 per violation",
      "Annual independent audits of platform compliance required",
    ],
  },
  {
    id: "kosma",
    law: "KOSMA (Kids Online Safety & Media Act)",
    summary: "Combined package merging KOSA with COPPA 2.0 updates. Expands COPPA protections to teens (13-16) and strengthens age verification requirements for platforms serving minors.",
    jurisdiction: "United States (Federal)",
    introduced: "2024 (S. 1409 + S. 1418, 118th Congress)",
    stage: "Passed Senate (Jul 2024); pending House action",
    categories: ["algo_feed_control", "age_gate"],
    keyProvisions: [
      "Extends COPPA protections from under-13 to all minors under 17",
      "Requires platforms to obtain verifiable parental consent for data collection on minors",
      "Mandates age verification mechanisms on platforms likely to be used by children",
      "Prohibits targeted advertising to minors under 17",
      "Creates an Eraser Button — right for minors to delete personal data",
      "Establishes Kids Online Safety Council within the FTC",
    ],
  },
  {
    id: "ca-sb-976",
    law: "CA SB 976",
    summary: "California law restricting addictive social media features for minors. Bans algorithmic feeds and addictive design patterns for users known to be under 18 without parental consent.",
    jurisdiction: "California, United States",
    introduced: "2024 (SB 976, California Legislature)",
    stage: "Signed into law (Sep 2024); effective Jan 2027",
    categories: ["algo_feed_control", "addictive_design_control"],
    keyProvisions: [
      "Prohibits platforms from providing addictive feeds to minors without parental consent",
      "Bans sending notifications to minors during school hours (7am-3pm) and overnight (9pm-6am)",
      "Requires platforms to default minors to chronological feeds instead of algorithmic recommendations",
      "Restricts autoplay, infinite scroll, and engagement-maximizing features for minor accounts",
      "California AG enforcement with penalties up to $2,500 per affected minor per violation",
    ],
  },
  {
    id: "eu-dsa",
    law: "EU Digital Services Act",
    summary: "Comprehensive EU regulation governing digital platforms with specific protections for minors. Bans targeted advertising to minors and requires platforms to assess systemic risks to children.",
    jurisdiction: "European Union (27 member states)",
    introduced: "2022 (Regulation (EU) 2022/2065)",
    stage: "In force (Feb 2024); full enforcement active",
    categories: ["algo_feed_control", "addictive_design_control", "targeted_ad_block"],
    keyProvisions: [
      "Complete ban on targeted advertising based on profiling of minors",
      "Very large online platforms (VLOPs) must assess and mitigate systemic risks to minors",
      "Platforms must provide clear, age-appropriate terms of service for minors",
      "Recommender systems must offer at least one option not based on profiling",
      "Mandatory transparency reporting on content moderation and algorithmic systems",
      "Fines up to 6% of global annual turnover for non-compliance",
    ],
  },
  {
    id: "uk-osa",
    law: "UK Online Safety Act",
    summary: "UK law imposing a duty of care on platforms to protect children from harmful content online. Requires age verification and proactive measures to prevent children encountering harmful material.",
    jurisdiction: "United Kingdom",
    introduced: "2023 (UK Parliament)",
    stage: "Enacted (Oct 2023); Ofcom codes of practice in phased rollout",
    categories: ["addictive_design_control", "dm_restriction"],
    keyProvisions: [
      "Duty of care requiring platforms to protect children from harmful content",
      "Mandatory age verification or age estimation for platforms likely accessed by children",
      "Platforms must prevent children from encountering priority harmful content (self-harm, eating disorders, pornography)",
      "Restrictions on direct messaging between adults and children they don't know",
      "Ofcom as regulator with power to fine up to 10% of global revenue or £18 million",
      "Criminal liability for senior managers who fail to comply with information requests",
    ],
  },
  {
    id: "coppa-2",
    law: "COPPA 2.0",
    summary: "Update to the Children's Online Privacy Protection Act extending protections to teenagers (13-16), banning targeted advertising to all minors, and creating a data deletion right.",
    jurisdiction: "United States (Federal)",
    introduced: "2024 (S. 1418, 118th Congress)",
    stage: "Passed Senate as part of KOSMA (Jul 2024); pending House action",
    categories: ["targeted_ad_block", "data_deletion_request", "geolocation_opt_in"],
    keyProvisions: [
      "Extends COPPA from children under 13 to all minors under 17",
      "Complete ban on targeted advertising directed at minors",
      "Creates Eraser Button — minors and parents can request deletion of all personal data",
      "Prohibits conditioning service access on a minor providing more data than necessary",
      "Establishes Youth Privacy and Marketing Division within the FTC",
      "Increased penalties: up to $50,000 per violation (up from $46,517)",
    ],
  },
  {
    id: "ct-sb-3",
    law: "CT SB 3",
    summary: "Connecticut law protecting minors from addictive platform features and restricting unsolicited contact. Requires platforms to default to safest settings for accounts identified as minors.",
    jurisdiction: "Connecticut, United States",
    introduced: "2023 (SB 3, Connecticut General Assembly)",
    stage: "Signed into law (Jun 2023); effective Oct 2024",
    categories: ["addictive_design_control", "dm_restriction", "geolocation_opt_in"],
    keyProvisions: [
      "Platforms must default to highest privacy and safety settings for minor accounts",
      "Prohibits sending unsolicited communications (DMs) from adults to unconnected minors",
      "Restricts addictive features: autoplay, infinite scroll, notifications designed to increase engagement",
      "Geolocation data collection from minors prohibited without explicit informed consent",
      "Platforms must provide parents with tools to supervise minor accounts",
      "Connecticut AG enforcement authority; penalties under CUTPA (unfair trade practices)",
    ],
  },
  {
    id: "va-sb-854",
    law: "VA SB 854",
    summary: "Virginia law requiring social media platforms to implement notification restrictions and usage limits for minor accounts, including quiet hours during nighttime.",
    jurisdiction: "Virginia, United States",
    introduced: "2024 (SB 854, Virginia General Assembly)",
    stage: "Signed into law (Apr 2024); effective Jul 2025",
    categories: ["notification_curfew"],
    keyProvisions: [
      "Platforms must suppress non-essential notifications to minors during nighttime hours",
      "Requires platforms to implement configurable screen time limits for minor accounts",
      "Parents must be provided tools to set notification schedules",
      "Platforms must provide activity reports to parents on request",
      "Virginia AG enforcement with civil penalties",
    ],
  },
  {
    id: "ny-safe",
    law: "NY SAFE for Kids Act",
    summary: "New York law restricting addictive algorithmic feeds for minors and requiring notification-free periods. Bans algorithmic recommendations without parental consent.",
    jurisdiction: "New York, United States",
    introduced: "2024 (S. 7694 / A. 8148, New York Legislature)",
    stage: "Signed into law (Jun 2024); effective 2025",
    categories: ["notification_curfew"],
    keyProvisions: [
      "Prohibits addictive algorithmic feeds for minors without verifiable parental consent",
      "Mandates notification-free quiet hours for minor accounts (default overnight)",
      "Platforms must verify age of users before serving algorithmic content",
      "Restricts platforms from sending push notifications to minors during nighttime hours",
      "New York AG enforcement authority",
    ],
  },
  {
    id: "mn-hf-2",
    law: "MN HF 2",
    summary: "Minnesota bill requiring platforms to implement usage awareness tools for minor users, including periodic screen time reminders and usage dashboards.",
    jurisdiction: "Minnesota, United States",
    introduced: "2024 (HF 2, Minnesota Legislature)",
    stage: "Introduced; committee review",
    categories: ["usage_timer_notification"],
    keyProvisions: [
      "Platforms must provide periodic usage time reminders at intervals no greater than 60 minutes",
      "Requires platforms to offer a usage dashboard visible to both the minor and their parent",
      "Platforms must allow parents to configure reminder intervals",
      "Usage data must be presented in age-appropriate format for the minor",
    ],
  },
  {
    id: "tn-hb-1891",
    law: "TN HB 1891",
    summary: "Tennessee law requiring social media platforms to implement screen time awareness features for minor users, including configurable usage timer notifications.",
    jurisdiction: "Tennessee, United States",
    introduced: "2024 (HB 1891, Tennessee General Assembly)",
    stage: "Signed into law (May 2024); effective Jan 2025",
    categories: ["usage_timer_notification"],
    keyProvisions: [
      "Platforms must notify minor users of cumulative usage time at regular intervals",
      "Default usage reminder interval of 30 minutes; configurable by parent or minor",
      "Platforms must provide parents with weekly screen time reports",
      "Parental consent required for minors under 13 to create accounts",
      "Tennessee AG enforcement with civil penalties up to $10,000 per violation",
    ],
  },
  {
    id: "fl-hb-3",
    law: "FL HB 3",
    summary: "Florida law requiring age verification for social media platforms and prohibiting minors under 14 from holding accounts. Minors 14-15 need parental consent.",
    jurisdiction: "Florida, United States",
    introduced: "2024 (HB 3, Florida Legislature)",
    stage: "Signed into law (Mar 2024); enforcement paused (federal court injunction)",
    categories: ["age_gate"],
    keyProvisions: [
      "Prohibits social media accounts for children under 14",
      "Minors aged 14-15 require verifiable parental consent to create accounts",
      "Platforms must implement age verification using government-issued ID or equivalent",
      "Existing accounts for minors under 14 must be terminated within prescribed period",
      "Platforms must delete all personal information of terminated minor accounts",
      "Private right of action for parents; statutory damages of $10,000 per violation",
    ],
  },
  {
    id: "au-osa",
    law: "Australia Online Safety Act",
    summary: "Australian law establishing the eSafety Commissioner with broad powers to enforce online safety, including age verification requirements and content removal powers for material harmful to children.",
    jurisdiction: "Australia",
    introduced: "2021 (Online Safety Act 2021, Australian Parliament)",
    stage: "In force; age verification trial underway (2024-2025)",
    categories: ["age_gate"],
    keyProvisions: [
      "Establishes eSafety Commissioner as independent regulator",
      "Mandatory age verification for platforms hosting age-restricted content",
      "Powers to issue removal notices for cyber-abuse material targeting children",
      "Basic Online Safety Expectations (BOSE) that platforms must report against",
      "Industry codes of practice for platform categories (social media, messaging, gaming, etc.)",
      "Civil penalties up to AUD $555,000 per day for non-compliance",
    ],
  },
  {
    id: "india-dpdpa",
    law: "India DPDPA",
    summary: "India's Digital Personal Data Protection Act establishing comprehensive data protection rules with specific provisions prohibiting behavioral advertising targeting children and requiring verifiable parental consent.",
    jurisdiction: "India",
    introduced: "2023 (Digital Personal Data Protection Act, Indian Parliament)",
    stage: "Enacted (Aug 2023); rules being finalized",
    categories: ["targeted_ad_block"],
    keyProvisions: [
      "Complete ban on behavioral monitoring and targeted advertising directed at children",
      "Verifiable parental consent required before processing any child's data",
      "Prohibits processing of children's data that could cause detrimental effect",
      "Data fiduciaries must not undertake tracking or profiling of children",
      "Penalties up to INR 250 crore (approx. $30 million) for violations",
    ],
  },
  {
    id: "ny-nycdpa",
    law: "NY NYCDPA",
    summary: "New York Child Data Protection Act focusing on commercial data collection from minors, with strong data minimization and deletion rights for child accounts.",
    jurisdiction: "New York, United States",
    introduced: "2024 (New York Legislature)",
    stage: "Introduced; committee review",
    categories: ["data_deletion_request"],
    keyProvisions: [
      "Platforms must provide a clear, accessible mechanism for parents to request deletion of a minor's data",
      "Data deletion requests must be honored within 30 days",
      "Prohibits selling or sharing personal data of minors for commercial purposes",
      "Data minimization requirement — platforms may only collect data necessary for the service",
      "New York AG enforcement authority with enhanced penalties for violations involving minors",
    ],
  },
  {
    id: "md-kids-code",
    law: "MD Kids Code",
    summary: "Maryland Age-Appropriate Design Code requiring platforms to default to maximum privacy settings for minors, including geolocation disabled by default and data protection impact assessments.",
    jurisdiction: "Maryland, United States",
    introduced: "2024 (Maryland Kids Code, Maryland General Assembly)",
    stage: "Signed into law (May 2024); effective Oct 2025",
    categories: ["geolocation_opt_in"],
    keyProvisions: [
      "Geolocation and precise location services must be disabled by default for minors",
      "Platforms must complete a Data Protection Impact Assessment (DPIA) for features used by minors",
      "Highest privacy settings must be the default for accounts identified as belonging to minors",
      "Prohibits using geolocation data to serve targeted content or advertising to minors",
      "Platforms must provide clear, child-friendly explanations of how location data is used",
      "Maryland AG enforcement; penalties under Maryland Consumer Protection Act",
    ],
  },
]

type PlatformSupport = "full" | "partial" | "none"

interface CategoryField {
  name: string
  type: string
  required: boolean
  default: string
  constraints: string
  description: string
}

interface AgeDefault {
  range: string
  enabled: boolean
  summary: string
}

interface PlatformInfo {
  name: string
  support: PlatformSupport
}

interface CategoryReference {
  id: string
  name: string
  group: string
  description: string
  rationale: string
  laws: string[]
  fields: CategoryField[]
  exampleConfig: string
  ageDefaults: AgeDefault[]
  platforms: PlatformInfo[]
}

const PLATFORM_NONE: PlatformInfo[] = [
  { name: "NextDNS", support: "none" },
  { name: "CleanBrowsing", support: "none" },
  { name: "Android", support: "none" },
  { name: "Apple MDM", support: "none" },
  { name: "Microsoft", support: "none" },
]

const CATEGORY_REFERENCE: CategoryReference[] = [
  // ─── Content (1-5) ───
  {
    id: "content_rating",
    name: "Content Rating",
    group: "content",
    description: "Controls the maximum content rating a child can access across five international rating systems (MPAA, TV, ESRB, PEGI, CSM). Enforces age-appropriate media consumption.",
    rationale: "Exposure to age-inappropriate content is one of the most well-documented harms to child development. This rule ensures platforms respect age-based content gates across all media types — movies, TV, games, and apps.",
    laws: [],
    fields: [
      { name: "max_ratings", type: "Record<string, string>", required: true, default: "age-computed", constraints: "Keys: mpaa, tv, esrb, pegi, csm. Values must be valid ratings within each system.", description: "Maximum allowed content rating per rating system" },
    ],
    exampleConfig: '{\n  "max_ratings": {\n    "mpaa": "PG",\n    "tv": "TV-Y7",\n    "esrb": "E",\n    "pegi": "7",\n    "csm": "7+"\n  }\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "G / TV-Y / E / PEGI 3 / CSM 5+" },
      { range: "7-9", enabled: true, summary: "PG / TV-Y7 / E / PEGI 7 / CSM 7+" },
      { range: "10-12", enabled: true, summary: "PG / TV-PG / E10+ / PEGI 7 / CSM 10+" },
      { range: "13-16", enabled: true, summary: "PG-13 / TV-14 / T / PEGI 12 / CSM 13+" },
      { range: "17+", enabled: true, summary: "R / TV-MA / M / PEGI 16 / CSM 17+" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "full" },
      { name: "Microsoft", support: "full" },
    ],
  },
  {
    id: "content_block_title",
    name: "Content Block by Title",
    group: "content",
    description: "Blocks specific content titles (movies, shows, games, apps) by name. Provides granular per-title blocking beyond rating-based controls.",
    rationale: "Rating systems cannot catch every objectionable title. Parents need the ability to block specific content they deem inappropriate regardless of its official rating — for example, a PG movie with themes a particular family finds unsuitable.",
    laws: [],
    fields: [
      { name: "titles", type: "string[]", required: true, default: "[]", constraints: "Array of title strings. Case-insensitive matching. Max 500 entries.", description: "List of content titles to block" },
    ],
    exampleConfig: '{\n  "titles": ["Grand Theft Auto V", "Squid Game", "South Park"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: false, summary: "No titles blocked by default" },
      { range: "7-9", enabled: false, summary: "No titles blocked by default" },
      { range: "10-12", enabled: false, summary: "No titles blocked by default" },
      { range: "13-16", enabled: false, summary: "No titles blocked by default" },
      { range: "17+", enabled: false, summary: "No titles blocked by default" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "partial" },
      { name: "Microsoft", support: "full" },
    ],
  },
  {
    id: "content_allow_title",
    name: "Content Allow by Title",
    group: "content",
    description: "Explicitly allows specific content titles that would otherwise be blocked by rating or category rules. Acts as an override allowlist.",
    rationale: "Parents may want to grant exceptions for specific educational or family-approved content that falls above the child's general rating threshold — for example, allowing a PG-13 documentary for a 10-year-old.",
    laws: [],
    fields: [
      { name: "titles", type: "string[]", required: true, default: "[]", constraints: "Array of title strings. Case-insensitive matching. Max 500 entries.", description: "List of content titles to explicitly allow" },
    ],
    exampleConfig: '{\n  "titles": ["Planet Earth", "National Geographic Wild"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: false, summary: "No titles allowed by default" },
      { range: "7-9", enabled: false, summary: "No titles allowed by default" },
      { range: "10-12", enabled: false, summary: "No titles allowed by default" },
      { range: "13-16", enabled: false, summary: "No titles allowed by default" },
      { range: "17+", enabled: false, summary: "No titles allowed by default" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "partial" },
      { name: "Microsoft", support: "full" },
    ],
  },
  {
    id: "content_allowlist_mode",
    name: "Content Allowlist Mode",
    group: "content",
    description: "When enabled, switches content access to allowlist-only mode — only explicitly approved content is accessible. All other content is blocked by default.",
    rationale: "For very young children or highly restricted environments, a deny-all-except-approved approach is safer than trying to block every possible harmful title. This inverts the default posture from permissive to restrictive.",
    laws: [],
    fields: [
      { name: "enabled", type: "boolean", required: true, default: "false", constraints: "true or false", description: "Whether to enable allowlist-only mode" },
    ],
    exampleConfig: '{\n  "enabled": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: false, summary: "Disabled (rating-based filtering sufficient)" },
      { range: "7-9", enabled: false, summary: "Disabled" },
      { range: "10-12", enabled: false, summary: "Disabled" },
      { range: "13-16", enabled: false, summary: "Disabled" },
      { range: "17+", enabled: false, summary: "Disabled" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "partial" },
      { name: "Microsoft", support: "full" },
    ],
  },
  {
    id: "content_descriptor_block",
    name: "Content Descriptor Block",
    group: "content",
    description: "Blocks content based on specific content descriptors (violence, language, sexual content, drugs, gambling) regardless of the overall rating.",
    rationale: "A title may have an acceptable overall rating but contain specific elements a family wants to avoid. Content descriptors provide fine-grained control — for example, blocking all content flagged for gambling regardless of its rating.",
    laws: [],
    fields: [
      { name: "descriptors", type: "string[]", required: true, default: "age-computed", constraints: "Valid values: violence, language, sexual_content, drugs, gambling", description: "Content descriptors to block" },
    ],
    exampleConfig: '{\n  "descriptors": ["violence", "gambling", "drugs"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "All descriptors blocked" },
      { range: "7-9", enabled: true, summary: "All descriptors blocked" },
      { range: "10-12", enabled: true, summary: "violence, sexual_content, drugs, gambling" },
      { range: "13-16", enabled: true, summary: "sexual_content, drugs, gambling" },
      { range: "17+", enabled: true, summary: "gambling only" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "partial" },
      { name: "Microsoft", support: "full" },
    ],
  },
  // ─── Time (6-9) ───
  {
    id: "time_daily_limit",
    name: "Daily Screen Time Limit",
    group: "time",
    description: "Sets the maximum total screen time allowed per day in minutes. Enforced across all apps and content on supported platforms.",
    rationale: "Excessive screen time is linked to sleep disruption, reduced physical activity, and attention difficulties in children. Daily limits help families establish healthy digital habits and ensure time for offline activities.",
    laws: [],
    fields: [
      { name: "daily_minutes", type: "number", required: true, default: "age-computed", constraints: "Range: 15-480, step: 15", description: "Maximum screen time per day in minutes" },
    ],
    exampleConfig: '{\n  "daily_minutes": 120\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "60 minutes" },
      { range: "7-9", enabled: true, summary: "90 minutes" },
      { range: "10-12", enabled: true, summary: "120 minutes" },
      { range: "13-16", enabled: true, summary: "180 minutes" },
      { range: "17+", enabled: true, summary: "240 minutes" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "full" },
      { name: "Microsoft", support: "full" },
    ],
  },
  {
    id: "time_scheduled_hours",
    name: "Scheduled Usage Hours",
    group: "time",
    description: "Defines allowed usage windows for weekdays and weekends. Device access is blocked outside these hours, enforcing bedtime and school-time restrictions.",
    rationale: "Children need structured schedules that protect sleep, school time, and family time. Scheduled hours ensure devices are only accessible during parent-approved windows, preventing late-night usage and classroom distractions.",
    laws: [],
    fields: [
      { name: "schedule", type: "object", required: true, default: "age-computed", constraints: "Must include weekday and weekend sub-objects, each with start and end in HH:MM format", description: "Allowed usage schedule" },
      { name: "schedule.weekday.start", type: "string", required: true, default: "07:00", constraints: "HH:MM format, 24-hour", description: "Weekday start time" },
      { name: "schedule.weekday.end", type: "string", required: true, default: "age-computed", constraints: "HH:MM format, 24-hour", description: "Weekday end time (bedtime)" },
      { name: "schedule.weekend.start", type: "string", required: true, default: "08:00", constraints: "HH:MM format, 24-hour", description: "Weekend start time" },
      { name: "schedule.weekend.end", type: "string", required: true, default: "age-computed", constraints: "HH:MM format, 24-hour", description: "Weekend end time" },
    ],
    exampleConfig: '{\n  "schedule": {\n    "weekday": { "start": "07:00", "end": "20:00" },\n    "weekend": { "start": "08:00", "end": "21:00" }\n  }\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Weekday 07:00-19:00, Weekend 08:00-19:00" },
      { range: "7-9", enabled: true, summary: "Weekday 07:00-20:00, Weekend 08:00-20:00" },
      { range: "10-12", enabled: true, summary: "Weekday 07:00-21:00, Weekend 08:00-21:00" },
      { range: "13-16", enabled: true, summary: "Weekday 07:00-22:00, Weekend 08:00-22:00" },
      { range: "17+", enabled: true, summary: "Weekday 07:00-23:00, Weekend 08:00-23:00" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "partial" },
      { name: "Microsoft", support: "full" },
    ],
  },
  {
    id: "time_per_app_limit",
    name: "Per-App Time Limit",
    group: "time",
    description: "Sets individual time limits for specific apps. Allows parents to restrict time on specific apps (e.g., social media) while allowing more time for educational apps.",
    rationale: "Not all screen time is equal. Parents need granular control to limit addictive apps like social media or games while allowing longer use of educational tools like Khan Academy or reading apps.",
    laws: [],
    fields: [
      { name: "limits", type: "Record<string, number>", required: true, default: "{}", constraints: "Keys: app identifiers. Values: minutes per day (15-480, step 15)", description: "Per-app daily time limits in minutes" },
    ],
    exampleConfig: '{\n  "limits": {\n    "com.instagram.android": 30,\n    "com.tiktok.android": 30,\n    "com.youtube.android": 60\n  }\n}',
    ageDefaults: [
      { range: "0-6", enabled: false, summary: "No per-app limits (daily limit sufficient)" },
      { range: "7-9", enabled: false, summary: "No per-app limits by default" },
      { range: "10-12", enabled: false, summary: "No per-app limits by default" },
      { range: "13-16", enabled: false, summary: "No per-app limits by default" },
      { range: "17+", enabled: false, summary: "No per-app limits by default" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "full" },
      { name: "Microsoft", support: "partial" },
    ],
  },
  {
    id: "time_downtime",
    name: "Scheduled Downtime",
    group: "time",
    description: "Defines specific downtime periods where device usage is fully blocked. Supports different schedules per day of the week.",
    rationale: "Downtime periods enforce mandatory screen-free time for meals, homework, sleep, and family activities. Unlike scheduled hours which define allowed windows, downtime creates explicit blocked windows that override all other settings.",
    laws: [],
    fields: [
      { name: "start", type: "string", required: true, default: "age-computed", constraints: "HH:MM format, 24-hour", description: "Downtime start time" },
      { name: "end", type: "string", required: true, default: "07:00", constraints: "HH:MM format, 24-hour", description: "Downtime end time" },
      { name: "days", type: "string[]", required: false, default: '["mon","tue","wed","thu","fri","sat","sun"]', constraints: "Valid: mon, tue, wed, thu, fri, sat, sun", description: "Days of the week when downtime applies" },
    ],
    exampleConfig: '{\n  "start": "20:00",\n  "end": "07:00",\n  "days": ["mon", "tue", "wed", "thu", "fri"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "19:00-07:00 daily" },
      { range: "7-9", enabled: true, summary: "20:00-07:00 daily" },
      { range: "10-12", enabled: true, summary: "21:00-07:00 daily" },
      { range: "13-16", enabled: true, summary: "22:00-07:00 daily" },
      { range: "17+", enabled: true, summary: "23:00-07:00 daily" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "partial" },
      { name: "Microsoft", support: "full" },
    ],
  },
  // ─── Purchase (10-12) ───
  {
    id: "purchase_approval",
    name: "Purchase Approval",
    group: "purchase",
    description: "Requires parent/guardian approval before any purchase can be completed. Applies to app purchases, subscriptions, and digital content.",
    rationale: "Children may not understand the financial implications of digital purchases. Approval gates prevent unauthorized spending and teach responsible consumer habits by involving parents in purchase decisions.",
    laws: [],
    fields: [
      { name: "require_approval", type: "boolean", required: true, default: "age-computed", constraints: "true or false", description: "Whether purchases require parent approval" },
    ],
    exampleConfig: '{\n  "require_approval": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Approval required" },
      { range: "7-9", enabled: true, summary: "Approval required" },
      { range: "10-12", enabled: true, summary: "Approval required" },
      { range: "13-16", enabled: true, summary: "Approval required" },
      { range: "17+", enabled: false, summary: "No approval required" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "purchase_spending_cap",
    name: "Monthly Spending Cap",
    group: "purchase",
    description: "Sets a maximum monthly spending limit for the child's account across all digital purchases. Resets at the start of each calendar month.",
    rationale: "Even with purchase approval enabled, a spending cap provides a hard financial boundary. This protects against rapid-fire small purchases that individually seem harmless but accumulate quickly.",
    laws: [],
    fields: [
      { name: "monthly_cap", type: "number", required: true, default: "0", constraints: "Range: 0-500 (USD). 0 means no purchases allowed.", description: "Maximum monthly spending in USD" },
    ],
    exampleConfig: '{\n  "monthly_cap": 25\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "$0 (no purchases)" },
      { range: "7-9", enabled: true, summary: "$0 (no purchases)" },
      { range: "10-12", enabled: true, summary: "$10/month" },
      { range: "13-16", enabled: true, summary: "$25/month" },
      { range: "17+", enabled: false, summary: "No cap" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "purchase_block_iap",
    name: "Block In-App Purchases",
    group: "purchase",
    description: "Blocks all in-app purchases (IAP) including consumables, subscriptions, and loot boxes within apps and games.",
    rationale: "In-app purchases — especially loot boxes and microtransactions in games — are designed to exploit impulsive behavior. Blocking IAP entirely removes the most predatory monetization vectors targeting children.",
    laws: [],
    fields: [
      { name: "block_iap", type: "boolean", required: true, default: "age-computed", constraints: "true or false", description: "Whether to block all in-app purchases" },
    ],
    exampleConfig: '{\n  "block_iap": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "All IAP blocked" },
      { range: "7-9", enabled: true, summary: "All IAP blocked" },
      { range: "10-12", enabled: true, summary: "All IAP blocked" },
      { range: "13-16", enabled: false, summary: "IAP allowed (with approval)" },
      { range: "17+", enabled: false, summary: "IAP allowed" },
    ],
    platforms: PLATFORM_NONE,
  },
  // ─── Social (13-15) ───
  {
    id: "social_contacts",
    name: "Contact Management",
    group: "social",
    description: "Controls who the child can communicate with. In approved-only mode, only parent-approved contacts can reach the child.",
    rationale: "Stranger contact is one of the primary vectors for grooming and exploitation. Contact management ensures children only interact with vetted, parent-approved individuals across all communication channels.",
    laws: [],
    fields: [
      { name: "mode", type: "string", required: true, default: "age-computed", constraints: '"approved_only" or "anyone"', description: "Contact restriction mode" },
      { name: "approved_contacts", type: "string[]", required: false, default: "[]", constraints: "Array of contact identifiers. Max 200 entries.", description: "List of approved contact IDs when in approved_only mode" },
    ],
    exampleConfig: '{\n  "mode": "approved_only",\n  "approved_contacts": ["contact_abc123", "contact_def456"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Approved contacts only" },
      { range: "7-9", enabled: true, summary: "Approved contacts only" },
      { range: "10-12", enabled: true, summary: "Approved contacts only" },
      { range: "13-16", enabled: false, summary: "Anyone (monitoring enabled)" },
      { range: "17+", enabled: false, summary: "Anyone" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "social_chat_control",
    name: "Chat Control",
    group: "social",
    description: "Controls in-app chat functionality. Can be fully disabled, limited to friends only, or open to everyone.",
    rationale: "Chat features in games and apps expose children to unsupervised communication with strangers. Restricting chat to friends-only or disabling it entirely reduces exposure to harassment, bullying, and predatory contact.",
    laws: [],
    fields: [
      { name: "mode", type: "string", required: true, default: "age-computed", constraints: '"disabled", "friends_only", or "everyone"', description: "Chat restriction level" },
    ],
    exampleConfig: '{\n  "mode": "friends_only"\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Chat disabled" },
      { range: "7-9", enabled: true, summary: "Friends only" },
      { range: "10-12", enabled: true, summary: "Friends only" },
      { range: "13-16", enabled: true, summary: "Friends only" },
      { range: "17+", enabled: false, summary: "Everyone" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "social_multiplayer",
    name: "Multiplayer Gaming",
    group: "social",
    description: "Controls access to multiplayer gaming features. Can restrict to approved games only or disable multiplayer entirely.",
    rationale: "Multiplayer gaming exposes children to unmoderated voice and text chat with strangers. Restricting multiplayer to approved games ensures parents can vet the social environment of each game individually.",
    laws: [],
    fields: [
      { name: "enabled", type: "boolean", required: true, default: "age-computed", constraints: "true or false", description: "Whether multiplayer gaming is allowed" },
      { name: "approved_games", type: "string[]", required: false, default: "[]", constraints: "Array of game identifiers. Only used when enabled=true.", description: "List of approved multiplayer game IDs" },
    ],
    exampleConfig: '{\n  "enabled": true,\n  "approved_games": ["minecraft", "roblox"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: false, summary: "Multiplayer disabled" },
      { range: "7-9", enabled: true, summary: "Approved games only" },
      { range: "10-12", enabled: true, summary: "Approved games only" },
      { range: "13-16", enabled: true, summary: "All multiplayer allowed" },
      { range: "17+", enabled: true, summary: "All multiplayer allowed" },
    ],
    platforms: PLATFORM_NONE,
  },
  // ─── Web (16-20) ───
  {
    id: "web_safesearch",
    name: "Safe Search",
    group: "web",
    description: "Forces safe search mode on supported search engines (Google, Bing, DuckDuckGo, YouTube). Filters explicit results from search queries.",
    rationale: "Search engines are the primary discovery mechanism for content online. Without safe search enforcement, a single search query can expose children to pornography, violence, and other harmful content.",
    laws: [],
    fields: [
      { name: "enabled", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Whether to enforce safe search" },
    ],
    exampleConfig: '{\n  "enabled": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Safe search on" },
      { range: "7-9", enabled: true, summary: "Safe search on" },
      { range: "10-12", enabled: true, summary: "Safe search on" },
      { range: "13-16", enabled: true, summary: "Safe search on" },
      { range: "17+", enabled: true, summary: "Safe search on" },
    ],
    platforms: [
      { name: "NextDNS", support: "full" },
      { name: "CleanBrowsing", support: "full" },
      { name: "Android", support: "none" },
      { name: "Apple MDM", support: "none" },
      { name: "Microsoft", support: "none" },
    ],
  },
  {
    id: "web_category_block",
    name: "Web Category Block",
    group: "web",
    description: "Blocks access to entire categories of websites. Categories include adult content, gambling, drugs, violence, social media, dating, and malware.",
    rationale: "Category-based blocking provides broad protection against entire classes of harmful content without requiring per-URL management. It catches new harmful sites automatically as DNS providers update their category databases.",
    laws: [],
    fields: [
      { name: "categories", type: "string[]", required: true, default: "age-computed", constraints: "Valid: adult, gambling, drugs, violence, social_media, dating, malware", description: "Website categories to block" },
    ],
    exampleConfig: '{\n  "categories": ["adult", "gambling", "drugs", "violence", "malware"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "All categories blocked" },
      { range: "7-9", enabled: true, summary: "All categories blocked" },
      { range: "10-12", enabled: true, summary: "adult, gambling, drugs, violence, dating, malware" },
      { range: "13-16", enabled: true, summary: "adult, gambling, drugs, malware" },
      { range: "17+", enabled: true, summary: "adult, gambling, malware" },
    ],
    platforms: [
      { name: "NextDNS", support: "full" },
      { name: "CleanBrowsing", support: "full" },
      { name: "Android", support: "none" },
      { name: "Apple MDM", support: "full" },
      { name: "Microsoft", support: "full" },
    ],
  },
  {
    id: "web_custom_allowlist",
    name: "Web Custom Allowlist",
    group: "web",
    description: "Explicitly allows specific URLs/domains that would otherwise be blocked by category or filter rules. Acts as an override for false positives.",
    rationale: "Category-based blocking can sometimes catch educational or family-approved sites. The allowlist provides a mechanism to grant exceptions without weakening the overall filtering policy.",
    laws: [],
    fields: [
      { name: "urls", type: "string[]", required: true, default: "[]", constraints: "Array of URLs or domains. Max 1000 entries.", description: "URLs/domains to explicitly allow" },
    ],
    exampleConfig: '{\n  "urls": ["khanacademy.org", "wikipedia.org", "scratch.mit.edu"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: false, summary: "No custom allowlist" },
      { range: "7-9", enabled: false, summary: "No custom allowlist" },
      { range: "10-12", enabled: false, summary: "No custom allowlist" },
      { range: "13-16", enabled: false, summary: "No custom allowlist" },
      { range: "17+", enabled: false, summary: "No custom allowlist" },
    ],
    platforms: [
      { name: "NextDNS", support: "full" },
      { name: "CleanBrowsing", support: "full" },
      { name: "Android", support: "none" },
      { name: "Apple MDM", support: "none" },
      { name: "Microsoft", support: "none" },
    ],
  },
  {
    id: "web_custom_blocklist",
    name: "Web Custom Blocklist",
    group: "web",
    description: "Blocks specific URLs/domains in addition to category-based blocking. Provides per-site granularity for sites not covered by category filters.",
    rationale: "Some harmful or distracting sites may not fall into blocked categories. A custom blocklist lets parents address specific sites they've identified as problematic for their child.",
    laws: [],
    fields: [
      { name: "urls", type: "string[]", required: true, default: "[]", constraints: "Array of URLs or domains. Max 1000 entries.", description: "URLs/domains to block" },
    ],
    exampleConfig: '{\n  "urls": ["reddit.com", "4chan.org", "omegle.com"]\n}',
    ageDefaults: [
      { range: "0-6", enabled: false, summary: "No custom blocklist" },
      { range: "7-9", enabled: false, summary: "No custom blocklist" },
      { range: "10-12", enabled: false, summary: "No custom blocklist" },
      { range: "13-16", enabled: false, summary: "No custom blocklist" },
      { range: "17+", enabled: false, summary: "No custom blocklist" },
    ],
    platforms: [
      { name: "NextDNS", support: "full" },
      { name: "CleanBrowsing", support: "full" },
      { name: "Android", support: "none" },
      { name: "Apple MDM", support: "none" },
      { name: "Microsoft", support: "none" },
    ],
  },
  {
    id: "web_filter_level",
    name: "Web Filter Level",
    group: "web",
    description: "Sets the overall web filtering strictness level. Controls how aggressively content is filtered across all web access.",
    rationale: "A single filter level setting provides a simple, parent-friendly way to control overall web safety without requiring detailed category-by-category configuration. It acts as the baseline filtering posture.",
    laws: [],
    fields: [
      { name: "level", type: "string", required: true, default: "age-computed", constraints: '"strict", "moderate", or "light"', description: "Web filtering strictness level" },
    ],
    exampleConfig: '{\n  "level": "strict"\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Strict" },
      { range: "7-9", enabled: true, summary: "Strict" },
      { range: "10-12", enabled: true, summary: "Moderate" },
      { range: "13-16", enabled: true, summary: "Light" },
      { range: "17+", enabled: true, summary: "Light" },
    ],
    platforms: [
      { name: "NextDNS", support: "full" },
      { name: "CleanBrowsing", support: "full" },
      { name: "Android", support: "none" },
      { name: "Apple MDM", support: "full" },
      { name: "Microsoft", support: "full" },
    ],
  },
  // ─── Privacy (21-24) ───
  {
    id: "privacy_location",
    name: "Location Sharing",
    group: "privacy",
    description: "Controls location sharing settings. Can be off, shared with family only, or fully on. Family-only mode allows parents to locate the child without exposing location to third parties.",
    rationale: "Location data is highly sensitive for minors. While parents need location access for safety, sharing location with apps and third parties creates tracking and profiling risks. This control separates family safety from commercial surveillance.",
    laws: [],
    fields: [
      { name: "sharing", type: "string", required: true, default: "age-computed", constraints: '"off", "family_only", or "on"', description: "Location sharing mode" },
    ],
    exampleConfig: '{\n  "sharing": "family_only"\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Family only" },
      { range: "7-9", enabled: true, summary: "Family only" },
      { range: "10-12", enabled: true, summary: "Family only" },
      { range: "13-16", enabled: true, summary: "Family only" },
      { range: "17+", enabled: false, summary: "Off" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "none" },
      { name: "Microsoft", support: "none" },
    ],
  },
  {
    id: "privacy_profile_visibility",
    name: "Profile Visibility",
    group: "privacy",
    description: "Controls the visibility of the child's profile on platforms. Can be set to private, friends-only, or public.",
    rationale: "Public profiles expose children's personal information, photos, and activity to anyone on the internet. Restricting profile visibility reduces the risk of unwanted contact, identity theft, and profiling.",
    laws: [],
    fields: [
      { name: "visibility", type: "string", required: true, default: "age-computed", constraints: '"private", "friends", or "public"', description: "Profile visibility level" },
    ],
    exampleConfig: '{\n  "visibility": "private"\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Private" },
      { range: "7-9", enabled: true, summary: "Private" },
      { range: "10-12", enabled: true, summary: "Friends only" },
      { range: "13-16", enabled: true, summary: "Friends only" },
      { range: "17+", enabled: true, summary: "Friends only" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "privacy_data_sharing",
    name: "Data Sharing Controls",
    group: "privacy",
    description: "Controls whether the child's data can be shared with third parties for advertising or analytics purposes.",
    rationale: "Children's data is aggressively collected and monetized by ad networks and data brokers. These controls ensure parents can prevent commercial exploitation of their child's behavioral data, activity patterns, and personal information.",
    laws: [],
    fields: [
      { name: "allow_third_party", type: "boolean", required: true, default: "false", constraints: "true or false", description: "Whether third-party data sharing is allowed" },
      { name: "allow_analytics", type: "boolean", required: true, default: "false", constraints: "true or false", description: "Whether analytics data collection is allowed" },
    ],
    exampleConfig: '{\n  "allow_third_party": false,\n  "allow_analytics": false\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "All sharing blocked" },
      { range: "7-9", enabled: true, summary: "All sharing blocked" },
      { range: "10-12", enabled: true, summary: "All sharing blocked" },
      { range: "13-16", enabled: true, summary: "All sharing blocked" },
      { range: "17+", enabled: true, summary: "Analytics only" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "privacy_account_creation",
    name: "Account Creation Approval",
    group: "privacy",
    description: "Requires parent approval before the child can create new accounts on platforms and services.",
    rationale: "Uncontrolled account creation allows children to bypass parental controls by creating accounts on unmonitored platforms. Approval gates ensure parents know every platform their child uses.",
    laws: [],
    fields: [
      { name: "require_approval", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Whether new account creation requires parent approval" },
    ],
    exampleConfig: '{\n  "require_approval": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Approval required" },
      { range: "7-9", enabled: true, summary: "Approval required" },
      { range: "10-12", enabled: true, summary: "Approval required" },
      { range: "13-16", enabled: true, summary: "Approval required" },
      { range: "17+", enabled: false, summary: "No approval required" },
    ],
    platforms: PLATFORM_NONE,
  },
  // ─── Monitoring (25-26) ───
  {
    id: "monitoring_activity",
    name: "Activity Monitoring",
    group: "monitoring",
    description: "Enables activity monitoring to track app usage, screen time, and browsing activity. Reports are made available to parents through the dashboard.",
    rationale: "Parents need visibility into their child's digital activity to identify concerning patterns — excessive gaming, late-night usage, or visits to risky sites. Activity monitoring provides this visibility without blocking access.",
    laws: [],
    fields: [
      { name: "enabled", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Whether activity monitoring is enabled" },
    ],
    exampleConfig: '{\n  "enabled": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Monitoring on" },
      { range: "7-9", enabled: true, summary: "Monitoring on" },
      { range: "10-12", enabled: true, summary: "Monitoring on" },
      { range: "13-16", enabled: true, summary: "Monitoring on" },
      { range: "17+", enabled: true, summary: "Monitoring on" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "none" },
      { name: "Microsoft", support: "full" },
    ],
  },
  {
    id: "monitoring_alerts",
    name: "Monitoring Alerts",
    group: "monitoring",
    description: "Configures real-time alerts sent to parents when specific events occur, such as screen time being exceeded, new apps installed, blocked content attempts, or location changes.",
    rationale: "Passive monitoring is only useful if parents review reports. Real-time alerts ensure parents are immediately notified of concerning events, enabling timely intervention rather than after-the-fact discovery.",
    laws: [],
    fields: [
      { name: "enabled", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Whether monitoring alerts are enabled" },
      { name: "alert_types", type: "string[]", required: false, default: "all", constraints: "Valid: screen_time_exceeded, new_app_installed, blocked_content_attempt, location_change", description: "Types of alerts to send" },
    ],
    exampleConfig: '{\n  "enabled": true,\n  "alert_types": [\n    "screen_time_exceeded",\n    "new_app_installed",\n    "blocked_content_attempt"\n  ]\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "All alert types" },
      { range: "7-9", enabled: true, summary: "All alert types" },
      { range: "10-12", enabled: true, summary: "All alert types" },
      { range: "13-16", enabled: true, summary: "screen_time_exceeded, blocked_content_attempt" },
      { range: "17+", enabled: true, summary: "blocked_content_attempt only" },
    ],
    platforms: [
      { name: "NextDNS", support: "none" },
      { name: "CleanBrowsing", support: "none" },
      { name: "Android", support: "full" },
      { name: "Apple MDM", support: "none" },
      { name: "Microsoft", support: "full" },
    ],
  },
  // ─── Algorithmic Safety (27-28) ───
  {
    id: "algo_feed_control",
    name: "Algorithm Feed Control",
    group: "algorithmic_safety",
    description: "Controls whether platforms serve algorithmic or chronological feeds. In chronological mode, content is shown in time order rather than ranked by engagement algorithms.",
    rationale: "Algorithmic feeds are optimized for engagement, not child wellbeing. They amplify sensational, addictive, and emotionally provocative content. Chronological feeds remove the algorithmic amplification that leads children into harmful content rabbit holes.",
    laws: ["KOSA", "KOSMA", "CA SB 976", "EU DSA"],
    fields: [
      { name: "mode", type: "string", required: true, default: "chronological", constraints: '"chronological" or "algorithmic"', description: "Feed algorithm mode" },
    ],
    exampleConfig: '{\n  "mode": "chronological"\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Chronological" },
      { range: "7-9", enabled: true, summary: "Chronological" },
      { range: "10-12", enabled: true, summary: "Chronological" },
      { range: "13-16", enabled: true, summary: "Chronological" },
      { range: "17+", enabled: true, summary: "Chronological" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "addictive_design_control",
    name: "Addictive Design Control",
    group: "algorithmic_safety",
    description: "Disables addictive design patterns including infinite scroll, autoplay, streaks, like counts, and daily rewards. Each pattern can be individually controlled.",
    rationale: "Addictive design patterns exploit psychological vulnerabilities — variable reward schedules, loss aversion (streaks), social validation (likes), and endless content (infinite scroll). Disabling these patterns reduces compulsive usage and protects developing brains.",
    laws: ["KOSA", "CT SB 3", "EU DSA", "UK OSA"],
    fields: [
      { name: "disable_infinite_scroll", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Disable infinite scroll / endless feed" },
      { name: "disable_autoplay", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Disable auto-playing next video/content" },
      { name: "disable_streaks", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Disable streak counters and rewards" },
      { name: "disable_like_counts", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Hide like/reaction counts" },
      { name: "disable_daily_rewards", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Disable daily login rewards" },
    ],
    exampleConfig: '{\n  "disable_infinite_scroll": true,\n  "disable_autoplay": true,\n  "disable_streaks": true,\n  "disable_like_counts": true,\n  "disable_daily_rewards": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "All patterns disabled" },
      { range: "7-9", enabled: true, summary: "All patterns disabled" },
      { range: "10-12", enabled: true, summary: "All patterns disabled" },
      { range: "13-16", enabled: true, summary: "Autoplay + infinite scroll disabled" },
      { range: "17+", enabled: false, summary: "No restrictions" },
    ],
    platforms: PLATFORM_NONE,
  },
  // ─── Notifications (29-30) ───
  {
    id: "notification_curfew",
    name: "Notification Curfew",
    group: "notifications",
    description: "Suppresses all non-essential notifications during defined quiet hours. Emergency and family notifications are always allowed through.",
    rationale: "Notifications are a primary driver of compulsive device checking and sleep disruption. A notification curfew during evening and nighttime hours protects sleep quality and reduces anxiety from constant digital stimulation.",
    laws: ["VA SB 854", "NY SAFE for Kids"],
    fields: [
      { name: "start", type: "string", required: true, default: "age-computed", constraints: "HH:MM format, 24-hour", description: "Curfew start time" },
      { name: "end", type: "string", required: true, default: "age-computed", constraints: "HH:MM format, 24-hour", description: "Curfew end time" },
    ],
    exampleConfig: '{\n  "start": "20:00",\n  "end": "07:00"\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "20:00-07:00" },
      { range: "7-9", enabled: true, summary: "20:00-07:00" },
      { range: "10-12", enabled: true, summary: "20:00-07:00" },
      { range: "13-16", enabled: true, summary: "22:00-06:00" },
      { range: "17+", enabled: true, summary: "00:00-06:00" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "usage_timer_notification",
    name: "Usage Timer Notification",
    group: "notifications",
    description: "Sends periodic reminders to the child at configurable intervals while they are using their device. Helps build awareness of time spent on screens.",
    rationale: "Children often lose track of time while using devices. Periodic usage reminders build self-regulation skills by making children conscious of how long they've been using screens, encouraging voluntary breaks.",
    laws: ["MN HF 2", "TN HB 1891"],
    fields: [
      { name: "interval_minutes", type: "number", required: true, default: "age-computed", constraints: "Valid values: 15, 30, 45, or 60", description: "Reminder interval in minutes" },
    ],
    exampleConfig: '{\n  "interval_minutes": 30\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Every 15 minutes" },
      { range: "7-9", enabled: true, summary: "Every 15 minutes" },
      { range: "10-12", enabled: true, summary: "Every 15 minutes" },
      { range: "13-16", enabled: true, summary: "Every 30 minutes" },
      { range: "17+", enabled: true, summary: "Every 60 minutes" },
    ],
    platforms: PLATFORM_NONE,
  },
  // ─── Advertising & Data (31, 34-35) ───
  {
    id: "targeted_ad_block",
    name: "Targeted Ad Block",
    group: "advertising_data",
    description: "Blocks all targeted and behavioral advertising for the child's account. Only contextual (non-personalized) ads are permitted.",
    rationale: "Targeted advertising uses surveillance-based profiling to exploit children's vulnerabilities, interests, and insecurities. Multiple laws now explicitly prohibit behavioral advertising targeting minors.",
    laws: ["COPPA 2.0", "EU DSA", "India DPDPA"],
    fields: [
      { name: "block_targeted_ads", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Whether to block targeted/behavioral ads" },
    ],
    exampleConfig: '{\n  "block_targeted_ads": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Targeted ads blocked" },
      { range: "7-9", enabled: true, summary: "Targeted ads blocked" },
      { range: "10-12", enabled: true, summary: "Targeted ads blocked" },
      { range: "13-16", enabled: true, summary: "Targeted ads blocked" },
      { range: "17+", enabled: true, summary: "Targeted ads blocked" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "data_deletion_request",
    name: "Data Deletion Request",
    group: "advertising_data",
    description: "Enables one-click data deletion request for child accounts. Platforms must honor deletion requests within 30 days per applicable law.",
    rationale: "Children cannot meaningfully consent to permanent data collection. The right to deletion ensures that data collected during childhood — browsing history, location data, social interactions — can be erased when no longer needed or desired.",
    laws: ["COPPA 2.0", "NY NYCDPA"],
    fields: [
      { name: "enabled", type: "boolean", required: true, default: "true", constraints: "true or false", description: "Whether data deletion request capability is enabled" },
    ],
    exampleConfig: '{\n  "enabled": true\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Enabled" },
      { range: "7-9", enabled: true, summary: "Enabled" },
      { range: "10-12", enabled: true, summary: "Enabled" },
      { range: "13-16", enabled: true, summary: "Enabled" },
      { range: "17+", enabled: true, summary: "Enabled" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "geolocation_opt_in",
    name: "Geolocation Opt-In",
    group: "advertising_data",
    description: "Defaults geolocation sharing to off and requires explicit opt-in. Prevents apps from silently accessing location data.",
    rationale: "Many apps request and use geolocation data by default, creating detailed movement profiles of children. Defaulting to off and requiring explicit opt-in ensures location access is a conscious, informed decision.",
    laws: ["CT SB 3", "MD Kids Code", "COPPA update"],
    fields: [
      { name: "geolocation_allowed", type: "boolean", required: true, default: "false", constraints: "true or false", description: "Whether geolocation is allowed for third-party apps" },
    ],
    exampleConfig: '{\n  "geolocation_allowed": false\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Geolocation off" },
      { range: "7-9", enabled: true, summary: "Geolocation off" },
      { range: "10-12", enabled: true, summary: "Geolocation off" },
      { range: "13-16", enabled: true, summary: "Geolocation off" },
      { range: "17+", enabled: true, summary: "Geolocation off" },
    ],
    platforms: PLATFORM_NONE,
  },
  // ─── Access Control (32-33) ───
  {
    id: "dm_restriction",
    name: "DM Restriction",
    group: "access_control",
    description: "Restricts direct messaging capabilities. Can block all DMs, limit to contacts only, or allow everyone.",
    rationale: "Direct messages are the primary vector for predatory contact, cyberbullying, and sextortion. Restricting DMs to known contacts dramatically reduces the attack surface for these harms.",
    laws: ["CT SB 3", "UK OSA"],
    fields: [
      { name: "mode", type: "string", required: true, default: "age-computed", constraints: '"none", "contacts_only", or "everyone"', description: "DM restriction level" },
    ],
    exampleConfig: '{\n  "mode": "contacts_only"\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "No DMs" },
      { range: "7-9", enabled: true, summary: "No DMs" },
      { range: "10-12", enabled: true, summary: "No DMs" },
      { range: "13-16", enabled: true, summary: "Contacts only" },
      { range: "17+", enabled: false, summary: "Everyone" },
    ],
    platforms: PLATFORM_NONE,
  },
  {
    id: "age_gate",
    name: "Age Gate",
    group: "access_control",
    description: "Requires age verification before platform access. Configurable minimum age threshold. Platforms must implement age verification compliant with applicable law.",
    rationale: "Age gates are the first line of defense against underage access to platforms designed for older users. Multiple jurisdictions now mandate robust age verification for platforms serving minors.",
    laws: ["KOSMA", "FL HB 3", "Australia Online Safety Act"],
    fields: [
      { name: "enabled", type: "boolean", required: true, default: "age-computed", constraints: "true or false", description: "Whether age gate is enabled" },
      { name: "min_age", type: "number", required: false, default: "13", constraints: "Range: 0-18", description: "Minimum age required for platform access" },
    ],
    exampleConfig: '{\n  "enabled": true,\n  "min_age": 13\n}',
    ageDefaults: [
      { range: "0-6", enabled: true, summary: "Enabled (min age 13)" },
      { range: "7-9", enabled: true, summary: "Enabled (min age 13)" },
      { range: "10-12", enabled: true, summary: "Enabled (min age 13)" },
      { range: "13-16", enabled: false, summary: "Disabled (meets minimum)" },
      { range: "17+", enabled: false, summary: "Disabled" },
    ],
    platforms: PLATFORM_NONE,
  },
]

const CATEGORY_GROUPS = [
  { key: "content", label: "Content", description: "Control what media and content children can access across platforms", categories: ["content_rating", "content_block_title", "content_allow_title", "content_allowlist_mode", "content_descriptor_block"] },
  { key: "time", label: "Time", description: "Manage screen time limits, schedules, and downtime periods", categories: ["time_daily_limit", "time_scheduled_hours", "time_per_app_limit", "time_downtime"] },
  { key: "purchase", label: "Purchase", description: "Control digital purchases, spending limits, and in-app transactions", categories: ["purchase_approval", "purchase_spending_cap", "purchase_block_iap"] },
  { key: "social", label: "Social", description: "Manage contacts, chat, and multiplayer interactions", categories: ["social_contacts", "social_chat_control", "social_multiplayer"] },
  { key: "web", label: "Web", description: "Filter web content, enforce safe search, and manage blocklists", categories: ["web_safesearch", "web_category_block", "web_custom_allowlist", "web_custom_blocklist", "web_filter_level"] },
  { key: "privacy", label: "Privacy", description: "Control location sharing, profile visibility, and data sharing", categories: ["privacy_location", "privacy_profile_visibility", "privacy_data_sharing", "privacy_account_creation"] },
  { key: "monitoring", label: "Monitoring", description: "Track activity and configure real-time alerts for parents", categories: ["monitoring_activity", "monitoring_alerts"] },
  { key: "algorithmic_safety", label: "Algorithmic Safety", description: "Control algorithmic feeds and disable addictive design patterns", categories: ["algo_feed_control", "addictive_design_control"] },
  { key: "notifications", label: "Notifications", description: "Manage notification curfews and usage timer reminders", categories: ["notification_curfew", "usage_timer_notification"] },
  { key: "advertising_data", label: "Advertising & Data", description: "Block targeted ads, enable data deletion, and control geolocation", categories: ["targeted_ad_block", "data_deletion_request", "geolocation_opt_in"] },
  { key: "access_control", label: "Access Control", description: "Manage DM restrictions and age verification gates", categories: ["dm_restriction", "age_gate"] },
]

const AGE_DEFAULTS_TABLE = [
  { setting: "Screen Time", key: "time_daily_limit", values: ["60 min", "90 min", "120 min", "180 min", "240 min"] },
  { setting: "Bedtime", key: "time_downtime", values: ["19:00", "20:00", "21:00", "22:00", "23:00"] },
  { setting: "Web Filter", key: "web_filter_level", values: ["Strict", "Strict", "Moderate", "Light", "Light"] },
  { setting: "Purchase Approval", key: "purchase_approval", values: ["Yes", "Yes", "Yes", "Yes", "No"] },
  { setting: "Block IAP", key: "purchase_block_iap", values: ["Yes", "Yes", "Yes", "No", "No"] },
  { setting: "Chat Control", key: "social_chat_control", values: ["Disabled", "Friends only", "Friends only", "Friends only", "Everyone"] },
  { setting: "Feed Algorithm", key: "algo_feed_control", values: ["Chrono", "Chrono", "Chrono", "Chrono", "Chrono"] },
  { setting: "Addictive Design", key: "addictive_design_control", values: ["All blocked", "All blocked", "All blocked", "Autoplay+Scroll", "Off"] },
  { setting: "DM Restriction", key: "dm_restriction", values: ["None", "None", "None", "Contacts only", "Everyone"] },
  { setting: "Notification Curfew", key: "notification_curfew", values: ["20-07", "20-07", "20-07", "22-06", "00-06"] },
  { setting: "Usage Timer", key: "usage_timer_notification", values: ["15 min", "15 min", "15 min", "30 min", "60 min"] },
  { setting: "Targeted Ads", key: "targeted_ad_block", values: ["Blocked", "Blocked", "Blocked", "Blocked", "Blocked"] },
  { setting: "Geolocation", key: "geolocation_opt_in", values: ["Off", "Off", "Off", "Off", "Off"] },
  { setting: "Age Gate", key: "age_gate", values: ["On (13+)", "On (13+)", "On (13+)", "Off", "Off"] },
  { setting: "Data Deletion", key: "data_deletion_request", values: ["Enabled", "Enabled", "Enabled", "Enabled", "Enabled"] },
]

const AGE_RATING_TABLE = [
  { range: "0-6", mpaa: "G", tv: "TV-Y", esrb: "E", pegi: "3", csm: "5+" },
  { range: "7-9", mpaa: "PG", tv: "TV-Y7", esrb: "E", pegi: "7", csm: "7+" },
  { range: "10-12", mpaa: "PG", tv: "TV-PG", esrb: "E10+", pegi: "7", csm: "10+" },
  { range: "13-16", mpaa: "PG-13", tv: "TV-14", esrb: "T", pegi: "12", csm: "13+" },
  { range: "17", mpaa: "R", tv: "TV-MA", esrb: "M", pegi: "16", csm: "17+" },
  { range: "18+", mpaa: "NC-17", tv: "TV-MA", esrb: "AO", pegi: "18", csm: "18+" },
]

const RECIPES: Recipe[] = [
  {
    id: "first-time-setup",
    title: "First-Time Parent Setup",
    summary: "Maria protects her 7-year-old with standard protections across NextDNS and Android",
    icon: "🚀",
    tags: ["Quick Setup", "NextDNS", "Android"],
    scenario: "Maria just downloaded the GuardianGate app. Her daughter Sofia is 7 years old. Maria wants standard age-appropriate protection without manually configuring 35 categories. She has a NextDNS account for home WiFi filtering and an Android tablet for Sofia.",
    actors: ["Parent App", "GuardianGate API", "NextDNS", "Android"],
    flowDiagram: `Parent App          GuardianGate API        NextDNS        Android
    |                       |                   |              |
    |── POST /register ────>|                   |              |
    |<── 201 token ─────────|                   |              |
    |── POST /setup/quick ─>|                   |              |
    |   (Sofia, age 7)      |── generate rules ─|              |
    |<── 201 family+policy ─|                   |              |
    |── POST /compliance ──>|                   |              |
    |   (NextDNS creds)     |── verify ────────>|              |
    |<── 200 verified ──────|                   |              |
    |── POST /compliance ──>|                   |              |
    |   (Android creds)     |── verify ─────────|─────────────>|
    |<── 200 verified ──────|                   |              |
    |── POST /enforce ─────>|── push rules ────>|              |
    |                       |── push rules ─────|─────────────>|
    |<── 200 results ───────|                   |              |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/auth/register",
        description: "Maria creates her account",
        requestBody: `{
  "email": "maria@example.com",
  "password": "SecureP@ss123",
  "name": "Maria Garcia"
}`,
        responseBody: `{
  "user": { "id": "usr_abc123", "email": "maria@example.com" },
  "access_token": "eyJhbG...",
  "refresh_token": "rt_xyz..."
}`,
        whatHappens: "Account created with hashed password. JWT issued with 15-minute expiry. Refresh token (SHA-256 hashed) stored in database."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Quick Setup creates family, child, and age-appropriate policy in one call",
        requestBody: `{
  "child_name": "Sofia",
  "child_birth_date": "2019-03-15",
  "protection_level": "recommended"
}`,
        responseBody: `{
  "family": { "id": "fam_def456" },
  "child": { "id": "child_ghi789", "age": 7 },
  "policy": {
    "id": "pol_jkl012",
    "status": "active",
    "rules_count": 22,
    "content_ratings": { "mpaa": "PG", "tv": "TV-Y7", "esrb": "E", "pegi": "7" }
  }
}`,
        whatHappens: "API computes Sofia's age (7), generates 22 rules from the recommended template: PG content ratings, 2hr daily screen time, SafeSearch on, social media blocked, notifications curfewed 8PM-7AM."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Link and verify NextDNS account for home DNS filtering",
        requestBody: `{
  "platform": "nextdns",
  "credentials": { "api_key": "ndns_abc...", "profile_id": "abc123" },
  "child_id": "child_ghi789"
}`,
        responseBody: `{
  "id": "comp_mno345",
  "platform": "nextdns",
  "status": "verified",
  "capabilities": ["web_filter", "safe_search", "dns_block"]
}`,
        whatHappens: "API encrypts the NextDNS API key with AES-256-GCM, calls NextDNS API to verify credentials, and maps platform capabilities to policy rule categories."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Link and verify Android device for app and content controls",
        requestBody: `{
  "platform": "android",
  "credentials": { "device_token": "and_xyz..." },
  "child_id": "child_ghi789"
}`,
        responseBody: `{
  "id": "comp_pqr678",
  "platform": "android",
  "status": "verified",
  "capabilities": ["content_rating", "app_block", "screen_time", "safe_search"]
}`,
        whatHappens: "Android device token verified. Platform registered with broader capabilities than DNS — it can enforce content ratings, app restrictions, and screen time limits."
      },
      {
        number: 5,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push all policy rules to both verified platforms",
        requestBody: `{
  "policy_id": "pol_jkl012",
  "platforms": ["comp_mno345", "comp_pqr678"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 },
    { "platform": "android", "status": "success", "rules_pushed": 18 }
  ]
}`,
        whatHappens: "Each platform receives only the rules it can enforce. NextDNS gets 8 DNS-level rules (web filter, safe search, blocked domains). Android gets 18 rules including content ratings, screen time, and app restrictions."
      }
    ],
    keyTeachingPoint: "Quick Setup reduces 35 categories to a single API call. Each platform only receives the rules it can actually enforce — define once, push everywhere."
  },
  {
    id: "app-integration",
    title: "Third-Party App Integration",
    summary: "DevCo builds 'KidShield' using the GuardianGate API with webhooks",
    icon: "🔌",
    tags: ["Integration", "Webhooks", "OAuth"],
    scenario: "DevCo is building 'KidShield', a parental control app. They need to register as an API consumer, discover available platforms, set up webhook notifications for enforcement events, and execute their first policy enforcement.",
    actors: ["KidShield App", "GuardianGate API", "Webhook Endpoint"],
    flowDiagram: `KidShield App       GuardianGate API       Webhook Endpoint
    |                       |                       |
    |── POST /register ────>|                       |
    |<── 201 token ─────────|                       |
    |── GET /platforms ────>|                       |
    |<── 200 platforms ─────|                       |
    |── POST /webhooks ────>|                       |
    |<── 201 webhook ───────|                       |
    |── POST /setup/quick ─>|                       |
    |<── 201 policy ────────|                       |
    |── POST /enforce ─────>|                       |
    |<── 200 results ───────|                       |
    |                       |── POST event ────────>|
    |                       |   (HMAC-signed)       |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/auth/register",
        description: "Register the KidShield service account",
        requestBody: `{
  "email": "api@kidshield.dev",
  "password": "K1dSh!eld_Api_2024",
  "name": "KidShield Service"
}`,
        responseBody: `{
  "user": { "id": "usr_ks001" },
  "access_token": "eyJhbG..."
}`,
        whatHappens: "Service account created. In production, this would use OAuth client credentials flow, but the API supports direct registration for development."
      },
      {
        number: 2,
        method: "GET",
        endpoint: "/api/v1/platforms",
        description: "Discover which platforms are available and their capabilities",
        responseBody: `{
  "platforms": [
    { "id": "nextdns", "name": "NextDNS", "capabilities": ["web_filter", "safe_search", "dns_block"], "status": "live" },
    { "id": "cleanbrowsing", "name": "CleanBrowsing", "capabilities": ["web_filter", "safe_search"], "status": "live" },
    { "id": "android", "name": "Android", "capabilities": ["content_rating", "app_block", "screen_time"], "status": "live" },
    { "id": "apple_mdm", "name": "Apple MDM", "capabilities": ["content_rating", "app_block"], "status": "manual" },
    { "id": "microsoft", "name": "Microsoft Family", "capabilities": ["content_rating", "screen_time"], "status": "partial" }
  ]
}`,
        whatHappens: "Returns all 5 supported platforms with their capabilities and live/manual/partial status. KidShield uses this to show users which platforms they can connect."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/webhooks",
        description: "Register a webhook to receive enforcement and policy events",
        requestBody: `{
  "url": "https://api.kidshield.dev/webhooks/guardiangate",
  "events": ["enforcement.completed", "enforcement.failed", "policy.updated"],
  "secret": "whsec_kidshield_prod_key"
}`,
        responseBody: `{
  "id": "wh_abc123",
  "url": "https://api.kidshield.dev/webhooks/guardiangate",
  "events": ["enforcement.completed", "enforcement.failed", "policy.updated"],
  "status": "active"
}`,
        whatHappens: "Webhook registered. All future events matching the subscribed types will be POST-ed to the URL with an HMAC-SHA256 signature in the X-Signature header for verification."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Create a family and policy through KidShield's onboarding",
        requestBody: `{
  "child_name": "Alex",
  "child_birth_date": "2012-08-20",
  "protection_level": "strict"
}`,
        responseBody: `{
  "family": { "id": "fam_ks001" },
  "child": { "id": "child_ks001", "age": 13 },
  "policy": { "id": "pol_ks001", "rules_count": 26 }
}`,
        whatHappens: "Strict protection for a 13-year-old generates 26 rules — stricter than recommended. Social media fully restricted, content ratings capped at PG-13, screen time at 1.5 hours."
      },
      {
        number: 5,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push policy to connected platforms",
        requestBody: `{
  "policy_id": "pol_ks001"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 }
  ]
}`,
        whatHappens: "Enforcement runs. After completion, a webhook event is sent to KidShield's endpoint with HMAC signature, allowing the app to update its UI in real-time."
      }
    ],
    keyTeachingPoint: "Third-party apps integrate by discovering platforms, registering webhooks, and using the same Quick Setup API. HMAC-signed webhooks provide real-time event delivery."
  },
  {
    id: "dns-protection",
    title: "DNS-Level Web Protection",
    summary: "Set up home WiFi (NextDNS) and school Chromebook (CleanBrowsing) DNS filtering",
    icon: "🌐",
    tags: ["NextDNS", "CleanBrowsing", "DNS"],
    scenario: "The Chen family wants DNS-level protection on two networks: NextDNS on the home router for all home devices, and CleanBrowsing on their daughter's school Chromebook (the school requires CleanBrowsing). Both should enforce the same policy but through different DNS providers.",
    actors: ["Parent App", "GuardianGate API", "NextDNS", "CleanBrowsing"],
    flowDiagram: `Parent App          GuardianGate API       NextDNS      CleanBrowsing
    |                       |                   |              |
    |── POST /compliance ──>|                   |              |
    |   (NextDNS)           |── verify ────────>|              |
    |<── 200 verified ──────|                   |              |
    |── POST /compliance ──>|                   |              |
    |   (CleanBrowsing)     |── verify ─────────|─────────────>|
    |<── 200 verified ──────|                   |              |
    |── PUT /rules/bulk ───>|                   |              |
    |   (web_filter rules)  |                   |              |
    |<── 200 updated ───────|                   |              |
    |── POST /enforce ─────>|── push DNS ──────>|              |
    |                       |── push DNS ───────|─────────────>|
    |<── 200 results ───────|                   |              |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Verify NextDNS credentials for home network",
        requestBody: `{
  "platform": "nextdns",
  "credentials": { "api_key": "ndns_home...", "profile_id": "home_profile" },
  "child_id": "child_chen01"
}`,
        responseBody: `{
  "id": "comp_ndns01",
  "platform": "nextdns",
  "status": "verified",
  "capabilities": ["web_filter", "safe_search", "dns_block"]
}`,
        whatHappens: "NextDNS API key validated. Profile ID confirmed. Capabilities mapped — NextDNS supports web filtering, safe search enforcement, and custom domain blocking."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Verify CleanBrowsing credentials for school Chromebook",
        requestBody: `{
  "platform": "cleanbrowsing",
  "credentials": { "api_key": "cb_school..." },
  "child_id": "child_chen01"
}`,
        responseBody: `{
  "id": "comp_cb01",
  "platform": "cleanbrowsing",
  "status": "verified",
  "capabilities": ["web_filter", "safe_search"]
}`,
        whatHappens: "CleanBrowsing verified with fewer capabilities than NextDNS — it supports web filtering and safe search but not custom domain blocking."
      },
      {
        number: 3,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_chen01/rules/bulk",
        description: "Update web filtering rules — enable additional blocked categories",
        requestBody: `{
  "rules": [
    { "category": "web_filter", "config": { "blocked_categories": ["adult", "gambling", "malware", "social_media", "gaming"] } },
    { "category": "safe_search", "config": { "enabled": true, "engine": "all" } }
  ]
}`,
        responseBody: `{
  "updated": 2,
  "policy_version": 3
}`,
        whatHappens: "Bulk rule update modifies two categories at once. Policy version incremented to track changes. These rules apply to both DNS platforms on next enforcement."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push updated rules to both DNS providers simultaneously",
        requestBody: `{
  "policy_id": "pol_chen01",
  "platforms": ["comp_ndns01", "comp_cb01"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8, "details": "5 blocked categories + safe_search + 0 custom domains" },
    { "platform": "cleanbrowsing", "status": "success", "rules_pushed": 6, "details": "5 blocked categories + safe_search (no custom domain support)" }
  ]
}`,
        whatHappens: "Same policy, different push counts. NextDNS gets 8 rules (including custom domain blocking capability). CleanBrowsing gets 6 rules (no custom domain support). Each platform receives only what it can enforce."
      }
    ],
    keyTeachingPoint: "Multiple DNS providers can enforce the same policy. The API handles capability differences — CleanBrowsing gets fewer rules than NextDNS because it supports fewer features."
  },
  {
    id: "child-turns-13",
    title: "Child Turns 13",
    summary: "Birthday triggers automatic age re-evaluation and relaxed teen-appropriate rules",
    icon: "🎂",
    tags: ["Age Ratings", "Policy Update", "Lifecycle"],
    scenario: "Emma's 13th birthday is today. Her policy was generated when she was 12 with PG content ratings, 2-hour screen time, and social media blocked. Now that she's a teenager, the API needs to recalculate age-appropriate defaults — PG-13 content, 3-hour screen time, and supervised social media access.",
    actors: ["Parent App", "GuardianGate API", "Platforms"],
    flowDiagram: `Parent App          GuardianGate API            Platforms
    |                       |                           |
    |── GET /children/{id} >|                           |
    |<── 200 (age: 13) ────|                           |
    |── GET /age-ratings ──>|                           |
    |   ?age=13             |                           |
    |<── 200 ratings ───────|                           |
    |── POST /generate ────>|                           |
    |   from-age            |── recalculate rules ──    |
    |<── 200 new policy ────|                           |
    |── PUT /activate ─────>|                           |
    |<── 200 activated ─────|                           |
    |── POST /enforce ─────>|── push updated rules ───>|
    |<── 200 results ───────|                           |`,
    steps: [
      {
        number: 1,
        method: "GET",
        endpoint: "/api/v1/families/fam_001/children/child_emma",
        description: "Check Emma's current age — the API computes it from birth date",
        responseBody: `{
  "id": "child_emma",
  "name": "Emma",
  "birth_date": "2013-02-07",
  "age": 13,
  "active_policy_id": "pol_emma_v1"
}`,
        whatHappens: "Age is computed dynamically from birth_date, not stored. Today being Emma's birthday, the API returns age: 13 instead of yesterday's 12."
      },
      {
        number: 2,
        method: "GET",
        endpoint: "/api/v1/ratings/age-ratings?age=13",
        description: "Look up age-appropriate content ratings for a 13-year-old",
        responseBody: `{
  "age": 13,
  "ratings": {
    "mpaa": "PG-13",
    "tv": "TV-14",
    "esrb": "T",
    "pegi": "12",
    "csm": "13+"
  }
}`,
        whatHappens: "The age-to-rating map returns teen-appropriate ratings. PG-13 movies and T-rated games are now allowed, up from PG and E."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/policies/generate-from-age",
        description: "Generate a new policy based on Emma's current age",
        requestBody: `{
  "child_id": "child_emma",
  "protection_level": "recommended"
}`,
        responseBody: `{
  "policy": {
    "id": "pol_emma_v2",
    "status": "draft",
    "rules_count": 24,
    "changes_from_previous": {
      "relaxed": ["content_rating (PG→PG-13)", "time_daily_limit (2h→3h)", "social_access (blocked→supervised)"],
      "unchanged": 19,
      "tightened": ["targeted_ad_block (now required by COPPA 2.0 for 13-16)"]
    }
  }
}`,
        whatHappens: "New policy generated as a draft. The API shows exactly what changed: 3 rules relaxed for teen appropriateness, 1 rule tightened due to COPPA 2.0 applying to the 13-16 age bracket."
      },
      {
        number: 4,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_emma_v2/activate",
        description: "Parent reviews changes and activates the new policy",
        responseBody: `{
  "id": "pol_emma_v2",
  "status": "active",
  "previous_policy": "pol_emma_v1",
  "previous_status": "archived"
}`,
        whatHappens: "New policy activated, old policy archived (not deleted — full audit trail preserved). The child's active_policy_id pointer is updated."
      },
      {
        number: 5,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push the updated teen-appropriate rules to all connected platforms",
        requestBody: `{
  "policy_id": "pol_emma_v2"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 },
    { "platform": "android", "status": "success", "rules_pushed": 20 }
  ]
}`,
        whatHappens: "All platforms receive updated rules. Android now allows T-rated games and supervised social media. NextDNS unblocks social media domains that were previously filtered."
      }
    ],
    keyTeachingPoint: "Age is computed dynamically, not stored. When a child's age crosses a threshold, generate-from-age recalculates all 35 categories and shows exactly what changed."
  },
  {
    id: "multi-child",
    title: "Multi-Child Family",
    summary: "Two children (ages 5 and 14) with different policies under the same family",
    icon: "👨‍👩‍👧‍👦",
    tags: ["Family", "Multiple Policies", "Age Tiers"],
    scenario: "The Johnsons have two kids: Lily (5) and Marcus (14). They need very different protection levels — Lily needs allowlist-only content access and 1-hour screen time, while Marcus needs teen-appropriate ratings and 3 hours. Both share the same family account and NextDNS profile.",
    actors: ["Parent App", "GuardianGate API", "NextDNS"],
    flowDiagram: `Parent App          GuardianGate API            NextDNS
    |                       |                           |
    |── POST /setup/quick ─>|                           |
    |   (Lily, age 5)       |── generate 20 rules ──   |
    |<── 201 policy_lily ───|                           |
    |── POST /setup/quick ─>|                           |
    |   (Marcus, age 14)    |── generate 24 rules ──   |
    |<── 201 policy_marcus ─|                           |
    |── POST /enforce ─────>|                           |
    |   (policy_lily)       |── push strict DNS ──────>|
    |<── 200 ───────────────|                           |
    |── POST /enforce ─────>|                           |
    |   (policy_marcus)     |── push teen DNS ────────>|
    |<── 200 ───────────────|                           |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Set up Lily (age 5) with recommended protection",
        requestBody: `{
  "child_name": "Lily",
  "child_birth_date": "2021-06-10",
  "protection_level": "strict"
}`,
        responseBody: `{
  "family": { "id": "fam_johnson" },
  "child": { "id": "child_lily", "age": 5 },
  "policy": { "id": "pol_lily", "rules_count": 20 }
}`,
        whatHappens: "Lily gets strict protection for a 5-year-old: G-rated content only, 1-hour screen time, all social media blocked, allowlist mode available. Family created on first call."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Set up Marcus (age 14) with recommended protection under the same family",
        requestBody: `{
  "child_name": "Marcus",
  "child_birth_date": "2012-01-22",
  "protection_level": "recommended",
  "family_id": "fam_johnson"
}`,
        responseBody: `{
  "family": { "id": "fam_johnson" },
  "child": { "id": "child_marcus", "age": 14 },
  "policy": { "id": "pol_marcus", "rules_count": 24 }
}`,
        whatHappens: "Marcus gets recommended teen protection: PG-13 content, 3-hour screen time, supervised social media. Same family — family_id passed to avoid creating a duplicate."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Enforce Lily's strict policy on NextDNS",
        requestBody: `{
  "policy_id": "pol_lily",
  "platforms": ["comp_ndns_lily"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8, "profile": "lily_profile" }
  ]
}`,
        whatHappens: "Lily's NextDNS profile gets the strictest DNS filtering: adult + social + gaming + streaming all blocked. Safe search enforced on all engines."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Enforce Marcus's teen policy on NextDNS",
        requestBody: `{
  "policy_id": "pol_marcus",
  "platforms": ["comp_ndns_marcus"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 6, "profile": "marcus_profile" }
  ]
}`,
        whatHappens: "Marcus's NextDNS profile is more permissive: adult + gambling blocked, but social media and gaming allowed. Different child = different NextDNS profile = different rules."
      }
    ],
    keyTeachingPoint: "Each child gets their own policy under a shared family. The same platform (NextDNS) can enforce different rules per child using separate profiles."
  },
  {
    id: "co-parenting",
    title: "Co-Parenting Setup",
    summary: "Divorced parents share family access with role-based permissions",
    icon: "🤝",
    tags: ["Family Members", "Roles", "Shared Access"],
    scenario: "David and Sarah are divorced and share custody of their son Jake (10). David set up GuardianGate initially. Sarah needs her own account with the ability to view policies and trigger enforcement, but David retains admin control over policy changes.",
    actors: ["David (Admin)", "GuardianGate API", "Sarah (Member)"],
    flowDiagram: `David (Admin)       GuardianGate API        Sarah (Member)
    |                       |                       |
    |── POST /members ─────>|                       |
    |   (invite Sarah)      |── send invite ───────>|
    |<── 201 invite ────────|                       |
    |                       |<── POST /accept ──────|
    |                       |── 200 member added ──>|
    |                       |                       |
    |                       |<── GET /policies ─────|
    |                       |── 200 (read-only) ───>|
    |                       |<── POST /enforce ─────|
    |                       |── 200 results ───────>|`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/families/fam_custody/members",
        description: "David invites Sarah as a family member with 'member' role",
        requestBody: `{
  "email": "sarah@example.com",
  "role": "member",
  "permissions": ["view_policies", "view_reports", "trigger_enforcement"]
}`,
        responseBody: `{
  "invite": {
    "id": "inv_abc123",
    "email": "sarah@example.com",
    "role": "member",
    "status": "pending",
    "expires_at": "2026-02-14T00:00:00Z"
  }
}`,
        whatHappens: "Invitation created with a 7-day expiry. Sarah receives a member role — she can view and enforce but cannot modify policies. Only admin role can change rules."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/invites/inv_abc123/accept",
        description: "Sarah accepts the invitation from her own account",
        responseBody: `{
  "family": { "id": "fam_custody" },
  "member": {
    "user_id": "usr_sarah",
    "role": "member",
    "permissions": ["view_policies", "view_reports", "trigger_enforcement"]
  }
}`,
        whatHappens: "Sarah is now a family member. She sees the same children, policies, and reports as David, but cannot edit policy rules or manage family settings."
      },
      {
        number: 3,
        method: "GET",
        endpoint: "/api/v1/families/fam_custody/policies",
        description: "Sarah views Jake's current policy (read-only)",
        responseBody: `{
  "policies": [{
    "id": "pol_jake",
    "child": { "id": "child_jake", "name": "Jake", "age": 10 },
    "status": "active",
    "rules_count": 22,
    "last_enforced": "2026-02-06T18:00:00Z"
  }]
}`,
        whatHappens: "Sarah can see the full policy details including all rules, but PUT/DELETE operations on rules would return 403 Forbidden for the member role."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Sarah triggers enforcement from her device during her custody time",
        requestBody: `{
  "policy_id": "pol_jake"
}`,
        responseBody: `{
  "results": [
    { "platform": "android", "status": "success", "rules_pushed": 18 }
  ],
  "triggered_by": "usr_sarah"
}`,
        whatHappens: "Sarah can trigger enforcement because she has the trigger_enforcement permission. The audit log records that Sarah (not David) triggered this enforcement."
      }
    ],
    keyTeachingPoint: "Role-based family membership lets co-parents share access. Members can view and enforce but only admins can modify policy rules."
  },
  {
    id: "block-game",
    title: "Blocking a Specific Game",
    summary: "Parent sees Fortnite usage and blocks it across both DNS and Android",
    icon: "🎮",
    tags: ["Game Block", "NextDNS", "Android"],
    scenario: "Dad notices his 9-year-old son is spending hours on Fortnite, which is rated T (Teen) by ESRB — above the E (Everyone) limit in the child's policy. The content rating rule should have caught this but Epic Games' launcher domain wasn't in the filter list. Dad needs to explicitly block Fortnite at both the DNS level and the Android app level.",
    actors: ["Parent App", "GuardianGate API", "NextDNS", "Android"],
    flowDiagram: `Parent App          GuardianGate API       NextDNS        Android
    |                       |                   |              |
    |── GET /reports ──────>|                   |              |
    |<── 200 usage data ────|                   |              |
    |── PUT /rules/{id} ───>|                   |              |
    |   (web_custom_block)  |                   |              |
    |<── 200 updated ───────|                   |              |
    |── PUT /rules/{id} ───>|                   |              |
    |   (app_block)         |                   |              |
    |<── 200 updated ───────|                   |              |
    |── POST /enforce ─────>|── block domain ──>|              |
    |                       |── block app ──────|─────────────>|
    |<── 200 results ───────|                   |              |`,
    steps: [
      {
        number: 1,
        method: "GET",
        endpoint: "/api/v1/reports?child_id=child_son01&period=7d",
        description: "Check recent activity reports to see Fortnite usage",
        responseBody: `{
  "usage": [
    { "app": "Fortnite", "package": "com.epicgames.fortnite", "daily_avg_minutes": 142, "rating": "T (Teen)" },
    { "app": "YouTube", "daily_avg_minutes": 45, "rating": "T (Teen)" }
  ],
  "alerts": [
    { "type": "rating_violation", "app": "Fortnite", "expected_max": "E", "actual": "T" }
  ]
}`,
        whatHappens: "Reports show Fortnite averaging 2+ hours/day with a rating violation alert. The T rating exceeds the child's E (Everyone) maximum."
      },
      {
        number: 2,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_son/rules/rule_web_block",
        description: "Add Fortnite domains to the custom web blocklist",
        requestBody: `{
  "category": "web_custom_block",
  "config": {
    "domains": ["epicgames.com", "fortnite.com", "unrealengine.com"]
  }
}`,
        responseBody: `{
  "id": "rule_web_block",
  "category": "web_custom_block",
  "config": { "domains": ["epicgames.com", "fortnite.com", "unrealengine.com"] },
  "updated_at": "2026-02-07T10:30:00Z"
}`,
        whatHappens: "Three domains added to the custom blocklist. This will be enforced at the DNS level — any device using the child's NextDNS profile will be unable to resolve these domains."
      },
      {
        number: 3,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_son/rules/rule_app_block",
        description: "Block the Fortnite app by package name on Android",
        requestBody: `{
  "category": "app_block",
  "config": {
    "packages": ["com.epicgames.fortnite", "com.epicgames.launcher"]
  }
}`,
        responseBody: `{
  "id": "rule_app_block",
  "category": "app_block",
  "config": { "packages": ["com.epicgames.fortnite", "com.epicgames.launcher"] },
  "updated_at": "2026-02-07T10:31:00Z"
}`,
        whatHappens: "App blocked by Android package name. Both the game and the Epic Games launcher are blocked, preventing reinstallation through the launcher."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push both blocking rules to NextDNS and Android",
        requestBody: `{
  "policy_id": "pol_son",
  "platforms": ["comp_ndns_son", "comp_android_son"]
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 9, "details": "+3 blocked domains" },
    { "platform": "android", "status": "success", "rules_pushed": 19, "details": "+2 blocked packages" }
  ]
}`,
        whatHappens: "DNS-level block prevents Fortnite web access on any device. Android app block prevents launch on the tablet. Two-layer protection — even if the child uses a different network, the app itself won't launch."
      }
    ],
    keyTeachingPoint: "Defense in depth: block both the DNS domain and the app package. DNS blocking covers all devices on the network, app blocking covers the specific device even on other networks."
  },
  {
    id: "apple-manual",
    title: "Apple Device (Manual Flow)",
    summary: "Set up iPad protection via MDM profile — Apple requires manual steps",
    icon: "🍎",
    tags: ["Apple MDM", "Manual", "Guided Steps"],
    scenario: "Mom wants to protect her daughter's iPad. Unlike NextDNS and Android which have push APIs, Apple's MDM requires manual installation of a configuration profile. The GuardianGate API generates the profile and provides step-by-step instructions for the parent.",
    actors: ["Parent App", "GuardianGate API", "Apple MDM"],
    flowDiagram: `Parent App          GuardianGate API         Apple iPad
    |                       |                        |
    |── POST /compliance ──>|                        |
    |   (apple_mdm)         |                        |
    |<── 200 status:manual ─|                        |
    |── POST /enforce ─────>|                        |
    |   (apple_mdm)         |── generate profile ──  |
    |<── 200 manual_steps ──|                        |
    |                       |                        |
    |   [Parent follows steps on iPad]               |
    |                       |                        |
    |── GET /results ──────>|                        |
    |<── 200 pending_manual─|                        |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Register the Apple device — returns 'manual' status instead of 'verified'",
        requestBody: `{
  "platform": "apple_mdm",
  "credentials": { "device_name": "Sofia's iPad", "apple_id_hint": "sofia@icloud.com" },
  "child_id": "child_sofia"
}`,
        responseBody: `{
  "id": "comp_apple01",
  "platform": "apple_mdm",
  "status": "manual",
  "capabilities": ["content_rating", "app_block", "screen_time", "web_filter"],
  "note": "Apple MDM requires manual profile installation"
}`,
        whatHappens: "Unlike NextDNS which returns 'verified', Apple returns 'manual' status. The API can't auto-verify Apple devices — parent must install a configuration profile on the device."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Request enforcement — API generates an MDM profile and manual steps",
        requestBody: `{
  "policy_id": "pol_sofia",
  "platforms": ["comp_apple01"]
}`,
        responseBody: `{
  "results": [{
    "platform": "apple_mdm",
    "status": "manual_steps",
    "profile_url": "https://api.guardiangate.dev/profiles/mdm_abc123.mobileconfig",
    "manual_steps": [
      "1. On the iPad, open Safari and go to the profile URL",
      "2. Tap 'Allow' when prompted to download the configuration profile",
      "3. Open Settings → General → VPN & Device Management",
      "4. Tap the GuardianGate profile and tap 'Install'",
      "5. Enter the iPad passcode when prompted",
      "6. Tap 'Install' again to confirm"
    ],
    "expires_at": "2026-02-07T11:00:00Z"
  }]
}`,
        whatHappens: "API generates an MDM .mobileconfig file with all policy rules embedded. The profile URL is time-limited (30 minutes). Manual steps guide the parent through installation."
      },
      {
        number: 3,
        method: "GET",
        endpoint: "/api/v1/enforce/results?compliance_id=comp_apple01",
        description: "Check if the manual installation was completed",
        responseBody: `{
  "compliance_id": "comp_apple01",
  "platform": "apple_mdm",
  "enforcement_status": "pending_manual",
  "profile_installed": false,
  "last_checked": "2026-02-07T10:35:00Z",
  "instructions": "Awaiting manual profile installation on device"
}`,
        whatHappens: "The API can't confirm installation until the device checks in. Status remains 'pending_manual' until the MDM profile phones home, at which point it changes to 'enforced'."
      }
    ],
    keyTeachingPoint: "Not all platforms support push-based enforcement. Apple MDM uses a 'manual_steps' flow where the API generates instructions and a configuration profile for the parent to install."
  },
  {
    id: "re-verification",
    title: "Platform Re-Verification",
    summary: "NextDNS API key was rotated — fix the failed enforcement and re-verify",
    icon: "🔑",
    tags: ["Re-Verify", "Error Recovery", "NextDNS"],
    scenario: "Enforcement failed because the parent rotated their NextDNS API key without updating GuardianGate. The stored (encrypted) key no longer works. The parent needs to see the failure, provide the new key, and re-verify the platform connection.",
    actors: ["Parent App", "GuardianGate API", "NextDNS"],
    flowDiagram: `Parent App          GuardianGate API            NextDNS
    |                       |                           |
    |── POST /enforce ─────>|── push rules ────────────>|
    |                       |<── 401 unauthorized ──────|
    |<── 200 (failed) ──────|                           |
    |── GET /results ──────>|                           |
    |<── 200 auth_failed ───|                           |
    |── POST /verify ──────>|                           |
    |   (new API key)       |── verify new key ────────>|
    |                       |<── 200 ok ────────────────|
    |<── 200 re-verified ───|                           |
    |── POST /enforce ─────>|── push rules ────────────>|
    |                       |<── 200 ok ────────────────|
    |<── 200 success ───────|                           |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Attempt enforcement — it fails because the API key was rotated",
        requestBody: `{
  "policy_id": "pol_family01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "failed", "error": "authentication_failed", "message": "NextDNS returned 401: Invalid API key" }
  ]
}`,
        whatHappens: "Enforcement attempted but NextDNS rejected the stored API key. The result includes the specific error so the parent knows exactly what went wrong."
      },
      {
        number: 2,
        method: "GET",
        endpoint: "/api/v1/enforce/results?compliance_id=comp_ndns01",
        description: "Get detailed enforcement results and failure history",
        responseBody: `{
  "compliance_id": "comp_ndns01",
  "platform": "nextdns",
  "status": "auth_failed",
  "last_success": "2026-02-05T18:00:00Z",
  "last_failure": "2026-02-07T09:00:00Z",
  "failure_count": 3,
  "action_required": "Re-verify platform credentials"
}`,
        whatHappens: "Detailed status shows the platform has been failing for 2 days with 3 consecutive failures. The action_required field tells the parent exactly what to do."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/compliance/comp_ndns01/verify",
        description: "Re-verify with the new NextDNS API key",
        requestBody: `{
  "credentials": { "api_key": "ndns_NEW_rotated_key...", "profile_id": "abc123" }
}`,
        responseBody: `{
  "id": "comp_ndns01",
  "platform": "nextdns",
  "status": "verified",
  "previous_status": "auth_failed",
  "verified_at": "2026-02-07T09:15:00Z"
}`,
        whatHappens: "New API key encrypted with AES-256-GCM and stored. Old key overwritten. NextDNS API called to verify the new credentials work. Status changes from auth_failed back to verified."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Retry enforcement with the new verified credentials",
        requestBody: `{
  "policy_id": "pol_family01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 }
  ]
}`,
        whatHappens: "Enforcement succeeds with the new credentials. All 8 DNS rules pushed to NextDNS. The failure counter resets to zero."
      }
    ],
    keyTeachingPoint: "When platform credentials change, enforcement fails gracefully with a clear error. Re-verify the credentials, then retry enforcement — the API handles the key rotation transparently."
  },
  {
    id: "webhook-dashboard",
    title: "Webhook-Driven Dashboard",
    summary: "Build a real-time dashboard using HMAC-signed webhook events",
    icon: "📊",
    tags: ["Webhooks", "HMAC", "Real-Time"],
    scenario: "A developer is building a real-time parental controls dashboard. Instead of polling the API, they register a webhook endpoint to receive events as they happen — enforcement completions, policy changes, and failures. Each event is HMAC-signed for verification.",
    actors: ["Dashboard", "GuardianGate API", "Webhook Server"],
    flowDiagram: `Dashboard App       GuardianGate API       Webhook Server
    |                       |                       |
    |── POST /webhooks ────>|                       |
    |<── 201 webhook ───────|                       |
    |── POST /test ────────>|                       |
    |                       |── POST test event ───>|
    |                       |   (HMAC-signed)       |
    |<── 200 test ok ───────|<── 200 ──────────────|
    |                       |                       |
    |── POST /enforce ─────>|                       |
    |<── 200 ───────────────|                       |
    |                       |── POST event ────────>|
    |                       |   enforcement.done    |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/webhooks",
        description: "Register a webhook endpoint for enforcement and policy events",
        requestBody: `{
  "url": "https://dashboard.example.com/hooks/gg",
  "events": ["enforcement.completed", "enforcement.failed", "policy.updated", "policy.activated"],
  "secret": "whsec_dashboard_secret_key_2024"
}`,
        responseBody: `{
  "id": "wh_dash01",
  "url": "https://dashboard.example.com/hooks/gg",
  "events": ["enforcement.completed", "enforcement.failed", "policy.updated", "policy.activated"],
  "status": "active",
  "created_at": "2026-02-07T10:00:00Z"
}`,
        whatHappens: "Webhook registered with 4 event types. The secret is used to generate HMAC-SHA256 signatures for each delivery, allowing the receiver to verify authenticity."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/webhooks/wh_dash01/test",
        description: "Send a test event to verify the endpoint works",
        responseBody: `{
  "test_delivery": {
    "id": "del_test01",
    "event": "test.ping",
    "status": "delivered",
    "response_code": 200,
    "response_time_ms": 145,
    "signature": "sha256=abc123..."
  }
}`,
        whatHappens: "A test ping is sent to the webhook URL. The API confirms delivery, response code, and latency. If the endpoint returns non-2xx, the test fails and the developer knows to fix their server."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Trigger an enforcement — webhook fires automatically after completion",
        requestBody: `{
  "policy_id": "pol_dash01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 }
  ]
}`,
        whatHappens: "Enforcement completes. The API automatically sends an enforcement.completed event to all registered webhooks. The dashboard receives it in real-time and updates its UI."
      },
      {
        number: 4,
        method: "GET",
        endpoint: "/api/v1/webhooks/wh_dash01/deliveries",
        description: "Check webhook delivery history for debugging",
        responseBody: `{
  "deliveries": [
    { "id": "del_001", "event": "enforcement.completed", "status": "delivered", "response_code": 200, "timestamp": "2026-02-07T10:05:00Z" },
    { "id": "del_test01", "event": "test.ping", "status": "delivered", "response_code": 200, "timestamp": "2026-02-07T10:01:00Z" }
  ]
}`,
        whatHappens: "Delivery log shows all webhook events sent, their status, and response codes. Failed deliveries are retried with exponential backoff (1min, 5min, 30min)."
      }
    ],
    keyTeachingPoint: "Webhooks eliminate polling. Register once, receive HMAC-signed events in real-time. Use the test endpoint to verify setup, and the deliveries endpoint to debug issues."
  },
  {
    id: "emergency-pause",
    title: "Emergency Policy Pause",
    summary: "Temporarily pause all restrictions and re-enable them later",
    icon: "⏸️",
    tags: ["Pause", "Emergency", "Lifecycle"],
    scenario: "Mom is at a doctor's appointment and needs her 8-year-old to access a video call app that's normally blocked. She pauses the policy temporarily to remove all restrictions, then re-activates it when she's done.",
    actors: ["Parent App", "GuardianGate API", "Platforms"],
    flowDiagram: `Parent App          GuardianGate API            Platforms
    |                       |                           |
    |── PUT /pause ────────>|                           |
    |<── 200 paused ────────|                           |
    |── POST /enforce ─────>|── remove restrictions ──>|
    |<── 200 cleared ───────|                           |
    |                       |                           |
    |   [... appointment time passes ...]               |
    |                       |                           |
    |── PUT /activate ─────>|                           |
    |<── 200 active ────────|                           |
    |── POST /enforce ─────>|── restore restrictions ─>|
    |<── 200 enforced ──────|                           |`,
    steps: [
      {
        number: 1,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_child01/pause",
        description: "Pause the policy — marks it as inactive without deleting any rules",
        requestBody: `{
  "reason": "Doctor appointment - need video call access",
  "auto_resume_minutes": 60
}`,
        responseBody: `{
  "id": "pol_child01",
  "status": "paused",
  "paused_at": "2026-02-07T14:00:00Z",
  "auto_resume_at": "2026-02-07T15:00:00Z",
  "paused_by": "usr_mom",
  "reason": "Doctor appointment - need video call access"
}`,
        whatHappens: "Policy status changed to 'paused'. All rules preserved but marked as not-enforceable. Optional auto-resume timer set for 60 minutes as a safety net."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Enforce the paused state — removes active restrictions from platforms",
        requestBody: `{
  "policy_id": "pol_child01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 0, "details": "Policy paused: all restrictions removed" },
    { "platform": "android", "status": "success", "rules_pushed": 0, "details": "Policy paused: all restrictions removed" }
  ]
}`,
        whatHappens: "With the policy paused, enforcement pushes zero rules — effectively removing all restrictions. The child now has unrestricted access on all platforms."
      },
      {
        number: 3,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_child01/activate",
        description: "Re-activate the policy to restore all protections",
        responseBody: `{
  "id": "pol_child01",
  "status": "active",
  "activated_at": "2026-02-07T14:45:00Z",
  "was_paused_for_minutes": 45,
  "rules_count": 22
}`,
        whatHappens: "Policy reactivated. All 22 rules are now enforceable again. Auto-resume timer cancelled since the parent manually resumed. Duration logged for audit trail."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push all restrictions back to platforms",
        requestBody: `{
  "policy_id": "pol_child01"
}`,
        responseBody: `{
  "results": [
    { "platform": "nextdns", "status": "success", "rules_pushed": 8 },
    { "platform": "android", "status": "success", "rules_pushed": 18 }
  ]
}`,
        whatHappens: "Full enforcement restored. All DNS filters and Android restrictions back in place. If the parent had forgotten, auto-resume would have triggered at the 60-minute mark."
      }
    ],
    keyTeachingPoint: "Pause/activate is non-destructive — rules are preserved, just not enforced. The optional auto_resume_minutes timer provides a safety net so restrictions are automatically restored."
  },
  {
    id: "custom-blocklist",
    title: "Custom Web Blocklist",
    summary: "Block reddit.com and 4chan.org across both DNS providers",
    icon: "🚫",
    tags: ["Custom Domains", "NextDNS", "CleanBrowsing"],
    scenario: "A parent discovers their 11-year-old has been accessing Reddit and 4chan, which aren't caught by the standard web filter categories. They need to add these specific domains to a custom blocklist and push the blocks to both NextDNS (home) and CleanBrowsing (school Chromebook).",
    actors: ["Parent App", "GuardianGate API", "NextDNS", "CleanBrowsing"],
    flowDiagram: `Parent App          GuardianGate API       NextDNS      CleanBrowsing
    |                       |                   |              |
    |── PUT /rules/{id} ───>|                   |              |
    |   (custom domains)    |                   |              |
    |<── 200 updated ───────|                   |              |
    |── POST /enforce ─────>|── block domains ─>|              |
    |                       |── block domains ──|─────────────>|
    |<── 200 results ───────|                   |              |`,
    steps: [
      {
        number: 1,
        method: "PUT",
        endpoint: "/api/v1/policies/pol_child11/rules/rule_custom_block",
        description: "Add reddit.com and 4chan.org to the custom web blocklist",
        requestBody: `{
  "category": "web_custom_block",
  "config": {
    "domains": ["reddit.com", "4chan.org", "old.reddit.com", "i.reddit.com"]
  }
}`,
        responseBody: `{
  "id": "rule_custom_block",
  "category": "web_custom_block",
  "config": {
    "domains": ["reddit.com", "4chan.org", "old.reddit.com", "i.reddit.com"]
  },
  "domain_count": 4,
  "updated_at": "2026-02-07T11:00:00Z"
}`,
        whatHappens: "Four domains added to custom blocklist. Subdomains (old.reddit.com, i.reddit.com) need to be listed explicitly since DNS blocking is exact-match unless the platform supports wildcard."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Push the custom blocklist to both DNS providers",
        requestBody: `{
  "policy_id": "pol_child11",
  "platforms": ["comp_ndns_home", "comp_cb_school"]
}`,
        responseBody: `{
  "results": [
    {
      "platform": "nextdns",
      "status": "success",
      "rules_pushed": 9,
      "details": "+4 custom blocked domains (wildcards supported)"
    },
    {
      "platform": "cleanbrowsing",
      "status": "success",
      "rules_pushed": 7,
      "details": "+4 custom blocked domains (exact match only)"
    }
  ]
}`,
        whatHappens: "Both DNS providers receive the domain blocklist. NextDNS supports wildcard blocking (*.reddit.com), so all subdomains are covered. CleanBrowsing uses exact-match only, so only the 4 listed domains are blocked."
      }
    ],
    keyTeachingPoint: "Custom domain blocking supplements category-based filtering. Different DNS providers may handle wildcards differently — NextDNS blocks all subdomains, CleanBrowsing blocks exact matches only."
  },
  {
    id: "school-district",
    title: "School District Bulk Setup",
    summary: "IT admin onboards 200 students via scripted API calls to CleanBrowsing",
    icon: "🏫",
    tags: ["Bulk", "Script", "CleanBrowsing", "Enterprise"],
    scenario: "Lincoln Middle School's IT administrator needs to onboard 200 students at once. They'll use a script to call the API in a loop: register a service account, run Quick Setup for each student from a CSV, verify CleanBrowsing for the school network, and enforce a uniform policy across all students.",
    actors: ["IT Script", "GuardianGate API", "CleanBrowsing"],
    flowDiagram: `IT Script           GuardianGate API          CleanBrowsing
    |                       |                          |
    |── POST /register ────>|                          |
    |<── 201 token ─────────|                          |
    |                       |                          |
    |── POST /setup/quick ─>| (×200, from CSV)         |
    |   student_1           |                          |
    |── POST /setup/quick ─>|                          |
    |   student_2           |                          |
    |   ...                 |                          |
    |── POST /setup/quick ─>|                          |
    |   student_200         |                          |
    |                       |                          |
    |── POST /compliance ──>| (×200)                   |
    |   (CleanBrowsing)     |── verify ───────────────>|
    |                       |                          |
    |── POST /enforce ─────>| (×200)                   |
    |                       |── push rules ───────────>|
    |<── 200 results ───────|                          |`,
    steps: [
      {
        number: 1,
        method: "POST",
        endpoint: "/api/v1/auth/register",
        description: "Register the school's IT service account",
        requestBody: `{
  "email": "it-admin@lincoln.edu",
  "password": "L1ncoln_IT_2024!",
  "name": "Lincoln MS IT Admin"
}`,
        responseBody: `{
  "user": { "id": "usr_lincoln_it" },
  "access_token": "eyJhbG..."
}`,
        whatHappens: "Service account created for the school. This account will own all 200 student families. In production, schools would have a dedicated 'organization' tier with bulk rate limits."
      },
      {
        number: 2,
        method: "POST",
        endpoint: "/api/v1/setup/quick",
        description: "Run Quick Setup for each student (called 200 times from CSV loop)",
        requestBody: `{
  "child_name": "Student, Jane",
  "child_birth_date": "2014-05-12",
  "protection_level": "strict",
  "family_id": "fam_lincoln_ms"
}`,
        responseBody: `{
  "family": { "id": "fam_lincoln_ms" },
  "child": { "id": "child_jane_doe", "age": 11 },
  "policy": { "id": "pol_jane_doe", "rules_count": 24 }
}`,
        whatHappens: "Each student gets their own child profile and policy under the school family. All use 'strict' protection. The script loops through a CSV calling this endpoint 200 times with a 100ms delay between calls."
      },
      {
        number: 3,
        method: "POST",
        endpoint: "/api/v1/compliance",
        description: "Verify CleanBrowsing for each student's Chromebook (200 times)",
        requestBody: `{
  "platform": "cleanbrowsing",
  "credentials": { "api_key": "cb_lincoln_ms..." },
  "child_id": "child_jane_doe"
}`,
        responseBody: `{
  "id": "comp_cb_jane",
  "platform": "cleanbrowsing",
  "status": "verified"
}`,
        whatHappens: "Each student's Chromebook is linked to the school's CleanBrowsing account. The same API key is used for all students but each gets a unique compliance record for tracking."
      },
      {
        number: 4,
        method: "POST",
        endpoint: "/api/v1/enforce",
        description: "Enforce policies in batch — called for each student's policy",
        requestBody: `{
  "policy_id": "pol_jane_doe"
}`,
        responseBody: `{
  "results": [
    { "platform": "cleanbrowsing", "status": "success", "rules_pushed": 6 }
  ]
}`,
        whatHappens: "Each student's policy is enforced individually on CleanBrowsing. The script collects all results and generates a summary report: 198 succeeded, 2 failed (invalid student birth dates in CSV)."
      }
    ],
    keyTeachingPoint: "The same API works for both individual parents and school districts. Bulk onboarding is just a loop over Quick Setup + Compliance + Enforce. Use CSV exports and scripting for scale."
  },
]

function Keyword({ children }: { children: string }) {
  return <strong className="text-primary font-bold">{children}</strong>
}

function SupportBadge({ support }: { support: PlatformSupport }) {
  if (support === "full") return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Full</span>
  if (support === "partial") return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Partial</span>
  return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20">None</span>
}

function PlatformSupportIcon({ support }: { support: PlatformSupport }) {
  if (support === "full") return <span className="text-emerald-500" title="Full support">&#10003;</span>
  if (support === "partial") return <span className="text-amber-500" title="Partial support">&#9681;</span>
  return <span className="text-zinc-400" title="No support">&mdash;</span>
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("preamble")
  const [docsTab, setDocsTab] = useState<"specification" | "recipes">("specification")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState("")
  const [expandedLegislation, setExpandedLegislation] = useState<Set<string>>(new Set())
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set())

  const toggleRecipe = (id: string) => {
    setExpandedRecipes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const expandAllRecipes = () => setExpandedRecipes(new Set(RECIPES.map(r => r.id)))
  const collapseAllRecipes = () => setExpandedRecipes(new Set())

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const expandAll = () => setExpandedCategories(new Set(CATEGORY_REFERENCE.map(c => c.id)))
  const collapseAll = () => setExpandedCategories(new Set())

  const toggleLegislation = (id: string) => {
    setExpandedLegislation(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredReference = categoryFilter
    ? CATEGORY_REFERENCE.filter(c =>
        c.id.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        c.name.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        c.description.toLowerCase().includes(categoryFilter.toLowerCase())
      )
    : CATEGORY_REFERENCE

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">GCSS v1.0</h1>
            <p className="text-sm text-muted-foreground mt-1">
              The GuardianGate Child Safety Standard
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/dashboard" className="text-sm gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="relative flex border-b border-border">
          {(["specification", "recipes"] as const).map(t => (
            <button key={t} onClick={() => setDocsTab(t)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                docsTab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t === "specification" ? "Specification" : "Recipes"}
            </button>
          ))}
          <motion.div
            className="absolute bottom-0 h-0.5 bg-primary rounded-full"
            layoutId="docs-tab-indicator"
            animate={{
              left: docsTab === "specification" ? "0%" : "50%",
              width: "50%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={docsTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="max-w-7xl mx-auto px-6 py-8 flex gap-8"
        >
        {docsTab === "specification" ? (
          <>
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Specification</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setActiveSection(section.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {section.title}
              </a>
            ))}
            <div className="border-t border-border my-4" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reference</p>
            <a href="#rule-categories" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              35 Policy Categories
            </a>
            {CATEGORY_GROUPS.map(g => (
              <a key={g.key} href={`#cat-group-${g.key}`} className="block pl-6 pr-3 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                {g.label} ({g.categories.length})
              </a>
            ))}
            <a href="#platform-support" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              Platform Support Matrix
            </a>
            <a href="#age-ratings" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              Age-Rating Map
            </a>
            <a href="#age-defaults" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              Age-Based Defaults
            </a>
            <a href="#api-base" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              API Base URL
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-12">
          {/* Preamble */}
          <section id="preamble">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">GuardianGate Child Safety Standard (GCSS) v1.0</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                This document defines the <strong className="text-foreground">GuardianGate Child Safety Standard (GCSS)</strong>, a mandatory regulatory framework
                for technology platforms that serve minors. All regulated platforms <Keyword>MUST</Keyword> implement this standard
                to achieve and maintain compliance certification.
              </p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                GCSS establishes a universal policy framework spanning 35 safety categories across 11 domains: Content, Time, Purchase,
                Social, Web, Privacy, Monitoring, Algorithmic Safety, Notifications, Advertising &amp; Data, and Access Control.
                Platforms <Keyword>SHALL</Keyword> expose compliance endpoints that accept policy
                enforcement requests from the GuardianGate Enforcement Engine.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This standard is administered by GuardianGate in coordination with government child safety authorities.
                Non-compliance may result in regulatory action as defined in Section 10.
              </p>
              <div className="mt-6 flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">35</p>
                  <p className="text-xs text-muted-foreground">Policy Categories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">5</p>
                  <p className="text-xs text-muted-foreground">Rating Systems</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">15</p>
                  <p className="text-xs text-muted-foreground">Regulated Platforms</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">3</p>
                  <p className="text-xs text-muted-foreground">Compliance Levels</p>
                </div>
              </div>
            </div>
          </section>

          {/* RFC 2119 */}
          <section id="rfc2119">
            <h2 className="text-xl font-bold text-foreground mb-4">RFC 2119 Keywords</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <p className="text-sm text-muted-foreground mb-4">
                The key words &quot;MUST&quot;, &quot;MUST NOT&quot;, &quot;REQUIRED&quot;, &quot;SHALL&quot;, &quot;SHALL NOT&quot;, &quot;SHOULD&quot;,
                &quot;SHOULD NOT&quot;, &quot;RECOMMENDED&quot;, &quot;MAY&quot;, and &quot;OPTIONAL&quot; in this document are to be
                interpreted as described in <a href="https://www.rfc-editor.org/rfc/rfc2119" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">RFC 2119</a>.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 p-3 rounded-lg"><Keyword>MUST</Keyword> / <Keyword>REQUIRED</Keyword> / <Keyword>SHALL</Keyword> — Absolute requirement</div>
                <div className="bg-muted/50 p-3 rounded-lg"><Keyword>SHOULD</Keyword> / <Keyword>RECOMMENDED</Keyword> — Strong recommendation, may be deviated from with justification</div>
                <div className="bg-muted/50 p-3 rounded-lg"><Keyword>MAY</Keyword> / <Keyword>OPTIONAL</Keyword> — Truly optional behavior</div>
                <div className="bg-muted/50 p-3 rounded-lg"><Keyword>MUST NOT</Keyword> / <Keyword>SHALL NOT</Keyword> — Absolute prohibition</div>
              </div>
            </div>
          </section>

          {/* Section 1: Platform Authentication */}
          <section id="auth">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Platform Authentication</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                All regulated platforms <Keyword>MUST</Keyword> authenticate using JWT bearer tokens. The authentication system
                implements refresh token rotation with SHA-256 hashing for security.
              </p>
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Access Token</h4>
                  <p className="text-xs text-muted-foreground">Platforms <Keyword>MUST</Keyword> include a valid JWT in the Authorization header. Tokens expire after 15 minutes.</p>
                  <pre className="bg-zinc-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto mt-2">{`Authorization: Bearer <access_token>`}</pre>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Token Rotation</h4>
                  <p className="text-xs text-muted-foreground">Platforms <Keyword>MUST</Keyword> implement token rotation. Each refresh request returns a new token pair and revokes the previous refresh token. Platforms <Keyword>MUST NOT</Keyword> reuse expired refresh tokens.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Endpoints</h4>
                  <div className="space-y-1 text-xs font-mono">
                    <p><span className="text-emerald-400">POST</span> /auth/register — Register compliance administrator</p>
                    <p><span className="text-emerald-400">POST</span> /auth/login — Authenticate</p>
                    <p><span className="text-emerald-400">POST</span> /auth/refresh — Rotate token pair</p>
                    <p><span className="text-emerald-400">POST</span> /auth/logout — Revoke all tokens</p>
                    <p><span className="text-blue-400">GET</span> /auth/me — Current administrator profile</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Protected Families */}
          <section id="families">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Protected Families</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                The family data model <Keyword>SHALL</Keyword> support multiple guardians per family unit with role-based access control.
                Child profiles <Keyword>MUST</Keyword> include birth date for age-based policy computation.
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-1">Owner</h4>
                  <p className="text-xs text-muted-foreground">Full administrative control. <Keyword>MAY</Keyword> delete the family unit.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-1">Parent</h4>
                  <p className="text-xs text-muted-foreground"><Keyword>MAY</Keyword> manage children, policies, and compliance links.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-1">Guardian</h4>
                  <p className="text-xs text-muted-foreground">Read-only access. <Keyword>MUST NOT</Keyword> modify policies or compliance links.</p>
                </div>
              </div>
              <div className="text-xs font-mono space-y-1 text-muted-foreground">
                <p><span className="text-blue-400">GET</span> /families — List protected families</p>
                <p><span className="text-emerald-400">POST</span> /families — Register protected family</p>
                <p><span className="text-blue-400">GET</span> /families/{'{'}familyID{'}'}/children — List protected children</p>
                <p><span className="text-emerald-400">POST</span> /families/{'{'}familyID{'}'}/children — Register protected child</p>
                <p><span className="text-blue-400">GET</span> /children/{'{'}childID{'}'}/age-ratings — Compute age-appropriate ratings</p>
              </div>
            </div>
          </section>

          {/* Section 3: Safety Policies */}
          <section id="policies">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Safety Policies</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Safety policies define protection rules for each child. Each policy contains rules across 35 categories spanning 11 domains.
                Platforms <Keyword>MUST</Keyword> implement enforcement for all categories they claim capability in.
                Rules are stored as JSONB with category-specific schemas.
              </p>
              <p className="text-sm text-muted-foreground">
                Policies transition through states: <code className="bg-muted px-1 rounded text-xs text-foreground">draft</code> →
                <code className="bg-muted px-1 rounded text-xs text-foreground">active</code> →
                <code className="bg-muted px-1 rounded text-xs text-foreground">paused</code>.
                Only <code className="bg-muted px-1 rounded text-xs text-foreground">active</code> policies <Keyword>SHALL</Keyword> be enforced on platforms.
              </p>
              <div className="text-xs font-mono space-y-1 text-muted-foreground">
                <p><span className="text-emerald-400">POST</span> /children/{'{'}childID{'}'}/policies — Create safety policy</p>
                <p><span className="text-emerald-400">POST</span> /policies/{'{'}policyID{'}'}/activate — Activate for enforcement</p>
                <p><span className="text-emerald-400">POST</span> /policies/{'{'}policyID{'}'}/generate-from-age — Auto-generate age-appropriate rules</p>
                <p><span className="text-amber-400">PUT</span> /policies/{'{'}policyID{'}'}/rules/bulk — Bulk upsert rules (35 categories)</p>
              </div>
            </div>
          </section>

          {/* Section 3.1: 35 Mandatory Policy Categories */}
          <section id="policy-categories">
            <h2 className="text-xl font-bold text-foreground mb-4">3.1 35 Mandatory Policy Categories</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                GCSS v1.0 defines 35 policy categories across 11 domains. The 9 new legislation-driven categories
                are backed by specific child safety laws and <Keyword>MUST</Keyword> be enforced by all compliant platforms.
              </p>
              <div className="space-y-3">
                {NEW_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <code className="text-sm font-mono text-primary font-medium">{cat.name}</code>
                        <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 flex-shrink-0">
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
              <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  See the <a href="#rule-categories" className="text-primary font-medium hover:underline">complete API reference below</a> for full JSON schemas, field constraints, age-based defaults, platform support, and code examples for all 35 categories.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Regulated Platforms */}
          <section id="platforms">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Regulated Platforms</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                All technology platforms serving minors <Keyword>SHALL</Keyword> register with the GuardianGate platform registry.
                Each platform declares its category, compliance level, supported capabilities, and authentication mechanism.
              </p>
              <div className="text-xs font-mono space-y-1 text-muted-foreground mb-4">
                <p><span className="text-blue-400">GET</span> /platforms — List all regulated platforms</p>
                <p><span className="text-blue-400">GET</span> /platforms/{'{'}platformID{'}'} — Platform compliance profile</p>
                <p><span className="text-blue-400">GET</span> /platforms/by-category — Filter by category (dns, streaming, gaming, device, browser)</p>
                <p><span className="text-blue-400">GET</span> /platforms/by-capability — Filter by declared capability</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded-lg p-4">
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
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
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
                <div className="bg-muted/50 border border-border rounded-lg p-4">
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
          <section id="compliance">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Compliance Verification</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Platforms <Keyword>MUST</Keyword> establish a compliance link to prove they can receive enforcement instructions.
                Credentials are encrypted with AES-256-GCM at rest. Platforms <Keyword>SHALL</Keyword> support periodic re-verification.
              </p>
              <div className="text-xs font-mono space-y-1 text-muted-foreground">
                <p><span className="text-blue-400">GET</span> /families/{'{'}familyID{'}'}/compliance — List compliance links</p>
                <p><span className="text-emerald-400">POST</span> /compliance — Verify platform compliance (establish link)</p>
                <p><span className="text-red-400">DELETE</span> /compliance/{'{'}linkID{'}'} — Revoke certification</p>
                <p><span className="text-emerald-400">POST</span> /compliance/{'{'}linkID{'}'}/verify — Re-verify compliance link</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground"><strong>Credential Security:</strong> All platform credentials <Keyword>MUST</Keyword> be encrypted using AES-256-GCM before storage. Plaintext credentials <Keyword>MUST NOT</Keyword> be logged or stored unencrypted at any point in the pipeline.</p>
              </div>
              <div className="text-xs font-mono space-y-1 text-muted-foreground">
                <p><span className="text-blue-400">GET</span> /platforms/{'{'}platformID{'}'}/oauth/authorize — OAuth2 authorization URL</p>
                <p><span className="text-blue-400">GET</span> /platforms/{'{'}platformID{'}'}/oauth/callback — OAuth2 token exchange</p>
              </div>
            </div>
          </section>

          {/* Section 5.1: Quick Setup API */}
          <section id="quick-setup">
            <h2 className="text-xl font-bold text-foreground mb-4">5.1 Quick Setup API</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                The Quick Setup API provides a single-call onboarding flow that creates a family (if needed), registers a child,
                generates all 35 age-appropriate policy rules, and activates the policy. This endpoint <Keyword>SHOULD</Keyword> be
                the primary entry point for parent-facing applications.
              </p>
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Endpoint</h4>
                <p className="text-xs font-mono text-muted-foreground"><span className="text-emerald-400">POST</span> /setup/quick</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Request Body</h4>
                <pre className="bg-zinc-900 text-blue-400 rounded-lg p-3 text-xs overflow-x-auto">
{`{
  "family_id": "uuid (optional — omit to create new family)",
  "family_name": "string (optional — used when creating new family)",
  "child_name": "string (required)",
  "birth_date": "YYYY-MM-DD (required)",
  "strictness": "recommended | strict | relaxed"
}`}
                </pre>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Response</h4>
                <pre className="bg-zinc-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">
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
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <strong>Strictness levels:</strong> <code className="bg-muted px-1 rounded text-xs">recommended</code> uses age-appropriate
                  defaults. <code className="bg-muted px-1 rounded text-xs">strict</code> reduces screen time by 30% and tightens timer intervals.
                  <code className="bg-muted px-1 rounded text-xs">relaxed</code> increases screen time by 30% and extends timer intervals.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Policy Enforcement */}
          <section id="enforcement">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Policy Enforcement</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                The GuardianGate Enforcement Engine fans out policy rules to all verified platforms concurrently.
                Platforms <Keyword>MUST</Keyword> accept enforcement requests and report per-rule results.
                Enforcement jobs track status as: <code className="bg-muted px-1 rounded text-xs text-foreground">pending</code> →
                <code className="bg-muted px-1 rounded text-xs text-foreground">running</code> →
                <code className="bg-muted px-1 rounded text-xs text-foreground">completed</code> / <code className="bg-muted px-1 rounded text-xs text-foreground">partial</code> / <code className="bg-muted px-1 rounded text-xs text-foreground">failed</code>.
              </p>
              <div className="text-xs font-mono space-y-1 text-muted-foreground">
                <p><span className="text-emerald-400">POST</span> /children/{'{'}childID{'}'}/enforce — Enforce policy across all platforms</p>
                <p><span className="text-emerald-400">POST</span> /compliance/{'{'}linkID{'}'}/enforce — Enforce on specific platform</p>
                <p><span className="text-blue-400">GET</span> /children/{'{'}childID{'}'}/enforcement/jobs — List enforcement runs</p>
                <p><span className="text-blue-400">GET</span> /enforcement/jobs/{'{'}jobID{'}'} — Enforcement job status</p>
                <p><span className="text-blue-400">GET</span> /enforcement/jobs/{'{'}jobID{'}'}/results — Per-platform enforcement results</p>
                <p><span className="text-emerald-400">POST</span> /enforcement/jobs/{'{'}jobID{'}'}/retry — Retry failed enforcement</p>
              </div>
              <pre className="bg-zinc-900 text-blue-400 rounded-lg p-3 text-xs overflow-x-auto">
{`// Example enforcement result per platform
{
  "platform_id": "nextdns",
  "status": "completed",
  "rules_applied": 4,
  "rules_skipped": 8,
  "rules_failed": 0
}`}
              </pre>
            </div>
          </section>

          {/* Section 7: Content Rating Standard */}
          <section id="ratings">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Content Rating Standard</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                GCSS defines a unified content rating framework spanning 5 international rating systems.
                Platforms <Keyword>MUST</Keyword> map their internal content ratings to the nearest GCSS equivalent.
                Cross-system equivalences <Keyword>SHALL</Keyword> be computed with a confidence score (0-1).
              </p>
              <div className="text-xs font-mono space-y-1 text-muted-foreground mb-4">
                <p><span className="text-blue-400">GET</span> /ratings/systems — List all rating systems</p>
                <p><span className="text-blue-400">GET</span> /ratings/systems/{'{'}systemID{'}'} — Ratings within a system</p>
                <p><span className="text-blue-400">GET</span> /ratings/by-age?age={'{'}n{'}'} — Age-appropriate ratings</p>
                <p><span className="text-blue-400">GET</span> /ratings/{'{'}ratingID{'}'}/convert — Cross-system equivalences</p>
                <p><span className="text-blue-400">GET</span> /ratings/systems/{'{'}systemID{'}'}/descriptors — Content descriptors</p>
              </div>
            </div>
          </section>

          {/* Section 8: Event Notifications */}
          <section id="webhooks">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Event Notifications</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Platforms <Keyword>SHOULD</Keyword> register webhook endpoints to receive real-time enforcement notifications.
                All webhook payloads <Keyword>MUST</Keyword> be signed using HMAC-SHA256 with the webhook secret.
                Platforms <Keyword>MUST</Keyword> verify the <code className="bg-muted px-1 rounded text-xs text-foreground">X-GuardianGate-Signature</code> header before processing.
              </p>
              <div className="text-xs font-mono space-y-1 text-muted-foreground">
                <p><span className="text-emerald-400">POST</span> /webhooks — Register notification endpoint</p>
                <p><span className="text-amber-400">PUT</span> /webhooks/{'{'}webhookID{'}'} — Update endpoint configuration</p>
                <p><span className="text-emerald-400">POST</span> /webhooks/{'{'}webhookID{'}'}/test — Send test notification</p>
                <p><span className="text-blue-400">GET</span> /webhooks/{'{'}webhookID{'}'}/deliveries — Delivery audit log</p>
              </div>
              <pre className="bg-zinc-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">
{`# Signature verification
signature = HMAC-SHA256(webhook_secret, request_body)
# Compare with X-GuardianGate-Signature header (hex-encoded)`}
              </pre>
            </div>
          </section>

          {/* Section 9: Compliance Levels */}
          <section id="levels">
            <h2 className="text-xl font-bold text-foreground mb-4">9. Compliance Levels</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Each platform is classified into one of three compliance levels. Platforms <Keyword>MUST</Keyword> progress toward
                full compliance. Regression from Compliant to a lower level <Keyword>SHALL</Keyword> trigger regulatory review.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded-lg p-5">
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
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-5">
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
                <div className="bg-muted/50 border border-border rounded-lg p-5">
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
          <section id="timeline">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Enforcement Timeline</h2>
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                The following timeline governs the transition to mandatory GCSS compliance for all regulated platforms.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-24 flex-shrink-0 text-right">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Phase 1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Voluntary Adoption</h4>
                    <p className="text-xs text-muted-foreground">Platforms <Keyword>MAY</Keyword> register and begin compliance integration. Early adopters receive Compliant certification.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-24 flex-shrink-0 text-right">
                    <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded">Phase 2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Mandatory Registration</h4>
                    <p className="text-xs text-muted-foreground">All platforms serving minors <Keyword>MUST</Keyword> register with the GCSS platform registry. Pending Compliance status assigned.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-24 flex-shrink-0 text-right">
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

          {/* Reference sections */}
          <div className="space-y-12">
            <section id="rule-categories">
              <h2 className="text-xl font-bold text-foreground mb-4">35 Mandatory Policy Categories</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Complete API reference for all 35 policy categories. Each entry includes the JSON configuration schema,
                field constraints, age-based defaults, platform support, and usage examples. Platforms claiming capability
                in a category <Keyword>MUST</Keyword> implement enforcement for all rules within that category.
              </p>

              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button onClick={expandAll} className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
                  Expand All
                </button>
                <button onClick={collapseAll} className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
                  Collapse All
                </button>
              </div>

              {/* Category Groups */}
              <div className="space-y-8">
                {CATEGORY_GROUPS.map(group => {
                  const groupCats = filteredReference.filter(c => c.group === group.key)
                  if (groupCats.length === 0) return null
                  return (
                    <div key={group.key} id={`cat-group-${group.key}`}>
                      {/* Group Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-foreground">{group.label}</h3>
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">{group.categories.length} categories</span>
                        <span className="text-xs text-muted-foreground">{group.description}</span>
                      </div>

                      {/* Category Cards */}
                      <div className="space-y-2">
                        {groupCats.map(cat => {
                          const globalIndex = CATEGORY_REFERENCE.findIndex(c => c.id === cat.id) + 1
                          const isExpanded = expandedCategories.has(cat.id)
                          return (
                            <div key={cat.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                              {/* Collapsed Row */}
                              <button
                                onClick={() => toggleCategory(cat.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                              >
                                <span className="text-xs font-mono text-muted-foreground w-7 flex-shrink-0">#{globalIndex}</span>
                                <code className="text-sm font-mono text-primary font-medium flex-shrink-0">{cat.id}</code>
                                <span className="text-sm text-foreground font-medium">{cat.name}</span>
                                <span className="text-xs text-muted-foreground truncate flex-1">{cat.description.slice(0, 80)}...</span>
                                {cat.laws.length > 0 && (
                                  <div className="flex gap-1 flex-shrink-0">
                                    {cat.laws.slice(0, 2).map(law => (
                                      <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20 whitespace-nowrap">{law}</span>
                                    ))}
                                    {cat.laws.length > 2 && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20">+{cat.laws.length - 2}</span>}
                                  </div>
                                )}
                                <svg className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>

                              {/* Expanded Detail Panel */}
                              {isExpanded && (
                                <div className="border-t border-border px-4 py-5 space-y-5 bg-muted/10">
                                  {/* Why This Exists */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Why This Exists</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{cat.rationale}</p>
                                    {cat.laws.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {cat.laws.map(law => (
                                          <span key={law} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-medium border border-amber-500/20">{law}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Configuration Schema */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Configuration Schema</h4>
                                    <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
                                      <table className="w-full text-xs">
                                        <thead><tr className="bg-muted/50"><th className="px-3 py-2 text-left text-muted-foreground">Field</th><th className="px-3 py-2 text-left text-muted-foreground">Type</th><th className="px-3 py-2 text-center text-muted-foreground">Required</th><th className="px-3 py-2 text-left text-muted-foreground">Default</th><th className="px-3 py-2 text-left text-muted-foreground">Constraints</th></tr></thead>
                                        <tbody className="divide-y divide-border">
                                          {cat.fields.map(f => (
                                            <tr key={f.name} className="hover:bg-muted/30">
                                              <td className="px-3 py-2 font-mono text-primary">{f.name}</td>
                                              <td className="px-3 py-2 font-mono text-foreground">{f.type}</td>
                                              <td className="px-3 py-2 text-center">{f.required ? <span className="text-emerald-500">Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{f.default}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{f.constraints}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* Example Configuration */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Example Configuration</h4>
                                    <pre className="bg-zinc-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">{cat.exampleConfig}</pre>
                                  </div>

                                  {/* Age-Based Defaults */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Age-Based Defaults</h4>
                                    <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
                                      <table className="w-full text-xs">
                                        <thead><tr className="bg-muted/50"><th className="px-3 py-2 text-left text-muted-foreground">Age Range</th><th className="px-3 py-2 text-center text-muted-foreground">Enabled</th><th className="px-3 py-2 text-left text-muted-foreground">Default Settings</th></tr></thead>
                                        <tbody className="divide-y divide-border">
                                          {cat.ageDefaults.map(ad => (
                                            <tr key={ad.range} className="hover:bg-muted/30">
                                              <td className="px-3 py-2 font-medium text-foreground">{ad.range}</td>
                                              <td className="px-3 py-2 text-center">{ad.enabled ? <span className="text-emerald-500">Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{ad.summary}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* Platform Support */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Platform Support</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {cat.platforms.map(p => (
                                        <div key={p.name} className="flex items-center gap-1.5">
                                          <span className="text-xs text-muted-foreground">{p.name}:</span>
                                          <SupportBadge support={p.support} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* API Usage */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-2">API Usage</h4>
                                    <pre className="bg-zinc-900 text-blue-400 rounded-lg p-3 text-xs overflow-x-auto">{`PUT /policies/{policyID}/rules/bulk
Content-Type: application/json

{
  "rules": [
    {
      "category": "${cat.id}",
      "enabled": true,
      "config": ${cat.exampleConfig.split('\n').map((l, i) => i === 0 ? l : '      ' + l).join('\n')}
    }
  ]
}`}</pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Platform Support Matrix */}
            <section id="platform-support">
              <h2 className="text-xl font-bold text-foreground mb-4">Platform Support Matrix</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Overview of which category groups are supported by each platform adapter. <span className="text-emerald-500">&#10003;</span> = Full support,{" "}
                <span className="text-amber-500">&#9681;</span> = Partial support, <span className="text-zinc-400">&mdash;</span> = No support.
              </p>
              <div className="bg-card rounded-xl border border-border/50 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground">Category Group</th>
                      {PLATFORM_NAMES.map(name => (
                        <th key={name} className="px-4 py-3 text-center text-xs text-muted-foreground">{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {CATEGORY_GROUPS.map(group => {
                      const groupCats = CATEGORY_REFERENCE.filter(c => c.group === group.key)
                      const platformSummary = PLATFORM_NAMES.map(pName => {
                        const supports = groupCats.map(c => c.platforms.find(p => p.name === pName)?.support || "none")
                        if (supports.every(s => s === "none")) return "none" as PlatformSupport
                        if (supports.every(s => s === "full")) return "full" as PlatformSupport
                        return "partial" as PlatformSupport
                      })
                      return (
                        <tr key={group.key} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">
                            <a href={`#cat-group-${group.key}`} className="hover:text-primary transition-colors">{group.label}</a>
                            <span className="text-xs text-muted-foreground ml-2">({group.categories.length})</span>
                          </td>
                          {platformSummary.map((support, i) => (
                            <td key={PLATFORM_NAMES[i]} className="px-4 py-3 text-center text-lg">
                              <PlatformSupportIcon support={support} />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="age-ratings">
              <h2 className="text-xl font-bold text-foreground mb-4">Age-to-Rating Standard</h2>
              <p className="text-sm text-muted-foreground mb-4">Platforms <Keyword>MUST</Keyword> use the following age-to-rating mappings when computing content restrictions. Used by <code className="bg-muted px-1 rounded text-xs text-foreground">GET /ratings/by-age</code> and <code className="bg-muted px-1 rounded text-xs text-foreground">POST /policies/:id/generate-from-age</code>.</p>
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50"><th className="px-4 py-3 text-left text-xs text-muted-foreground">Age</th><th className="px-4 py-3 text-center text-xs text-muted-foreground">MPAA</th><th className="px-4 py-3 text-center text-xs text-muted-foreground">TV</th><th className="px-4 py-3 text-center text-xs text-muted-foreground">ESRB</th><th className="px-4 py-3 text-center text-xs text-muted-foreground">PEGI</th><th className="px-4 py-3 text-center text-xs text-muted-foreground">CSM</th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {AGE_RATING_TABLE.map((row) => (
                      <tr key={row.range} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{row.range}</td>
                        <td className="px-4 py-3 text-center"><span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium">{row.mpaa}</span></td>
                        <td className="px-4 py-3 text-center"><span className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-2 py-0.5 rounded text-xs font-medium">{row.tv}</span></td>
                        <td className="px-4 py-3 text-center"><span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-medium">{row.esrb}</span></td>
                        <td className="px-4 py-3 text-center"><span className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 px-2 py-0.5 rounded text-xs font-medium">{row.pegi}</span></td>
                        <td className="px-4 py-3 text-center"><span className="bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400 px-2 py-0.5 rounded text-xs font-medium">{row.csm}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Age-Based Defaults */}
            <section id="age-defaults">
              <h2 className="text-xl font-bold text-foreground mb-4">Age-Based Default Policies</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Default policy values generated by <code className="bg-muted px-1 rounded text-xs text-foreground">POST /policies/:id/generate-from-age</code> and the Quick Setup API.
                These defaults represent the &quot;recommended&quot; strictness level. Values are computed from the child&apos;s age at policy creation time.
              </p>
              <div className="bg-card rounded-xl border border-border/50 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground whitespace-nowrap">Setting</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">0-6</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">7-9</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">10-12</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">13-16</th>
                      <th className="px-4 py-3 text-center text-xs text-muted-foreground">17+</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {AGE_DEFAULTS_TABLE.map(row => (
                      <tr key={row.key} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          <a href={`#rule-categories`} className="hover:text-primary transition-colors">{row.setting}</a>
                        </td>
                        {row.values.map((val, i) => (
                          <td key={i} className="px-4 py-3 text-center text-xs text-muted-foreground whitespace-nowrap">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="api-base">
              <h2 className="text-xl font-bold text-foreground mb-4">API Base URL</h2>
              <div className="bg-card rounded-xl border border-border/50 p-6">
                <p className="text-sm text-muted-foreground mb-4">All GCSS API endpoints are served under:</p>
                <pre className="bg-zinc-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">{API_BASE}</pre>
                <p className="text-sm text-muted-foreground mt-4">Platforms <Keyword>MUST</Keyword> use HTTPS in production environments. HTTP <Keyword>MAY</Keyword> be used only in development.</p>
              </div>
            </section>

            {/* Section 11: Legislative Compliance Matrix */}
            <section id="legislation">
              <h2 className="text-xl font-bold text-foreground mb-4">11. Legislative Compliance Matrix</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The following legislation maps to GCSS policy categories. Platforms operating in jurisdictions
                covered by these laws <Keyword>MUST</Keyword> implement the corresponding categories.
                Click any entry to see key provisions, jurisdiction details, and legislative status.
              </p>

              <div className="space-y-2">
                {LEGISLATION_REFERENCE.map(leg => {
                  const isExpanded = expandedLegislation.has(leg.id)
                  const stageColor = leg.stage.startsWith("In force") || leg.stage.startsWith("Enacted") || leg.stage.startsWith("Signed")
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : leg.stage.startsWith("Passed")
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    : leg.stage.includes("paused") || leg.stage.includes("injunction")
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"

                  return (
                    <div key={leg.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                      {/* Collapsed Row */}
                      <button
                        onClick={() => toggleLegislation(leg.id)}
                        className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground">{leg.law}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${stageColor} whitespace-nowrap`}>
                                {leg.stage.split(";")[0]}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{leg.jurisdiction}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{leg.summary}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {leg.categories.map(cat => (
                                <code key={cat} className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded font-mono whitespace-nowrap">{cat}</code>
                              ))}
                            </div>
                            <svg className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </button>

                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <div className="border-t border-border px-4 py-5 space-y-4 bg-muted/10">
                          {/* Metadata Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Jurisdiction</p>
                              <p className="text-sm text-foreground">{leg.jurisdiction}</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Introduced</p>
                              <p className="text-sm text-foreground">{leg.introduced}</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status</p>
                              <p className="text-sm text-foreground">{leg.stage}</p>
                            </div>
                          </div>

                          {/* Key Provisions */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Key Provisions</h4>
                            <ul className="space-y-1.5">
                              {leg.keyProvisions.map((provision, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <span className="text-primary mt-0.5 flex-shrink-0">&#8226;</span>
                                  <span className="leading-relaxed">{provision}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Required GCSS Categories */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Required GCSS Categories</h4>
                            <div className="flex flex-wrap gap-2">
                              {leg.categories.map(catId => {
                                const cat = CATEGORY_REFERENCE.find(c => c.id === catId)
                                return (
                                  <a key={catId} href="#rule-categories" onClick={() => { setExpandedCategories(prev => new Set(prev).add(catId)) }} className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5 hover:bg-primary/10 transition-colors">
                                    <code className="text-xs font-mono text-primary">{catId}</code>
                                    {cat && <span className="text-[10px] text-muted-foreground">{cat.name}</span>}
                                  </a>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Section 12: Parent Experience */}
            <section id="parent-experience">
              <h2 className="text-xl font-bold text-foreground mb-4">12. Parent Experience</h2>
              <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  GuardianGate provides a guided Quick Setup flow that enables parents to protect their children across
                  all regulated platforms in under one minute. The three-step wizard handles family creation, age-based
                  policy generation, and platform verification.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-3">1</div>
                    <h4 className="font-medium text-foreground mb-1">Tell Us About Your Child</h4>
                    <p className="text-xs text-muted-foreground">Enter name, birth date, and choose a protection level (Recommended, Strict, or Relaxed).</p>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-3">2</div>
                    <h4 className="font-medium text-foreground mb-1">Review Protections</h4>
                    <p className="text-xs text-muted-foreground">See plain-language summary cards for screen time, content ratings, web filtering, social controls, privacy, and algorithm safety.</p>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-3">3</div>
                    <h4 className="font-medium text-foreground mb-1">Connect Platforms</h4>
                    <p className="text-xs text-muted-foreground">Verify compliance on platforms with a progress indicator. Enforce with one click after connecting.</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">What Gets Created</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Family (if not already created)</li>
                    <li>Child profile with age computation</li>
                    <li>Active safety policy with ~20-25 enabled rules across all 35 categories</li>
                    <li>Age-appropriate content ratings across 5 rating systems</li>
                    <li>Legislation-compliant rules for algorithmic safety, notifications, advertising, and data privacy</li>
                  </ul>
                </div>
              </div>
            </section>

          </div>
        </main>
          </>
        ) : (
          <>
        {/* Recipes sidebar */}
        <aside className="w-56 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recipes</p>
            {RECIPES.map((r) => (
              <a
                key={r.id}
                href={`#recipe-${r.id}`}
                className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <span className="mr-2">{r.icon}</span>{r.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Recipes content */}
        <main className="flex-1 min-w-0 space-y-12">
          <section id="recipes">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Real-World Recipes</h2>
              <div className="flex gap-2">
                <button onClick={expandAllRecipes} className="text-xs px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Expand All</button>
                <button onClick={collapseAllRecipes} className="text-xs px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Collapse All</button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              End-to-end walkthroughs showing how the API pieces fit together for real scenarios — from a parent&apos;s action through the API to platform enforcement.
            </p>
            <div className="space-y-3">
              {RECIPES.map((recipe, index) => {
                const isExpanded = expandedRecipes.has(recipe.id)
                return (
                  <div key={recipe.id} id={`recipe-${recipe.id}`} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                    <button
                      onClick={() => toggleRecipe(recipe.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-xl flex-shrink-0">{recipe.icon}</span>
                      <span className="text-xs text-muted-foreground font-mono flex-shrink-0">#{index + 1}</span>
                      <span className="font-semibold text-foreground text-sm">{recipe.title}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline truncate">{recipe.summary}</span>
                      <div className="flex gap-1.5 ml-auto flex-shrink-0">
                        {recipe.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary border border-primary/10">{tag}</span>
                        ))}
                      </div>
                      <svg className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/50 bg-muted/10 px-5 py-5 space-y-6">
                        {/* Scenario */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Scenario</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{recipe.scenario}</p>
                        </div>

                        {/* Flow Diagram */}
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Flow Diagram</h4>
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {recipe.actors.map(actor => (
                              <span key={actor} className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground border border-border">{actor}</span>
                            ))}
                          </div>
                          <div className="overflow-x-auto">
                            <pre className="bg-zinc-900 text-green-400 rounded-lg p-4 text-xs font-mono leading-relaxed whitespace-pre">{recipe.flowDiagram}</pre>
                          </div>
                        </div>

                        {/* Steps */}
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Step-by-Step</h4>
                          <div className="space-y-4">
                            {recipe.steps.map(step => (
                              <div key={step.number} className="bg-muted/30 rounded-lg p-4">
                                <div className="flex items-start gap-3 mb-2">
                                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.number}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                                        step.method === "POST" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                        step.method === "GET" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                        step.method === "PUT" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                        "bg-red-500/10 text-red-600 dark:text-red-400"
                                      }`}>{step.method}</span>
                                      <code className="text-xs font-mono text-foreground">{step.endpoint}</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                  </div>
                                </div>
                                {step.requestBody && (
                                  <div className="mt-3 ml-9">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request</p>
                                    <pre className="bg-zinc-900 text-blue-400 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre">{step.requestBody}</pre>
                                  </div>
                                )}
                                {step.responseBody && (
                                  <div className="mt-3 ml-9">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Response</p>
                                    <pre className="bg-zinc-900 text-green-400 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre">{step.responseBody}</pre>
                                  </div>
                                )}
                                <div className="mt-3 ml-9 flex items-start gap-2">
                                  <span className="text-muted-foreground mt-0.5">&rarr;</span>
                                  <p className="text-xs text-muted-foreground italic leading-relaxed">{step.whatHappens}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Takeaway */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Key Takeaway</h4>
                          <p className="text-sm text-foreground">{recipe.keyTeachingPoint}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </main>
          </>
        )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
