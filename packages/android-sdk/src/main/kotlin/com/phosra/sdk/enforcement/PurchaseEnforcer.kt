package com.phosra.sdk.enforcement

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.UserManager
import com.phosra.sdk.models.Purchases
import com.phosra.sdk.services.PhosraDeviceAdminReceiver

/**
 * Enforces purchase restrictions on the device.
 *
 * Strategy:
 * - Uses DevicePolicyManager to apply user restrictions when device admin is active
 * - Can disable Google Play Store in-app purchases via UserManager restrictions
 * - Spending cap tracking is handled server-side (no on-device enforcement)
 *
 * Required permissions:
 * - Device Admin (user must activate via Settings > Security > Device Admins)
 *
 * Limitations:
 * - Android does not provide an API to intercept individual Play Store purchases
 * - "Require approval" is best enforced via Google Family Link integration
 * - Block IAP can only be achieved with Device Admin or MDM profile
 *
 * TODO: Consider integrating with Google Play Billing Library to observe
 *       purchase events and report them to the server for spending cap tracking.
 */
class PurchaseEnforcer(private val context: Context) {

    private var currentConfig: Purchases? = null

    /**
     * Apply purchase restrictions from the compiled policy.
     *
     * @param purchases The purchase configuration.
     * @return A [CategoryReport] describing the enforcement result.
     */
    fun apply(purchases: Purchases): CategoryReport {
        currentConfig = purchases

        // Check if there's anything to enforce
        if (!purchases.requireApproval && !purchases.blockIap && purchases.spendingCapUsd <= 0) {
            return CategoryReport(
                status = EnforcementStatus.ENFORCED,
                framework = "DevicePolicyManager",
                details = "No purchase restrictions configured"
            )
        }

        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val adminComponent = ComponentName(context, PhosraDeviceAdminReceiver::class.java)
        val isAdmin = dpm.isAdminActive(adminComponent)

        val enforced = mutableListOf<String>()
        val partial = mutableListOf<String>()

        // Block in-app purchases
        if (purchases.blockIap) {
            if (isAdmin) {
                // TODO: With Device Owner or Profile Owner, we can restrict
                //       app installations and in-app purchases via:
                //       dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_INSTALL_APPS)
                //
                //       Standard device admin cannot add user restrictions.
                //       This requires the app to be a Device Owner (set up via adb or NFC provisioning).
                partial.add("Block IAP (requires Device Owner)")
            } else {
                partial.add("Block IAP (device admin not active)")
            }
        }

        // Require purchase approval
        if (purchases.requireApproval) {
            // Android doesn't have a native API for purchase approval workflows.
            // This is best handled via Google Family Link or server-side.
            partial.add("Purchase approval (server-side only)")
        }

        // Spending cap
        if (purchases.spendingCapUsd > 0) {
            // Spending cap is tracked server-side by aggregating purchase reports.
            // No on-device enforcement mechanism available.
            partial.add("Spending cap \$${purchases.spendingCapUsd} (server-side tracking)")
        }

        val status = if (enforced.isNotEmpty() && partial.isEmpty()) {
            EnforcementStatus.ENFORCED
        } else if (enforced.isNotEmpty() || partial.isNotEmpty()) {
            EnforcementStatus.PARTIAL
        } else {
            EnforcementStatus.UNSUPPORTED
        }

        val details = buildString {
            if (enforced.isNotEmpty()) append("Enforced: ${enforced.joinToString(", ")}. ")
            if (partial.isNotEmpty()) append("Partial: ${partial.joinToString(", ")}.")
        }

        return CategoryReport(
            status = status,
            framework = "DevicePolicyManager",
            details = details.trim()
        )
    }

    /**
     * Remove all purchase restrictions.
     */
    fun remove() {
        // TODO: Remove any user restrictions applied via DevicePolicyManager
        currentConfig = null
    }

    /**
     * Get the current enforcement status.
     */
    fun currentStatus(): CategoryReport {
        return if (currentConfig != null) {
            CategoryReport(
                status = EnforcementStatus.PARTIAL,
                framework = "DevicePolicyManager",
                details = "Purchase restrictions configured (enforcement limited on Android)"
            )
        } else {
            CategoryReport(
                status = EnforcementStatus.PENDING,
                framework = "DevicePolicyManager",
                details = "No purchase restrictions"
            )
        }
    }
}
