import Foundation

/// All 45 Phosra rule categories, matching the Go `domain.RuleCategory` constants.
///
/// Each case maps to its snake_case string value used in the JSON API.
public enum RuleCategory: String, Codable, CaseIterable, Sendable {
    // MARK: - Content Rules
    case contentRating = "content_rating"
    case contentBlockTitle = "content_block_title"
    case contentAllowTitle = "content_allow_title"
    case contentAllowlistMode = "content_allowlist_mode"
    case contentDescriptorBlock = "content_descriptor_block"

    // MARK: - Time Rules
    case timeDailyLimit = "time_daily_limit"
    case timeScheduledHours = "time_scheduled_hours"
    case timePerAppLimit = "time_per_app_limit"
    case timeDowntime = "time_downtime"

    // MARK: - Purchase Rules
    case purchaseApproval = "purchase_approval"
    case purchaseSpendingCap = "purchase_spending_cap"
    case purchaseBlockIAP = "purchase_block_iap"

    // MARK: - Social Rules
    case socialContacts = "social_contacts"
    case socialChatControl = "social_chat_control"
    case socialMultiplayer = "social_multiplayer"

    // MARK: - Web Rules
    case webSafesearch = "web_safesearch"
    case webCategoryBlock = "web_category_block"
    case webCustomAllowlist = "web_custom_allowlist"
    case webCustomBlocklist = "web_custom_blocklist"
    case webFilterLevel = "web_filter_level"

    // MARK: - Privacy Rules
    case privacyLocation = "privacy_location"
    case privacyProfileVisibility = "privacy_profile_visibility"
    case privacyDataSharing = "privacy_data_sharing"
    case privacyAccountCreation = "privacy_account_creation"

    // MARK: - Monitoring Rules
    case monitoringActivity = "monitoring_activity"
    case monitoringAlerts = "monitoring_alerts"

    // MARK: - Algorithmic Safety Rules (KOSA, KOSMA, CA SB 976, EU DSA)
    case algoFeedControl = "algo_feed_control"
    case addictiveDesignControl = "addictive_design_control"

    // MARK: - Notification Rules (VA SB 854, NY SAFE for Kids, MN HF 2, TN HB 1891)
    case notificationCurfew = "notification_curfew"
    case usageTimerNotification = "usage_timer_notification"

    // MARK: - Advertising & Data Rules (COPPA 2.0, EU DSA, India DPDPA, CT SB 3, MD Kids Code)
    case targetedAdBlock = "targeted_ad_block"
    case dmRestriction = "dm_restriction"
    case ageGate = "age_gate"
    case dataDeletionRequest = "data_deletion_request"
    case geolocationOptIn = "geolocation_opt_in"

    // MARK: - Compliance Expansion Rules
    case csamReporting = "csam_reporting"
    case libraryFilterCompliance = "library_filter_compliance"
    case aiMinorInteraction = "ai_minor_interaction"
    case socialMediaMinAge = "social_media_min_age"
    case imageRightsMinor = "image_rights_minor"

    // MARK: - Legislation-Driven Expansion (2025)
    case parentalConsentGate = "parental_consent_gate"
    case parentalEventNotification = "parental_event_notification"
    case screenTimeReport = "screen_time_report"
    case commercialDataBan = "commercial_data_ban"
    case algorithmicAudit = "algorithmic_audit"
}
