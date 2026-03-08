import SwiftUI
import AuthenticationServices

struct LoginView: View {
    private let loginURL = URL(string: "https://www.phosra.com/login?from=phosra-app")!
    @State private var isAuthenticating = false
    @State private var authSession: ASWebAuthenticationSession?

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Branding
            VStack(spacing: 16) {
                // Starburst mark
                Image("PhosraMark")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 72, height: 72)

                Text("Phosra")
                    .font(.system(size: 40, weight: .bold, design: .rounded))

                Text("Child safety compliance\nfor the modern family")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()

            // Sign in button
            Button {
                startAuth()
            } label: {
                HStack(spacing: 10) {
                    if isAuthenticating {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "arrow.right.circle.fill")
                    }
                    Text("Sign in with Phosra")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .tint(PhosraBrand.green)
            .disabled(isAuthenticating)

            Text("Sign in via phosra.com,\nthen you'll be returned to the app automatically.")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)

            Spacer()
                .frame(height: 40)
        }
        .padding(.horizontal, 32)
    }

    private func startAuth() {
        isAuthenticating = true

        let session = ASWebAuthenticationSession(
            url: loginURL,
            callbackURLScheme: "phosra-app"
        ) { callbackURL, error in
            DispatchQueue.main.async {
                isAuthenticating = false
                authSession = nil

                if let error {
                    let nsError = error as NSError
                    if nsError.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                            return
                    }
                    print("[LoginView] Auth error: \(error.localizedDescription)")
                    return
                }

                if let callbackURL {
                    AuthManager.shared.handleDeepLink(url: callbackURL)
                }
            }
        }

        session.presentationContextProvider = PresentationContext.shared
        session.prefersEphemeralWebBrowserSession = false

        // Store strong reference so session isn't deallocated
        authSession = session
        session.start()
    }
}

// MARK: - Presentation Context

private class PresentationContext: NSObject, ASWebAuthenticationPresentationContextProviding {
    static let shared = PresentationContext()

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = scene.windows.first else {
            return ASPresentationAnchor()
        }
        return window
    }
}

#Preview {
    LoginView()
}
