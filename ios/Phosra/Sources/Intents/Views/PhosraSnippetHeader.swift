import SwiftUI

/// Branded header for all Siri snippet views.
/// Shows the Phosra mark + title, consistent across all intents.
struct PhosraSnippetHeader: View {

    let title: String
    let icon: String?

    init(_ title: String, icon: String? = nil) {
        self.title = title
        self.icon = icon
    }

    var body: some View {
        VStack(spacing: 8) {
            HStack(spacing: 8) {
                Image("PhosraMark")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 20, height: 20)

                Text("Phosra")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)

                Spacer()
            }

            HStack(spacing: 6) {
                if let icon {
                    Image(systemName: icon)
                        .foregroundStyle(PhosraBrand.green)
                }
                Text(title)
                    .font(.headline)
                Spacer()
            }
        }
    }
}
