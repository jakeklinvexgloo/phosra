package com.phosra.sdk.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * All 45 rule categories matching the Go domain.RuleCategory constants.
 * Each enum entry's @SerialName matches the snake_case string used in JSON payloads.
 */
@Serializable
enum class RuleCategory {
    // ── Content rules ──────────────────────────────────────────────
    @SerialName("content_rating")
    CONTENT_RATING,

    @SerialName("content_block_title")
    CONTENT_BLOCK_TITLE,

    @SerialName("content_allow_title")
    CONTENT_ALLOW_TITLE,

    @SerialName("content_allowlist_mode")
    CONTENT_ALLOWLIST_MODE,

    @SerialName("content_descriptor_block")
    CONTENT_DESCRIPTOR_BLOCK,

    // ── Time rules ─────────────────────────────────────────────────
    @SerialName("time_daily_limit")
    TIME_DAILY_LIMIT,

    @SerialName("time_scheduled_hours")
    TIME_SCHEDULED_HOURS,

    @SerialName("time_per_app_limit")
    TIME_PER_APP_LIMIT,

    @SerialName("time_downtime")
    TIME_DOWNTIME,

    // ── Purchase rules ─────────────────────────────────────────────
    @SerialName("purchase_approval")
    PURCHASE_APPROVAL,

    @SerialName("purchase_spending_cap")
    PURCHASE_SPENDING_CAP,

    @SerialName("purchase_block_iap")
    PURCHASE_BLOCK_IAP,

    // ── Social rules ───────────────────────────────────────────────
    @SerialName("social_contacts")
    SOCIAL_CONTACTS,

    @SerialName("social_chat_control")
    SOCIAL_CHAT_CONTROL,

    @SerialName("social_multiplayer")
    SOCIAL_MULTIPLAYER,

    // ── Web rules ──────────────────────────────────────────────────
    @SerialName("web_safesearch")
    WEB_SAFESEARCH,

    @SerialName("web_category_block")
    WEB_CATEGORY_BLOCK,

    @SerialName("web_custom_allowlist")
    WEB_CUSTOM_ALLOWLIST,

    @SerialName("web_custom_blocklist")
    WEB_CUSTOM_BLOCKLIST,

    @SerialName("web_filter_level")
    WEB_FILTER_LEVEL,

    // ── Privacy rules ──────────────────────────────────────────────
    @SerialName("privacy_location")
    PRIVACY_LOCATION,

    @SerialName("privacy_profile_visibility")
    PRIVACY_PROFILE_VISIBILITY,

    @SerialName("privacy_data_sharing")
    PRIVACY_DATA_SHARING,

    @SerialName("privacy_account_creation")
    PRIVACY_ACCOUNT_CREATION,

    // ── Monitoring rules ───────────────────────────────────────────
    @SerialName("monitoring_activity")
    MONITORING_ACTIVITY,

    @SerialName("monitoring_alerts")
    MONITORING_ALERTS,

    // ── Algorithmic Safety rules (KOSA, KOSMA, CA SB 976, EU DSA) ──
    @SerialName("algo_feed_control")
    ALGO_FEED_CONTROL,

    @SerialName("addictive_design_control")
    ADDICTIVE_DESIGN_CONTROL,

    // ── Notification rules ─────────────────────────────────────────
    @SerialName("notification_curfew")
    NOTIFICATION_CURFEW,

    @SerialName("usage_timer_notification")
    USAGE_TIMER_NOTIFICATION,

    // ── Advertising & Data rules (COPPA 2.0, EU DSA, India DPDPA) ──
    @SerialName("targeted_ad_block")
    TARGETED_AD_BLOCK,

    @SerialName("dm_restriction")
    DM_RESTRICTION,

    @SerialName("age_gate")
    AGE_GATE,

    @SerialName("data_deletion_request")
    DATA_DELETION_REQUEST,

    @SerialName("geolocation_opt_in")
    GEOLOCATION_OPT_IN,

    // ── Compliance expansion rules ─────────────────────────────────
    @SerialName("csam_reporting")
    CSAM_REPORTING,

    @SerialName("library_filter_compliance")
    LIBRARY_FILTER_COMPLIANCE,

    @SerialName("ai_minor_interaction")
    AI_MINOR_INTERACTION,

    @SerialName("social_media_min_age")
    SOCIAL_MEDIA_MIN_AGE,

    @SerialName("image_rights_minor")
    IMAGE_RIGHTS_MINOR,

    // ── Legislation-driven expansion (2025) ────────────────────────
    @SerialName("parental_consent_gate")
    PARENTAL_CONSENT_GATE,

    @SerialName("parental_event_notification")
    PARENTAL_EVENT_NOTIFICATION,

    @SerialName("screen_time_report")
    SCREEN_TIME_REPORT,

    @SerialName("commercial_data_ban")
    COMMERCIAL_DATA_BAN,

    @SerialName("algorithmic_audit")
    ALGORITHMIC_AUDIT;

    companion object {
        /** Returns all 45 rule categories. */
        fun all(): List<RuleCategory> = entries.toList()
    }
}
