# Phosra SDK for Android

On-device child safety enforcement for Android using UsageStatsManager, DevicePolicyManager, VpnService, and AccessibilityService.

## Requirements

- Android 8.0+ (API level 26)
- Kotlin 1.9+
- Gradle 8+
- Android Studio Hedgehog (2023.1) or later

## Installation

### Gradle (Maven Central)

Add the dependency to your module-level `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.phosra:sdk:1.0.0")
}
```

If using the Groovy DSL (`build.gradle`):

```groovy
dependencies {
    implementation 'com.phosra:sdk:1.0.0'
}
```

Ensure Maven Central is in your repository list (it is by default in modern projects):

```kotlin
repositories {
    mavenCentral()
    google()
}
```

## Quick Start

### 1. Request Required Permissions

Before enforcement, your app needs several permissions. Prompt the user through each:

```kotlin
import com.phosra.sdk.permissions.PermissionManager

val permissionManager = PermissionManager(context)

// Check which permissions are still needed
val missing = permissionManager.getMissingPermissions()

// Guide the user through each permission
for (permission in missing) {
    permissionManager.requestPermission(activity, permission)
}
```

### 2. Register the Device (Parent-Authenticated)

The parent initiates registration from their authenticated session:

```kotlin
import com.phosra.sdk.PhosraClient
import com.phosra.sdk.PhosraConfiguration
import com.phosra.sdk.models.RegisterDeviceRequest

val config = PhosraConfiguration(
    parentToken = parentJWT,  // Parent's session token
    childId = childUUID       // Child's Phosra ID
)
val client = PhosraClient(config)

val request = RegisterDeviceRequest(
    deviceName = "Emma's Pixel",
    deviceModel = android.os.Build.MODEL,
    osVersion = android.os.Build.VERSION.RELEASE,
    appVersion = BuildConfig.VERSION_NAME,
    capabilities = listOf("UsageStats", "DeviceAdmin", "VPN", "Accessibility")
)

val response = client.registerDevice(request)
```

### 3. Store the API Key in EncryptedSharedPreferences

The API key is returned **once** during registration. Store it immediately:

```kotlin
import com.phosra.sdk.storage.KeystoreHelper

KeystoreHelper.saveDeviceKey(context, response.apiKey)
println("Device registered: ${response.device.id}")
```

### 4. Schedule Background Sync with WorkManager

Set up periodic policy sync:

```kotlin
import com.phosra.sdk.sync.PolicySyncWorker
import androidx.work.*
import java.util.concurrent.TimeUnit

val syncRequest = PeriodicWorkRequestBuilder<PolicySyncWorker>(
    15, TimeUnit.MINUTES
).setConstraints(
    Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .build()
).build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "phosra_policy_sync",
    ExistingPeriodicWorkPolicy.KEEP,
    syncRequest
)
```

## API Client

The `PhosraClient` wraps the Phosra REST API with typed Kotlin interfaces. It supports two authentication modes:

- **Parent mode** (`parentToken`): For device registration endpoints
- **Device mode** (`deviceKey`): For policy sync, reporting, and acknowledgment

### Register a Device

```kotlin
val response = client.registerDevice(RegisterDeviceRequest(
    deviceName = "Emma's Pixel",
    deviceModel = "Pixel 8 Pro",
    osVersion = "14",
    appVersion = "1.0.0",
    capabilities = listOf("UsageStats", "DeviceAdmin", "VPN", "Accessibility")
))
// response.apiKey -- store in EncryptedSharedPreferences immediately
// response.device.id -- device UUID
```

### Fetch Compiled Policy

```kotlin
// Full fetch
val policy = client.fetchPolicy()

// Conditional fetch (returns null if unchanged)
val updated = client.fetchPolicy(sinceVersion = 3)
```

### Submit an Enforcement Report

```kotlin
import com.phosra.sdk.models.*

val report = DeviceReport(
    reportType = ReportType.ENFORCEMENT_STATUS,
    payload = EnforcementStatusPayload(
        policyVersion = policy.version,
        results = listOf(
            CategoryEnforcementResult(
                category = "content_rating",
                status = "enforced",
                framework = "UsageStatsManager"
            ),
            CategoryEnforcementResult(
                category = "web_filter_level",
                status = "enforced",
                framework = "VpnService"
            )
        )
    )
)
client.submitReport(report)
```

### Acknowledge Policy Version

```kotlin
client.ackPolicyVersion(policy.version)
```

## Enforcement Engine

The enforcement engine translates the `CompiledPolicy` into Android framework calls. It is organized as a two-layer architecture:

1. **API Client** (`PhosraClient`) -- Handles network communication with the Phosra API
2. **Enforcement Engine** -- Applies the compiled policy to the device using Android APIs

### Architecture

```
PhosraClient                      Enforcement Engine
┌──────────────────────┐         ┌──────────────────────────┐
│ registerDevice()     │         │ ContentFilterEnforcer    │
│ fetchPolicy()        │ ──────> │ ScreenTimeEnforcer       │
│ submitReport()       │         │ PurchaseEnforcer         │
│ ackPolicyVersion()   │         │ WebFilterEnforcer        │
└──────────────────────┘         │ SocialEnforcer           │
                                 │ NotificationEnforcer     │
                                 │ PrivacyEnforcer          │
                                 └──────────────────────────┘
                                          │
                                          ▼
                                 ┌──────────────────────────┐
                                 │ Android APIs             │
                                 │ - UsageStatsManager      │
                                 │ - DevicePolicyManager    │
                                 │ - VpnService             │
                                 │ - AccessibilityService   │
                                 └──────────────────────────┘
```

### Content Filter Enforcer

Blocks apps by package name using overlay + UsageStatsManager:

```kotlin
import android.app.usage.UsageStatsManager

// Detect foreground app
val usageStatsManager = context.getSystemService(UsageStatsManager::class.java)
val stats = usageStatsManager.queryUsageStats(
    UsageStatsManager.INTERVAL_DAILY,
    startTime, endTime
)

// If blocked app is in foreground, show blocking overlay
if (currentApp in policy.contentFilter.blockedApps) {
    showBlockingOverlay()
}
```

### Screen Time Enforcer

Tracks cumulative usage and enforces daily limits:

```kotlin
// Query today's total usage
val totalMinutes = getTodayUsageMinutes(usageStatsManager)

if (totalMinutes >= policy.screenTime.dailyLimitMinutes) {
    // Lock device or show time-up overlay
    enforceScreenTimeLimit()
}
```

### Web Filter Enforcer

Uses a local VPN to intercept and filter DNS requests:

```kotlin
// PhosraVpnService intercepts DNS queries
class PhosraVpnService : VpnService() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val builder = Builder()
            .addAddress("10.0.0.2", 32)
            .addDnsServer("10.0.0.1")
            .setSession("Phosra Web Filter")

        val tunnel = builder.establish()
        // Forward DNS queries, block domains in policy.webFilter.blockedDomains
        return START_STICKY
    }
}
```

## Required Permissions

| Permission | Purpose | How to Request |
|---|---|---|
| `INTERNET` | API communication | Granted automatically |
| `ACCESS_NETWORK_STATE` | Check connectivity | Granted automatically |
| `PACKAGE_USAGE_STATS` | Screen time tracking | Settings > Apps > Special Access > Usage Access |
| `SYSTEM_ALERT_WINDOW` | Blocking overlay UI | Settings > Apps > Special Access > Display over other apps |
| `BIND_VPN_SERVICE` | DNS-based web filtering | VPN connection dialog (system prompt) |
| `FOREGROUND_SERVICE` | Background enforcement | Granted automatically |
| `RECEIVE_BOOT_COMPLETED` | Restart after reboot | Granted automatically |
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Notification filtering | Settings > Apps > Special Access > Notification Access |
| `QUERY_ALL_PACKAGES` | Detect installed apps | Granted automatically (declare in manifest) |
| Device Admin | Device-level restrictions | System enrollment dialog |
| Accessibility Service | Foreground app detection | Settings > Accessibility |

### Permission Request Flow

```kotlin
// 1. Usage Stats Access
val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
startActivity(intent)

// 2. Overlay Permission
if (!Settings.canDrawOverlays(context)) {
    val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}")
    )
    startActivity(intent)
}

// 3. VPN Service
val vpnIntent = VpnService.prepare(context)
if (vpnIntent != null) {
    startActivityForResult(vpnIntent, VPN_REQUEST_CODE)
}

// 4. Device Admin
val componentName = ComponentName(context, PhosraDeviceAdminReceiver::class.java)
val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
    putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, componentName)
    putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION,
        "Required for enforcing child safety restrictions.")
}
startActivity(intent)
```

## Google Play Policy Compliance

Apps using these permissions require careful compliance with Google Play policies:

1. **Declare permissions accurately** in your Play Console listing. Explain each permission's purpose in the Data Safety section.

2. **UsageStatsManager and Accessibility Service** are restricted APIs. Your app must be a designated parental control app or have a core use case that requires these APIs. Submit a [Permissions Declaration Form](https://support.google.com/googleplay/android-developer/answer/9214102) in Play Console.

3. **VPN Service** usage must be declared and explained. The VPN must only be used for content filtering (DNS blocking), not for data collection.

4. **QUERY_ALL_PACKAGES** requires justification. Document that your app needs this to enforce app-level restrictions.

5. **Target audience**: Set your app's target audience to "Parents" in Play Console, not "Children". The app is a parental control tool.

6. **Privacy policy**: Include a privacy policy that covers data collected from child devices. Phosra only stores hashed device keys and aggregated usage data.

## Project Structure

```
src/main/
├── AndroidManifest.xml                    # Permissions and service declarations
├── res/
│   ├── values/strings.xml                 # App strings
│   └── xml/
│       ├── accessibility_service_config.xml
│       └── device_admin_policies.xml
└── java/com/phosra/sdk/
    ├── PhosraClient.kt                    # API client
    ├── PhosraConfiguration.kt             # Configuration (baseURL, auth)
    ├── models/
    │   ├── CompiledPolicy.kt              # Full compiled policy
    │   ├── DeviceRegistration.kt          # Register request/response
    │   ├── DeviceReport.kt                # Enforcement and screen time reports
    │   ├── PolicyModels.kt                # ContentFilter, ScreenTime, etc.
    │   └── RuleCategory.kt               # All 45 rule categories
    ├── networking/
    │   ├── ApiClient.kt                   # OkHttp-based HTTP client
    │   ├── ApiError.kt                    # Typed error classes
    │   └── KeystoreHelper.kt             # EncryptedSharedPreferences wrapper
    ├── enforcement/
    │   ├── EnforcementEngine.kt           # Orchestrates all enforcers
    │   ├── ContentFilterEnforcer.kt       # App blocking via overlay
    │   ├── ScreenTimeEnforcer.kt          # Usage tracking + limits
    │   ├── WebFilterEnforcer.kt           # DNS-based web filtering
    │   ├── PurchaseEnforcer.kt            # Purchase restrictions
    │   ├── SocialEnforcer.kt              # Social/messaging controls
    │   ├── NotificationEnforcer.kt        # Notification curfew
    │   └── PrivacyEnforcer.kt             # Privacy controls
    ├── services/
    │   ├── PhosraVpnService.kt            # Local VPN for DNS filtering
    │   ├── PhosraAccessibilityService.kt  # Foreground app detection
    │   └── PhosraDeviceAdminReceiver.kt   # Device admin for restrictions
    └── sync/
        └── PolicySyncWorker.kt            # WorkManager periodic sync
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Build the project: `./gradlew build`
4. Run tests: `./gradlew test`
5. Submit a pull request

## License

See [LICENSE](../../LICENSE) in the repository root.
