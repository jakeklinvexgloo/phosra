package com.phosra.sdk.networking

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Secure storage for the device API key using Android's EncryptedSharedPreferences.
 *
 * The API key is encrypted at rest using AES-256 GCM via the Android Keystore.
 * This ensures the key cannot be extracted even on a rooted device without
 * access to the hardware-backed keystore.
 */
object KeystoreHelper {

    private const val PREFS_FILE = "phosra_secure_prefs"
    private const val KEY_DEVICE_API_KEY = "device_api_key"
    private const val KEY_LAST_POLICY_VERSION = "last_policy_version"

    /**
     * Save the device API key securely.
     * Call this immediately after device registration with the one-time API key.
     */
    fun saveDeviceKey(context: Context, key: String) {
        getEncryptedPrefs(context).edit()
            .putString(KEY_DEVICE_API_KEY, key)
            .apply()
    }

    /**
     * Load the stored device API key, or null if not yet registered.
     */
    fun loadDeviceKey(context: Context): String? {
        return getEncryptedPrefs(context).getString(KEY_DEVICE_API_KEY, null)
    }

    /**
     * Delete the stored device API key (e.g., on device revocation or uninstall).
     */
    fun deleteDeviceKey(context: Context) {
        getEncryptedPrefs(context).edit()
            .remove(KEY_DEVICE_API_KEY)
            .apply()
    }

    /**
     * Save the last acknowledged policy version for conditional fetching.
     */
    fun saveLastPolicyVersion(context: Context, version: Int) {
        getEncryptedPrefs(context).edit()
            .putInt(KEY_LAST_POLICY_VERSION, version)
            .apply()
    }

    /**
     * Load the last acknowledged policy version, or 0 if none saved.
     */
    fun loadLastPolicyVersion(context: Context): Int {
        return getEncryptedPrefs(context).getInt(KEY_LAST_POLICY_VERSION, 0)
    }

    private fun getEncryptedPrefs(context: Context): SharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        return EncryptedSharedPreferences.create(
            context,
            PREFS_FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
}
