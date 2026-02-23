package com.phosra.sdk.enforcement

import android.content.Context
import com.phosra.sdk.models.WebFilter
import com.phosra.sdk.services.PhosraVpnService

/**
 * Enforces web content filtering using a local VPN service for DNS-level blocking.
 *
 * Strategy:
 * - Starts [PhosraVpnService] as a local VPN tunnel
 * - Intercepts DNS queries and blocks resolution for filtered domains
 * - Supports domain blocklists, allowlists, and category-based filtering
 * - Safe search enforcement redirects search engine queries through safe search
 *
 * This does NOT proxy all traffic. It operates at the DNS level only,
 * which is lightweight and does not impact connection speed for allowed sites.
 *
 * Required permissions:
 * - BIND_VPN_SERVICE (user must approve the VPN connection dialog)
 *
 * TODO: Full VPN-based DNS filtering requires extensive device testing.
 *       Consider using DNS-over-HTTPS provider APIs as an alternative on
 *       Android 9+ (Private DNS settings).
 */
class WebFilterEnforcer(private val context: Context) {

    private var currentFilter: WebFilter? = null
    private var isActive = false

    /**
     * Apply web filtering rules.
     *
     * @param webFilter The web filter configuration from the compiled policy.
     * @return A [CategoryReport] describing the enforcement result.
     */
    fun apply(webFilter: WebFilter): CategoryReport {
        currentFilter = webFilter

        // Check if there's anything to enforce
        val hasRules = webFilter.safeSearch ||
            webFilter.blockedDomains.isNotEmpty() ||
            webFilter.allowedDomains.isNotEmpty() ||
            webFilter.blockedCategories.isNotEmpty() ||
            webFilter.level.isNotBlank()

        if (!hasRules) {
            return CategoryReport(
                status = EnforcementStatus.ENFORCED,
                framework = "VpnService",
                details = "No web filter rules configured; VPN not started"
            )
        }

        // Start the VPN service for DNS filtering
        return try {
            PhosraVpnService.start(context, webFilter)
            isActive = true

            val details = buildString {
                append("Web filter active (level: ${webFilter.level.ifBlank { "custom" }}). ")
                if (webFilter.safeSearch) append("Safe search enforced. ")
                if (webFilter.blockedDomains.isNotEmpty()) {
                    append("${webFilter.blockedDomains.size} domains blocked. ")
                }
                if (webFilter.allowedDomains.isNotEmpty()) {
                    append("${webFilter.allowedDomains.size} domains allowed. ")
                }
                if (webFilter.blockedCategories.isNotEmpty()) {
                    append("${webFilter.blockedCategories.size} categories blocked.")
                }
            }

            CategoryReport(
                status = EnforcementStatus.ENFORCED,
                framework = "VpnService (DNS filtering)",
                details = details.trim()
            )
        } catch (e: Exception) {
            CategoryReport(
                status = EnforcementStatus.FAILED,
                framework = "VpnService",
                details = "Failed to start VPN: ${e.message}",
                error = e
            )
        }
    }

    /**
     * Remove web filtering and stop the VPN service.
     */
    fun remove() {
        PhosraVpnService.stop(context)
        currentFilter = null
        isActive = false
    }

    /**
     * Get the current enforcement status.
     */
    fun currentStatus(): CategoryReport {
        return if (currentFilter != null && isActive) {
            CategoryReport(
                status = EnforcementStatus.ENFORCED,
                framework = "VpnService (DNS filtering)",
                details = "Web filter active"
            )
        } else {
            CategoryReport(
                status = EnforcementStatus.PENDING,
                framework = "VpnService",
                details = "Web filter not active"
            )
        }
    }

    /**
     * Check if a domain is blocked by the current filter configuration.
     *
     * @param domain The domain to check (e.g., "example.com").
     * @return true if the domain should be blocked.
     */
    fun isDomainBlocked(domain: String): Boolean {
        val filter = currentFilter ?: return false
        val normalizedDomain = domain.lowercase().trimEnd('.')

        // If we have an allowlist, only allow those domains
        if (filter.allowedDomains.isNotEmpty()) {
            return !filter.allowedDomains.any { allowed ->
                normalizedDomain == allowed.lowercase() ||
                    normalizedDomain.endsWith(".${allowed.lowercase()}")
            }
        }

        // Check explicit blocklist
        if (filter.blockedDomains.any { blocked ->
                normalizedDomain == blocked.lowercase() ||
                    normalizedDomain.endsWith(".${blocked.lowercase()}")
            }) {
            return true
        }

        // Category-based blocking would require a domain categorization database
        // TODO: Integrate with a domain categorization API or local database
        //       for blocked_categories enforcement

        return false
    }

    /**
     * Get the safe search enforcement settings for major search engines.
     * Returns DNS rewrites or query parameter modifications needed.
     */
    fun getSafeSearchConfig(): Map<String, String> {
        if (currentFilter?.safeSearch != true) return emptyMap()

        // Safe search enforcement via DNS rewriting:
        // - Google: Redirect to forcesafesearch.google.com
        // - Bing: Redirect to strict.bing.com
        // - DuckDuckGo: Append safe=1 parameter
        // - YouTube: Redirect to restrictmoderate mode via DNS
        return mapOf(
            "www.google.com" to "forcesafesearch.google.com",
            "google.com" to "forcesafesearch.google.com",
            "www.bing.com" to "strict.bing.com",
            "bing.com" to "strict.bing.com",
            "www.youtube.com" to "restrict.youtube.com",
            "youtube.com" to "restrict.youtube.com",
            "m.youtube.com" to "restrict.youtube.com"
        )
    }
}
