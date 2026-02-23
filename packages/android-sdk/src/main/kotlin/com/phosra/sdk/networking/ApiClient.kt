package com.phosra.sdk.networking

import com.phosra.sdk.PhosraConfiguration
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Low-level OkHttp-based HTTP client for the Phosra API.
 *
 * Handles:
 * - Authentication headers (X-Device-Key or Bearer token)
 * - JSON serialization/deserialization via kotlinx.serialization
 * - 304 Not Modified handling for conditional policy fetches
 * - Proper error mapping to [PhosraApiError] sealed class
 * - Coroutine-based async execution
 */
class ApiClient(private val config: PhosraConfiguration) {

    companion object {
        private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()
        private const val HEADER_DEVICE_KEY = "X-Device-Key"
        private const val HEADER_AUTHORIZATION = "Authorization"
        private const val HEADER_CONTENT_TYPE = "Content-Type"
        private const val HEADER_USER_AGENT = "User-Agent"
        private const val HEADER_RETRY_AFTER = "Retry-After"

        private const val SDK_USER_AGENT = "PhosraAndroidSDK/1.0.0"
    }

    val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        isLenient = true
        coerceInputValues = true
    }

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    /**
     * Perform a GET request.
     *
     * @param path Relative path appended to the base URL (e.g., "/device/policy")
     * @param queryParams Optional query parameters
     * @return Raw response body string, or null for 304 Not Modified
     * @throws PhosraApiError on any failure
     */
    suspend fun get(
        path: String,
        queryParams: Map<String, String> = emptyMap()
    ): String? {
        val urlBuilder = StringBuilder(config.baseUrl).append(path)
        if (queryParams.isNotEmpty()) {
            urlBuilder.append("?")
            urlBuilder.append(
                queryParams.entries.joinToString("&") { (k, v) ->
                    "${k}=${v}"
                }
            )
        }

        val request = Request.Builder()
            .url(urlBuilder.toString())
            .get()
            .apply { addAuthHeaders(this) }
            .addHeader(HEADER_USER_AGENT, SDK_USER_AGENT)
            .build()

        val response = executeRequest(request)
        return handleResponse(response)
    }

    /**
     * Perform a POST request with a JSON body.
     *
     * @param path Relative path appended to the base URL
     * @param body Serialized JSON string for the request body
     * @return Raw response body string
     * @throws PhosraApiError on any failure
     */
    suspend fun post(path: String, body: String): String? {
        val requestBody = body.toRequestBody(JSON_MEDIA_TYPE)

        val request = Request.Builder()
            .url("${config.baseUrl}$path")
            .post(requestBody)
            .apply { addAuthHeaders(this) }
            .addHeader(HEADER_USER_AGENT, SDK_USER_AGENT)
            .addHeader(HEADER_CONTENT_TYPE, "application/json")
            .build()

        val response = executeRequest(request)
        return handleResponse(response)
    }

    /**
     * Perform a PUT request with a JSON body.
     *
     * @param path Relative path appended to the base URL
     * @param body Serialized JSON string for the request body
     * @return Raw response body string
     * @throws PhosraApiError on any failure
     */
    suspend fun put(path: String, body: String): String? {
        val requestBody = body.toRequestBody(JSON_MEDIA_TYPE)

        val request = Request.Builder()
            .url("${config.baseUrl}$path")
            .put(requestBody)
            .apply { addAuthHeaders(this) }
            .addHeader(HEADER_USER_AGENT, SDK_USER_AGENT)
            .addHeader(HEADER_CONTENT_TYPE, "application/json")
            .build()

        val response = executeRequest(request)
        return handleResponse(response)
    }

    /**
     * Perform a DELETE request.
     *
     * @param path Relative path appended to the base URL
     * @return Raw response body string
     * @throws PhosraApiError on any failure
     */
    suspend fun delete(path: String): String? {
        val request = Request.Builder()
            .url("${config.baseUrl}$path")
            .delete()
            .apply { addAuthHeaders(this) }
            .addHeader(HEADER_USER_AGENT, SDK_USER_AGENT)
            .build()

        val response = executeRequest(request)
        return handleResponse(response)
    }

    // ── Private helpers ────────────────────────────────────────────

    private fun addAuthHeaders(builder: Request.Builder) {
        config.deviceKey?.let { key ->
            builder.addHeader(HEADER_DEVICE_KEY, key)
        }
        config.parentToken?.let { token ->
            builder.addHeader(HEADER_AUTHORIZATION, "Bearer $token")
        }
    }

    /**
     * Execute the OkHttp request asynchronously using coroutines.
     */
    private suspend fun executeRequest(request: Request): Response {
        return withContext(Dispatchers.IO) {
            suspendCancellableCoroutine { continuation ->
                val call = httpClient.newCall(request)

                continuation.invokeOnCancellation {
                    call.cancel()
                }

                call.enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        if (continuation.isActive) {
                            continuation.resumeWithException(
                                PhosraApiError.NetworkError(e)
                            )
                        }
                    }

                    override fun onResponse(call: Call, response: Response) {
                        if (continuation.isActive) {
                            continuation.resume(response)
                        }
                    }
                })
            }
        }
    }

    /**
     * Map the HTTP response to a result or throw the appropriate [PhosraApiError].
     */
    private fun handleResponse(response: Response): String? {
        val code = response.code
        val body = response.body?.string()

        return when {
            code == 304 -> null // Not Modified
            code in 200..299 -> body ?: ""
            code == 401 -> throw PhosraApiError.Unauthorized
            code == 404 -> throw PhosraApiError.NotFound
            code == 429 -> {
                val retryAfter = response.header(HEADER_RETRY_AFTER)?.toLongOrNull()
                throw PhosraApiError.RateLimited(retryAfter)
            }
            else -> throw PhosraApiError.HttpError(code, body)
        }
    }
}
