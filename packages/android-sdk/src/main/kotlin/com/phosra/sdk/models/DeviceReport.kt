package com.phosra.sdk.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

/**
 * Report submitted from device to server via POST /device/report.
 * Maps to Go service.DeviceReportRequest.
 */
@Serializable
data class DeviceReport(
    @SerialName("report_type")
    val reportType: String,

    @SerialName("payload")
    val payload: JsonObject,

    @SerialName("reported_at")
    val reportedAt: String
) {
    companion object {
        const val TYPE_ENFORCEMENT_STATUS = "enforcement_status"
        const val TYPE_SCREEN_TIME = "screen_time"
        const val TYPE_APP_USAGE = "app_usage"
        const val TYPE_WEB_ACTIVITY = "web_activity"
        const val TYPE_VIOLATION = "violation"
    }
}

/**
 * Structured enforcement status report payload.
 * Maps to Go service.EnforcementStatusReport.
 */
@Serializable
data class EnforcementStatusPayload(
    @SerialName("policy_version")
    val policyVersion: Int,

    @SerialName("results")
    val results: List<CategoryEnforcementResult>
)

/**
 * Result of enforcing a single rule category on-device.
 * Maps to Go service.CategoryEnforcementResult.
 */
@Serializable
data class CategoryEnforcementResult(
    @SerialName("category")
    val category: String,

    @SerialName("status")
    val status: String,

    @SerialName("framework")
    val framework: String,

    @SerialName("detail")
    val detail: String = ""
) {
    companion object {
        const val STATUS_ENFORCED = "enforced"
        const val STATUS_PARTIAL = "partial"
        const val STATUS_FAILED = "failed"
        const val STATUS_UNSUPPORTED = "unsupported"
    }
}

/**
 * Request body for POST /device/ack to acknowledge a policy version.
 */
@Serializable
data class PolicyAckRequest(
    @SerialName("version")
    val version: Int
)
