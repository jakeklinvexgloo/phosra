package com.phosra.sdk

import com.phosra.sdk.models.CompiledPolicy
import com.phosra.sdk.models.DeviceReport
import com.phosra.sdk.models.PolicyAckRequest
import com.phosra.sdk.models.RegisterDeviceRequest
import com.phosra.sdk.models.RegisterDeviceResponse
import com.phosra.sdk.networking.ApiClient
import com.phosra.sdk.networking.PhosraApiError

/**
 * Main entry point for the Phosra Android SDK.
 *
 * Provides two factory methods:
 * - [forParent]: For parent-initiated operations (device registration).
 * - [forDevice]: For device-authenticated operations (policy fetch, reporting).
 *
 * All methods are suspend functions designed for use with Kotlin coroutines.
 *
 * Usage:
 * ```kotlin
 * // Parent registering a new device
 * val parentClient = PhosraClient.forParent(token = "jwt-token-here")
 * val response = parentClient.registerDevice(childId = "child-uuid", request = ...)
 *
 * // Device fetching and applying policy
 * val deviceClient = PhosraClient.forDevice(deviceKey = response.apiKey)
 * val policy = deviceClient.fetchPolicy()
 * ```
 */
class PhosraClient private constructor(private val config: PhosraConfiguration) {

    private val apiClient = ApiClient(config)

    companion object {
        /**
         * Create a client authenticated as a parent (bearer token).
         * Used for device registration and management.
         */
        fun forParent(
            token: String,
            baseUrl: String = PhosraConfiguration.DEFAULT_BASE_URL
        ): PhosraClient {
            return PhosraClient(
                PhosraConfiguration(
                    baseUrl = baseUrl,
                    parentToken = token
                )
            )
        }

        /**
         * Create a client authenticated as a device (X-Device-Key header).
         * Used for policy fetching, report submission, and policy acknowledgment.
         */
        fun forDevice(
            deviceKey: String,
            baseUrl: String = PhosraConfiguration.DEFAULT_BASE_URL
        ): PhosraClient {
            return PhosraClient(
                PhosraConfiguration(
                    baseUrl = baseUrl,
                    deviceKey = deviceKey
                )
            )
        }
    }

    /**
     * Register a new device for a child.
     * Requires parent authentication (use [forParent]).
     *
     * @param childId UUID of the child to register the device for.
     * @param request Device registration details (name, model, OS, etc.).
     * @return Registration response containing the device info and one-time API key.
     * @throws PhosraApiError on failure.
     */
    suspend fun registerDevice(
        childId: String,
        request: RegisterDeviceRequest
    ): RegisterDeviceResponse {
        val body = apiClient.json.encodeToString(request)
        val responseBody = apiClient.post("/children/$childId/devices", body)
            ?: throw PhosraApiError.HttpError(500, "Empty response from register device")

        return try {
            apiClient.json.decodeFromString<RegisterDeviceResponse>(responseBody)
        } catch (e: Exception) {
            throw PhosraApiError.DecodingError(e)
        }
    }

    /**
     * Fetch the compiled policy for this device.
     * Requires device authentication (use [forDevice]).
     *
     * Supports conditional fetching: if [sinceVersion] is provided and the server
     * has no newer policy, this returns null (304 Not Modified).
     *
     * @param sinceVersion If provided, only return policy if version > sinceVersion.
     * @return The compiled policy, or null if the policy hasn't changed.
     * @throws PhosraApiError on failure.
     */
    suspend fun fetchPolicy(sinceVersion: Int? = null): CompiledPolicy? {
        val queryParams = mutableMapOf<String, String>()
        sinceVersion?.let { queryParams["since_version"] = it.toString() }

        val responseBody = try {
            apiClient.get("/device/policy", queryParams)
        } catch (e: PhosraApiError.NotModified) {
            return null
        }

        // null response means 304 Not Modified
        if (responseBody == null) return null

        return try {
            apiClient.json.decodeFromString<CompiledPolicy>(responseBody)
        } catch (e: Exception) {
            throw PhosraApiError.DecodingError(e)
        }
    }

    /**
     * Submit an enforcement or activity report from this device.
     * Requires device authentication (use [forDevice]).
     *
     * @param report The report to submit (enforcement status, screen time, etc.).
     * @throws PhosraApiError on failure.
     */
    suspend fun submitReport(report: DeviceReport) {
        val body = apiClient.json.encodeToString(report)
        apiClient.post("/device/report", body)
    }

    /**
     * Acknowledge that a policy version has been applied on this device.
     * Requires device authentication (use [forDevice]).
     *
     * Call this after successfully applying a new policy to update the server's
     * record of what version this device is running.
     *
     * @param version The policy version that was applied.
     * @throws PhosraApiError on failure.
     */
    suspend fun acknowledgePolicy(version: Int) {
        val body = apiClient.json.encodeToString(PolicyAckRequest(version))
        apiClient.post("/device/ack", body)
    }
}
