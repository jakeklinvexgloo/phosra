import Foundation

/// Low-level HTTP client for communicating with the Phosra API.
///
/// Handles authentication headers, JSON encoding/decoding with snake_case keys,
/// HTTP 304 Not Modified for conditional policy fetches, and error mapping.
final class APIClient: @unchecked Sendable {
    private let baseURL: URL
    private let session: URLSession
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    /// Authentication mode for this client.
    enum AuthMode {
        /// Device-key authentication via `X-Device-Key` header.
        case deviceKey(String)
        /// Parent JWT authentication via `Authorization: Bearer` header.
        case parentToken(String)
        /// No authentication.
        case none
    }

    private let authMode: AuthMode

    init(baseURL: URL, authMode: AuthMode, session: URLSession? = nil) {
        self.baseURL = baseURL
        self.authMode = authMode
        self.session = session ?? URLSession(configuration: .default)

        self.encoder = JSONEncoder()
        self.encoder.keyEncodingStrategy = .convertToSnakeCase
        self.encoder.dateEncodingStrategy = .iso8601

        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .useDefaultKeys // We use explicit CodingKeys
        self.decoder.dateDecodingStrategy = .iso8601
    }

    // MARK: - Request Methods

    /// Perform a GET request and decode the response.
    ///
    /// - Parameters:
    ///   - path: API path relative to baseURL (e.g., "/device/policy").
    ///   - queryItems: Optional URL query parameters.
    /// - Returns: The decoded response, or `nil` if the server returned 304 Not Modified.
    func get<T: Decodable>(path: String, queryItems: [URLQueryItem]? = nil) async throws -> T? {
        let request = try buildRequest(method: "GET", path: path, queryItems: queryItems)
        let (data, response) = try await perform(request)

        if response.statusCode == 304 {
            return nil
        }

        try validateResponse(response, data: data)
        return try decode(T.self, from: data)
    }

    /// Perform a GET request and return the decoded response (non-optional).
    func getRequired<T: Decodable>(path: String, queryItems: [URLQueryItem]? = nil) async throws -> T {
        guard let result: T = try await get(path: path, queryItems: queryItems) else {
            throw PhosraAPIError.notModified
        }
        return result
    }

    /// Perform a POST request with a JSON body and decode the response.
    func post<Body: Encodable, Response: Decodable>(
        path: String,
        body: Body
    ) async throws -> Response {
        var request = try buildRequest(method: "POST", path: path)
        request.httpBody = try encodeBody(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (data, response) = try await perform(request)
        try validateResponse(response, data: data)
        return try decode(Response.self, from: data)
    }

    /// Perform a POST request with a JSON body, ignoring the response body.
    func postVoid<Body: Encodable>(path: String, body: Body) async throws {
        var request = try buildRequest(method: "POST", path: path)
        request.httpBody = try encodeBody(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (data, response) = try await perform(request)
        try validateResponse(response, data: data)
    }

    // MARK: - Internals

    private func buildRequest(
        method: String,
        path: String,
        queryItems: [URLQueryItem]? = nil
    ) throws -> URLRequest {
        var components = URLComponents(url: baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: true)!
        if let queryItems = queryItems, !queryItems.isEmpty {
            components.queryItems = queryItems
        }

        guard let url = components.url else {
            throw PhosraAPIError.networkError(URLError(.badURL))
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("PhosraSDK-iOS/1.0", forHTTPHeaderField: "User-Agent")

        // Set authentication header
        switch authMode {
        case .deviceKey(let key):
            request.setValue(key, forHTTPHeaderField: "X-Device-Key")
        case .parentToken(let token):
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        case .none:
            break
        }

        return request
    }

    private func perform(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw PhosraAPIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw PhosraAPIError.networkError(URLError(.badServerResponse))
        }

        return (data, httpResponse)
    }

    private func validateResponse(_ response: HTTPURLResponse, data: Data) throws {
        switch response.statusCode {
        case 200...299:
            return
        case 304:
            return // Handled by caller
        case 401:
            throw PhosraAPIError.unauthorized
        case 404:
            throw PhosraAPIError.notFound
        case 429:
            let retryAfter = response.value(forHTTPHeaderField: "Retry-After")
                .flatMap { TimeInterval($0) }
            throw PhosraAPIError.rateLimited(retryAfter: retryAfter)
        default:
            let message = parseErrorMessage(from: data)
            throw PhosraAPIError.httpError(statusCode: response.statusCode, message: message)
        }
    }

    private func encodeBody<T: Encodable>(_ body: T) throws -> Data {
        do {
            return try encoder.encode(body)
        } catch {
            throw PhosraAPIError.decodingError(error)
        }
    }

    private func decode<T: Decodable>(_ type: T.Type, from data: Data) throws -> T {
        do {
            return try decoder.decode(type, from: data)
        } catch {
            throw PhosraAPIError.decodingError(error)
        }
    }

    private func parseErrorMessage(from data: Data) -> String? {
        struct ErrorBody: Decodable {
            let error: String?
            let message: String?
        }
        guard let body = try? JSONDecoder().decode(ErrorBody.self, from: data) else {
            return String(data: data, encoding: .utf8)
        }
        return body.error ?? body.message
    }
}
