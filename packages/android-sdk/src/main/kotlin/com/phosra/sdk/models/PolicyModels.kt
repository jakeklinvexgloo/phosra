package com.phosra.sdk.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Content filtering configuration — age ratings, blocked/allowed apps, allowlist mode.
 * Maps to Go service.ContentFilter.
 */
@Serializable
data class ContentFilter(
    @SerialName("age_rating")
    val ageRating: String = "",

    @SerialName("max_ratings")
    val maxRatings: Map<String, String> = emptyMap(),

    @SerialName("blocked_apps")
    val blockedApps: List<String> = emptyList(),

    @SerialName("allowed_apps")
    val allowedApps: List<String> = emptyList(),

    @SerialName("allowlist_mode")
    val allowlistMode: Boolean = false
)

/**
 * Screen time configuration — daily limits, per-app limits, downtime windows, schedules.
 * Maps to Go service.ScreenTime.
 */
@Serializable
data class ScreenTime(
    @SerialName("daily_limit_minutes")
    val dailyLimitMinutes: Int = 0,

    @SerialName("per_app_limits")
    val perAppLimits: List<PerAppLimit> = emptyList(),

    @SerialName("downtime_windows")
    val downtimeWindows: List<DowntimeWindow> = emptyList(),

    @SerialName("always_allowed_apps")
    val alwaysAllowedApps: List<String> = emptyList(),

    @SerialName("schedule")
    val schedule: ScheduleConfig? = null
)

/**
 * Per-app time limit. Maps to Go service.AppLimit.
 * Uses `bundle_id` for cross-platform compatibility; on Android this is the package name.
 */
@Serializable
data class PerAppLimit(
    @SerialName("bundle_id")
    val bundleId: String,

    @SerialName("daily_minutes")
    val dailyMinutes: Int
)

/**
 * A window during which the device is in "downtime" (most apps blocked).
 * Maps to Go service.DowntimeWindow.
 */
@Serializable
data class DowntimeWindow(
    @SerialName("days_of_week")
    val daysOfWeek: List<String> = emptyList(),

    @SerialName("start_time")
    val startTime: String = "",

    @SerialName("end_time")
    val endTime: String = ""
)

/**
 * Weekly schedule configuration with separate weekday/weekend time ranges.
 * Maps to Go service.ScheduleConfig.
 */
@Serializable
data class ScheduleConfig(
    @SerialName("weekday")
    val weekday: ScheduleDay,

    @SerialName("weekend")
    val weekend: ScheduleDay
)

/**
 * A time range within a day (start/end in "HH:mm" format).
 * Maps to Go service.TimeRange.
 */
@Serializable
data class ScheduleDay(
    @SerialName("start")
    val start: String,

    @SerialName("end")
    val end: String
)

/**
 * Purchase restriction configuration.
 * Maps to Go service.Purchases.
 */
@Serializable
data class Purchases(
    @SerialName("require_approval")
    val requireApproval: Boolean = false,

    @SerialName("block_iap")
    val blockIap: Boolean = false,

    @SerialName("spending_cap_usd")
    val spendingCapUsd: Double = 0.0
)

/**
 * Privacy control configuration.
 * Maps to Go service.Privacy.
 */
@Serializable
data class Privacy(
    @SerialName("location_sharing_enabled")
    val locationSharingEnabled: Boolean = false,

    @SerialName("profile_visibility")
    val profileVisibility: String = "",

    @SerialName("account_creation_approval")
    val accountCreationApproval: Boolean = false,

    @SerialName("data_sharing_restricted")
    val dataSharingRestricted: Boolean = false
)

/**
 * Social interaction controls.
 * Maps to Go service.Social.
 */
@Serializable
data class Social(
    @SerialName("chat_mode")
    val chatMode: String = "",

    @SerialName("dm_restriction")
    val dmRestriction: String = "",

    @SerialName("multiplayer_mode")
    val multiplayerMode: String = ""
)

/**
 * Notification controls — curfew hours and usage timer intervals.
 * Named PhosraNotifications to avoid conflict with android.app.Notification.
 * Maps to Go service.Notifications.
 */
@Serializable
data class PhosraNotifications(
    @SerialName("curfew_start")
    val curfewStart: String = "",

    @SerialName("curfew_end")
    val curfewEnd: String = "",

    @SerialName("usage_timer_minutes")
    val usageTimerMinutes: Int = 0
)

/**
 * Web content filtering configuration.
 * Maps to Go service.WebFilter.
 */
@Serializable
data class WebFilter(
    @SerialName("level")
    val level: String = "",

    @SerialName("safe_search")
    val safeSearch: Boolean = false,

    @SerialName("blocked_domains")
    val blockedDomains: List<String> = emptyList(),

    @SerialName("allowed_domains")
    val allowedDomains: List<String> = emptyList(),

    @SerialName("blocked_categories")
    val blockedCategories: List<String> = emptyList()
)
