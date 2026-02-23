import Foundation
import Security

/// Simple Keychain wrapper for securely storing and retrieving the device API key.
public enum KeychainHelper {
    /// Default Keychain service identifier for the Phosra device key.
    public static let defaultService = "com.phosra.device-key"

    /// Keychain operation errors.
    public enum KeychainError: Error, LocalizedError {
        case saveFailed(OSStatus)
        case loadFailed(OSStatus)
        case deleteFailed(OSStatus)
        case encodingFailed
        case unexpectedData

        public var errorDescription: String? {
            switch self {
            case .saveFailed(let status):
                return "Keychain save failed with status \(status)"
            case .loadFailed(let status):
                return "Keychain load failed with status \(status)"
            case .deleteFailed(let status):
                return "Keychain delete failed with status \(status)"
            case .encodingFailed:
                return "Failed to encode key data for Keychain"
            case .unexpectedData:
                return "Unexpected data format in Keychain"
            }
        }
    }

    /// Save a key string to the Keychain.
    ///
    /// If a value already exists for the given service, it will be overwritten.
    ///
    /// - Parameters:
    ///   - key: The key string to store (e.g., the device API key).
    ///   - service: The Keychain service identifier. Defaults to `com.phosra.device-key`.
    public static func save(key: String, service: String = defaultService) throws {
        guard let data = key.data(using: .utf8) else {
            throw KeychainError.encodingFailed
        }

        // Delete any existing item first
        let deleteQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
        ]
        SecItemDelete(deleteQuery as CFDictionary)

        // Add the new item
        let addQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]

        let status = SecItemAdd(addQuery as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    /// Load a key string from the Keychain.
    ///
    /// - Parameter service: The Keychain service identifier. Defaults to `com.phosra.device-key`.
    /// - Returns: The stored key string, or `nil` if no value exists.
    public static func load(service: String = defaultService) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        if status == errSecItemNotFound {
            return nil
        }

        guard status == errSecSuccess else {
            throw KeychainError.loadFailed(status)
        }

        guard let data = result as? Data, let key = String(data: data, encoding: .utf8) else {
            throw KeychainError.unexpectedData
        }

        return key
    }

    /// Delete the stored key from the Keychain.
    ///
    /// - Parameter service: The Keychain service identifier. Defaults to `com.phosra.device-key`.
    public static func delete(service: String = defaultService) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed(status)
        }
    }
}
