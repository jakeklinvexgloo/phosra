import Foundation

// MARK: - API Error

enum PhosraAPIError: Error, LocalizedError {
    case unauthorized
    case notFound
    case badRequest(String)
    case serverError(Int)
    case networkError(Error)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .unauthorized:
            return "Authentication required. Please sign in again."
        case .notFound:
            return "The requested resource was not found."
        case .badRequest(let message):
            return "Bad request: \(message)"
        case .serverError(let code):
            return "Server error (HTTP \(code)). Please try again later."
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Failed to parse server response: \(error.localizedDescription)"
        }
    }
}

// MARK: - API Client

actor PhosraAPIClient {

    static let shared = PhosraAPIClient()

    private let baseURL = "https://phosra-api.fly.dev/api/v1"
    private let session = URLSession.shared
    private let decoder = JSONDecoder.phosraAPI
    private let encoder = JSONEncoder.phosraAPI

    private init() {}

    // MARK: - Families

    func listFamilies() async throws -> [Family] {
        try await request("GET", path: "/families")
    }

    func createFamily(name: String) async throws -> Family {
        try await request("POST", path: "/families", body: ["name": name])
    }

    // MARK: - Children

    func listChildren(familyId: String) async throws -> [Child] {
        try await request("GET", path: "/families/\(familyId)/children")
    }

    func getChild(childId: String) async throws -> Child {
        try await request("GET", path: "/children/\(childId)")
    }

    func getAgeRatings(childId: String) async throws -> [String: String] {
        try await request("GET", path: "/children/\(childId)/age-ratings")
    }

    // MARK: - Quick Setup

    func quickSetup(
        childName: String,
        birthDate: Date,
        strictness: String,
        familyId: String? = nil
    ) async throws -> QuickSetupResponse {
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withFullDate]

        var body: [String: String] = [
            "child_name": childName,
            "birth_date": dateFormatter.string(from: birthDate),
            "strictness": strictness
        ]
        if let familyId {
            body["family_id"] = familyId
        }

        return try await request("POST", path: "/quick-setup", body: body)
    }

    // MARK: - Policies

    func listPolicies(childId: String) async throws -> [ChildPolicy] {
        try await request("GET", path: "/children/\(childId)/policies")
    }

    func activatePolicy(policyId: String) async throws {
        try await requestVoid("POST", path: "/policies/\(policyId)/activate")
    }

    func pausePolicy(policyId: String) async throws {
        try await requestVoid("POST", path: "/policies/\(policyId)/pause")
    }

    func generateFromAge(policyId: String) async throws -> [PolicyRule] {
        try await request("POST", path: "/policies/\(policyId)/generate-from-age")
    }

    // MARK: - Rules

    func createRule(
        policyId: String,
        category: String,
        enabled: Bool,
        config: [String: Any]? = nil
    ) async throws -> PolicyRule {
        var body: [String: AnyCodableValue] = [
            "category": .string(category),
            "enabled": .bool(enabled)
        ]
        if let config {
            body["config"] = AnyCodableValue(config)
        }
        return try await request("POST", path: "/policies/\(policyId)/rules", body: AnyCodable(body))
    }

    func updateRule(
        ruleId: String,
        enabled: Bool? = nil,
        config: [String: Any]? = nil
    ) async throws {
        var body: [String: AnyCodableValue] = [:]
        if let enabled {
            body["enabled"] = .bool(enabled)
        }
        if let config {
            body["config"] = AnyCodableValue(config)
        }
        try await requestVoid("PATCH", path: "/rules/\(ruleId)", body: AnyCodable(body))
    }

    func bulkUpsertRules(policyId: String, rules: [[String: Any]]) async throws {
        let body: [String: AnyCodableValue] = [
            "rules": .array(rules.map { AnyCodableValue($0) })
        ]
        try await requestVoid("PUT", path: "/policies/\(policyId)/rules/bulk", body: AnyCodable(body))
    }

    // MARK: - Enforcement

    func triggerEnforcement(
        childId: String,
        platformIds: [String]? = nil
    ) async throws -> EnforcementResult {
        var body: [String: AnyCodableValue] = [
            "child_id": .string(childId)
        ]
        if let platformIds {
            body["platform_ids"] = .array(platformIds.map { .string($0) })
        }
        return try await request("POST", path: "/enforcement/trigger", body: AnyCodable(body))
    }

    // MARK: - Viewing Analytics

    func getViewingAnalytics(childId: String) async throws -> ViewingAnalytics {
        try await request("GET", path: "/children/\(childId)/viewing-analytics")
    }

    // MARK: - Device Registration

    func registerDevice(
        childId: String,
        deviceName: String,
        deviceModel: String,
        osVersion: String,
        apnsToken: String? = nil
    ) async throws -> DeviceRegistrationResponse {
        var body: [String: String] = [
            "child_id": childId,
            "device_name": deviceName,
            "device_model": deviceModel,
            "os_version": osVersion
        ]
        if let apnsToken {
            body["apns_token"] = apnsToken
        }
        return try await request("POST", path: "/devices/register", body: body)
    }

    // MARK: - Emergency Pause / Resume

    func emergencyPause(childId: String) async throws {
        try await requestVoid("POST", path: "/children/\(childId)/emergency-pause")
    }

    func emergencyResume(childId: String) async throws {
        try await requestVoid("POST", path: "/children/\(childId)/emergency-resume")
    }

    // MARK: - Private Helpers

    /// Performs an authenticated HTTP request and decodes the JSON response.
    private func request<T: Decodable>(
        _ method: String,
        path: String,
        body: (any Encodable)? = nil
    ) async throws -> T {
        let (data, _) = try await performRequest(method, path: path, body: body)

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw PhosraAPIError.decodingError(error)
        }
    }

    /// Performs an authenticated HTTP request that returns no meaningful body.
    private func requestVoid(
        _ method: String,
        path: String,
        body: (any Encodable)? = nil
    ) async throws {
        let _ = try await performRequest(method, path: path, body: body)
    }

    /// Shared implementation: builds the URLRequest, attaches auth, sends, and validates status.
    private func performRequest(
        _ method: String,
        path: String,
        body: (any Encodable)? = nil
    ) async throws -> (Data, HTTPURLResponse) {
        guard let url = URL(string: baseURL + path) else {
            throw PhosraAPIError.badRequest("Invalid URL: \(path)")
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")

        // Attach JWT
        let jwt = try await AuthManager.shared.getValidJWT()
        urlRequest.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")

        // Encode body if present
        if let body {
            do {
                urlRequest.httpBody = try encoder.encode(body)
            } catch {
                throw PhosraAPIError.decodingError(error)
            }
        }

        // Perform request
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: urlRequest)
        } catch {
            throw PhosraAPIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw PhosraAPIError.networkError(
                URLError(.badServerResponse)
            )
        }

        // Map HTTP status codes to errors
        switch httpResponse.statusCode {
        case 200...299:
            return (data, httpResponse)
        case 401:
            throw PhosraAPIError.unauthorized
        case 404:
            throw PhosraAPIError.notFound
        case 400:
            let message = extractErrorMessage(from: data)
            throw PhosraAPIError.badRequest(message)
        default:
            throw PhosraAPIError.serverError(httpResponse.statusCode)
        }
    }

    /// Attempts to extract an error message from a JSON error response body.
    private func extractErrorMessage(from data: Data) -> String {
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let message = json["error"] as? String {
            return message
        }
        return String(data: data, encoding: .utf8) ?? "Unknown error"
    }
}
