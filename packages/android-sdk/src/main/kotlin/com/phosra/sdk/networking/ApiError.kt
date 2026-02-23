package com.phosra.sdk.networking

/**
 * Sealed class hierarchy for all API errors the SDK can produce.
 * Consumers can exhaustively match on these to handle every error case.
 */
sealed class PhosraApiError : Exception() {

    /** HTTP error with a non-success status code. */
    data class HttpError(
        val statusCode: Int,
        override val message: String?
    ) : PhosraApiError()

    /** Network-level failure (no connectivity, DNS resolution, timeout, etc.). */
    data class NetworkError(
        override val cause: Throwable
    ) : PhosraApiError() {
        override val message: String = cause.message ?: "Network error"
    }

    /** Failed to decode the JSON response body. */
    data class DecodingError(
        override val cause: Throwable
    ) : PhosraApiError() {
        override val message: String = cause.message ?: "JSON decoding error"
    }

    /** 401 Unauthorized — device key or bearer token is invalid/expired. */
    data object Unauthorized : PhosraApiError() {
        override val message: String = "Unauthorized"
    }

    /** 404 Not Found. */
    data object NotFound : PhosraApiError() {
        override val message: String = "Not found"
    }

    /** 429 Too Many Requests — includes optional Retry-After header value. */
    data class RateLimited(
        val retryAfterSeconds: Long?
    ) : PhosraApiError() {
        override val message: String = "Rate limited" +
            (retryAfterSeconds?.let { ", retry after ${it}s" } ?: "")
    }

    /** 304 Not Modified — policy has not changed since the requested version. */
    data object NotModified : PhosraApiError() {
        override val message: String = "Not modified"
    }

    /** No device key is stored — must register the device first. */
    data object NoDeviceKey : PhosraApiError() {
        override val message: String = "No device key available"
    }
}
