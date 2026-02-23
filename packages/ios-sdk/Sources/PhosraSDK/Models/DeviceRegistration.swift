import Foundation

/// Request body for `POST /children/{childID}/devices`.
///
/// Sent by the parent app to register a new iOS device for a child.
public struct RegisterDeviceRequest: Encodable, Sendable {
    /// Human-readable device name (e.g., "Jake's iPhone").
    public let deviceName: String

    /// Device model identifier (e.g., "iPhone15,2").
    public let deviceModel: String

    /// iOS version string (e.g., "17.4.1").
    public let osVersion: String

    /// Phosra app version (e.g., "1.0.0").
    public let appVersion: String

    /// Apple framework capabilities available on this device.
    /// Typical values: ["FamilyControls", "ManagedSettings", "DeviceActivity", "WebContentFilter"]
    public let capabilities: [String]

    /// APNs device token for push-based policy refresh. Nil if not yet granted.
    public let apnsToken: String?

    public init(
        deviceName: String,
        deviceModel: String,
        osVersion: String,
        appVersion: String,
        capabilities: [String] = ["FamilyControls", "ManagedSettings", "DeviceActivity"],
        apnsToken: String? = nil
    ) {
        self.deviceName = deviceName
        self.deviceModel = deviceModel
        self.osVersion = osVersion
        self.appVersion = appVersion
        self.capabilities = capabilities
        self.apnsToken = apnsToken
    }

    enum CodingKeys: String, CodingKey {
        case deviceName = "device_name"
        case deviceModel = "device_model"
        case osVersion = "os_version"
        case appVersion = "app_version"
        case capabilities
        case apnsToken = "apns_token"
    }
}

/// Response from `POST /children/{childID}/devices`.
///
/// Contains the newly created device registration and a one-time API key.
/// The API key MUST be stored in the Keychain immediately -- it is never returned again.
public struct RegisterDeviceResponse: Decodable, Sendable {
    /// The full device registration object.
    public let device: DeviceRegistrationInfo

    /// One-time API key (hex-encoded, 64 characters).
    /// Store this in the Keychain immediately using `KeychainHelper.save(key:)`.
    /// The server only stores the SHA-256 hash; this plaintext value is never returned again.
    public let apiKey: String

    enum CodingKeys: String, CodingKey {
        case device
        case apiKey = "api_key"
    }
}

/// Device registration details returned from the server.
public struct DeviceRegistrationInfo: Decodable, Sendable {
    public let id: String
    public let childID: String
    public let familyID: String
    public let platformID: String
    public let deviceName: String
    public let deviceModel: String
    public let osVersion: String
    public let appVersion: String
    public let apnsToken: String?
    public let lastSeenAt: String?
    public let lastPolicyVersion: Int
    public let status: String
    public let capabilities: [String]
    public let createdAt: String
    public let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case childID = "child_id"
        case familyID = "family_id"
        case platformID = "platform_id"
        case deviceName = "device_name"
        case deviceModel = "device_model"
        case osVersion = "os_version"
        case appVersion = "app_version"
        case apnsToken = "apns_token"
        case lastSeenAt = "last_seen_at"
        case lastPolicyVersion = "last_policy_version"
        case status, capabilities
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
