import Foundation

#if canImport(FamilyControls)
import FamilyControls
#endif

/// Main orchestrator for applying a `CompiledPolicy` to the device using Apple's
/// FamilyControls, ManagedSettings, and DeviceActivity frameworks.
///
/// ## Usage
///
/// ```swift
/// let engine = EnforcementEngine()
///
/// // 1. Request FamilyControls authorization (once, during onboarding)
/// try await engine.requestAuthorization()
///
/// // 2. Apply a policy
/// let report = try engine.applyPolicy(compiledPolicy)
///
/// // 3. Check enforcement status
/// let status = engine.currentStatus()
/// ```
///
/// - Important: FamilyControls requires iOS 16+ and an Apple-provisioned entitlement.
///   The enforcement code below is scaffolding that compiles on macOS for development.
///   Real enforcement requires on-device testing with a signed build.
@available(iOS 16.0, macOS 13.0, *)
public final class EnforcementEngine {
    private let contentEnforcer: ContentFilterEnforcer
    private let screenTimeEnforcer: ScreenTimeEnforcer
    private let webFilterEnforcer: WebFilterEnforcer
    private let purchaseEnforcer: PurchaseEnforcer
    private let notificationEnforcer: NotificationEnforcer

    private var lastReport: EnforcementReport?

    public init() {
        self.contentEnforcer = ContentFilterEnforcer()
        self.screenTimeEnforcer = ScreenTimeEnforcer()
        self.webFilterEnforcer = WebFilterEnforcer()
        self.purchaseEnforcer = PurchaseEnforcer()
        self.notificationEnforcer = NotificationEnforcer()
    }

    /// Request FamilyControls authorization from the user.
    ///
    /// This must be called before any enforcement can take effect. On iOS, this
    /// presents a system dialog asking the parent/guardian to approve parental controls.
    ///
    /// - Throws: If the user denies authorization or FamilyControls is unavailable.
    public func requestAuthorization() async throws {
        #if canImport(FamilyControls) && os(iOS)
        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
        #else
        // MARK: - TODO: FamilyControls authorization is only available on iOS with the entitlement.
        // This no-op allows the SDK to compile on macOS for development.
        #endif
    }

    /// Apply a compiled policy to the device.
    ///
    /// Each policy section is applied independently. If one section fails, the others
    /// are still attempted. The returned `EnforcementReport` shows the status of each.
    ///
    /// - Parameter policy: The compiled policy from the Phosra API.
    /// - Returns: A report describing the enforcement outcome per category.
    public func applyPolicy(_ policy: CompiledPolicy) -> EnforcementReport {
        var report = EnforcementReport()

        report.contentFilter = contentEnforcer.apply(policy.contentFilter)
        report.screenTime = screenTimeEnforcer.apply(policy.screenTime)
        report.webFilter = webFilterEnforcer.apply(policy.webFilter)
        report.purchases = purchaseEnforcer.apply(policy.purchases)
        report.notifications = notificationEnforcer.apply(policy.notifications)

        self.lastReport = report
        return report
    }

    /// Remove all enforced restrictions from the device.
    ///
    /// This clears all ManagedSettingsStore settings, cancels DeviceActivity schedules,
    /// and removes notification curfew. Typically called when a device is unregistered.
    public func removeAllRestrictions() {
        contentEnforcer.remove()
        screenTimeEnforcer.remove()
        webFilterEnforcer.remove()
        purchaseEnforcer.remove()
        notificationEnforcer.remove()

        self.lastReport = nil
    }

    /// Get the most recent enforcement status.
    ///
    /// Returns the report from the last `applyPolicy` call, or a default pending report
    /// if no policy has been applied yet.
    public func currentStatus() -> EnforcementReport {
        return lastReport ?? EnforcementReport()
    }
}

// MARK: - Enforcement Report

/// Describes the outcome of applying a `CompiledPolicy` to the device.
public struct EnforcementReport: Sendable {
    public var contentFilter: CategoryReport = .init()
    public var screenTime: CategoryReport = .init()
    public var webFilter: CategoryReport = .init()
    public var purchases: CategoryReport = .init()
    public var notifications: CategoryReport = .init()

    public init() {}

    /// Converts the report into an array of `CategoryEnforcementResult` for API submission.
    public func toResults() -> [CategoryEnforcementResult] {
        return [
            CategoryEnforcementResult(
                category: "content_filter",
                status: contentFilter.status.rawValue,
                framework: contentFilter.framework,
                detail: contentFilter.details.isEmpty ? nil : contentFilter.details
            ),
            CategoryEnforcementResult(
                category: "screen_time",
                status: screenTime.status.rawValue,
                framework: screenTime.framework,
                detail: screenTime.details.isEmpty ? nil : screenTime.details
            ),
            CategoryEnforcementResult(
                category: "web_filter",
                status: webFilter.status.rawValue,
                framework: webFilter.framework,
                detail: webFilter.details.isEmpty ? nil : webFilter.details
            ),
            CategoryEnforcementResult(
                category: "purchases",
                status: purchases.status.rawValue,
                framework: purchases.framework,
                detail: purchases.details.isEmpty ? nil : purchases.details
            ),
            CategoryEnforcementResult(
                category: "notifications",
                status: notifications.status.rawValue,
                framework: notifications.framework,
                detail: notifications.details.isEmpty ? nil : notifications.details
            ),
        ]
    }

    /// Per-category enforcement result.
    public struct CategoryReport: Sendable {
        public var status: EnforcementStatus = .pending
        public var framework: String = ""
        public var details: String = ""
        public var errorMessage: String? = nil

        public init() {}
    }

    /// Enforcement status for a single category.
    public enum EnforcementStatus: String, Codable, Sendable {
        case pending
        case enforced
        case partial
        case failed
        case unsupported
    }
}
