import SwiftUI
import WebKit

struct PhosraWebView: UIViewRepresentable {
    let url: URL

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "phosraApp")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true

        context.coordinator.webView = webView
        context.coordinator.targetURL = url

        // Set Stytch cookies then load
        context.coordinator.setStytchCookiesAndLoad()

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // No-op: the web view manages its own state after initial load
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        weak var webView: WKWebView?
        var targetURL: URL?

        func setStytchCookiesAndLoad() {
            guard let webView, let targetURL else { return }
            let cookieStore = webView.configuration.websiteDataStore.httpCookieStore

            Task {
                // Get session token and JWT
                let sessionToken = AuthManager.shared.sessionToken
                let jwt = try? await AuthManager.shared.getValidJWT()

                // Set cookies on main thread, then load
                await MainActor.run {
                    let group = DispatchGroup()

                    if let sessionToken {
                        if let cookie = HTTPCookie(properties: [
                            .name: "stytch_session",
                            .value: sessionToken,
                            .domain: "www.phosra.com",
                            .path: "/",
                            .secure: "TRUE",
                            .expires: Date.distantFuture,
                        ]) {
                            group.enter()
                            cookieStore.setCookie(cookie) { group.leave() }
                        }
                    }

                    if let jwt {
                        if let cookie = HTTPCookie(properties: [
                            .name: "stytch_session_jwt",
                            .value: jwt,
                            .domain: "www.phosra.com",
                            .path: "/",
                            .secure: "TRUE",
                            .expires: Date.distantFuture,
                        ]) {
                            group.enter()
                            cookieStore.setCookie(cookie) { group.leave() }
                        }
                    }

                    group.notify(queue: .main) {
                        webView.load(URLRequest(url: targetURL))
                    }
                }
            }
        }

        // MARK: WKScriptMessageHandler

        func userContentController(
            _ userContentController: WKUserContentController,
            didReceive message: WKScriptMessage
        ) {
            guard let body = message.body as? [String: Any] else { return }
            let action = body["action"] as? String ?? ""

            switch action {
            case "logout":
                AuthManager.shared.logout()
            case "navigate":
                if let path = body["path"] as? String,
                   let url = URL(string: "https://www.phosra.com\(path)") {
                    webView?.load(URLRequest(url: url))
                }
            default:
                print("PhosraWebView: unhandled message action '\(action)'")
            }
        }

        // MARK: WKNavigationDelegate

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }

            // Open external links in Safari
            if let host = url.host,
               !host.contains("phosra.com"),
               navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }

            decisionHandler(.allow)
        }
    }
}

// MARK: - Loading overlay

struct PhosraWebViewWithLoading: View {
    let url: URL
    @State private var isLoading = true

    var body: some View {
        ZStack {
            PhosraWebView(url: url)

            if isLoading {
                ProgressView()
                    .controlSize(.large)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(.ultraThinMaterial)
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation { isLoading = false }
            }
        }
    }
}
