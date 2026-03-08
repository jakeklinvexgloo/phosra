import AppIntents

// MARK: - Extend Screen Time Intent

/// Adds extra minutes to a child's daily screen time limit.
///
/// Example phrases:
/// - "Give Emma 30 more minutes in Phosra"
/// - "Extend screen time for Emma in Phosra"
struct ExtendTimeIntent: AppIntent {

    static let title: LocalizedStringResource = "Extend Screen Time"

    static let description = IntentDescription(
        "Give a child extra screen time minutes for today.",
        categoryName: "Rules"
    )

    static let authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication
    static let openAppWhenRun: Bool = false

    // MARK: - Parameters

    @Parameter(title: "Child")
    var child: ChildEntity

    @Parameter(
        title: "Extra Minutes",
        description: "Number of additional minutes to allow",
        requestValueDialog: "How many extra minutes?"
    )
    var minutes: Int

    // MARK: - Perform

    func perform() async throws -> some IntentResult & ProvidesDialog {
        // 1. Verify authentication
        guard await AuthManager.shared.isAuthenticated else {
            throw PhosraIntentError.notAuthenticated
        }

        // 2. Validate minutes
        guard minutes > 0 && minutes <= 480 else {
            throw PhosraIntentError.setupFailed(
                detail: "Extra time must be between 1 and 480 minutes."
            )
        }

        // 3. Confirm with the user
        try await requestConfirmation(
            result: .result(
                dialog: "Extend \(child.name)'s screen time by \(minutes) minutes?"
            )
        )

        // 4. Find the active policy and current daily limit rule
        do {
            let policies = try await PhosraAPIClient.shared.listPolicies(childId: child.id)
            guard let activePolicy = policies.first(where: { $0.status == "active" }) else {
                throw PhosraIntentError.setupFailed(
                    detail: "No active policy found for \(child.name). Please set up protection first."
                )
            }

            // Fetch current rules to find the existing daily limit
            let currentRules = try await PhosraAPIClient.shared.generateFromAge(
                policyId: activePolicy.id
            )

            // Look for existing time_daily_limit rule to get current value
            var currentLimit = 120 // Default: 2 hours
            if let dailyLimitRule = currentRules.first(where: { $0.category == "time_daily_limit" }),
               let config = dailyLimitRule.config,
               let configDict = config.value as? [String: Any],
               let limit = configDict["max_minutes"] as? Int {
                currentLimit = limit
            }

            let newLimit = currentLimit + minutes

            // Upsert the updated daily limit rule
            let updatedRule: [String: Any] = [
                "category": "time_daily_limit",
                "enabled": true,
                "config": [
                    "max_minutes": newLimit
                ] as [String: Any]
            ]

            try await PhosraAPIClient.shared.bulkUpsertRules(
                policyId: activePolicy.id,
                rules: [updatedRule]
            )
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
            dialog: "Done! \(child.name) gets \(minutes) extra minutes of screen time."
        )
    }

    // MARK: - Parameter Summary

    static var parameterSummary: some ParameterSummary {
        Summary("Give \(\.$child) \(\.$minutes) extra minutes")
    }
}

// MARK: - Suggested Invocation Phrases

extension ExtendTimeIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "Give extra screen time in Phosra",
            "Extend screen time in Phosra"
        ]
    }
}
