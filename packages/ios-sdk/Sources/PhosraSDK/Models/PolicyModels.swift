import Foundation

// MARK: - Content Filter

/// Content filtering settings: age ratings, blocked/allowed apps, and allowlist mode.
/// Maps to Go `service.ContentFilter`.
public struct ContentFilter: Codable, Sendable {
    /// Apple age rating string (e.g., "4+", "9+", "12+", "17+").
    public let ageRating: String

    /// Maximum content ratings per rating system (e.g., {"apple": "12+", "mpaa": "PG-13"}).
    public let maxRatings: [String: String]

    /// Bundle IDs of apps explicitly blocked.
    public let blockedApps: [String]

    /// Bundle IDs of apps explicitly allowed (used when `allowlistMode` is true).
    public let allowedApps: [String]

    /// When true, only apps in `allowedApps` are permitted; all others are blocked.
    public let allowlistMode: Bool

    enum CodingKeys: String, CodingKey {
        case ageRating = "age_rating"
        case maxRatings = "max_ratings"
        case blockedApps = "blocked_apps"
        case allowedApps = "allowed_apps"
        case allowlistMode = "allowlist_mode"
    }
}

// MARK: - Screen Time

/// Screen time limits and schedules.
/// Maps to Go `service.ScreenTime`.
public struct ScreenTime: Codable, Sendable {
    /// Total daily screen time limit in minutes (0 = unlimited).
    public let dailyLimitMinutes: Int

    /// Per-app daily time limits.
    public let perAppLimits: [PerAppLimit]?

    /// Downtime windows during which the device is locked.
    public let downtimeWindows: [DowntimeWindow]?

    /// Bundle IDs of apps that are always accessible (e.g., Phone, Messages, Maps).
    public let alwaysAllowedApps: [String]

    /// Weekday/weekend schedule configuration.
    public let schedule: ScheduleConfig?

    enum CodingKeys: String, CodingKey {
        case dailyLimitMinutes = "daily_limit_minutes"
        case perAppLimits = "per_app_limits"
        case downtimeWindows = "downtime_windows"
        case alwaysAllowedApps = "always_allowed_apps"
        case schedule
    }
}

/// A per-app daily time limit.
/// Maps to Go `service.AppLimit`.
public struct PerAppLimit: Codable, Sendable {
    /// The app's bundle identifier (e.g., "com.google.ios.youtube").
    public let bundleID: String

    /// Maximum daily usage in minutes.
    public let dailyMinutes: Int

    enum CodingKeys: String, CodingKey {
        case bundleID = "bundle_id"
        case dailyMinutes = "daily_minutes"
    }
}

/// A downtime window during which device usage is restricted.
/// Maps to Go `service.DowntimeWindow`.
public struct DowntimeWindow: Codable, Sendable {
    /// Days of the week this window applies to (e.g., ["monday", "tuesday", ...]).
    public let daysOfWeek: [String]

    /// Start time in "HH:mm" format (24-hour).
    public let startTime: String

    /// End time in "HH:mm" format (24-hour).
    public let endTime: String

    enum CodingKeys: String, CodingKey {
        case daysOfWeek = "days_of_week"
        case startTime = "start_time"
        case endTime = "end_time"
    }
}

/// Schedule configuration with different weekday and weekend time ranges.
/// Maps to Go `service.ScheduleConfig`.
public struct ScheduleConfig: Codable, Sendable {
    /// Allowed time range on weekdays.
    public let weekday: TimeRange

    /// Allowed time range on weekends.
    public let weekend: TimeRange
}

/// A start/end time range in "HH:mm" format.
/// Maps to Go `service.TimeRange`.
public struct TimeRange: Codable, Sendable {
    /// Start time in "HH:mm" format (24-hour).
    public let start: String

    /// End time in "HH:mm" format (24-hour).
    public let end: String
}

// MARK: - Purchases

/// Purchase restriction settings.
/// Maps to Go `service.Purchases`.
public struct Purchases: Codable, Sendable {
    /// Whether purchases require parental approval.
    public let requireApproval: Bool

    /// Whether in-app purchases are blocked entirely.
    public let blockIAP: Bool

    /// Monthly spending cap in USD. 0 means no cap.
    public let spendingCapUSD: Double?

    enum CodingKeys: String, CodingKey {
        case requireApproval = "require_approval"
        case blockIAP = "block_iap"
        case spendingCapUSD = "spending_cap_usd"
    }
}

// MARK: - Privacy

/// Privacy settings for location sharing, profile visibility, and data controls.
/// Maps to Go `service.Privacy`.
public struct Privacy: Codable, Sendable {
    /// Whether location sharing is enabled for the child.
    public let locationSharingEnabled: Bool

    /// Profile visibility level (e.g., "private", "friends_only", "public").
    public let profileVisibility: String

    /// Whether new account creation requires parental approval.
    public let accountCreationApproval: Bool

    /// Whether data sharing with third parties is restricted.
    public let dataSharingRestricted: Bool

    enum CodingKeys: String, CodingKey {
        case locationSharingEnabled = "location_sharing_enabled"
        case profileVisibility = "profile_visibility"
        case accountCreationApproval = "account_creation_approval"
        case dataSharingRestricted = "data_sharing_restricted"
    }
}

// MARK: - Social

/// Social interaction controls.
/// Maps to Go `service.Social`.
public struct Social: Codable, Sendable {
    /// Chat mode (e.g., "disabled", "friends_only", "open").
    public let chatMode: String

    /// Direct message restriction level (e.g., "disabled", "contacts_only", "open").
    public let dmRestriction: String

    /// Multiplayer gaming mode (e.g., "disabled", "friends_only", "open").
    public let multiplayerMode: String

    enum CodingKeys: String, CodingKey {
        case chatMode = "chat_mode"
        case dmRestriction = "dm_restriction"
        case multiplayerMode = "multiplayer_mode"
    }
}

// MARK: - Notifications

/// Notification curfew and usage timer settings.
/// Maps to Go `service.Notifications`.
public struct Notifications: Codable, Sendable {
    /// Curfew start time in "HH:mm" format. Nil if no curfew.
    public let curfewStart: String?

    /// Curfew end time in "HH:mm" format. Nil if no curfew.
    public let curfewEnd: String?

    /// Usage timer notification interval in minutes. 0 = disabled.
    public let usageTimerMinutes: Int?

    enum CodingKeys: String, CodingKey {
        case curfewStart = "curfew_start"
        case curfewEnd = "curfew_end"
        case usageTimerMinutes = "usage_timer_minutes"
    }
}

// MARK: - Web Filter

/// Web content filtering settings.
/// Maps to Go `service.WebFilter`.
public struct WebFilter: Codable, Sendable {
    /// Filter level (e.g., "none", "moderate", "strict").
    public let level: String

    /// Whether safe search is enforced on search engines.
    public let safeSearch: Bool

    /// Domains that are explicitly blocked.
    public let blockedDomains: [String]

    /// Domains that are explicitly allowed (bypass filtering).
    public let allowedDomains: [String]

    /// Web content categories that are blocked (e.g., "gambling", "adult", "violence").
    public let blockedCategories: [String]

    enum CodingKeys: String, CodingKey {
        case level
        case safeSearch = "safe_search"
        case blockedDomains = "blocked_domains"
        case allowedDomains = "allowed_domains"
        case blockedCategories = "blocked_categories"
    }
}
