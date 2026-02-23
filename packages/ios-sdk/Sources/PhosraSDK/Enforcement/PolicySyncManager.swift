import Foundation

/// Manages background policy synchronization between the Phosra API and the device.
///
/// Supports two refresh mechanisms:
/// - **Polling**: Periodic HTTP requests with conditional fetch (`since_version` → 304).
/// - **Push**: APNs silent push notifications for immediate refresh.
///
/// ## Usage
///
/// ```swift
/// let client = PhosraClient.forDevice(deviceKey: storedKey)
/// let engine = EnforcementEngine()
/// let syncManager = PolicySyncManager(client: client, engine: engine)
///
/// // Start polling every 15 minutes
/// syncManager.startPolling()
///
/// // Handle push notifications in AppDelegate
/// func application(_:didReceiveRemoteNotification:fetchCompletionHandler:) {
///     Task {
///         await syncManager.handlePushNotification(userInfo)
///         completionHandler(.newData)
///     }
/// }
/// ```
@available(iOS 16.0, macOS 13.0, *)
public final class PolicySyncManager {
    private let client: PhosraClient
    private let engine: EnforcementEngine
    private let reporter: EnforcementReporter
    private var currentVersion: Int = 0
    private var pollTimer: Timer?
    private var isSyncing: Bool = false

    /// Delegate for sync lifecycle events.
    public weak var delegate: PolicySyncDelegate?

    /// Creates a new policy sync manager.
    ///
    /// - Parameters:
    ///   - client: A device-mode `PhosraClient`.
    ///   - engine: The enforcement engine to apply policies to.
    public init(client: PhosraClient, engine: EnforcementEngine) {
        self.client = client
        self.engine = engine
        self.reporter = EnforcementReporter(client: client)
    }

    /// Start periodic policy polling.
    ///
    /// - Parameter interval: Polling interval in seconds. Defaults to 900 (15 minutes).
    public func startPolling(interval: TimeInterval = 900) {
        stopPolling()

        // Perform an immediate sync
        Task {
            await syncPolicy()
        }

        // Schedule repeating timer on the main run loop
        pollTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            Task { [weak self] in
                await self?.syncPolicy()
            }
        }
    }

    /// Stop periodic polling.
    public func stopPolling() {
        pollTimer?.invalidate()
        pollTimer = nil
    }

    /// Handle an APNs silent push notification for immediate policy refresh.
    ///
    /// Call this from `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)`.
    ///
    /// Expected push payload:
    /// ```json
    /// {
    ///   "aps": { "content-available": 1 },
    ///   "phosra": { "action": "policy_refresh" }
    /// }
    /// ```
    ///
    /// - Parameter userInfo: The push notification payload.
    public func handlePushNotification(_ userInfo: [AnyHashable: Any]) async {
        // Verify this is a Phosra policy refresh push
        if let phosra = userInfo["phosra"] as? [String: Any],
           let action = phosra["action"] as? String,
           action == "policy_refresh" {
            await syncPolicy()
        }
    }

    /// Manually trigger a policy refresh.
    ///
    /// Fetches the latest policy, applies it, reports the result, and acknowledges the version.
    public func refreshNow() async throws {
        await syncPolicy()
    }

    /// The last successfully applied policy version.
    public var lastAppliedVersion: Int {
        return currentVersion
    }

    // MARK: - Internal

    private func syncPolicy() async {
        guard !isSyncing else { return }
        isSyncing = true
        defer { isSyncing = false }

        do {
            delegate?.policySyncDidStart()

            // Conditional fetch — server returns 304 if unchanged
            guard let policy = try await client.fetchPolicy(sinceVersion: currentVersion) else {
                delegate?.policySyncDidComplete(version: currentVersion, changed: false)
                return
            }

            // Apply the policy to the device
            let report = engine.applyPolicy(policy)
            currentVersion = policy.version

            // Report enforcement status to the server
            try await reporter.reportEnforcementStatus(
                policyVersion: policy.version,
                report: report
            )

            // Acknowledge the policy version
            try await client.acknowledgePolicy(version: policy.version)

            delegate?.policySyncDidComplete(version: policy.version, changed: true)
        } catch {
            delegate?.policySyncDidFail(error: error)
        }
    }

    deinit {
        pollTimer?.invalidate()
    }
}

// MARK: - Policy Sync Delegate

/// Delegate protocol for receiving policy sync lifecycle events.
@available(iOS 16.0, macOS 13.0, *)
public protocol PolicySyncDelegate: AnyObject {
    /// Called when a policy sync operation begins.
    func policySyncDidStart()

    /// Called when a policy sync completes.
    ///
    /// - Parameters:
    ///   - version: The current policy version.
    ///   - changed: Whether the policy was updated (false = 304 Not Modified).
    func policySyncDidComplete(version: Int, changed: Bool)

    /// Called when a policy sync fails.
    ///
    /// - Parameter error: The error that occurred.
    func policySyncDidFail(error: Error)
}
