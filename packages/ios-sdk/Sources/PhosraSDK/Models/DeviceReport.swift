import Foundation

/// A report submitted from the device to the server via `POST /device/report`.
///
/// Supports two report types:
/// - `enforcement_status`: Reports the result of applying a policy version
/// - `screen_time`: Reports aggregated screen time usage data
public struct DeviceReport: Encodable, Sendable {
    /// Report type identifier.
    public let reportType: ReportType

    /// Report payload (type-specific).
    public let payload: ReportPayload

    /// When the report was generated on-device.
    public let reportedAt: Date

    public init(reportType: ReportType, payload: ReportPayload, reportedAt: Date = Date()) {
        self.reportType = reportType
        self.payload = payload
        self.reportedAt = reportedAt
    }

    enum CodingKeys: String, CodingKey {
        case reportType = "report_type"
        case payload
        case reportedAt = "reported_at"
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(reportType.rawValue, forKey: .reportType)
        try container.encode(reportedAt, forKey: .reportedAt)

        switch payload {
        case .enforcementStatus(let report):
            try container.encode(report, forKey: .payload)
        case .screenTime(let report):
            try container.encode(report, forKey: .payload)
        }
    }
}

/// The type of device report.
public enum ReportType: String, Sendable {
    case enforcementStatus = "enforcement_status"
    case screenTime = "screen_time"
}

/// Type-safe report payload discriminated by `ReportType`.
public enum ReportPayload: Sendable {
    case enforcementStatus(EnforcementStatusPayload)
    case screenTime(ScreenTimePayload)
}

// MARK: - Enforcement Status Payload

/// Payload for `enforcement_status` reports.
/// Maps to Go `service.EnforcementStatusReport`.
public struct EnforcementStatusPayload: Codable, Sendable {
    /// The policy version that was applied.
    public let policyVersion: Int

    /// Per-category enforcement results.
    public let results: [CategoryEnforcementResult]

    public init(policyVersion: Int, results: [CategoryEnforcementResult]) {
        self.policyVersion = policyVersion
        self.results = results
    }

    enum CodingKeys: String, CodingKey {
        case policyVersion = "policy_version"
        case results
    }
}

/// The result of enforcing a single rule category on-device.
/// Maps to Go `service.CategoryEnforcementResult`.
public struct CategoryEnforcementResult: Codable, Sendable {
    /// The rule category (e.g., "time_daily_limit", "content_rating").
    public let category: String

    /// Enforcement outcome: "enforced", "partial", "failed", "unsupported".
    public let status: String

    /// The Apple framework used (e.g., "ManagedSettings", "DeviceActivity", "FamilyControls").
    public let framework: String

    /// Additional detail or error message.
    public let detail: String?

    public init(category: String, status: String, framework: String, detail: String? = nil) {
        self.category = category
        self.status = status
        self.framework = framework
        self.detail = detail
    }
}

// MARK: - Screen Time Payload

/// Payload for `screen_time` reports.
public struct ScreenTimePayload: Codable, Sendable {
    /// Usage by category in minutes (e.g., {"social-media": 45, "gaming": 30}).
    public let byCategory: [String: Int]

    /// Top apps by usage in minutes (e.g., {"com.burbn.instagram": 25}).
    public let topApps: [String: Int]

    /// Total screen time in minutes for the reporting period.
    public let totalMinutes: Int

    /// ISO 8601 date string for the reporting period (e.g., "2025-01-15").
    public let date: String

    public init(byCategory: [String: Int], topApps: [String: Int], totalMinutes: Int, date: String) {
        self.byCategory = byCategory
        self.topApps = topApps
        self.totalMinutes = totalMinutes
        self.date = date
    }

    enum CodingKeys: String, CodingKey {
        case byCategory = "by_category"
        case topApps = "top_apps"
        case totalMinutes = "total_minutes"
        case date
    }
}
