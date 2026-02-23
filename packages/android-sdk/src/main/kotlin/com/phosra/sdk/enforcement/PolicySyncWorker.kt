package com.phosra.sdk.enforcement

import android.content.Context
import android.util.Log
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.phosra.sdk.PhosraClient
import com.phosra.sdk.networking.KeystoreHelper
import com.phosra.sdk.networking.PhosraApiError
import java.util.concurrent.TimeUnit

/**
 * WorkManager-based background worker that periodically syncs policy from the server.
 *
 * Workflow:
 * 1. Load device key from Android Keystore
 * 2. Create a [PhosraClient] for device authentication
 * 3. Fetch policy with conditional request (since_version=N)
 * 4. If new policy received: apply via [EnforcementEngine]
 * 5. Report enforcement status back to server
 * 6. Acknowledge the policy version
 *
 * Default sync interval: 15 minutes.
 * The worker respects network constraints and will retry on failure.
 */
class PolicySyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    companion object {
        private const val TAG = "PhosraPolicySync"
        private const val WORK_NAME = "phosra_policy_sync"
        private const val DEFAULT_INTERVAL_MINUTES = 15L

        /**
         * Schedule periodic policy sync.
         *
         * @param context Application context.
         * @param intervalMinutes Sync interval in minutes (minimum 15 per WorkManager).
         */
        fun schedule(context: Context, intervalMinutes: Long = DEFAULT_INTERVAL_MINUTES) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<PolicySyncWorker>(
                intervalMinutes, TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .addTag(TAG)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                syncRequest
            )

            Log.i(TAG, "Scheduled policy sync every ${intervalMinutes} minutes")
        }

        /**
         * Cancel periodic policy sync.
         */
        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
            Log.i(TAG, "Cancelled policy sync")
        }

        /**
         * Trigger an immediate one-time policy sync (in addition to the periodic schedule).
         */
        fun triggerImmediate(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val immediateRequest = OneTimeWorkRequestBuilder<PolicySyncWorker>()
                .setConstraints(constraints)
                .addTag("${TAG}_immediate")
                .build()

            WorkManager.getInstance(context).enqueue(immediateRequest)
            Log.i(TAG, "Triggered immediate policy sync")
        }
    }

    override suspend fun doWork(): Result {
        Log.d(TAG, "Starting policy sync")

        // 1. Load device key
        val deviceKey = KeystoreHelper.loadDeviceKey(applicationContext)
        if (deviceKey == null) {
            Log.w(TAG, "No device key found — skipping sync")
            return Result.failure()
        }

        // 2. Create client
        val client = PhosraClient.forDevice(deviceKey)

        // 3. Load last known policy version for conditional fetch
        val lastVersion = KeystoreHelper.loadLastPolicyVersion(applicationContext)

        // 4. Fetch policy
        val policy = try {
            client.fetchPolicy(sinceVersion = if (lastVersion > 0) lastVersion else null)
        } catch (e: PhosraApiError.Unauthorized) {
            Log.e(TAG, "Device key unauthorized — device may have been revoked")
            return Result.failure()
        } catch (e: PhosraApiError.NetworkError) {
            Log.w(TAG, "Network error during policy fetch — will retry", e.cause)
            return Result.retry()
        } catch (e: PhosraApiError.RateLimited) {
            Log.w(TAG, "Rate limited — will retry after ${e.retryAfterSeconds}s")
            return Result.retry()
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error fetching policy", e)
            return Result.retry()
        }

        // 5. If no new policy (304 Not Modified), we're done
        if (policy == null) {
            Log.d(TAG, "Policy unchanged (version $lastVersion)")
            return Result.success()
        }

        Log.i(TAG, "Received new policy version ${policy.version} (was $lastVersion)")

        // 6. Apply policy via enforcement engine
        val engine = EnforcementEngine(applicationContext)
        val report = engine.applyPolicy(policy)

        Log.i(TAG, "Enforcement result: ${report.overallStatus}")

        // 7. Report enforcement status back to server
        try {
            val reporter = EnforcementReporter(client)
            reporter.reportEnforcementStatus(policy.version, report)
            Log.d(TAG, "Enforcement status reported")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to report enforcement status", e)
            // Don't fail the whole sync for a reporting error
        }

        // 8. Acknowledge policy version
        try {
            client.acknowledgePolicy(policy.version)
            KeystoreHelper.saveLastPolicyVersion(applicationContext, policy.version)
            Log.d(TAG, "Policy version ${policy.version} acknowledged")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to acknowledge policy version", e)
            // Don't fail — the server will still have the enforcement report
        }

        return Result.success()
    }
}
