import Foundation

#if canImport(DeviceActivity)
import DeviceActivity
#endif

/// Enforces screen time limits using Apple's DeviceActivity framework.
///
/// Handles:
/// - Daily aggregate time limits via `DeviceActivitySchedule`
/// - Per-app time limits
/// - Downtime windows (block usage during specific hours)
/// - Weekday/weekend schedules
///
/// - Important: DeviceActivity monitoring requires a DeviceActivityMonitor app extension.
///   The schedule is set here, but the actual enforcement callbacks (threshold reached,
///   interval ended) must be handled in a separate `DeviceActivityMonitorExtension` target.
@available(iOS 16.0, macOS 13.0, *)
final class ScreenTimeEnforcer {
    #if canImport(DeviceActivity) && os(iOS)
    private let center = DeviceActivityCenter()
    #endif

    /// Apply screen time settings to the device.
    ///
    /// - Parameter screenTime: Screen time configuration from the compiled policy.
    /// - Returns: A category report describing the enforcement outcome.
    func apply(_ screenTime: ScreenTime) -> EnforcementReport.CategoryReport {
        var report = EnforcementReport.CategoryReport()
        report.framework = "DeviceActivity"

        #if canImport(DeviceActivity) && os(iOS)
        do {
            // Stop any existing monitoring before applying new schedule
            center.stopMonitoring()

            var details: [String] = []

            // MARK: - Daily Limit Schedule
            if screenTime.dailyLimitMinutes > 0 {
                // Create a DeviceActivitySchedule for the daily limit.
                //
                // MARK: - TODO: Create DeviceActivitySchedule with cumulative usage threshold.
                //
                // Example (requires device testing):
                //   let schedule = DeviceActivitySchedule(
                //       intervalStart: DateComponents(hour: 0, minute: 0),
                //       intervalEnd: DateComponents(hour: 23, minute: 59),
                //       repeats: true
                //   )
                //   let event = DeviceActivityEvent(
                //       applications: selection.applicationTokens,
                //       threshold: DateComponents(minute: screenTime.dailyLimitMinutes)
                //   )
                //   try center.startMonitoring(.daily, during: schedule, events: [.dailyLimit: event])

                details.append("Daily limit: \(screenTime.dailyLimitMinutes)min")
            }

            // MARK: - Per-App Limits
            if let perAppLimits = screenTime.perAppLimits, !perAppLimits.isEmpty {
                // MARK: - TODO: Create per-app DeviceActivityEvents with individual thresholds.
                //
                // Each app needs its own event with the app's ApplicationToken and threshold.
                // Requires FamilyActivitySelection to map bundle IDs to tokens.

                details.append("Per-app limits: \(perAppLimits.count) apps")
            }

            // MARK: - Downtime Windows
            if let windows = screenTime.downtimeWindows, !windows.isEmpty {
                // MARK: - TODO: Create DeviceActivitySchedule for each downtime window.
                //
                // For each window, create a schedule that blocks usage during the specified hours.
                // The DeviceActivityMonitor extension will shield apps when downtime starts.

                for window in windows {
                    details.append("Downtime: \(window.startTime)-\(window.endTime) on \(window.daysOfWeek.joined(separator: ", "))")
                }
            }

            // MARK: - Weekday/Weekend Schedule
            if let schedule = screenTime.schedule {
                // MARK: - TODO: Create separate DeviceActivitySchedules for weekday and weekend.
                details.append("Schedule: weekday \(schedule.weekday.start)-\(schedule.weekday.end), weekend \(schedule.weekend.start)-\(schedule.weekend.end)")
            }

            report.status = details.isEmpty ? .enforced : .partial
            report.details = details.isEmpty ? "No screen time restrictions configured" : details.joined(separator: "; ")
        }
        #else
        report.status = .unsupported
        report.details = "DeviceActivity is only available on iOS 16+"
        #endif

        return report
    }

    /// Remove all screen time monitoring.
    func remove() {
        #if canImport(DeviceActivity) && os(iOS)
        center.stopMonitoring()
        #endif
    }
}
