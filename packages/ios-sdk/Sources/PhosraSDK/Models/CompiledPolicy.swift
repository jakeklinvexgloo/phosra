import Foundation

/// A fully compiled policy for on-device enforcement.
///
/// This struct matches the Go `service.CompiledPolicy` exactly. It is returned by
/// `GET /device/policy` and contains all rule settings organized by category.
public struct CompiledPolicy: Codable, Sendable {
    /// Policy version number. Increments each time a parent modifies a rule.
    public let version: Int

    /// UUID of the child this policy applies to.
    public let childID: String

    /// Child's current age in years.
    public let childAge: Int

    /// Age group label (e.g., "toddler", "child", "tween", "teen").
    public let ageGroup: String

    /// UUID of the parent-created policy.
    public let policyID: String

    /// Policy status ("active", "paused", "draft").
    public let status: String

    /// ISO 8601 timestamp when this policy was compiled.
    public let generatedAt: String

    /// Content filtering rules (age ratings, blocked/allowed apps).
    public let contentFilter: ContentFilter

    /// Screen time limits and schedules.
    public let screenTime: ScreenTime

    /// Purchase restriction settings.
    public let purchases: Purchases

    /// Privacy controls (location, profile visibility, data sharing).
    public let privacy: Privacy

    /// Social interaction controls (chat, DMs, multiplayer).
    public let social: Social

    /// Notification curfew and usage timer settings.
    public let notifications: Notifications

    /// Web content filtering rules.
    public let webFilter: WebFilter

    enum CodingKeys: String, CodingKey {
        case version, status, purchases, privacy, social, notifications
        case childID = "child_id"
        case childAge = "child_age"
        case ageGroup = "age_group"
        case policyID = "policy_id"
        case generatedAt = "generated_at"
        case contentFilter = "content_filter"
        case screenTime = "screen_time"
        case webFilter = "web_filter"
    }
}
