import UserNotifications
import UIKit

@Observable
class PushManager: NSObject, UNUserNotificationCenterDelegate, @unchecked Sendable {
    static let shared = PushManager()

    var isRegistered = false
    var deviceToken: String?

    func requestPermission() async -> Bool {
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .badge, .sound])
            if granted {
                await MainActor.run {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            return granted
        } catch {
            return false
        }
    }

    func handleDeviceToken(_ token: Data) {
        let tokenString = token.map { String(format: "%02.2hhx", $0) }.joined()
        self.deviceToken = tokenString
        self.isRegistered = true

        // Send to backend (fire-and-forget)
        Task {
            try? await registerTokenWithBackend(tokenString)
        }
    }

    func handleRegistrationError(_ error: Error) {
        print("APNs registration failed: \(error)")
        self.isRegistered = false
    }

    private func registerTokenWithBackend(_ token: String) async throws {
        // Call device registration endpoint if we have a child context
        // For parent's device, we may need a different endpoint
        // For now, store the token for later use when registering a child's device
    }

    // Handle incoming notifications
    func handleNotification(_ userInfo: [AnyHashable: Any]) {
        guard let phosra = userInfo["phosra"] as? [String: Any],
              let event = phosra["event"] as? String else { return }

        switch event {
        case "policy.updated":
            // Refresh widget data
            // Post notification for UI update
            NotificationCenter.default.post(name: .phosraPolicyUpdated, object: nil, userInfo: phosra)

        case "enforcement.completed":
            let status = phosra["status"] as? String ?? "unknown"
            showLocalNotification(
                title: "Enforcement Complete",
                body: "Rules have been \(status == "completed" ? "applied successfully" : "partially applied")."
            )

        case "enforcement.failed":
            let error = phosra["error"] as? String ?? "Unknown error"
            showLocalNotification(
                title: "Enforcement Failed",
                body: "Some rules couldn't be applied: \(error)"
            )

        case "usage.threshold":
            let childName = phosra["child_name"] as? String ?? "Your child"
            let percent = phosra["percent"] as? Int ?? 90
            showLocalNotification(
                title: "Screen Time Alert",
                body: "\(childName) has used \(percent)% of their daily screen time."
            )

        default:
            break
        }
    }

    private func showLocalNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil // deliver immediately
        )

        UNUserNotificationCenter.current().add(request)
    }

    // MARK: - UNUserNotificationCenterDelegate

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        return [.banner, .badge, .sound]
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        handleNotification(response.notification.request.content.userInfo)
    }
}

extension Notification.Name {
    static let phosraPolicyUpdated = Notification.Name("phosraPolicyUpdated")
    static let phosraEnforcementCompleted = Notification.Name("phosraEnforcementCompleted")
}
