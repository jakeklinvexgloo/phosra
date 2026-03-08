import AppIntents

// MARK: - Set Bedtime Intent

/// Write intent that updates a child's bedtime enforcement rule.
///
/// Example phrases:
/// - "Set bedtime for Emma to 8pm in Phosra"
/// - "Change Emma's bedtime to 9pm in Phosra"
struct SetBedtimeIntent: AppIntent {

    static let title: LocalizedStringResource = "Set Bedtime"

    static let description = IntentDescription(
        "Set or update the bedtime for a child's screen time schedule.",
        categoryName: "Rules"
    )

    static let authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication
    static let openAppWhenRun: Bool = false

    // MARK: - Parameters

    @Parameter(title: "Child")
    var child: ChildEntity

    @Parameter(
        title: "Bedtime",
        description: "The time screens should turn off",
        requestValueDialog: "What time should bedtime be?"
    )
    var bedtime: Date

    // MARK: - Perform

    func perform() async throws -> some IntentResult & ProvidesDialog {
        // 1. Verify authentication
        guard await AuthManager.shared.isAuthenticated else {
            throw PhosraIntentError.notAuthenticated
        }

        // 2. Extract hour from the provided bedtime
        let hour = Calendar.current.component(.hour, from: bedtime)
        let formattedTime = Self.formatHour(hour)

        // 3. Confirm with the user before making changes
        try await requestConfirmation(
            result: .result(
                dialog: "Set bedtime for \(child.name) to \(formattedTime)?"
            )
        )

        // 4. Ensure the child has an active policy
        guard let policyId = child.activePolicyId else {
            throw PhosraIntentError.setupFailed(
                detail: "No active policy found for \(child.name). Please set up protection first."
            )
        }

        // 5. Find existing bedtime rule or create one
        do {
            let policies = try await PhosraAPIClient.shared.listPolicies(childId: child.id)
            guard let activePolicy = policies.first(where: { $0.status == "active" }) else {
                throw PhosraIntentError.setupFailed(
                    detail: "No active policy found for \(child.name)."
                )
            }

            // Use bulk upsert to create or update the time_scheduled_hours rule
            let bedtimeRule: [String: Any] = [
                "category": "time_scheduled_hours",
                "enabled": true,
                "config": [
                    "bedtime_hour": hour,
                    "wake_hour": 7 // Default wake time
                ] as [String: Any]
            ]

            try await PhosraAPIClient.shared.bulkUpsertRules(
                policyId: activePolicy.id,
                rules: [bedtimeRule]
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

        // 6. Update Siri's entity cache
        PhosraShortcuts.updateAppShortcutParameters()

        return .result(
            dialog: "Done! Bedtime for \(child.name) is now set to \(formattedTime)."
        )
    }

    // MARK: - Parameter Summary

    static var parameterSummary: some ParameterSummary {
        Summary("Set bedtime for \(\.$child) to \(\.$bedtime)")
    }

    // MARK: - Helpers

    /// Formats an hour (0-23) into a user-friendly string like "8:00 PM".
    private static func formatHour(_ hour: Int) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        var components = DateComponents()
        components.hour = hour
        components.minute = 0
        let date = Calendar.current.date(from: components) ?? Date()
        return formatter.string(from: date)
    }
}

// MARK: - Suggested Invocation Phrases

extension SetBedtimeIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "Set bedtime in Phosra",
            "Change bedtime in Phosra"
        ]
    }
}
