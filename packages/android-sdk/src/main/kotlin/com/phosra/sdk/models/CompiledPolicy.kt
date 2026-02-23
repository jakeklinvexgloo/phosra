package com.phosra.sdk.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The full compiled policy returned by the Phosra API at GET /device/policy.
 * This is the single source of truth for all parental controls to be enforced on-device.
 *
 * Maps exactly to Go service.CompiledPolicy struct.
 */
@Serializable
data class CompiledPolicy(
    @SerialName("version")
    val version: Int,

    @SerialName("child_id")
    val childId: String,

    @SerialName("child_age")
    val childAge: Int,

    @SerialName("age_group")
    val ageGroup: String,

    @SerialName("policy_id")
    val policyId: String,

    @SerialName("status")
    val status: String,

    @SerialName("generated_at")
    val generatedAt: String,

    @SerialName("content_filter")
    val contentFilter: ContentFilter,

    @SerialName("screen_time")
    val screenTime: ScreenTime,

    @SerialName("purchases")
    val purchases: Purchases,

    @SerialName("privacy")
    val privacy: Privacy,

    @SerialName("social")
    val social: Social,

    @SerialName("notifications")
    val notifications: PhosraNotifications,

    @SerialName("web_filter")
    val webFilter: WebFilter
)
