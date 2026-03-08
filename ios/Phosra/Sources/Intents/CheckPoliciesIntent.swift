import AppIntents
import SwiftUI

// MARK: - Check Policies Intent

/// Read-only Siri intent that lists active policies for a child.
///
/// Example phrases:
/// - "What rules are active for Emma in Phosra?"
/// - "Show Emma's policies in Phosra"
struct CheckPoliciesIntent: AppIntent {

    static let title: LocalizedStringResource = "Check Policies"

    static let description = IntentDescription(
        "See which safety policies are active for a child and how many rules each contains.",
        categoryName: "Policies"
    )

    static let openAppWhenRun: Bool = false
    static let authenticationPolicy: IntentAuthenticationPolicy = .alwaysAllowed

    // MARK: Parameters

    @Parameter(title: "Child")
    var child: ChildEntity

    // MARK: Perform

    func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
        let policies: [ChildPolicy]

        do {
            policies = try await PhosraAPIClient.shared.listPolicies(childId: child.id)
        } catch is AuthError {
            throw PhosraIntentError.notAuthenticated
        } catch let error as PhosraAPIError {
            if case .unauthorized = error {
                throw PhosraIntentError.notAuthenticated
            }
            throw PhosraIntentError.networkError
        } catch {
            throw PhosraIntentError.networkError
        }

        let activePolicies = policies.filter { $0.status == "active" }
        let dialog: IntentDialog

        if activePolicies.isEmpty {
            dialog = "\(child.name) has no active policies."
        } else {
            let policyNames = activePolicies.map { $0.name }.joined(separator: ", ")
            let count = activePolicies.count
            let noun = count == 1 ? "policy" : "policies"
            dialog = "\(child.name) has \(count) active \(noun): \(policyNames)."
        }

        return .result(
            dialog: dialog,
            view: PolicyListView(child: child, policies: policies)
        )
    }

    // MARK: - Suggested Invocation Phrases

    static var parameterSummary: some ParameterSummary {
        Summary("Check policies for \(\.$child)")
    }
}

// MARK: - Intent Shortcuts

extension CheckPoliciesIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "Check policies in Phosra",
            "What rules are active in Phosra"
        ]
    }
}
