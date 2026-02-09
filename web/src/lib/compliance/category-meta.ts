// Shared category display metadata — used by StandardLawPage and adapters

export const CATEGORY_META: Record<
  string,
  { name: string; description: string; group: string }
> = {
  algo_feed_control: {
    name: "Algorithm Feed Control",
    description:
      "Disables personalized algorithmic feeds and switches to chronological or non-profiled content delivery.",
    group: "algorithmic",
  },
  addictive_design_control: {
    name: "Addictive Design Control",
    description:
      "Disables autoplay, infinite scroll, notification streaks, and other compulsive-use design patterns.",
    group: "algorithmic",
  },
  targeted_ad_block: {
    name: "Targeted Ad Block",
    description:
      "Blocks behavioral advertising, ad profiling, and retargeting for minor users across connected platforms.",
    group: "advertising",
  },
  data_deletion_request: {
    name: "Data Deletion Request",
    description:
      "Triggers data deletion workflows on connected platforms and enables full profile removal via API.",
    group: "privacy",
  },
  geolocation_opt_in: {
    name: "Geolocation Opt-In",
    description:
      "Ensures location tracking is disabled by default, requiring explicit parental authorization to enable.",
    group: "privacy",
  },
  notification_curfew: {
    name: "Notification Curfew",
    description:
      "Suppresses non-essential push notifications during configurable quiet hours (e.g., overnight).",
    group: "notifications",
  },
  usage_timer_notification: {
    name: "Usage Timer",
    description:
      "Sends configurable screen time alerts and enforces daily usage limits across platforms.",
    group: "notifications",
  },
  dm_restriction: {
    name: "DM Restriction",
    description:
      "Restricts direct messaging to approved contacts or friends only, blocking messages from strangers.",
    group: "access_control",
  },
  age_gate: {
    name: "Age Gate",
    description:
      "Enforces age verification requirements and restricts access to age-inappropriate content or features.",
    group: "access_control",
  },
  content_rating: {
    name: "Content Rating",
    description:
      "Applies content maturity ratings (MPAA, TV, ESRB, PEGI, CSM) to filter age-inappropriate media.",
    group: "content",
  },
  web_safesearch: {
    name: "Safe Search",
    description:
      "Enables safe search filters across search engines to block explicit content from results.",
    group: "content",
  },
  web_category_block: {
    name: "Web Category Block",
    description:
      "Blocks access to configurable website categories such as gambling, adult content, and violence.",
    group: "content",
  },
  web_filter_level: {
    name: "Web Filter Level",
    description:
      "Sets the overall web filtering strictness level from permissive to highly restrictive.",
    group: "content",
  },
  time_daily_limit: {
    name: "Daily Time Limit",
    description:
      "Enforces maximum daily screen time across platforms with configurable per-app or global limits.",
    group: "time",
  },
  time_scheduled_hours: {
    name: "Scheduled Hours",
    description:
      "Restricts platform access to specified time windows (e.g., after school, before bedtime).",
    group: "time",
  },
  privacy_data_sharing: {
    name: "Data Sharing Control",
    description:
      "Controls what personal data can be shared with third parties and platform partners.",
    group: "privacy",
  },
  monitoring_activity: {
    name: "Activity Monitoring",
    description:
      "Provides parental visibility into app usage, content accessed, and online activity patterns.",
    group: "monitoring",
  },
  social_media_min_age: {
    name: "Social Media Min Age",
    description:
      "Enforces minimum age requirements for social media platform access based on jurisdiction.",
    group: "access_control",
  },
  csam_reporting: {
    name: "CSAM Reporting",
    description:
      "Automates detection and reporting workflows for child sexual abuse material across platforms.",
    group: "reporting",
  },
  library_filter_compliance: {
    name: "Library Filter",
    description:
      "Implements content filtering for public library and educational institution compliance.",
    group: "content",
  },
  ai_minor_interaction: {
    name: "AI Minor Interaction",
    description:
      "Controls AI chatbot and generative AI interactions with minor users, enforcing safety guardrails.",
    group: "algorithmic",
  },
  image_rights_minor: {
    name: "Image Rights",
    description:
      "Protects minors' image rights by controlling photo sharing and facial recognition usage.",
    group: "privacy",
  },
}

export const GROUP_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  algorithmic: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  notifications: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
  advertising: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
  },
  access_control: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },
  content: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  privacy: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/20",
  },
  time: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
  },
  monitoring: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
  },
  reporting: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
  other: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
  },
}

export function getCategoryMeta(categoryId: string) {
  return (
    CATEGORY_META[categoryId] ?? {
      name: categoryId
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      description: `Enforces ${categoryId.replace(/_/g, " ")} rules across connected platforms.`,
      group: "other",
    }
  )
}

export function getGroupColor(group: string) {
  return (
    GROUP_COLORS[group] ?? {
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      border: "border-slate-500/20",
    }
  )
}
