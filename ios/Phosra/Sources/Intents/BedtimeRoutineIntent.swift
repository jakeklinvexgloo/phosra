import AppIntents

// MARK: - Bedtime Routine Intent

/// Activates bedtime mode for ALL children in the family at once.
/// No parameters needed — just say "It's bedtime" and everything locks down.
///
/// Example phrases:
/// - "It's bedtime in Phosra"
/// - "Start bedtime routine in Phosra"
struct BedtimeRoutineIntent: AppIntent {

    static let title: LocalizedStringResource = "Bedtime Routine"

    static let description = IntentDescription(
        "Activate bedtime mode for all children — screens off, internet paused.",
        categoryName: "Enforcement"
    )

    static let authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication
    static let openAppWhenRun: Bool = false

    // No parameters — applies to all children

    // MARK: - Perform

    func perform() async throws -> some IntentResult & ProvidesDialog {
        // 1. Verify authentication
        guard await AuthManager.shared.isAuthenticated else {
            throw PhosraIntentError.notAuthenticated
        }

        // 2. Fetch all children across all families
        let allChildren: [(child: Child, familyId: String)]
        do {
            let families = try await PhosraAPIClient.shared.listFamilies()

            guard !families.isEmpty else {
                throw PhosraIntentError.setupFailed(
                    detail: "No family found. Please set up your family in Phosra first."
                )
            }

            var children: [(Child, String)] = []
            for family in families {
                let familyChildren = try await PhosraAPIClient.shared.listChildren(
                    familyId: family.id
                )
                for child in familyChildren {
                    children.append((child, family.id))
                }
            }

            guard !children.isEmpty else {
                throw PhosraIntentError.setupFailed(
                    detail: "No children found. Add a child first by saying \"Add a child in Phosra\"."
                )
            }

            allChildren = children
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

        // 3. Build the child names list for the confirmation dialog
        let childNames = allChildren.map { $0.child.name }
        let namesDisplay: String
        switch childNames.count {
        case 1:
            namesDisplay = childNames[0]
        case 2:
            namesDisplay = "\(childNames[0]) and \(childNames[1])"
        default:
            let allButLast = childNames.dropLast().joined(separator: ", ")
            namesDisplay = "\(allButLast), and \(childNames.last!)"
        }

        // 4. Confirm before activating bedtime for everyone
        try await requestConfirmation(
            result: .result(
                dialog: "Activate bedtime mode for \(namesDisplay)?"
            )
        )

        // 5. Trigger enforcement with bedtime policy for each child
        var succeeded: [String] = []
        var failed: [String] = []

        for (child, _) in allChildren {
            do {
                // Emergency pause is the fastest way to lock everything down at bedtime
                try await PhosraAPIClient.shared.emergencyPause(childId: child.id)
                succeeded.append(child.name)
            } catch {
                failed.append(child.name)
            }
        }

        // 6. Build result summary
        let dialog: String
        if failed.isEmpty {
            dialog = "Bedtime mode activated for \(namesDisplay). All screens are locked down. Good night!"
        } else if succeeded.isEmpty {
            throw PhosraIntentError.setupFailed(
                detail: "Failed to activate bedtime for any children. Please try again."
            )
        } else {
            let failedNames = failed.joined(separator: ", ")
            dialog = "Bedtime mode activated for \(succeeded.joined(separator: ", ")). " +
                     "Failed for \(failedNames) — try again or check the app."
        }

        return .result(dialog: "\(dialog)")
    }

    // MARK: - Parameter Summary

    static var parameterSummary: some ParameterSummary {
        Summary("Activate bedtime for all children")
    }
}

// MARK: - Suggested Invocation Phrases

extension BedtimeRoutineIntent {
    static var suggestedInvocationPhrases: [String] {
        [
            "It's bedtime in Phosra",
            "Start bedtime routine in Phosra"
        ]
    }
}
