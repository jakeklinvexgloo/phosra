# PhosraSDK for iOS

Swift Package providing an API client and on-device enforcement engine for the Phosra parental controls platform. Uses Apple's FamilyControls, ManagedSettings, and DeviceActivity frameworks (iOS 16+).

## Requirements

- iOS 16.0+ / macOS 13.0+
- Swift 5.9+
- Xcode 15+
- **FamilyControls entitlement** (required for enforcement; request from [Apple Developer portal](https://developer.apple.com/contact/request/family-controls-distribution))

## Installation

### Swift Package Manager

Add the dependency to your `Package.swift`:

```swift
dependencies: [
    .package(path: "../packages/ios-sdk")
]
```

Or in Xcode: File > Add Package Dependencies > Add Local...

Then add `PhosraSDK` to your target dependencies:

```swift
.target(
    name: "YourApp",
    dependencies: ["PhosraSDK"]
)
```

## Architecture

The SDK has two layers:

### API Client Layer

Handles all communication with the Phosra backend:

- **`PhosraClient`** -- Main entry point with parent mode (registration) and device mode (sync)
- **`PhosraConfiguration`** -- Base URL, authentication tokens
- **`APIClient`** -- URLSession-based HTTP client with conditional fetch (304) support
- **`KeychainHelper`** -- Secure storage for the device API key

### Enforcement Engine Layer

Applies compiled policies to the device using Apple frameworks:

- **`EnforcementEngine`** -- Orchestrator that delegates to per-category enforcers
- **`ContentFilterEnforcer`** -- ManagedSettingsStore for app/content blocking
- **`ScreenTimeEnforcer`** -- DeviceActivitySchedule for time limits and downtime
- **`WebFilterEnforcer`** -- ManagedSettingsStore for web content filtering
- **`PurchaseEnforcer`** -- ManagedSettingsStore for purchase restrictions
- **`NotificationEnforcer`** -- Notification curfew and usage timers
- **`PolicySyncManager`** -- Background polling + APNs push refresh
- **`EnforcementReporter`** -- Reports enforcement status back to server

```
PhosraClient                      Enforcement Engine
+-----------------------+         +----------------------------+
| forParent(token:)     |         | ContentFilterEnforcer      |
| forDevice(deviceKey:) |         | ScreenTimeEnforcer         |
| fetchPolicy()         | ------> | WebFilterEnforcer           |
| submitReport()        |         | PurchaseEnforcer           |
| acknowledgePolicy()   |         | NotificationEnforcer       |
+-----------------------+         +----------------------------+
                                           |
                                           v
                                  +----------------------------+
                                  | Apple Frameworks           |
                                  | - FamilyControls           |
                                  | - ManagedSettings          |
                                  | - DeviceActivity           |
                                  +----------------------------+
```

## Quick Start

### 1. Register a Device (Parent App)

```swift
import PhosraSDK

let client = PhosraClient.forParent(token: parentJWT)

let request = RegisterDeviceRequest(
    deviceName: UIDevice.current.name,
    deviceModel: UIDevice.current.model,
    osVersion: UIDevice.current.systemVersion,
    appVersion: "1.0.0"
)

let response = try await client.registerDevice(childID: childUUID, request: request)

// Store the API key immediately -- it is only returned once
try KeychainHelper.save(key: response.apiKey)
```

### 2. Start Policy Sync (Child Device)

```swift
import PhosraSDK

// Load device key from Keychain
guard let client = try PhosraClient.fromKeychain() else {
    // Device not registered yet
    return
}

let engine = EnforcementEngine()
try await engine.requestAuthorization()

let syncManager = PolicySyncManager(client: client, engine: engine)
syncManager.delegate = self
syncManager.startPolling() // Every 15 minutes
```

### 3. Handle Push Notifications

```swift
func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
) {
    Task {
        await syncManager.handlePushNotification(userInfo)
        completionHandler(.newData)
    }
}
```

### 4. Manual Policy Fetch and Apply

```swift
let client = PhosraClient.forDevice(deviceKey: storedKey)

// Fetch the compiled policy
if let policy = try await client.fetchPolicy() {
    print("Policy v\(policy.version) for \(policy.ageGroup) child")

    // Apply to device
    let engine = EnforcementEngine()
    let report = engine.applyPolicy(policy)

    // Report enforcement status
    try await client.submitReport(DeviceReport(
        reportType: .enforcementStatus,
        payload: .enforcementStatus(EnforcementStatusPayload(
            policyVersion: policy.version,
            results: report.toResults()
        ))
    ))

    // Acknowledge the version
    try await client.acknowledgePolicy(version: policy.version)
}
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/children/{childID}/devices` | Bearer (parent JWT) | Register a device |
| GET | `/device/policy?since_version=N` | X-Device-Key | Fetch compiled policy (304 if unchanged) |
| POST | `/device/report` | X-Device-Key | Submit enforcement/screen time report |
| POST | `/device/ack` | X-Device-Key | Acknowledge policy version applied |
| GET | `/platform-mappings/apple` | None | Apple framework mappings |

## Required Entitlements and Capabilities

Your app must include these entitlements:

| Entitlement | Purpose |
|---|---|
| `com.apple.developer.family-controls` | Core FamilyControls access |
| `com.apple.developer.managed-settings.shield-configuration` | Custom shield UI when apps are blocked |
| `com.apple.developer.device-activity-monitor` | Background activity monitoring |
| Push Notifications | APNs for real-time policy push |
| Background Modes: Remote notifications | Silent push handling |
| Background Modes: Background fetch | Periodic policy sync |
| Keychain Sharing (optional) | Share device key with extensions |

### Info.plist Keys

```xml
<key>NSFamilyControlsUsageDescription</key>
<string>This app manages screen time and content restrictions for child safety.</string>
```

## Development Notes

### Building on macOS

The API client layer compiles and runs on macOS for development and testing. The enforcement layer uses `#if canImport(ManagedSettings) && os(iOS)` guards to compile on macOS but only execute on iOS.

```bash
cd packages/ios-sdk
swift build
```

### Enforcement Scaffolding

The enforcement code is intentionally scaffolding. Key areas that require on-device testing with a signed FamilyControls entitlement:

1. **ApplicationToken mapping** -- ManagedSettings uses opaque tokens, not bundle IDs. Requires `FamilyActivityPicker` UI.
2. **DeviceActivitySchedule** -- Schedule creation and threshold events need real device testing.
3. **WebContentFilter** -- The exact `WebContentSettings` API surface varies by iOS version.
4. **Notification silencing** -- `ManagedSettingsStore.notification` requires iOS 16.4+.

Look for `// MARK: - TODO` comments throughout the enforcement layer for specific implementation notes.

### DeviceActivityMonitor Extension

Screen time enforcement requires a separate app extension target:

```
YourApp.xcodeproj
  YourApp/
  DeviceActivityMonitorExtension/
    DeviceActivityMonitorExtension.swift
```

This extension receives callbacks when usage thresholds are crossed and must apply/remove shields accordingly. The SDK provides the schedule and configuration; the extension handles the runtime callbacks.

## Project Structure

```
Sources/PhosraSDK/
+-- PhosraClient.swift               # Main client (forParent / forDevice)
+-- Configuration.swift              # PhosraConfiguration (baseURL, auth)
+-- Models/
|   +-- CompiledPolicy.swift         # Full compiled policy matching Go struct
|   +-- DeviceRegistration.swift     # Register request/response
|   +-- DeviceReport.swift           # Enforcement and screen time reports
|   +-- PolicyModels.swift           # ContentFilter, ScreenTime, Purchases, etc.
|   +-- RuleCategory.swift           # All 45 rule categories as enum
+-- Networking/
|   +-- APIClient.swift              # Low-level URLSession HTTP client
|   +-- APIError.swift               # PhosraAPIError enum
|   +-- KeychainHelper.swift         # Keychain save/load/delete
+-- Enforcement/
|   +-- EnforcementEngine.swift      # Main orchestrator
|   +-- ContentFilterEnforcer.swift  # ManagedSettings app/content blocking
|   +-- ScreenTimeEnforcer.swift     # DeviceActivity time limits
|   +-- WebFilterEnforcer.swift      # ManagedSettings web filtering
|   +-- PurchaseEnforcer.swift       # ManagedSettings purchase restrictions
|   +-- NotificationEnforcer.swift   # Notification curfew
|   +-- PolicySyncManager.swift      # Background polling + APNs
|   +-- EnforcementReporter.swift    # Reports enforcement status to API
+-- Extensions/
    +-- Date+Extensions.swift        # ISO 8601 and time parsing helpers
    +-- Data+Extensions.swift        # Hex encoding/decoding
```

## App Store Submission Notes

Apps using FamilyControls require additional review:

1. **Request the entitlement** at [developer.apple.com/contact/request/family-controls-distribution](https://developer.apple.com/contact/request/family-controls-distribution). Approval typically takes 1-2 weeks.

2. **Provide clear documentation** in App Store Connect explaining how the app uses FamilyControls for child safety. Include screenshots of the parental consent flow.

3. **Test with TestFlight** using the development entitlement before requesting the distribution entitlement.

4. **Include a privacy policy** that covers data collection from children (COPPA compliance). Phosra only stores hashed device keys and aggregated usage data.

5. **Age-gate your app** to prevent children from modifying their own restrictions.

## License

Proprietary -- Phosra, Inc.
