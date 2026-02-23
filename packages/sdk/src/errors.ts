// ────────────────────────────────────────────────────────────────────────────
// @phosra/sdk — Error classes
// ────────────────────────────────────────────────────────────────────────────

/**
 * Base error for all Phosra SDK errors.
 */
export class PhosraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhosraError";
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error returned by the Phosra API (non-2xx response).
 */
export class PhosraApiError extends PhosraError {
  /** HTTP status code. */
  readonly statusCode: number;
  /** Machine-readable error code from the API, if available. */
  readonly code?: string;
  /** Additional error details from the API response body. */
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "PhosraApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * 401 Unauthorized — token is missing, expired, or invalid.
 */
export class PhosraAuthError extends PhosraApiError {
  constructor(message = "Authentication required", details?: Record<string, unknown>) {
    super(message, 401, "unauthorized", details);
    this.name = "PhosraAuthError";
  }
}

/**
 * 404 Not Found — the requested resource does not exist.
 */
export class PhosraNotFoundError extends PhosraApiError {
  constructor(message = "Resource not found", details?: Record<string, unknown>) {
    super(message, 404, "not_found", details);
    this.name = "PhosraNotFoundError";
  }
}

/**
 * 422 Unprocessable Entity — validation failure.
 */
export class PhosraValidationError extends PhosraApiError {
  constructor(message = "Validation failed", details?: Record<string, unknown>) {
    super(message, 422, "validation_error", details);
    this.name = "PhosraValidationError";
  }
}

/**
 * 429 Too Many Requests — rate limit exceeded.
 */
export class PhosraRateLimitError extends PhosraApiError {
  /** Number of seconds to wait before retrying, if provided by the API. */
  readonly retryAfter?: number;

  constructor(
    message = "Rate limit exceeded",
    retryAfter?: number,
    details?: Record<string, unknown>,
  ) {
    super(message, 429, "rate_limited", details);
    this.name = "PhosraRateLimitError";
    this.retryAfter = retryAfter;
  }
}
