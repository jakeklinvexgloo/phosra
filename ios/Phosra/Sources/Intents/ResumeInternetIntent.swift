import AppIntents

// MARK: - Resume Internet Intent

/// Restores internet access after an emergency pause.
///
/// Example phrases:
/// - "Resume Emma's internet in Phosra"
/// - "Unpause Emma in Phosra"
struct ResumeInternetIntent: AppIntent {

    static let title: LocalizedStringResource = "Resume Internet"

    static let description = IntentDescription(
        "Restore internet access for a child after an emergency pause.",
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

        // 2. Confirm before restoring access
        try await requestConfirmation(
            result: .result(
                dialog: "Resume internet for \(child.name)?"
            )
        )

        // 3. Execute emergency resume
        do {
            try await PhosraAPIClient.shared.emergencyResume(childId: child.id)
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
            dialog: "Internet restored for \(child.name). Normal protection rules are back in effect."
        )
    }

    // MARK: - Parameter Summary

    static var parameterSummary: some ParameterSummary {
        Summary("Resume internet for \(\.$child)")
    }
}

// MARK: - Suggested Invocation Phrases

extension ResumeInternetIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "Resume internet in Phosra",
            "Unpause internet in Phosra"
        ]
    }
}
