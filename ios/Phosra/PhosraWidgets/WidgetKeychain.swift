import Foundation
import Security

// MARK: - Widget Keychain

/// Lightweight Keychain reader for the widget extension.
/// Shares the same App Group (`group.com.phosra.shared`) and service name
/// as the main app's `KeychainManager`, so it can read the session token
/// that was stored by the main app without any additional setup.
///
/// This is intentionally minimal: the widget only needs to *read* the
/// session token for API calls. All write operations happen in the main app.
enum WidgetKeychain {

    private static let service = "com.phosra.app"
    private static let accessGroup = "group.com.phosra.shared"
    private static let sessionTokenKey = "session_token"

    // MARK: - Public API

    /// Returns the Stytch session token stored by the main app, or `nil`
    /// if the user is not signed in (or the Keychain item is missing).
    static func getSessionToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: sessionTokenKey,
            kSecAttrAccessGroup as String: accessGroup,
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecReturnData as String: true,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }

        return String(data: data, encoding: .utf8)
    }
}
