import Foundation

// MARK: - Family

struct Family: Codable, Identifiable, Sendable {
    let id: String
    let name: String
    let createdAt: String?
}

// MARK: - Child

struct Child: Codable, Identifiable, Sendable {
    let id: String
    let familyId: String
    let name: String
    let birthDate: String
    let avatarUrl: String?
}

// MARK: - Quick Setup

struct QuickSetupResponse: Codable, Sendable {
    let family: Family
    let child: Child
    let policy: ChildPolicy
    let rules: [PolicyRule]
    let ageGroup: String
    let maxRatings: [String: String]?
    let ruleSummary: RuleSummary
}

// MARK: - Child Policy

struct ChildPolicy: Codable, Identifiable, Sendable {
    let id: String
    let childId: String
    let name: String
    let status: String
    let priority: Int
    let version: Int
}

// MARK: - Policy Rule

struct PolicyRule: Codable, Identifiable, Sendable {
    let id: String
    let policyId: String
    let category: String
    let enabled: Bool
    let config: AnyCodable?
}

// MARK: - Rule Summary

struct RuleSummary: Codable, Sendable {
    let screenTimeMinutes: Int
    let bedtimeHour: Int
    let webFilterLevel: String
    let contentRating: String
    let totalRulesEnabled: Int
}

// MARK: - Viewing Analytics

struct ViewingAnalytics: Codable, Sendable {
    let childId: String
    let childName: String?
    let totalTitles: Int
    let aboveAgeCount: Int
    let highQualityCount: Int
    let familyFriendlyCount: Int
}

// MARK: - Enforcement Result

struct EnforcementResult: Codable, Sendable {
    let id: String
    let status: String
    let rulesApplied: Int
    let rulesSkipped: Int
    let rulesFailed: Int
}

// MARK: - Device Registration

struct DeviceRegistrationResponse: Codable, Sendable {
    let device: DeviceRegistration
    let apiKey: String
}

struct DeviceRegistration: Codable, Identifiable, Sendable {
    let id: String
    let childId: String
    let platformId: String
    let deviceName: String
}

// MARK: - Child Age Calculation

extension Child {
    /// Calculates the child's current age from their `birthDate` (ISO 8601 date string).
    /// Returns 0 if the date cannot be parsed.
    var calculatedAge: Int {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]

        // Try full-date format first (e.g. "2018-05-12"), then fall back to
        // the default ISO 8601 with time component.
        let date: Date? = formatter.date(from: birthDate) ?? {
            formatter.formatOptions = [.withInternetDateTime]
            return formatter.date(from: birthDate)
        }()

        guard let birthDate = date else { return 0 }

        let components = Calendar.current.dateComponents([.year], from: birthDate, to: Date())
        return max(components.year ?? 0, 0)
    }
}

// MARK: - JSON Decoder Configuration

extension JSONDecoder {
    /// Pre-configured decoder for Phosra API responses.
    /// Converts snake_case JSON keys to camelCase Swift properties.
    static let phosraAPI: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()
}

// MARK: - JSON Encoder Configuration

extension JSONEncoder {
    /// Pre-configured encoder for Phosra API requests.
    /// Converts camelCase Swift properties to snake_case JSON keys.
    static let phosraAPI: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        return encoder
    }()
}
