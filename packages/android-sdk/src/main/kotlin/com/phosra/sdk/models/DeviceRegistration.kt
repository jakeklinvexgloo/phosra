package com.phosra.sdk.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request body for POST /children/{childID}/devices.
 * Maps to Go service.RegisterDeviceRequest, adapted for Android.
 */
@Serializable
data class RegisterDeviceRequest(
    @SerialName("device_name")
    val deviceName: String,

    @SerialName("device_model")
    val deviceModel: String,

    @SerialName("os_version")
    val osVersion: String,

    @SerialName("app_version")
    val appVersion: String,

    @SerialName("fcm_token")
    val fcmToken: String? = null,

    @SerialName("capabilities")
    val capabilities: List<String> = emptyList()
)

/**
 * Response body from POST /children/{childID}/devices.
 * Maps to Go service.RegisterDeviceResponse.
 */
@Serializable
data class RegisterDeviceResponse(
    @SerialName("device")
    val device: DeviceInfo,

    @SerialName("api_key")
    val apiKey: String
)

/**
 * Device information returned by the API.
 * Maps to the relevant fields of Go domain.DeviceRegistration.
 */
@Serializable
data class DeviceInfo(
    @SerialName("id")
    val id: String,

    @SerialName("child_id")
    val childId: String,

    @SerialName("family_id")
    val familyId: String,

    @SerialName("platform_id")
    val platformId: String,

    @SerialName("device_name")
    val deviceName: String,

    @SerialName("device_model")
    val deviceModel: String,

    @SerialName("os_version")
    val osVersion: String,

    @SerialName("app_version")
    val appVersion: String,

    @SerialName("last_seen_at")
    val lastSeenAt: String? = null,

    @SerialName("last_policy_version")
    val lastPolicyVersion: Int = 0,

    @SerialName("status")
    val status: String,

    @SerialName("capabilities")
    val capabilities: List<String> = emptyList(),

    @SerialName("created_at")
    val createdAt: String,

    @SerialName("updated_at")
    val updatedAt: String
)
