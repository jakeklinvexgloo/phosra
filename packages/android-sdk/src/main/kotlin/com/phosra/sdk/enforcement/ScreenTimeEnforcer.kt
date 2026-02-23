package com.phosra.sdk.enforcement

import android.app.AlarmManager
import android.app.PendingIntent
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import com.phosra.sdk.models.DowntimeWindow
import com.phosra.sdk.models.PerAppLimit
import com.phosra.sdk.models.ScreenTime
import java.util.Calendar
import java.util.concurrent.TimeUnit

/**
 * Enforces screen time limits using Android's UsageStatsManager.
 *
 * Capabilities:
 * - Track total daily device usage
 * - Enforce daily_limit_minutes (block all non-exempt apps when exceeded)
 * - Apply per_app_limits (block specific apps when their limit is reached)
 * - Handle downtime_windows (block during specified hours/days)
 * - Schedule alarms for limit warnings (5 min / 1 min before limit)
 *
 * Required permissions:
 * - PACKAGE_USAGE_STATS (Settings > Apps > Usage Access)
 *
 * TODO: Full implementation requires a persistent foreground service to
 *       continuously track usage. The AccessibilityService can supplement
 *       by detecting app switches.
 */
class ScreenTimeEnforcer(private val context: Context) {

    private var currentScreenTime: ScreenTime? = null
    private var isTracking = false

    companion object {
        private const val PREFS_NAME = "phosra_screen_time"
        private const val KEY_DAILY_USAGE_MS = "daily_usage_ms"
        private const val KEY_LAST_RESET_DATE = "last_reset_date"
        private const val WARNING_5_MIN_REQUEST_CODE = 20001
        private const val WARNING_1_MIN_REQUEST_CODE = 20002
        private const val LIMIT_REACHED_REQUEST_CODE = 20003
    }

    /**
     * Apply screen time rules from the compiled policy.
     *
     * @param screenTime The screen time configuration.
     * @return A [CategoryReport] describing the enforcement result.
     */
    fun apply(screenTime: ScreenTime): CategoryReport {
        currentScreenTime = screenTime

        if (!hasUsageStatsPermission()) {
            return CategoryReport(
                status = EnforcementStatus.FAILED,
                framework = "UsageStatsManager",
                details = "PACKAGE_USAGE_STATS permission not granted"
            )
        }

        // Reset daily usage counter if new day
        resetDailyUsageIfNeeded()

        // Start tracking usage
        startTracking(screenTime)

        // Schedule limit warning alarms
        if (screenTime.dailyLimitMinutes > 0) {
            scheduleLimitWarnings(screenTime.dailyLimitMinutes)
        }

        val details = buildString {
            if (screenTime.dailyLimitMinutes > 0) {
                append("Daily limit: ${screenTime.dailyLimitMinutes}min. ")
            }
            if (screenTime.perAppLimits.isNotEmpty()) {
                append("Per-app limits: ${screenTime.perAppLimits.size} apps. ")
            }
            if (screenTime.downtimeWindows.isNotEmpty()) {
                append("Downtime windows: ${screenTime.downtimeWindows.size}. ")
            }
            if (screenTime.schedule != null) {
                append("Schedule configured. ")
            }
            if (screenTime.alwaysAllowedApps.isNotEmpty()) {
                append("Always allowed: ${screenTime.alwaysAllowedApps.size} apps.")
            }
        }

        return CategoryReport(
            status = EnforcementStatus.ENFORCED,
            framework = "UsageStatsManager + AlarmManager",
            details = details.trim()
        )
    }

    /**
     * Remove all screen time restrictions and stop tracking.
     */
    fun remove() {
        stopTracking()
        cancelLimitWarnings()
        currentScreenTime = null
    }

    /**
     * Get the current enforcement status.
     */
    fun currentStatus(): CategoryReport {
        return if (currentScreenTime != null && isTracking) {
            val usedMinutes = getTodayUsageMinutes()
            val limit = currentScreenTime?.dailyLimitMinutes ?: 0
            CategoryReport(
                status = EnforcementStatus.ENFORCED,
                framework = "UsageStatsManager",
                details = "Used ${usedMinutes}min" +
                    if (limit > 0) " / ${limit}min limit" else ""
            )
        } else {
            CategoryReport(
                status = EnforcementStatus.PENDING,
                framework = "UsageStatsManager",
                details = "Screen time tracking not active"
            )
        }
    }

    /**
     * Get total device usage for today in minutes.
     *
     * Queries UsageStatsManager for aggregate app usage since midnight.
     * Excludes always-allowed apps from the total.
     */
    fun getTodayUsageMinutes(): Long {
        val usageStatsManager =
            context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        val alwaysAllowed = currentScreenTime?.alwaysAllowedApps?.toSet() ?: emptySet()

        val totalMs = stats
            .filter { it.packageName !in alwaysAllowed }
            .sumOf { it.totalTimeInForeground }

        return TimeUnit.MILLISECONDS.toMinutes(totalMs)
    }

    /**
     * Get usage for a specific app today in minutes.
     */
    fun getAppUsageMinutes(packageName: String): Long {
        val usageStatsManager =
            context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            calendar.timeInMillis,
            System.currentTimeMillis()
        )

        val appStats = stats.firstOrNull { it.packageName == packageName }
        return TimeUnit.MILLISECONDS.toMinutes(appStats?.totalTimeInForeground ?: 0)
    }

    /**
     * Check if the daily limit has been exceeded.
     */
    fun isDailyLimitExceeded(): Boolean {
        val limit = currentScreenTime?.dailyLimitMinutes ?: return false
        if (limit <= 0) return false
        return getTodayUsageMinutes() >= limit
    }

    /**
     * Check if a specific app has exceeded its per-app limit.
     */
    fun isAppLimitExceeded(packageName: String): Boolean {
        val perAppLimit = currentScreenTime?.perAppLimits
            ?.firstOrNull { it.bundleId == packageName }
            ?: return false

        return getAppUsageMinutes(packageName) >= perAppLimit.dailyMinutes
    }

    /**
     * Check if the device is currently in a downtime window.
     */
    fun isInDowntime(): Boolean {
        val windows = currentScreenTime?.downtimeWindows ?: return false
        if (windows.isEmpty()) return false

        val now = Calendar.getInstance()
        val dayOfWeek = getDayOfWeekString(now.get(Calendar.DAY_OF_WEEK))
        val currentTime = String.format("%02d:%02d", now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE))

        return windows.any { window ->
            dayOfWeek in window.daysOfWeek &&
                currentTime >= window.startTime &&
                currentTime < window.endTime
        }
    }

    // ── Private helpers ────────────────────────────────────────────

    private fun startTracking(screenTime: ScreenTime) {
        // TODO: Start a foreground service that periodically:
        //       1. Queries UsageStatsManager for current usage
        //       2. Compares against daily_limit_minutes
        //       3. Checks per_app_limits for the foreground app
        //       4. Checks if currently in a downtime_window
        //       5. Triggers app blocking overlay when limits are exceeded
        //
        //       Polling interval: ~30 seconds for responsive enforcement.
        //       Alternatively, use AccessibilityService window events as triggers.
        isTracking = true
    }

    private fun stopTracking() {
        // TODO: Stop the tracking foreground service
        isTracking = false
    }

    private fun scheduleLimitWarnings(dailyLimitMinutes: Int) {
        val usedMinutes = getTodayUsageMinutes()
        val remainingMinutes = dailyLimitMinutes - usedMinutes

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        // Schedule 5-minute warning
        if (remainingMinutes > 5) {
            val warningTime = System.currentTimeMillis() +
                TimeUnit.MINUTES.toMillis(remainingMinutes - 5)
            val intent = createWarningIntent("5_min_warning")
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                WARNING_5_MIN_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                warningTime,
                pendingIntent
            )
        }

        // Schedule 1-minute warning
        if (remainingMinutes > 1) {
            val warningTime = System.currentTimeMillis() +
                TimeUnit.MINUTES.toMillis(remainingMinutes - 1)
            val intent = createWarningIntent("1_min_warning")
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                WARNING_1_MIN_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                warningTime,
                pendingIntent
            )
        }
    }

    private fun cancelLimitWarnings() {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        listOf(WARNING_5_MIN_REQUEST_CODE, WARNING_1_MIN_REQUEST_CODE, LIMIT_REACHED_REQUEST_CODE)
            .forEach { requestCode ->
                val intent = createWarningIntent("")
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                alarmManager.cancel(pendingIntent)
            }
    }

    private fun createWarningIntent(warningType: String): Intent {
        return Intent("com.phosra.sdk.SCREEN_TIME_WARNING").apply {
            setPackage(context.packageName)
            putExtra("warning_type", warningType)
        }
    }

    private fun resetDailyUsageIfNeeded() {
        val prefs = getPrefs()
        val today = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
        val lastReset = prefs.getInt(KEY_LAST_RESET_DATE, -1)

        if (today != lastReset) {
            prefs.edit()
                .putLong(KEY_DAILY_USAGE_MS, 0)
                .putInt(KEY_LAST_RESET_DATE, today)
                .apply()
        }
    }

    private fun getPrefs(): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    private fun getDayOfWeekString(calendarDay: Int): String {
        return when (calendarDay) {
            Calendar.MONDAY -> "monday"
            Calendar.TUESDAY -> "tuesday"
            Calendar.WEDNESDAY -> "wednesday"
            Calendar.THURSDAY -> "thursday"
            Calendar.FRIDAY -> "friday"
            Calendar.SATURDAY -> "saturday"
            Calendar.SUNDAY -> "sunday"
            else -> ""
        }
    }

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
        val mode = appOps.unsafeCheckOpNoThrow(
            android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            context.packageName
        )
        return mode == android.app.AppOpsManager.MODE_ALLOWED
    }
}
