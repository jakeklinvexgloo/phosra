import AppIntents

// MARK: - Block App Intent

/// Blocks a specific app or service for a child by adding it to their
/// content block list and triggering enforcement.
///
/// Example phrases:
/// - "Block TikTok for Emma in Phosra"
/// - "Block YouTube for Emma in Phosra"
struct BlockAppIntent: AppIntent {

    static let title: LocalizedStringResource = "Block App"

    static let description = IntentDescription(
        "Block a specific app or website for a child.",
        categoryName: "Rules"
    )

    static let authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication
    static let openAppWhenRun: Bool = false

    // MARK: - Parameters

    @Parameter(title: "Child")
    var child: ChildEntity

    @Parameter(
        title: "App Name",
        description: "The app or service to block",
        requestValueDialog: "Which app should I block?"
    )
    var appName: String

    // MARK: - Perform

    func perform() async throws -> some IntentResult & ProvidesDialog {
        // 1. Verify authentication
        guard await AuthManager.shared.isAuthenticated else {
            throw PhosraIntentError.notAuthenticated
        }

        // 2. Validate input
        let trimmedAppName = appName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedAppName.isEmpty else {
            throw PhosraIntentError.setupFailed(detail: "App name cannot be empty.")
        }

        // 3. Confirm before blocking
        try await requestConfirmation(
            result: .result(
                dialog: "Block \(trimmedAppName) for \(child.name)?"
            )
        )

        // 4. Find active policy, add to block list, and trigger enforcement
        do {
            let policies = try await PhosraAPIClient.shared.listPolicies(childId: child.id)
            guard let activePolicy = policies.first(where: { $0.status == "active" }) else {
                throw PhosraIntentError.setupFailed(
                    detail: "No active policy found for \(child.name). Please set up protection first."
                )
            }

            // Create/update the content_block_title rule with the app name
            let blockRule: [String: Any] = [
                "category": "content_block_title",
                "enabled": true,
                "config": [
                    "blocked_titles": [trimmedAppName]
                ] as [String: Any]
            ]

            try await PhosraAPIClient.shared.bulkUpsertRules(
                policyId: activePolicy.id,
                rules: [blockRule]
            )

            // Trigger enforcement so the block takes effect immediately
            _ = try await PhosraAPIClient.shared.triggerEnforcement(childId: child.id)

        } catch let error as PhosraAPIError {
            switch error {
            case .unauthorized:
                throw PhosraIntentError.notAuthenticated
            case .networkError:
                throw PhosraIntentError.networkError
            default:
                throw PhosraIntentError.setupFailed(detail: error.localizedDescription)
            }
        } catch let intentError as PhosraIntentError {
            throw intentError
        } catch {
            throw PhosraIntentError.networkError
        }

        // 5. Update Siri's entity cache
        PhosraShortcuts.updateAppShortcutParameters()

        return .result(
            dialog: "\(trimmedAppName) is now blocked for \(child.name). Enforcement has been triggered."
        )
    }

    // MARK: - Parameter Summary

    static var parameterSummary: some ParameterSummary {
        Summary("Block \(\.$appName) for \(\.$child)")
    }
}

// MARK: - Suggested Invocation Phrases

extension BlockAppIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "Block an app in Phosra",
            "Block TikTok in Phosra"
        ]
    }
}
