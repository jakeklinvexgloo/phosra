import AppIntents
import SwiftUI

// MARK: - Add Child Intent

/// Hero Siri intent: "Add [child] to my family to protect them."
///
/// Multi-turn conversational flow:
/// 1. Parent: "Add Ramsay to my family in Phosra"
/// 2. Siri:   "How old is Ramsay?"
/// 3. Parent: "He's 8"
/// 4. Siri:   "What protection level — Relaxed, Recommended, or Strict?"
/// 5. Parent: "Strict"
/// 6. Siri:   [Shows confirmation with rule summary]
/// 7. Parent: "Yes"
/// 8. Siri:   "Done! Ramsay added with Strict protection. 8 rules active."
struct AddChildIntent: AppIntent {

    static let title: LocalizedStringResource = "Add Child to Family"

    static let description = IntentDescription(
        "Add a child to your Phosra family and set up age-appropriate protection",
        categoryName: "Family"
    )

    static let authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication

    // Opens the Phosra app if the intent needs foreground UI (e.g. login).
    static let openAppWhenRun: Bool = false

    // MARK: - Parameters (multi-turn conversation)

    @Parameter(
        title: "Child's Name",
        description: "The name of the child to add",
        requestValueDialog: "What is the child's name?"
    )
    var childName: String

    @Parameter(
        title: "Age",
        description: "The child's age in years",
        requestValueDialog: "How old is this child?"
    )
    var age: Int

    @Parameter(
        title: "Protection Level",
        description: "How strict the safety rules should be",
        requestValueDialog: "What protection level — Relaxed, Recommended, or Strict?"
    )
    var strictness: StrictnessLevel

    // MARK: - Perform

    func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
        // 1. Verify authentication
        guard await AuthManager.shared.isAuthenticated else {
            throw PhosraIntentError.notAuthenticated
        }

        // 2. Validate age range
        guard age >= 0 && age <= 17 else {
            throw PhosraIntentError.invalidAge
        }

        // 3. Get or create a family
        let familyId: String
        do {
            let families = try await PhosraAPIClient.shared.listFamilies()
            if let first = families.first {
                familyId = first.id
            } else {
                let family = try await PhosraAPIClient.shared.createFamily(
                    name: "\(childName)'s Family"
                )
                familyId = family.id
            }
        } catch is PhosraAPIError {
            throw PhosraIntentError.familyCreationFailed
        } catch {
            throw PhosraIntentError.networkError
        }

        // 4. Calculate birth date from age
        let birthDate = Calendar.current.date(
            byAdding: .year,
            value: -age,
            to: Date()
        )!

        // 5. Generate a rule preview for the confirmation dialog
        let preview = RulePreview.forAge(age, strictness: strictness)

        // 6. Show confirmation with rich snippet view
        try await requestConfirmation(
            result: .result(
                dialog: """
                I'll add \(childName) (age \(age)) with \(strictness.rawValue.capitalized) \
                protection. This includes \(preview.screenTimeMinutes) min/day screen time, \
                bedtime at \(preview.formattedBedtime), \(preview.contentRating) max content \
                rating, and safe search \(preview.safeSearch ? "on" : "off").
                """,
                view: AddChildConfirmationView(
                    name: childName,
                    age: age,
                    strictness: strictness,
                    preview: preview
                )
            )
        )

        // 7. Call the Quick Setup API
        let result: QuickSetupResponse
        do {
            result = try await PhosraAPIClient.shared.quickSetup(
                childName: childName,
                birthDate: birthDate,
                strictness: strictness.rawValue,
                familyId: familyId
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
        } catch {
            throw PhosraIntentError.networkError
        }

        // 8. Update Siri's entity cache so the new child is immediately available
        //    in follow-up intents (e.g. "Show Ramsay's screen time")
        PhosraShortcuts.updateAppShortcutParameters()

        // 9. Return success with result view
        return .result(
            dialog: "\(childName) has been added with \(strictness.rawValue.capitalized) protection. \(result.ruleSummary.totalRulesEnabled) rules are now active.",
            view: AddChildResultView(
                childName: childName,
                age: age,
                strictness: strictness,
                ruleSummary: result.ruleSummary
            )
        )
    }
}

// MARK: - Rule Preview

/// Local preview of the rules that will be applied, matching the Go backend's
/// `GenerateFromAge` logic. Used to show a confirmation dialog before calling
/// the API, so Siri can describe what will happen without a network round trip.
struct RulePreview {

    let screenTimeMinutes: Int
    let bedtimeHour: Int
    let contentRating: String
    let safeSearch: Bool
    let totalRules: Int

    /// Human-readable bedtime string (e.g. "8:00 PM").
    var formattedBedtime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        var components = DateComponents()
        components.hour = bedtimeHour
        components.minute = 0
        let date = Calendar.current.date(from: components) ?? Date()
        return formatter.string(from: date)
    }

    /// Generates a preview matching the Go backend's age-band logic:
    ///
    /// | Age Band | Screen Time | Bedtime | Rating   |
    /// |----------|-------------|---------|----------|
    /// | 0-6      | 60 min      | 7 PM    | G / PG   |
    /// | 7-9      | 90 min      | 8 PM    | PG       |
    /// | 10-12    | 120 min     | 9 PM    | PG-13    |
    /// | 13-16    | 180 min     | 10 PM   | PG-13/R  |
    /// | 17+      | 240 min     | 11 PM   | R        |
    ///
    /// Strictness multiplier applied to screen time:
    /// - Strict:      x 0.67
    /// - Recommended: x 1.00
    /// - Relaxed:     x 1.33
    static func forAge(_ age: Int, strictness: StrictnessLevel) -> RulePreview {
        // Base values by age band
        let baseMinutes: Int
        let bedtime: Int
        let rating: String
        let safeSearch: Bool
        let baseRules: Int

        switch age {
        case 0...6:
            baseMinutes = 60
            bedtime = 19
            rating = "G"
            safeSearch = true
            baseRules = 10
        case 7...9:
            baseMinutes = 90
            bedtime = 20
            rating = "PG"
            safeSearch = true
            baseRules = 9
        case 10...12:
            baseMinutes = 120
            bedtime = 21
            rating = "PG-13"
            safeSearch = true
            baseRules = 8
        case 13...16:
            baseMinutes = 180
            bedtime = 22
            rating = "PG-13"
            safeSearch = false
            baseRules = 7
        default: // 17+
            baseMinutes = 240
            bedtime = 23
            rating = "R"
            safeSearch = false
            baseRules = 6
        }

        // Apply strictness multiplier to screen time
        let multiplier: Double
        switch strictness {
        case .strict:
            multiplier = 0.67
        case .recommended:
            multiplier = 1.0
        case .relaxed:
            multiplier = 1.33
        }

        let adjustedMinutes = Int(round(Double(baseMinutes) * multiplier))

        // Strict adds extra rules (safe search forced on, stricter content filter)
        let adjustedRules: Int
        switch strictness {
        case .strict:
            adjustedRules = baseRules + 2
        case .recommended:
            adjustedRules = baseRules
        case .relaxed:
            adjustedRules = max(baseRules - 1, 4)
        }

        let adjustedSafeSearch: Bool
        switch strictness {
        case .strict:
            adjustedSafeSearch = true
        case .recommended:
            adjustedSafeSearch = safeSearch
        case .relaxed:
            adjustedSafeSearch = age <= 9
        }

        return RulePreview(
            screenTimeMinutes: adjustedMinutes,
            bedtimeHour: bedtime,
            contentRating: rating,
            safeSearch: adjustedSafeSearch,
            totalRules: adjustedRules
        )
    }
}

// MARK: - Intent Errors

/// User-friendly errors surfaced through Siri's dialog system.
enum PhosraIntentError: Error, CustomLocalizedStringResourceConvertible {

    case notAuthenticated
    case networkError
    case familyCreationFailed
    case invalidAge
    case setupFailed(detail: String)

    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .notAuthenticated:
            "Please sign in to Phosra first. Open the app to log in."
        case .networkError:
            "Couldn't reach Phosra. Check your internet connection and try again."
        case .familyCreationFailed:
            "Couldn't create the family. Please try again."
        case .invalidAge:
            "Age must be between 0 and 17 for child protection."
        case .setupFailed(let detail):
            "Setup failed: \(detail)"
        }
    }
}
