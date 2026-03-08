import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Tab = .dashboard

    enum Tab: String {
        case dashboard
        case family
        case settings
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            PhosraWebView(url: URL(string: "https://www.phosra.com/dashboard")!)
                .ignoresSafeArea(edges: .bottom)
                .tabItem {
                    Label("Dashboard", systemImage: "house.fill")
                }
                .tag(Tab.dashboard)

            NavigationStack {
                FamilyView()
            }
            .tabItem {
                Label("Family", systemImage: "person.3.fill")
            }
            .tag(Tab.family)

            NavigationStack {
                SettingsView()
            }
            .tabItem {
                Label("Settings", systemImage: "gear")
            }
            .tag(Tab.settings)
        }
        .tint(PhosraBrand.green)
    }
}

#Preview {
    MainTabView()
        .environment(AuthManager.shared)
}
