import Foundation

/// Builds and submits enforcement and screen time reports to the Phosra API.
///
/// Used internally by `PolicySyncManager` after applying a policy. Can also be
/// used directly to submit custom reports.
@available(iOS 16.0, macOS 13.0, *)
final class EnforcementReporter {
    private let client: PhosraClient

    init(client: PhosraClient) {
        self.client = client
    }

    /// Build and submit an enforcement status report after applying a policy.
    ///
    /// - Parameters:
    ///   - policyVersion: The version of the policy that was applied.
    ///   - report: The enforcement report from `EnforcementEngine.applyPolicy`.
    func reportEnforcementStatus(policyVersion: Int, report: EnforcementReport) async throws {
        let payload = EnforcementStatusPayload(
            policyVersion: policyVersion,
            results: report.toResults()
        )

        let deviceReport = DeviceReport(
            reportType: .enforcementStatus,
            payload: .enforcementStatus(payload)
        )

        try await client.submitReport(deviceReport)
    }

    /// Build and submit a screen time usage report.
    ///
    /// - Parameters:
    ///   - byCategory: Usage in minutes per Phosra category (e.g., "social-media": 45).
    ///   - topApps: Usage in minutes per app bundle ID (e.g., "com.burbn.instagram": 25).
    ///   - totalMinutes: Total screen time in minutes for the reporting period.
    ///   - date: The date of the reporting period in "yyyy-MM-dd" format.
    func reportScreenTime(
        byCategory: [String: Int],
        topApps: [String: Int],
        totalMinutes: Int,
        date: String
    ) async throws {
        let payload = ScreenTimePayload(
            byCategory: byCategory,
            topApps: topApps,
            totalMinutes: totalMinutes,
            date: date
        )

        let deviceReport = DeviceReport(
            reportType: .screenTime,
            payload: .screenTime(payload)
        )

        try await client.submitReport(deviceReport)
    }
}
