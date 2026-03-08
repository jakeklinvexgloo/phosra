import Foundation
import Observation

// MARK: - AuthManager

/// Manages Stytch authentication state for the Phosra iOS app.
///
/// Flow:
/// 1. User logs in on phosra.com in Safari
/// 2. Deep-link delivers a Stytch `session_token` (opaque, 7-day expiry)
/// 3. `KeychainManager` stores the token in the shared Keychain
/// 4. Before each API call, `getValidJWT()` exchanges the session_token
///    for a fresh JWT via `POST /v1/sessions/authenticate`
/// 5. JWT is cached in memory for 4 minutes to avoid redundant calls
///
/// The short-lived JWT is NEVER persisted — only the long-lived
/// session_token is stored in the Keychain.
@Observable
final class AuthManager: @unchecked Sendable {

    // MARK: Singleton

    static let shared = AuthManager()

    // MARK: Observable state

    private(set) var isAuthenticated: Bool = false
    private(set) var currentEmail: String?
    private(set) var sessionToken: String?

    // MARK: Stytch credentials

    private let stytchProjectID = "project-live-2ba56535-d746-4f35-9d26-acfadd5e8c99"
    private let stytchSecret = "secret-live-BVWsDsGndQ7Vefiellq3tOO2pBRdFdgLGE8="
    private let stytchAuthURL = URL(string: "https://api.stytch.com/v1/sessions/authenticate")!

    // MARK: JWT cache (in-memory only, actor-protected)

    private let jwtCache = JWTCache()

    // MARK: URLSession (background-safe, no delegate)

    private let urlSession: URLSession = {
        let config = URLSessionConfiguration.ephemeral
        config.timeoutIntervalForRequest = 15
        config.timeoutIntervalForResource = 30
        return URLSession(configuration: config)
    }()

    // MARK: Init

    private init() {
        // Restore persisted state from Keychain
        Task {
            let token = await KeychainManager.shared.getSessionToken()
            let email = await KeychainManager.shared.getUserEmail()
            await MainActor.run {
                self.sessionToken = token
                self.isAuthenticated = token != nil
                self.currentEmail = email
            }
        }
    }

    // MARK: - Public API

    /// Returns a valid Stytch JWT for API calls.
    ///
    /// - Checks the in-memory cache first (4-minute TTL).
    /// - If expired or missing, exchanges the stored `session_token`
    ///   for a fresh JWT via the Stytch API.
    /// - Safe to call from background App Intents (no UI required).
    ///
    /// - Throws: `AuthError` if no session token is stored or the
    ///   Stytch API rejects the request.
    func getValidJWT() async throws -> String {
        // Return cached JWT if still valid
        if let cached = await jwtCache.getIfValid() {
            return cached
        }

        // Load session token from Keychain
        guard let sessionToken = await KeychainManager.shared.getSessionToken() else {
            await setUnauthenticated()
            throw AuthError.noSessionToken
        }

        // Exchange for fresh JWT
        return try await refreshJWT(sessionToken: sessionToken)
    }

    /// Handle a deep-link URL from the login flow.
    ///
    /// Expected format: `phosra-app://auth?session_token=X&email=Y`
    ///
    /// - Returns: `true` if the deep link was an auth link and was handled.
    @discardableResult
    func handleDeepLink(url: URL) -> Bool {
        guard url.scheme == "phosra-app",
              url.host == "auth" else {
            return false
        }

        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let queryItems = components.queryItems else {
            return false
        }

        guard let sessionToken = queryItems.first(where: { $0.name == "session_token" })?.value,
              !sessionToken.isEmpty else {
            return false
        }

        let email = queryItems.first(where: { $0.name == "email" })?.value

        // Store credentials in Keychain (fire-and-forget, errors logged)
        Task {
            do {
                try await KeychainManager.shared.saveSessionToken(sessionToken)
                if let email, !email.isEmpty {
                    try await KeychainManager.shared.saveUserEmail(email)
                }
            } catch {
                print("[AuthManager] Failed to save deep-link credentials: \(error)")
            }

            // Invalidate JWT cache so next call fetches fresh
            await jwtCache.clear()

            await MainActor.run {
                self.sessionToken = sessionToken
                self.isAuthenticated = true
                self.currentEmail = email
            }

            print("[AuthManager] Session token stored via deep link for \(email ?? "unknown user")")
        }

        return true
    }

    /// Log out: clear Keychain, reset in-memory state.
    func logout() {
        Task {
            try? await KeychainManager.shared.clearAll()
            await jwtCache.clear()

            await MainActor.run {
                self.sessionToken = nil
                self.isAuthenticated = false
                self.currentEmail = nil
            }

            print("[AuthManager] Logged out")
        }
    }

    // MARK: - Private: JWT refresh

    private func refreshJWT(sessionToken: String) async throws -> String {
        // Build Basic auth header
        let credentials = "\(stytchProjectID):\(stytchSecret)"
        guard let credentialData = credentials.data(using: .utf8) else {
            throw AuthError.encodingFailed
        }
        let basicAuth = credentialData.base64EncodedString()

        // Build request
        var request = URLRequest(url: stytchAuthURL)
        request.httpMethod = "POST"
        request.setValue("Basic \(basicAuth)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["session_token": sessionToken]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        // Execute
        let (data, response) = try await urlSession.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            let bodyText = String(data: data, encoding: .utf8) ?? ""
            print("[AuthManager] Stytch refresh failed: \(httpResponse.statusCode) \(bodyText)")

            // Session is invalid — clear credentials
            if httpResponse.statusCode == 401 || httpResponse.statusCode == 404 {
                await setUnauthenticated()
                try? await KeychainManager.shared.clearAll()
            }

            throw AuthError.stytchError(
                statusCode: httpResponse.statusCode,
                body: bodyText
            )
        }

        // Parse response
        let parsed = try JSONDecoder().decode(StytchAuthResponse.self, from: data)

        // Cache the fresh JWT for 4 minutes
        await jwtCache.set(jwt: parsed.sessionJwt)

        // If Stytch rotated the session token, update the Keychain + in-memory cache
        if parsed.sessionToken != sessionToken {
            try? await KeychainManager.shared.saveSessionToken(parsed.sessionToken)
            await MainActor.run { self.sessionToken = parsed.sessionToken }
        }

        // Update email from Stytch user object
        if let email = parsed.user?.emails?.first?.email {
            try? await KeychainManager.shared.saveUserEmail(email)
            await MainActor.run {
                self.currentEmail = email
            }
        }

        // Update session expiry awareness
        await MainActor.run {
            self.isAuthenticated = true
        }

        print("[AuthManager] JWT refreshed successfully")
        return parsed.sessionJwt
    }

    private func setUnauthenticated() async {
        await MainActor.run {
            self.sessionToken = nil
            self.isAuthenticated = false
            self.currentEmail = nil
        }
    }
}

// MARK: - JWTCache (actor-isolated, background-safe)

/// Actor-isolated in-memory JWT cache with a 4-minute TTL.
/// Safe to access from any thread, including background App Intents.
private actor JWTCache {

    private var jwt: String?
    private var expiresAt: Date = .distantPast

    /// 4-minute cache duration (JWT is valid ~5 min, 1-min safety buffer).
    private let cacheDuration: TimeInterval = 4 * 60

    /// Returns the cached JWT if it has not expired, otherwise `nil`.
    func getIfValid() -> String? {
        guard let jwt, Date.now < expiresAt else {
            return nil
        }
        return jwt
    }

    /// Cache a fresh JWT with a 4-minute TTL.
    func set(jwt: String) {
        self.jwt = jwt
        self.expiresAt = Date.now.addingTimeInterval(cacheDuration)
    }

    /// Invalidate the cache.
    func clear() {
        self.jwt = nil
        self.expiresAt = .distantPast
    }
}

// MARK: - Stytch API response models

private struct StytchAuthResponse: Decodable {
    let sessionJwt: String
    let sessionToken: String
    let session: StytchSession?
    let user: StytchUser?

    enum CodingKeys: String, CodingKey {
        case sessionJwt = "session_jwt"
        case sessionToken = "session_token"
        case session
        case user
    }
}

private struct StytchSession: Decodable {
    let expiresAt: String?
    let userId: String?

    enum CodingKeys: String, CodingKey {
        case expiresAt = "expires_at"
        case userId = "user_id"
    }
}

private struct StytchUser: Decodable {
    let emails: [StytchEmail]?
}

private struct StytchEmail: Decodable {
    let email: String
}

// MARK: - Auth errors

enum AuthError: LocalizedError {
    case noSessionToken
    case encodingFailed
    case invalidResponse
    case stytchError(statusCode: Int, body: String)

    var errorDescription: String? {
        switch self {
        case .noSessionToken:
            return "No session token stored. Please log in."
        case .encodingFailed:
            return "Failed to encode authentication credentials."
        case .invalidResponse:
            return "Invalid response from authentication server."
        case .stytchError(let statusCode, let body):
            return "Authentication failed (HTTP \(statusCode)): \(body)"
        }
    }
}
