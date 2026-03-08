import AppIntents

// MARK: - Pause Internet Intent

/// The "shut it down" button parents have been begging for.
/// Immediately blocks all web access for a child via emergency pause.
///
/// Example phrases:
/// - "Pause Emma's internet in Phosra"
/// - "Shut it down for Emma in Phosra"
struct PauseInternetIntent: AppIntent {

    static let title: LocalizedStringResource = "Pause Internet"

    static let description = IntentDescription(
        "Immediately pause all internet access for a child. The nuclear option.",
        categoryName: "Enforcement"
    )

    static let authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication
    static let openAppWhenRun: Bool = false

    // MARK: - Parameters

    @Parameter(title: "Child")
    var child: ChildEntity

    // MARK: - Perform

    func perform() async throws -> some IntentResult & ProvidesDialog {
        // 1. Verify authentication
        guard await AuthManager.shared.isAuthenticated else {
            throw PhosraIntentError.notAuthenticated
        }

        // 2. Confirm — this is destructive
        try await requestConfirmation(
            result: .result(
                dialog: "Pause internet for \(child.name)? This will block all web access."
            )
        )

        // 3. Execute emergency pause
        do {
            try await PhosraAPIClient.shared.emergencyPause(childId: child.id)
        } catch let error as PhosraAPIError {
            switch error {
            case .unauthorized:
                throw PhosraIntentError.notAuthenticated
            case .networkError:
                throw PhosraIntentError.networkError
            default:
                throw PhosraIntentError.setupFailed(detail: error.localizedDescription)
            }
        } catch {
            throw PhosraIntentError.networkError
        }

        return .result(
            dialog: "Internet paused for \(child.name). All web access is now blocked. Say \"Resume \(child.name)'s internet in Phosra\" when you're ready to restore access."
        )
    }

    // MARK: - Parameter Summary

    static var parameterSummary: some ParameterSummary {
        Summary("Pause internet for \(\.$child)")
    }
}

// MARK: - Suggested Invocation Phrases

extension PauseInternetIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "Pause internet in Phosra",
            "Shut it down in Phosra"
        ]
    }
}
