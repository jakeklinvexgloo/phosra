package com.phosra.sdk.enforcement

import com.phosra.sdk.PhosraClient
import com.phosra.sdk.models.CategoryEnforcementResult
import com.phosra.sdk.models.DeviceReport
import com.phosra.sdk.models.EnforcementStatusPayload
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonObject
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

/**
 * Converts local [EnforcementReport] objects into [DeviceReport] payloads
 * and submits them to the Phosra API.
 *
 * This bridges the enforcement engine's local state with the server's
 * reporting endpoint (POST /device/report).
 */
class EnforcementReporter(private val client: PhosraClient) {

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    /**
     * Submit an enforcement status report to the server.
     *
     * @param policyVersion The policy version that was enforced.
     * @param report The local enforcement report.
     */
    suspend fun reportEnforcementStatus(
        policyVersion: Int,
        report: EnforcementReport
    ) {
        val results = buildEnforcementResults(report)
        val payload = EnforcementStatusPayload(
            policyVersion = policyVersion,
            results = results
        )

        val payloadJsonElement = json.encodeToJsonElement(payload)
        val payloadJsonObject = payloadJsonElement.jsonObject

        val deviceReport = DeviceReport(
            reportType = DeviceReport.TYPE_ENFORCEMENT_STATUS,
            payload = JsonObject(payloadJsonObject),
            reportedAt = nowIso8601()
        )

        client.submitReport(deviceReport)
    }

    /**
     * Submit a screen time usage report.
     *
     * @param totalMinutes Total screen time in minutes for the current day.
     * @param appUsage Map of package name to minutes used.
     */
    suspend fun reportScreenTime(
        totalMinutes: Long,
        appUsage: Map<String, Long>
    ) {
        val payloadMap = buildJsonObject {
            put("total_minutes", json.encodeToJsonElement(totalMinutes))
            put("app_usage", json.encodeToJsonElement(appUsage))
            put("date", json.encodeToJsonElement(todayIso8601()))
        }

        val deviceReport = DeviceReport(
            reportType = DeviceReport.TYPE_SCREEN_TIME,
            payload = payloadMap,
            reportedAt = nowIso8601()
        )

        client.submitReport(deviceReport)
    }

    /**
     * Submit a policy violation report.
     *
     * @param violationType The type of violation (e.g., "blocked_app_attempt", "limit_exceeded").
     * @param details Additional details about the violation.
     */
    suspend fun reportViolation(
        violationType: String,
        details: Map<String, String>
    ) {
        val payloadMap = buildJsonObject {
            put("violation_type", json.encodeToJsonElement(violationType))
            put("details", json.encodeToJsonElement(details))
        }

        val deviceReport = DeviceReport(
            reportType = DeviceReport.TYPE_VIOLATION,
            payload = payloadMap,
            reportedAt = nowIso8601()
        )

        client.submitReport(deviceReport)
    }

    // ── Private helpers ────────────────────────────────────────────

    private fun buildEnforcementResults(report: EnforcementReport): List<CategoryEnforcementResult> {
        return listOf(
            CategoryEnforcementResult(
                category = "content_filter",
                status = report.contentFilter.status.toApiStatus(),
                framework = report.contentFilter.framework,
                detail = report.contentFilter.details
            ),
            CategoryEnforcementResult(
                category = "screen_time",
                status = report.screenTime.status.toApiStatus(),
                framework = report.screenTime.framework,
                detail = report.screenTime.details
            ),
            CategoryEnforcementResult(
                category = "web_filter",
                status = report.webFilter.status.toApiStatus(),
                framework = report.webFilter.framework,
                detail = report.webFilter.details
            ),
            CategoryEnforcementResult(
                category = "purchases",
                status = report.purchases.status.toApiStatus(),
                framework = report.purchases.framework,
                detail = report.purchases.details
            ),
            CategoryEnforcementResult(
                category = "notifications",
                status = report.notifications.status.toApiStatus(),
                framework = report.notifications.framework,
                detail = report.notifications.details
            )
        )
    }

    private fun EnforcementStatus.toApiStatus(): String {
        return when (this) {
            EnforcementStatus.ENFORCED -> CategoryEnforcementResult.STATUS_ENFORCED
            EnforcementStatus.PARTIAL -> CategoryEnforcementResult.STATUS_PARTIAL
            EnforcementStatus.FAILED -> CategoryEnforcementResult.STATUS_FAILED
            EnforcementStatus.UNSUPPORTED -> CategoryEnforcementResult.STATUS_UNSUPPORTED
            EnforcementStatus.PENDING -> CategoryEnforcementResult.STATUS_PARTIAL
        }
    }

    private fun nowIso8601(): String {
        return DateTimeFormatter.ISO_INSTANT.format(Instant.now())
    }

    private fun todayIso8601(): String {
        return DateTimeFormatter.ISO_LOCAL_DATE.format(
            Instant.now().atOffset(ZoneOffset.UTC).toLocalDate()
        )
    }
}
