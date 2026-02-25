import Foundation

/// Configuration for the Phosra SDK client.
///
/// Supports two authentication modes:
/// - **Parent mode**: Uses a JWT `parentToken` for device registration calls
/// - **Device mode**: Uses a `deviceKey` (stored in Keychain) for policy sync and reporting
public struct PhosraConfiguration {
    /// Base URL for the Phosra API.
    public let baseURL: URL

    /// Device API key (hex-encoded, 64 chars). Used for device-authenticated endpoints.
    public let deviceKey: String?

    /// Parent JWT token. Used for parent-authenticated endpoints (device registration).
    public let parentToken: String?

    /// Child ID. Required for device registration.
    public let childID: String?

    /// Default Phosra API base URL.
    public static let defaultBaseURL = URL(string: "https://phosra-api.fly.dev/api/v1")!

    /// Creates a new configuration.
    ///
    /// - Parameters:
    ///   - baseURL: API base URL. Defaults to the production Phosra API.
    ///   - deviceKey: Device API key for device-authenticated calls.
    ///   - parentToken: Parent JWT for parent-authenticated calls.
    ///   - childID: Child ID for device registration.
    public init(
        baseURL: URL = defaultBaseURL,
        deviceKey: String? = nil,
        parentToken: String? = nil,
        childID: String? = nil
    ) {
        self.baseURL = baseURL
        self.deviceKey = deviceKey
        self.parentToken = parentToken
        self.childID = childID
    }
}
