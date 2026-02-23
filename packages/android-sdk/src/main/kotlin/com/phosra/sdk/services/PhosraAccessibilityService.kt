package com.phosra.sdk.services

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.phosra.sdk.enforcement.AppBlockingEnforcer

/**
 * Accessibility service for monitoring foreground app changes.
 *
 * This is the most battery-efficient way to detect when a blocked app
 * comes to the foreground on Android. The service receives
 * TYPE_WINDOW_STATE_CHANGED events containing the package name of
 * the newly focused window.
 *
 * When a blocked app is detected:
 * 1. The [AppBlockingEnforcer] checks if the package is blocked
 * 2. If blocked, a full-screen overlay is shown to prevent interaction
 * 3. The user is navigated back to the home screen
 *
 * Required permissions:
 * - BIND_ACCESSIBILITY_SERVICE (Settings > Accessibility > Phosra)
 *
 * Note: Google Play has strict policies around accessibility service usage.
 * The app must clearly explain why this permission is needed during the
 * setup flow and in the Play Store listing.
 *
 * TODO: Requires device testing. The blocking overlay integration with
 *       AppBlockingEnforcer needs to be wired up after the overlay UI
 *       is implemented.
 */
class PhosraAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "PhosraAccessibility"

        @Volatile
        var isRunning = false
            private set

        /**
         * Listener for foreground app changes.
         * Set by the enforcement engine to receive app change notifications.
         */
        var onAppChangedListener: ((String) -> Unit)? = null
    }

    private var appBlocker: AppBlockingEnforcer? = null
    private var lastPackageName: String? = null

    override fun onServiceConnected() {
        super.onServiceConnected()

        // Configure the service to receive window state changes
        val info = serviceInfo ?: AccessibilityServiceInfo()
        info.apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            notificationTimeout = 300
        }
        serviceInfo = info

        appBlocker = AppBlockingEnforcer(this)
        isRunning = true

        Log.i(TAG, "Accessibility service connected")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                val packageName = event.packageName?.toString() ?: return

                // Only process if the foreground app actually changed
                if (packageName == lastPackageName) return
                lastPackageName = packageName

                Log.d(TAG, "Foreground app changed: $packageName")

                // Notify the listener
                onAppChangedListener?.invoke(packageName)

                // Check if the app should be blocked
                val blocker = appBlocker ?: return
                if (blocker.isAppBlocked(packageName)) {
                    Log.i(TAG, "Blocked app detected: $packageName")
                    handleBlockedApp(packageName)
                }
            }
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "Accessibility service interrupted")
    }

    override fun onDestroy() {
        isRunning = false
        onAppChangedListener = null
        Log.i(TAG, "Accessibility service destroyed")
        super.onDestroy()
    }

    /**
     * Handle detection of a blocked app in the foreground.
     *
     * Strategy:
     * 1. Show blocking overlay (via AppBlockingEnforcer)
     * 2. Navigate user to home screen
     * 3. Optionally report the violation
     */
    private fun handleBlockedApp(packageName: String) {
        // TODO: Show the blocking overlay via AppBlockingEnforcer
        //       The overlay should cover the entire screen and show a
        //       "This app is blocked" message with a button to go home.

        // Navigate to home screen by performing the global HOME action
        performGlobalAction(GLOBAL_ACTION_HOME)

        Log.i(TAG, "Navigated away from blocked app: $packageName")

        // TODO: Report the violation to the server via EnforcementReporter
        //       This would require the reporter to be accessible from this service.
        //       Consider using a local broadcast or an event bus.
    }
}
