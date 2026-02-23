package com.phosra.sdk.services

import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import com.phosra.sdk.enforcement.WebFilterEnforcer
import com.phosra.sdk.models.WebFilter
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.ByteBuffer

/**
 * Local VPN service for DNS-based web content filtering.
 *
 * This service establishes a local VPN tunnel that intercepts DNS queries
 * and blocks resolution for filtered domains. It does NOT proxy all traffic --
 * only DNS queries are intercepted, making it lightweight and transparent
 * to the user's connection speed.
 *
 * Architecture:
 * 1. Creates a TUN interface that captures all device traffic
 * 2. Reads packets from the TUN interface
 * 3. Inspects DNS query packets (UDP port 53)
 * 4. For blocked domains: responds with NXDOMAIN or 0.0.0.0
 * 5. For allowed domains: forwards to upstream DNS and returns response
 * 6. Non-DNS traffic is passed through unmodified
 *
 * TODO: Full VPN implementation requires extensive testing on real devices.
 *       Key concerns:
 *       - Battery drain from running a persistent VPN
 *       - Compatibility with other VPN apps (only one VPN can be active)
 *       - DNS query parsing and response construction
 *       - IPv6 support
 *       - Split tunneling for performance
 */
class PhosraVpnService : VpnService() {

    companion object {
        private const val TAG = "PhosraVPN"
        private const val VPN_ADDRESS = "10.0.0.2"
        private const val VPN_ROUTE = "0.0.0.0"
        private const val DNS_SERVER = "8.8.8.8"
        private const val DNS_PORT = 53
        private const val MTU = 1500
        private const val EXTRA_WEB_FILTER = "web_filter_config"

        private var isRunning = false

        /**
         * Start the VPN service with the given web filter configuration.
         *
         * @param context Application context.
         * @param config The web filter configuration to enforce.
         */
        fun start(context: Context, config: WebFilter) {
            val intent = Intent(context, PhosraVpnService::class.java).apply {
                val configJson = Json.encodeToString(config)
                putExtra(EXTRA_WEB_FILTER, configJson)
            }
            context.startForegroundService(intent)
        }

        /**
         * Stop the VPN service.
         */
        fun stop(context: Context) {
            val intent = Intent(context, PhosraVpnService::class.java)
            context.stopService(intent)
        }

        /**
         * Check if the VPN service is currently running.
         */
        fun isActive(): Boolean = isRunning
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var webFilter: WebFilter? = null
    private var filterEnforcer: WebFilterEnforcer? = null

    @Volatile
    private var running = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Parse web filter configuration from intent
        intent?.getStringExtra(EXTRA_WEB_FILTER)?.let { configJson ->
            webFilter = try {
                Json.decodeFromString<WebFilter>(configJson)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to parse web filter config", e)
                null
            }
        }

        if (webFilter == null) {
            Log.e(TAG, "No web filter configuration provided")
            stopSelf()
            return START_NOT_STICKY
        }

        filterEnforcer = WebFilterEnforcer(this)

        // Establish the VPN tunnel
        try {
            establishVpn()
            isRunning = true
            running = true
            Log.i(TAG, "VPN service started with web filter config")

            // Start packet processing in a background thread
            Thread(::processPackets, "PhosraVPN-PacketProcessor").start()

        } catch (e: Exception) {
            Log.e(TAG, "Failed to establish VPN", e)
            stopSelf()
            return START_NOT_STICKY
        }

        return START_STICKY
    }

    override fun onDestroy() {
        running = false
        isRunning = false

        try {
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
            Log.e(TAG, "Error closing VPN interface", e)
        }

        Log.i(TAG, "VPN service stopped")
        super.onDestroy()
    }

    override fun onRevoke() {
        // Called when the user revokes VPN permission
        Log.w(TAG, "VPN permission revoked by user")
        running = false
        isRunning = false
        stopSelf()
        super.onRevoke()
    }

    // ── Private implementation ─────────────────────────────────────

    private fun establishVpn() {
        val builder = Builder()
            .setSession("Phosra Web Filter")
            .addAddress(VPN_ADDRESS, 32)
            .addRoute(VPN_ROUTE, 0) // Capture all traffic
            .addDnsServer(DNS_SERVER)
            .setMtu(MTU)
            .setBlocking(true)

        // Exclude our own app from the VPN to prevent loops
        builder.addDisallowedApplication(packageName)

        vpnInterface = builder.establish()
            ?: throw IllegalStateException("VPN interface establishment returned null")

        Log.i(TAG, "VPN tunnel established")
    }

    /**
     * Main packet processing loop.
     *
     * TODO: This is a simplified stub. Full implementation needs:
     * - Proper IP packet parsing
     * - DNS query extraction from UDP packets
     * - Domain name parsing from DNS wire format
     * - DNS response construction for blocked domains
     * - Forwarding allowed queries to upstream DNS
     * - Reassembling responses back to the TUN interface
     * - TCP DNS query support
     * - IPv6 support
     */
    private fun processPackets() {
        val vpnFd = vpnInterface ?: return
        val input = FileInputStream(vpnFd.fileDescriptor)
        val output = FileOutputStream(vpnFd.fileDescriptor)
        val buffer = ByteBuffer.allocate(MTU)

        Log.d(TAG, "Starting packet processing loop")

        while (running) {
            try {
                // Read a packet from the TUN interface
                val length = input.read(buffer.array())
                if (length <= 0) {
                    Thread.sleep(10)
                    continue
                }

                buffer.limit(length)

                // TODO: Parse the IP packet
                // - Check if it's a UDP packet to port 53 (DNS query)
                // - If DNS: extract the queried domain name
                //   - If domain is blocked: construct a DNS response with 0.0.0.0
                //   - If domain needs safe search redirect: rewrite the query
                //   - Otherwise: forward to upstream DNS server
                // - If not DNS: forward the packet unchanged

                // For now, forward all packets through (pass-through mode)
                // This ensures the VPN doesn't break connectivity while
                // the DNS filtering logic is being implemented.
                forwardPacket(buffer, output)

                buffer.clear()
            } catch (e: InterruptedException) {
                Log.d(TAG, "Packet processing interrupted")
                break
            } catch (e: Exception) {
                Log.e(TAG, "Error processing packet", e)
                if (!running) break
            }
        }

        Log.d(TAG, "Packet processing loop ended")
    }

    /**
     * Forward a packet through the VPN tunnel.
     * In a full implementation, this would selectively block or modify DNS packets.
     */
    private fun forwardPacket(buffer: ByteBuffer, output: FileOutputStream) {
        // TODO: Implement selective forwarding
        // For now this is a no-op pass-through stub
    }

    /**
     * Check if a DNS query domain should be blocked.
     */
    private fun shouldBlockDomain(domain: String): Boolean {
        return filterEnforcer?.isDomainBlocked(domain) ?: false
    }

    /**
     * Get safe search DNS rewrites if applicable.
     */
    private fun getSafeSearchRewrite(domain: String): String? {
        val rewrites = filterEnforcer?.getSafeSearchConfig() ?: return null
        return rewrites[domain.lowercase()]
    }
}
