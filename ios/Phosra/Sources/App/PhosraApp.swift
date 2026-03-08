import SwiftUI
import UserNotifications
import AppIntents

@main
struct PhosraApp: App {
    @State private var authManager = AuthManager.shared

    init() {
        requestPushNotifications()
        registerShortcuts()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(authManager)
                .onOpenURL { url in
                    AuthManager.shared.handleDeepLink(url: url)
                }
        }
    }

    private func registerShortcuts() {
        Task {
            do {
                try await PhosraShortcuts.updateAppShortcutParameters()
                print("[PhosraApp] App Shortcuts registered with Siri successfully")
            } catch {
                print("[PhosraApp] App Shortcuts registration FAILED: \(error)")
            }
        }
    }

    private func requestPushNotifications() {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .badge, .sound]
        ) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            if let error {
                print("Push notification registration error: \(error.localizedDescription)")
            }
        }
    }
}
