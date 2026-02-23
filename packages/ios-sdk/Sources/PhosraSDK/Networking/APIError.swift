import Foundation

/// Errors that can occur when communicating with the Phosra API.
public enum PhosraAPIError: Error, LocalizedError {
    /// A network-level error (no connectivity, DNS failure, timeout, etc.).
    case networkError(Error)

    /// The server returned an HTTP error status code.
    case httpError(statusCode: Int, message: String?)

    /// The response body could not be decoded into the expected type.
    case decodingError(Error)

    /// 401 Unauthorized -- the device key or parent token is invalid or expired.
    case unauthorized

    /// 404 Not Found -- the requested resource does not exist.
    case notFound

    /// 429 Too Many Requests -- the client is being rate-limited.
    case rateLimited(retryAfter: TimeInterval?)

    /// 304 Not Modified -- the policy has not changed since the requested version.
    case notModified

    /// No device key is configured. Required for device-authenticated endpoints.
    case noDeviceKey

    /// No parent token is configured. Required for parent-authenticated endpoints.
    case noParentToken

    public var errorDescription: String? {
        switch self {
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .httpError(let statusCode, let message):
            if let message = message {
                return "HTTP \(statusCode): \(message)"
            }
            return "HTTP error \(statusCode)"
        case .decodingError(let error):
            return "Decoding error: \(error.localizedDescription)"
        case .unauthorized:
            return "Unauthorized: invalid or expired credentials"
        case .notFound:
            return "Resource not found"
        case .rateLimited(let retryAfter):
            if let retryAfter = retryAfter {
                return "Rate limited. Retry after \(Int(retryAfter)) seconds."
            }
            return "Rate limited. Please try again later."
        case .notModified:
            return "Not modified (304)"
        case .noDeviceKey:
            return "No device key configured. Call PhosraClient.forDevice() or register a device first."
        case .noParentToken:
            return "No parent token configured. Call PhosraClient.forParent() first."
        }
    }
}
