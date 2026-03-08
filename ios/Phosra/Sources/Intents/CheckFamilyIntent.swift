import AppIntents
import SwiftUI

// MARK: - Check Family Intent

/// Read-only Siri intent that shows all families and their children.
///
/// Example phrases:
/// - "Show my family in Phosra"
/// - "Who's in my Phosra family?"
struct CheckFamilyIntent: AppIntent {

    static let title: LocalizedStringResource = "Show Family"

    static let description = IntentDescription(
        "See your family members and children managed in Phosra.",
        categoryName: "Family"
    )

    static let openAppWhenRun: Bool = false
    static let authenticationPolicy: IntentAuthenticationPolicy = .alwaysAllowed

    // MARK: Perform

    func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
        let families: [Family]
        var allChildren: [String: [Child]] = [:]

        do {
            families = try await PhosraAPIClient.shared.listFamilies()

            for family in families {
                let children = try await PhosraAPIClient.shared.listChildren(familyId: family.id)
                allChildren[family.id] = children
            }
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

        let dialog: IntentDialog

        if families.isEmpty {
            dialog = "You don't have any families set up in Phosra yet."
        } else {
            let parts = families.map { family -> String in
                let children = allChildren[family.id] ?? []
                if children.isEmpty {
                    return "\(family.name): no children added"
                }
                let childDescriptions = children.map { child in
                    "\(child.name) (age \(child.calculatedAge))"
                }
                return "\(family.name): \(childDescriptions.joined(separator: ", "))"
            }
            let summary = parts.joined(separator: ". ")
            dialog = "\(summary)"
        }

        // Flatten children for the snippet view
        let flatChildren = families.flatMap { allChildren[$0.id] ?? [] }

        return .result(
            dialog: dialog,
            view: FamilySummaryView(families: families, children: flatChildren)
        )
    }

    // MARK: - Suggested Invocation Phrases

    static var parameterSummary: some ParameterSummary {
        Summary("Show my family")
    }
}

// MARK: - Intent Shortcuts

extension CheckFamilyIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "Show my family in Phosra",
            "Who's in my Phosra family"
        ]
    }
}
