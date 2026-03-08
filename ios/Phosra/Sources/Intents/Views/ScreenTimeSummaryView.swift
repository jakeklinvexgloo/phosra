import SwiftUI

/// Siri snippet view showing viewing analytics for a child.
/// Displayed by CheckScreenTimeIntent after fetching data from the API.
struct ScreenTimeSummaryView: View {

    let child: ChildEntity
    let analytics: ViewingAnalytics

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            PhosraSnippetHeader(child.name, icon: "chart.bar.fill")

            Divider()

            // Stats grid
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                StatCard(
                    icon: "play.rectangle.fill",
                    label: "Total Titles",
                    value: "\(analytics.totalTitles)",
                    color: PhosraBrand.green
                )
                StatCard(
                    icon: "exclamationmark.triangle.fill",
                    label: "Above Age",
                    value: "\(analytics.aboveAgeCount)",
                    color: analytics.aboveAgeCount > 0 ? .orange : .green
                )
                StatCard(
                    icon: "hand.thumbsup.fill",
                    label: "Family Friendly",
                    value: "\(familyFriendlyPercent)%",
                    color: .green
                )
                StatCard(
                    icon: "star.fill",
                    label: "High Quality",
                    value: "\(analytics.highQualityCount)",
                    color: .purple
                )
            }
        }
        .padding()
    }

    private var familyFriendlyPercent: Int {
        guard analytics.totalTitles > 0 else { return 100 }
        return Int(Double(analytics.familyFriendlyCount) / Double(analytics.totalTitles) * 100)
    }
}

// MARK: - Stat Card

private struct StatCard: View {

    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text(value)
                .font(.headline)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
