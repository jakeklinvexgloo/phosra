export const AGE_DEFAULTS_TABLE = [
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

export const AGE_RATING_TABLE = [
  { range: "0-6", mpaa: "G", tv: "TV-Y", esrb: "E", pegi: "3", csm: "5+" },
  { range: "7-9", mpaa: "PG", tv: "TV-Y7", esrb: "E", pegi: "7", csm: "7+" },
  { range: "10-12", mpaa: "PG", tv: "TV-PG", esrb: "E10+", pegi: "7", csm: "10+" },
  { range: "13-16", mpaa: "PG-13", tv: "TV-14", esrb: "T", pegi: "12", csm: "13+" },
  { range: "17", mpaa: "R", tv: "TV-MA", esrb: "M", pegi: "16", csm: "17+" },
  { range: "18+", mpaa: "NC-17", tv: "TV-MA", esrb: "AO", pegi: "18", csm: "18+" },
]
