import SwiftUI

struct SettingsView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var showingSignOutConfirmation = false

    private var appVersion: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }

    var body: some View {
        List {
            // Account section
            Section {
                HStack {
                    Label("Email", systemImage: "envelope")
                    Spacer()
                    Text(authManager.currentEmail ?? "Unknown")
                        .foregroundStyle(.secondary)
                }
            } header: {
                Text("Account")
            }

            // Siri commands section
            Section {
                SiriCommandRow(
                    command: "\"Hey Siri, add a child to Phosra\"",
                    description: "Adds a new child profile to your family"
                )
                SiriCommandRow(
                    command: "\"Hey Siri, check screen time\"",
                    description: "Shows screen time for your children"
                )
                SiriCommandRow(
                    command: "\"Hey Siri, show Phosra dashboard\"",
                    description: "Opens the Phosra dashboard"
                )
            } header: {
                Text("Siri Commands")
            } footer: {
                Text("Use these voice commands with Siri to quickly access Phosra features.")
            }

            // About section
            Section {
                HStack {
                    Label("Version", systemImage: "info.circle")
                    Spacer()
                    Text(appVersion)
                        .foregroundStyle(.secondary)
                }

                Link(destination: URL(string: "https://www.phosra.com/privacy")!) {
                    Label("Privacy Policy", systemImage: "hand.raised")
                }

                Link(destination: URL(string: "https://www.phosra.com/terms")!) {
                    Label("Terms of Service", systemImage: "doc.text")
                }
            } header: {
                Text("About")
            }

            // Sign out section
            Section {
                Button(role: .destructive) {
                    showingSignOutConfirmation = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Sign Out")
                        Spacer()
                    }
                }
            }
        }
        .navigationTitle("Settings")
        .confirmationDialog(
            "Sign Out",
            isPresented: $showingSignOutConfirmation,
            titleVisibility: .visible
        ) {
            Button("Sign Out", role: .destructive) {
                authManager.logout()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to sign out of Phosra?")
        }
    }
}

// MARK: - Siri Command Row

private struct SiriCommandRow: View {
    let command: String
    let description: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(command)
                .font(.subheadline.weight(.medium))
                .italic()

            Text(description)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 2)
    }
}

#Preview {
    NavigationStack {
        SettingsView()
    }
    .environment(AuthManager.shared)
}
