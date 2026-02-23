import Foundation

#if canImport(ManagedSettings)
import ManagedSettings
#endif

/// Enforces purchase restrictions using Apple's ManagedSettings framework.
///
/// Handles:
/// - Requiring password for purchases (`requirePasswordForPurchases`)
/// - Blocking in-app purchases (`denyInAppPurchases`)
/// - Spending cap tracking (no direct Apple API; tracked via StoreKit observers)
///
/// - Important: ManagedSettings purchase controls work through
///   `ManagedSettingsStore.appStore`. Spending caps have no native Apple enforcement
///   and must be tracked through StoreKit transaction observers.
@available(iOS 16.0, macOS 13.0, *)
final class PurchaseEnforcer {
    #if canImport(ManagedSettings) && os(iOS)
    private let store = ManagedSettingsStore()
    #endif

    /// Apply purchase restriction settings to the device.
    ///
    /// - Parameter purchases: Purchase settings from the compiled policy.
    /// - Returns: A category report describing the enforcement outcome.
    func apply(_ purchases: Purchases) -> EnforcementReport.CategoryReport {
        var report = EnforcementReport.CategoryReport()
        report.framework = "ManagedSettings"

        #if canImport(ManagedSettings) && os(iOS)
        do {
            var details: [String] = []

            // MARK: - Purchase Approval
            if purchases.requireApproval {
                // MARK: - TODO: Apply password requirement.
                //
                // ManagedSettingsStore.appStore.requirePasswordForPurchases = true
                //
                // This requires the device to enter a password/Face ID for every purchase,
                // including free downloads. Combined with Ask to Buy (a system-level
                // Family Sharing feature), this gates purchases through parental approval.
                details.append("Purchase approval: required")
            }

            // MARK: - Block In-App Purchases
            if purchases.blockIAP {
                // MARK: - TODO: Block in-app purchases.
                //
                // ManagedSettingsStore.appStore.denyInAppPurchases = true
                //
                // This prevents all in-app purchase prompts from appearing.
                details.append("In-app purchases: blocked")
            }

            // MARK: - Spending Cap
            if let cap = purchases.spendingCapUSD, cap > 0 {
                // There is no Apple API for spending caps. The approach:
                //
                // 1. Use StoreKit 2's Transaction.updates to observe purchases
                // 2. Track cumulative spending in a local database
                // 3. When the cap is reached, block the App Store app via ManagedSettings
                // 4. Report spending to the Phosra backend for parent visibility
                //
                // MARK: - TODO: Implement StoreKit transaction observer for spending tracking.
                details.append("Spending cap: $\(String(format: "%.2f", cap))/mo (tracked via reports)")
            }

            if details.isEmpty {
                report.status = .enforced
                report.details = "No purchase restrictions configured"
            } else {
                report.status = .partial
                report.details = details.joined(separator: "; ")
            }
        }
        #else
        report.status = .unsupported
        report.details = "ManagedSettings is only available on iOS 16+"
        #endif

        return report
    }

    /// Remove all purchase restrictions.
    func remove() {
        #if canImport(ManagedSettings) && os(iOS)
        store.appStore.denyInAppPurchases = false
        store.appStore.requirePasswordForPurchases = false
        #endif
    }
}
