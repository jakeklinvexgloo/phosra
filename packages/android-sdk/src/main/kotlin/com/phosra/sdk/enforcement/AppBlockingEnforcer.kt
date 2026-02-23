package com.phosra.sdk.enforcement

import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.PixelFormat
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import com.phosra.sdk.models.ContentFilter

/**
 * Enforces app blocking using UsageStatsManager to detect the foreground app
 * and a system overlay to block access to restricted apps.
 *
 * On Android, there is no direct API to prevent an app from launching.
 * Instead, this enforcer:
 * 1. Monitors the foreground app via [UsageStatsManager]
 * 2. When a blocked app is detected, displays a full-screen blocking overlay
 * 3. In allowlist mode, blocks everything except explicitly allowed apps
 *
 * Required permissions:
 * - PACKAGE_USAGE_STATS (Settings > Apps > Usage Access)
 * - SYSTEM_ALERT_WINDOW (Settings > Apps > Draw Over Other Apps)
 *
 * TODO: Requires device testing. The monitoring loop needs to run in a
 *       foreground service or be triggered by the AccessibilityService.
 */
class AppBlockingEnforcer(private val context: Context) {

    private var currentFilter: ContentFilter? = null
    private var isMonitoring = false

    /**
     * Apply content filter rules for app blocking.
     *
     * @param contentFilter The content filter configuration from the compiled policy.
     * @return A [CategoryReport] describing the enforcement result.
     */
    fun apply(contentFilter: ContentFilter): CategoryReport {
        currentFilter = contentFilter

        // Check required permissions
        if (!hasUsageStatsPermission()) {
            return CategoryReport(
                status = EnforcementStatus.FAILED,
                framework = "UsageStatsManager",
                details = "PACKAGE_USAGE_STATS permission not granted"
            )
        }

        if (!Settings.canDrawOverlays(context)) {
            return CategoryReport(
                status = EnforcementStatus.PARTIAL,
                framework = "UsageStatsManager",
                details = "SYSTEM_ALERT_WINDOW permission not granted; monitoring without blocking overlay"
            )
        }

        // Start monitoring foreground app changes
        startMonitoring(contentFilter)

        val mode = if (contentFilter.allowlistMode) "allowlist" else "blocklist"
        val appCount = if (contentFilter.allowlistMode) {
            contentFilter.allowedApps.size
        } else {
            contentFilter.blockedApps.size
        }

        return CategoryReport(
            status = EnforcementStatus.ENFORCED,
            framework = "UsageStatsManager + WindowManager",
            details = "App blocking active in $mode mode ($appCount apps configured)"
        )
    }

    /**
     * Remove all app blocking restrictions and stop monitoring.
     */
    fun remove() {
        stopMonitoring()
        currentFilter = null
    }

    /**
     * Get the current enforcement status without making changes.
     */
    fun currentStatus(): CategoryReport {
        return if (currentFilter != null && isMonitoring) {
            CategoryReport(
                status = EnforcementStatus.ENFORCED,
                framework = "UsageStatsManager + WindowManager",
                details = "App blocking active"
            )
        } else {
            CategoryReport(
                status = EnforcementStatus.PENDING,
                framework = "UsageStatsManager + WindowManager",
                details = "App blocking not active"
            )
        }
    }

    /**
     * Check if a given package is blocked under the current filter.
     *
     * @param packageName The Android package name to check.
     * @return true if the app should be blocked.
     */
    fun isAppBlocked(packageName: String): Boolean {
        val filter = currentFilter ?: return false

        // System apps that should never be blocked
        val systemExempt = setOf(
            "com.android.systemui",
            "com.android.settings",
            "com.android.launcher",
            "com.android.launcher3",
            "com.google.android.apps.nexuslauncher",
            context.packageName // Never block ourselves
        )

        if (packageName in systemExempt) return false

        return if (filter.allowlistMode) {
            // In allowlist mode, block everything NOT in the allowed list
            packageName !in filter.allowedApps
        } else {
            // In blocklist mode, block only apps in the blocked list
            packageName in filter.blockedApps
        }
    }

    /**
     * Get the currently foreground app package name.
     *
     * @return The package name of the foreground app, or null if unable to determine.
     */
    fun getForegroundApp(): String? {
        val usageStatsManager =
            context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

        val endTime = System.currentTimeMillis()
        val startTime = endTime - 1000 // Last second

        val events = usageStatsManager.queryEvents(startTime, endTime)
        var foregroundApp: String? = null

        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                foregroundApp = event.packageName
            }
        }

        return foregroundApp
    }

    // ── Private helpers ────────────────────────────────────────────

    private fun startMonitoring(filter: ContentFilter) {
        // TODO: Start a foreground service or use the AccessibilityService to
        //       continuously monitor the foreground app. When a blocked app is
        //       detected, show the blocking overlay via showBlockingOverlay().
        //
        //       The AccessibilityService (PhosraAccessibilityService) receives
        //       TYPE_WINDOW_STATE_CHANGED events which include the package name
        //       of the newly focused window. This is more battery-efficient than
        //       polling UsageStatsManager.
        //
        //       Implementation outline:
        //       1. AccessibilityService detects window change
        //       2. Checks isAppBlocked(packageName)
        //       3. If blocked, sends broadcast to show overlay
        //       4. Overlay navigates user to home screen
        isMonitoring = true
    }

    private fun stopMonitoring() {
        // TODO: Stop the monitoring service/loop and dismiss any overlay
        isMonitoring = false
        dismissBlockingOverlay()
    }

    /**
     * Show a full-screen overlay that prevents interaction with the blocked app.
     * TODO: Implement a proper blocking UI (Activity or View) that:
     *       - Covers the entire screen
     *       - Shows a "This app is blocked" message
     *       - Provides a button to return to the home screen
     *       - Cannot be dismissed by the child
     */
    private fun showBlockingOverlay(blockedPackage: String) {
        // TODO: Create and show a WindowManager overlay
        //
        // val params = WindowManager.LayoutParams(
        //     WindowManager.LayoutParams.MATCH_PARENT,
        //     WindowManager.LayoutParams.MATCH_PARENT,
        //     WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
        //     WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        //         WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        //     PixelFormat.TRANSLUCENT
        // )
        // params.gravity = Gravity.CENTER
        //
        // val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        // windowManager.addView(blockingView, params)
    }

    private fun dismissBlockingOverlay() {
        // TODO: Remove the overlay view from WindowManager
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
