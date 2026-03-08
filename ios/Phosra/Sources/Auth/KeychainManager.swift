import Foundation
import Security

// MARK: - Keychain errors

enum KeychainError: LocalizedError {
    case encodingFailed
    case saveFailed(status: OSStatus)
    case deleteFailed(status: OSStatus)
    case unexpectedData
    case unhandledError(status: OSStatus)

    var errorDescription: String? {
        switch self {
        case .encodingFailed:
            return "Failed to encode data for Keychain"
        case .saveFailed(let status):
            return "Keychain save failed: \(SecCopyErrorMessageString(status, nil) as String? ?? "OSStatus \(status)")"
        case .deleteFailed(let status):
            return "Keychain delete failed: \(SecCopyErrorMessageString(status, nil) as String? ?? "OSStatus \(status)")"
        case .unexpectedData:
            return "Unexpected Keychain item data format"
        case .unhandledError(let status):
            return "Keychain error: \(SecCopyErrorMessageString(status, nil) as String? ?? "OSStatus \(status)")"
        }
    }
}

// MARK: - KeychainManager

/// Thread-safe Keychain wrapper using actor isolation.
/// Stores data under `com.phosra.app` service with shared access group
/// `group.com.phosra.shared` so widget and intent extensions can read tokens.
actor KeychainManager {

    static let shared = KeychainManager()

    // MARK: Constants

    private let service = "com.phosra.app"
    // Access group removed — requires App Groups entitlement not yet provisioned
    // private let accessGroup = "group.com.phosra.shared"

    // Well-known Keychain keys
    static let sessionTokenKey = "session_token"
    static let userEmailKey = "user_email"

    private init() {}

    // MARK: - Core CRUD

    /// Save raw data to the Keychain under the given key.
    func save(key: String, data: Data) throws {
        // Attempt to delete any existing item first (ignore errItemNotFound)
        try? delete(key: key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,

            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock,
            kSecValueData as String: data,
        ]

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status: status)
        }
    }

    /// Load raw data from the Keychain for the given key.
    /// Returns `nil` if the key does not exist.
    func load(key: String) throws -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,

            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecReturnData as String: true,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        switch status {
        case errSecSuccess:
            guard let data = result as? Data else {
                throw KeychainError.unexpectedData
            }
            return data
        case errSecItemNotFound:
            return nil
        default:
            throw KeychainError.unhandledError(status: status)
        }
    }

    /// Delete a single key from the Keychain.
    func delete(key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,

        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed(status: status)
        }
    }

    // MARK: - Convenience: Session Token

    /// Persist the Stytch session token (opaque, 7-day expiry).
    func saveSessionToken(_ token: String) throws {
        guard let data = token.data(using: .utf8) else {
            throw KeychainError.encodingFailed
        }
        try save(key: Self.sessionTokenKey, data: data)
    }

    /// Retrieve the stored session token, or `nil` if none exists.
    func getSessionToken() -> String? {
        guard let data = try? load(key: Self.sessionTokenKey) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Convenience: User Email

    /// Persist the current user's email address.
    func saveUserEmail(_ email: String) throws {
        guard let data = email.data(using: .utf8) else {
            throw KeychainError.encodingFailed
        }
        try save(key: Self.userEmailKey, data: data)
    }

    /// Retrieve the stored user email, or `nil` if none exists.
    func getUserEmail() -> String? {
        guard let data = try? load(key: Self.userEmailKey) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Clear All

    /// Remove all Keychain items stored by this app's service.
    func clearAll() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,

        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed(status: status)
        }
    }
}
