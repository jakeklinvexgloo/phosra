import AppIntents
import SwiftUI

// MARK: - Check Screen Time Intent

/// Read-only Siri intent that retrieves viewing analytics for a child.
///
/// Example phrases:
/// - "Check Emma's screen time in Phosra"
/// - "How much has Emma watched in Phosra?"
struct CheckScreenTimeIntent: AppIntent {

    static let title: LocalizedStringResource = "Check Screen Time"

    static let description = IntentDescription(
        "See how much a child has been watching and whether content is age-appropriate.",
        categoryName: "Viewing"
    )

    static let openAppWhenRun: Bool = false
    static let authenticationPolicy: IntentAuthenticationPolicy = .alwaysAllowed

    // MARK: Parameters

    @Parameter(title: "Child")
    var child: ChildEntity

    // MARK: Perform

    func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
        let analytics: ViewingAnalytics

        do {
            analytics = try await PhosraAPIClient.shared.getViewingAnalytics(childId: child.id)
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

        let childName = analytics.childName ?? child.name
        let ratio = analytics.totalTitles > 0
            ? Int(Double(analytics.familyFriendlyCount) / Double(analytics.totalTitles) * 100)
            : 100

        let dialog: IntentDialog = "\(childName) has watched \(analytics.totalTitles) titles. \(analytics.aboveAgeCount) above age rating, \(ratio)% family-friendly."

        return .result(
            dialog: dialog,
            view: ScreenTimeSummaryView(child: child, analytics: analytics)
        )
    }

    // MARK: - Suggested Invocation Phrases

    static var parameterSummary: some ParameterSummary {
        Summary("Check screen time for \(\.$child)")
    }
}

// MARK: - Intent Shortcuts

extension CheckScreenTimeIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "Check screen time in Phosra",
            "How much has my kid watched in Phosra"
        ]
    }
}
