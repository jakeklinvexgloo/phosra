import Foundation

/// Main entry point for the Phosra iOS SDK.
///
/// Operates in two modes:
/// - **Parent mode** (`forParent`): Used during device setup to register a device for a child.
/// - **Device mode** (`forDevice`): Used by the child's device for ongoing policy sync and reporting.
///
/// ## Quick Start
///
/// ```swift
/// // 1. Parent registers a device during setup
/// let parentClient = PhosraClient.forParent(token: parentJWT)
/// let response = try await parentClient.registerDevice(
///     childID: "child-uuid",
///     request: RegisterDeviceRequest(
///         deviceName: "Jake's iPhone",
///         deviceModel: UIDevice.current.model,
///         osVersion: UIDevice.current.systemVersion,
///         appVersion: "1.0.0"
///     )
/// )
///
/// // 2. Store the API key securely (only returned once!)
/// try KeychainHelper.save(key: response.apiKey)
///
/// // 3. Device uses key for ongoing sync
/// let deviceClient = PhosraClient.forDevice(deviceKey: response.apiKey)
/// if let policy = try await deviceClient.fetchPolicy() {
///     // Apply policy to device...
/// }
/// ```
public final class PhosraClient: @unchecked Sendable {
    private let apiClient: APIClient
    private let configuration: PhosraConfiguration

    private init(configuration: PhosraConfiguration, authMode: APIClient.AuthMode) {
        self.configuration = configuration
        self.apiClient = APIClient(baseURL: configuration.baseURL, authMode: authMode)
    }

    // MARK: - Factory Methods

    /// Create a client in parent mode for device registration.
    ///
    /// - Parameters:
    ///   - token: Parent's JWT access token.
    ///   - baseURL: API base URL. Defaults to production.
    /// - Returns: A `PhosraClient` configured for parent-authenticated calls.
    public static func forParent(
        token: String,
        baseURL: URL = PhosraConfiguration.defaultBaseURL
    ) -> PhosraClient {
        let config = PhosraConfiguration(baseURL: baseURL, parentToken: token)
        return PhosraClient(configuration: config, authMode: .parentToken(token))
    }

    /// Create a client in device mode for policy sync and reporting.
    ///
    /// - Parameters:
    ///   - deviceKey: The device API key (from `RegisterDeviceResponse.apiKey`, stored in Keychain).
    ///   - baseURL: API base URL. Defaults to production.
    /// - Returns: A `PhosraClient` configured for device-authenticated calls.
    public static func forDevice(
        deviceKey: String,
        baseURL: URL = PhosraConfiguration.defaultBaseURL
    ) -> PhosraClient {
        let config = PhosraConfiguration(baseURL: baseURL, deviceKey: deviceKey)
        return PhosraClient(configuration: config, authMode: .deviceKey(deviceKey))
    }

    /// Create a client in device mode, loading the API key from the Keychain.
    ///
    /// - Parameter baseURL: API base URL. Defaults to production.
    /// - Returns: A `PhosraClient` if a key was found, or `nil` if no key is stored.
    public static func fromKeychain(
        baseURL: URL = PhosraConfiguration.defaultBaseURL
    ) throws -> PhosraClient? {
        guard let key = try KeychainHelper.load() else {
            return nil
        }
        return forDevice(deviceKey: key, baseURL: baseURL)
    }

    // MARK: - Device Registration (Parent Mode)

    /// Register a new device for a child.
    ///
    /// Requires parent mode (`forParent`). The returned `apiKey` is shown only once
    /// and must be stored in the Keychain immediately.
    ///
    /// - Parameters:
    ///   - childID: UUID of the child to register the device for.
    ///   - request: Device registration details.
    /// - Returns: The device registration and one-time API key.
    public func registerDevice(
        childID: String,
        request: RegisterDeviceRequest
    ) async throws -> RegisterDeviceResponse {
        guard configuration.parentToken != nil else {
            throw PhosraAPIError.noParentToken
        }
        return try await apiClient.post(
            path: "/children/\(childID)/devices",
            body: request
        )
    }

    // MARK: - Policy Fetching (Device Mode)

    /// Fetch the compiled policy for this device's child.
    ///
    /// Supports conditional fetching: pass `sinceVersion` to receive a 304 Not Modified
    /// response (returns `nil`) if the policy hasn't changed.
    ///
    /// - Parameter sinceVersion: If set, the server returns 304 when the current version
    ///   is not newer than this value.
    /// - Returns: The compiled policy, or `nil` if the policy is unchanged (304).
    public func fetchPolicy(sinceVersion: Int? = nil) async throws -> CompiledPolicy? {
        guard configuration.deviceKey != nil else {
            throw PhosraAPIError.noDeviceKey
        }

        var queryItems: [URLQueryItem]?
        if let sinceVersion = sinceVersion {
            queryItems = [URLQueryItem(name: "since_version", value: String(sinceVersion))]
        }

        return try await apiClient.get(path: "/device/policy", queryItems: queryItems)
    }

    // MARK: - Report Submission (Device Mode)

    /// Submit an enforcement or screen time report.
    ///
    /// - Parameter report: The device report to submit.
    public func submitReport(_ report: DeviceReport) async throws {
        guard configuration.deviceKey != nil else {
            throw PhosraAPIError.noDeviceKey
        }

        let _: AcceptedResponse = try await apiClient.post(
            path: "/device/report",
            body: report
        )
    }

    // MARK: - Policy Acknowledgment (Device Mode)

    /// Acknowledge that a policy version has been applied on-device.
    ///
    /// This updates the server's record of which version the device is running.
    ///
    /// - Parameter version: The policy version that was successfully applied.
    public func acknowledgePolicy(version: Int) async throws {
        guard configuration.deviceKey != nil else {
            throw PhosraAPIError.noDeviceKey
        }

        let body = AckRequest(version: version)
        let _: AckResponse = try await apiClient.post(
            path: "/device/ack",
            body: body
        )
    }

    // MARK: - Platform Mappings

    /// Fetch Apple-specific platform mappings (age ratings, bundle IDs, framework mappings).
    ///
    /// This endpoint is public and does not require authentication.
    public func fetchAppleMappings() async throws -> ApplePlatformMappings {
        return try await apiClient.getRequired(path: "/platform-mappings/apple")
    }
}

// MARK: - Internal Request/Response Types

private struct AckRequest: Encodable {
    let version: Int
}

private struct AckResponse: Decodable {
    let acknowledgedVersion: Int

    enum CodingKeys: String, CodingKey {
        case acknowledgedVersion = "acknowledged_version"
    }
}

private struct AcceptedResponse: Decodable {
    let status: String
}

// MARK: - Apple Platform Mappings

/// Apple-specific platform mappings returned by `GET /platform-mappings/apple`.
/// Maps Phosra abstract categories to Apple framework identifiers.
public struct ApplePlatformMappings: Codable, Sendable {
    /// Maps generic ratings (e.g., "PG-13") to Apple age ratings (e.g., "12+").
    public let ageRatings: [String: String]

    /// Maps Phosra app categories to Apple bundle IDs and App Store categories.
    public let appCategories: [String: AppCategoryMap]

    /// Maps Phosra system app identifiers to Apple bundle IDs.
    public let systemApps: [String: String]

    /// Bundle IDs that should always be allowed regardless of policy.
    public let alwaysAllowed: [String]

    /// Maps Phosra rule categories to Apple framework and API class information.
    public let categoryFrameworks: [String: CategoryFrameworkMapping]

    enum CodingKeys: String, CodingKey {
        case ageRatings = "age_ratings"
        case appCategories = "app_categories"
        case systemApps = "system_apps"
        case alwaysAllowed = "always_allowed"
        case categoryFrameworks = "category_frameworks"
    }
}

/// Maps a Phosra abstract app category to Apple-specific identifiers.
public struct AppCategoryMap: Codable, Sendable {
    /// App Store category name (e.g., "SNS", "Games").
    public let appStoreCategory: String?

    /// Known bundle identifiers for apps in this category.
    public let bundleIDs: [String]

    /// Associated web domains for this category.
    public let webDomains: [String]?

    enum CodingKeys: String, CodingKey {
        case appStoreCategory = "app_store_category"
        case bundleIDs = "bundle_ids"
        case webDomains = "web_domains"
    }
}

/// Tells the iOS app which Apple framework and API class to use
/// when enforcing a given Phosra rule category.
public struct CategoryFrameworkMapping: Codable, Sendable {
    /// The Apple framework name (e.g., "ManagedSettings", "DeviceActivity", "FamilyControls", "none").
    public let framework: String

    /// The specific API class or property path (e.g., "ManagedSettingsStore.application").
    public let apiClass: String

    /// Minimum iOS version required (e.g., "16.0").
    public let minOS: String

    /// Implementation hints or caveats.
    public let notes: String?

    enum CodingKeys: String, CodingKey {
        case framework
        case apiClass = "api_class"
        case minOS = "min_os"
        case notes
    }
}
