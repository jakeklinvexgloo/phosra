package com.phosra.sdk

/**
 * Configuration for the Phosra SDK client.
 *
 * @param baseUrl The base URL for the Phosra API. Defaults to production.
 * @param deviceKey The device API key obtained during registration (for device auth).
 * @param parentToken The parent's bearer token (for parent-initiated actions like registration).
 * @param childId The ID of the child this device is registered for.
 */
data class PhosraConfiguration(
    val baseUrl: String = DEFAULT_BASE_URL,
    val deviceKey: String? = null,
    val parentToken: String? = null,
    val childId: String? = null
) {
    companion object {
        const val DEFAULT_BASE_URL = "https://phosra-api-production.up.railway.app/api/v1"
    }

    /**
     * Returns true if this configuration has device-level authentication.
     */
    val hasDeviceAuth: Boolean
        get() = !deviceKey.isNullOrBlank()

    /**
     * Returns true if this configuration has parent-level authentication.
     */
    val hasParentAuth: Boolean
        get() = !parentToken.isNullOrBlank()
}
