package com.phosra.sdk.enforcement

import android.app.Activity
import android.app.AppOpsManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.phosra.sdk.models.CompiledPolicy
import com.phosra.sdk.services.PhosraDeviceAdminReceiver

/**
 * Main orchestrator for on-device policy enforcement.
 *
 * Coordinates all enforcement sub-systems:
 * - [AppBlockingEnforcer]: Blocks/allows apps via UsageStatsManager + overlay
 * - [ScreenTimeEnforcer]: Tracks and limits screen time via UsageStatsManager
 * - [WebFilterEnforcer]: DNS-based web content filtering via local VPN
 * - [PurchaseEnforcer]: Play Store purchase restrictions
 * - [NotificationEnforcer]: Notification curfew and filtering
 *
 * Usage:
 * ```kotlin
 * val engine = EnforcementEngine(context)
 * if (!engine.hasRequiredPermissions().allGranted) {
 *     engine.requestPermissions(activity)
 * }
 * val report = engine.applyPolicy(policy)
 * ```
 */
class EnforcementEngine(private val context: Context) {

    private val appBlocker = AppBlockingEnforcer(context)
    private val screenTime = ScreenTimeEnforcer(context)
    private val webFilter = WebFilterEnforcer(context)
    private val purchases = PurchaseEnforcer(context)
    private val notifications = NotificationEnforcer(context)

    /**
     * Apply a compiled policy to the device.
     * Each enforcement subsystem is applied independently; failures in one
     * do not prevent others from executing.
     *
     * @param policy The compiled policy from the Phosra API.
     * @return An [EnforcementReport] summarizing the result of each category.
     */
    fun applyPolicy(policy: CompiledPolicy): EnforcementReport {
        val contentFilterReport = try {
            appBlocker.apply(policy.contentFilter)
        } catch (e: Exception) {
            CategoryReport(
                status = EnforcementStatus.FAILED,
                framework = "UsageStatsManager",
                details = "Content filter enforcement failed",
                error = e
            )
        }

        val screenTimeReport = try {
            screenTime.apply(policy.screenTime)
        } catch (e: Exception) {
            CategoryReport(
                status = EnforcementStatus.FAILED,
                framework = "UsageStatsManager",
                details = "Screen time enforcement failed",
                error = e
            )
        }

        val webFilterReport = try {
            webFilter.apply(policy.webFilter)
        } catch (e: Exception) {
            CategoryReport(
                status = EnforcementStatus.FAILED,
                framework = "VpnService",
                details = "Web filter enforcement failed",
                error = e
            )
        }

        val purchasesReport = try {
            purchases.apply(policy.purchases)
        } catch (e: Exception) {
            CategoryReport(
                status = EnforcementStatus.FAILED,
                framework = "DevicePolicyManager",
                details = "Purchase enforcement failed",
                error = e
            )
        }

        val notificationsReport = try {
            notifications.apply(policy.notifications)
        } catch (e: Exception) {
            CategoryReport(
                status = EnforcementStatus.FAILED,
                framework = "NotificationListenerService",
                details = "Notification enforcement failed",
                error = e
            )
        }

        return EnforcementReport(
            contentFilter = contentFilterReport,
            screenTime = screenTimeReport,
            webFilter = webFilterReport,
            purchases = purchasesReport,
            notifications = notificationsReport
        )
    }

    /**
     * Remove all enforced restrictions and stop enforcement services.
     */
    fun removeAllRestrictions() {
        appBlocker.remove()
        screenTime.remove()
        webFilter.remove()
        purchases.remove()
        notifications.remove()
    }

    /**
     * Get the current enforcement status without applying any changes.
     */
    fun currentStatus(): EnforcementReport {
        return EnforcementReport(
            contentFilter = appBlocker.currentStatus(),
            screenTime = screenTime.currentStatus(),
            webFilter = webFilter.currentStatus(),
            purchases = purchases.currentStatus(),
            notifications = notifications.currentStatus()
        )
    }

    /**
     * Check which permissions have been granted for enforcement.
     */
    fun hasRequiredPermissions(): PermissionStatus {
        return PermissionStatus(
            usageStats = hasUsageStatsPermission(),
            overlay = hasOverlayPermission(),
            deviceAdmin = hasDeviceAdminPermission(),
            vpn = hasVpnPermission(),
            notifications = hasNotificationListenerPermission()
        )
    }

    /**
     * Launch system settings screens to request all required permissions.
     * Each permission requires its own system dialog / settings screen.
     *
     * @param activity The activity to launch permission requests from.
     */
    fun requestPermissions(activity: Activity) {
        val status = hasRequiredPermissions()

        if (!status.usageStats) {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            activity.startActivity(intent)
        }

        if (!status.overlay) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                android.net.Uri.parse("package:${context.packageName}")
            )
            activity.startActivity(intent)
        }

        if (!status.deviceAdmin) {
            val componentName = ComponentName(context, PhosraDeviceAdminReceiver::class.java)
            val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, componentName)
                putExtra(
                    DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                    "Phosra needs device admin access to enforce parental controls."
                )
            }
            activity.startActivity(intent)
        }

        if (!status.vpn) {
            val intent = VpnService.prepare(activity)
            if (intent != null) {
                activity.startActivityForResult(intent, REQUEST_CODE_VPN)
            }
        }

        if (!status.notifications) {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            activity.startActivity(intent)
        }
    }

    // ── Permission checks ──────────────────────────────────────────

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.unsafeCheckOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun hasOverlayPermission(): Boolean {
        return Settings.canDrawOverlays(context)
    }

    private fun hasDeviceAdminPermission(): Boolean {
        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val componentName = ComponentName(context, PhosraDeviceAdminReceiver::class.java)
        return dpm.isAdminActive(componentName)
    }

    private fun hasVpnPermission(): Boolean {
        // VPN permission is checked by calling VpnService.prepare()
        // which returns null if already granted. We can't check without an Activity,
        // so we assume granted if VPN was previously established.
        // TODO: Track VPN permission state in SharedPreferences after user grants it
        return true
    }

    private fun hasNotificationListenerPermission(): Boolean {
        val enabledListeners = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners"
        ) ?: return false
        return enabledListeners.contains(context.packageName)
    }

    companion object {
        const val REQUEST_CODE_VPN = 10001
    }
}

/**
 * Aggregated enforcement report across all categories.
 */
data class EnforcementReport(
    val contentFilter: CategoryReport = CategoryReport(),
    val screenTime: CategoryReport = CategoryReport(),
    val webFilter: CategoryReport = CategoryReport(),
    val purchases: CategoryReport = CategoryReport(),
    val notifications: CategoryReport = CategoryReport()
) {
    /**
     * Overall status: ENFORCED if all are enforced, PARTIAL if any are partial/failed,
     * FAILED if all have failed.
     */
    val overallStatus: EnforcementStatus
        get() {
            val statuses = listOf(
                contentFilter.status,
                screenTime.status,
                webFilter.status,
                purchases.status,
                notifications.status
            )
            return when {
                statuses.all { it == EnforcementStatus.ENFORCED } -> EnforcementStatus.ENFORCED
                statuses.all { it == EnforcementStatus.FAILED } -> EnforcementStatus.FAILED
                statuses.all { it == EnforcementStatus.PENDING } -> EnforcementStatus.PENDING
                else -> EnforcementStatus.PARTIAL
            }
        }
}

/**
 * Report for a single enforcement category.
 */
data class CategoryReport(
    val status: EnforcementStatus = EnforcementStatus.PENDING,
    val framework: String = "",
    val details: String = "",
    val error: Throwable? = null
)

/**
 * Status of a single enforcement category.
 */
enum class EnforcementStatus {
    /** Not yet attempted. */
    PENDING,

    /** Successfully enforced all rules in this category. */
    ENFORCED,

    /** Some rules enforced, some failed or unsupported. */
    PARTIAL,

    /** Enforcement failed entirely for this category. */
    FAILED,

    /** This enforcement category is not supported on this device/OS version. */
    UNSUPPORTED
}

/**
 * Status of all required permissions.
 */
data class PermissionStatus(
    val usageStats: Boolean = false,
    val overlay: Boolean = false,
    val deviceAdmin: Boolean = false,
    val vpn: Boolean = false,
    val notifications: Boolean = false
) {
    /** True if all required permissions are granted. */
    val allGranted: Boolean
        get() = usageStats && overlay && deviceAdmin && vpn && notifications

    /** List of permissions that are missing. */
    val missingPermissions: List<String>
        get() = buildList {
            if (!usageStats) add("Usage Stats Access")
            if (!overlay) add("Draw Over Other Apps")
            if (!deviceAdmin) add("Device Admin")
            if (!vpn) add("VPN")
            if (!notifications) add("Notification Listener")
        }
}
