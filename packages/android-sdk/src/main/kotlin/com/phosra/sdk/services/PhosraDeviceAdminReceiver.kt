package com.phosra.sdk.services

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.Toast

/**
 * Device admin receiver for Phosra parental controls.
 *
 * Device admin provides access to:
 * - App restriction policies (when Device Owner)
 * - Password/PIN enforcement
 * - Camera disable
 * - Keyguard feature control
 * - Factory reset protection
 *
 * There are two levels of device admin on Android:
 *
 * 1. **Device Admin** (what this provides by default):
 *    - Basic policy control: password requirements, lock, wipe
 *    - Cannot restrict app installations or add user restrictions
 *    - Activated via Settings > Security > Device Admin Apps
 *
 * 2. **Device Owner** (requires special provisioning):
 *    - Full policy control: app restrictions, user restrictions, kiosk mode
 *    - Must be set during initial device setup (via NFC, QR code, or adb)
 *    - Cannot be activated on a device that already has user accounts
 *    - This is the ideal mode for parental control apps
 *
 * Setup as Device Owner (for maximum enforcement):
 * ```
 * adb shell dpm set-device-owner com.phosra.sdk/.services.PhosraDeviceAdminReceiver
 * ```
 *
 * TODO: Implement NFC/QR provisioning for Device Owner setup during
 *       child device onboarding flow.
 */
class PhosraDeviceAdminReceiver : DeviceAdminReceiver() {

    companion object {
        private const val TAG = "PhosraDeviceAdmin"
    }

    /**
     * Called when the device admin is activated by the user.
     */
    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Log.i(TAG, "Device admin enabled")
        Toast.makeText(
            context,
            "Phosra device admin activated",
            Toast.LENGTH_SHORT
        ).show()
    }

    /**
     * Called when the device admin is deactivated.
     * This means parental controls that require device admin will stop working.
     */
    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Log.w(TAG, "Device admin disabled — some parental controls will be reduced")
        Toast.makeText(
            context,
            "Phosra device admin deactivated. Some parental controls have been disabled.",
            Toast.LENGTH_LONG
        ).show()

        // TODO: Notify the server that device admin has been deactivated.
        //       This is a significant security event — the parent should be
        //       alerted that the child may have disabled parental controls.
        //       Consider triggering an immediate policy sync to report the change.
    }

    /**
     * Called when the user attempts to disable the device admin.
     * Provides a warning message shown in the confirmation dialog.
     */
    override fun onDisableRequested(context: Context, intent: Intent): CharSequence {
        return "Disabling Phosra will remove parental controls from this device. " +
            "Your parent/guardian will be notified."
    }

    /**
     * Called when a password change is detected.
     */
    override fun onPasswordChanged(context: Context, intent: Intent) {
        super.onPasswordChanged(context, intent)
        Log.i(TAG, "Device password changed")
        // TODO: Report password change event to the server
    }

    /**
     * Called when too many failed password attempts occur.
     */
    override fun onPasswordFailed(context: Context, intent: Intent) {
        super.onPasswordFailed(context, intent)
        Log.w(TAG, "Password attempt failed")
        // TODO: Report failed password attempt — could indicate tampering
    }

    /**
     * Called when the password is entered successfully.
     */
    override fun onPasswordSucceeded(context: Context, intent: Intent) {
        super.onPasswordSucceeded(context, intent)
        Log.d(TAG, "Password succeeded")
    }
}
