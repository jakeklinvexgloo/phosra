import SwiftUI

/// Siri snippet view shown after a child is successfully added via AddChildIntent.
/// Displays a success header, child details, and a summary of the active rules.
struct AddChildResultView: View {

    let childName: String
    let age: Int
    let strictness: StrictnessLevel
    let ruleSummary: RuleSummary

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            PhosraSnippetHeader("Child Added", icon: "checkmark.circle.fill")

            HStack(spacing: 8) {
                Text("\(childName), age \(age)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Spacer()
            }

            Divider()

            // Rule summary
            VStack(spacing: 6) {
                SummaryRow(
                    icon: "hourglass",
                    label: "Screen Time",
                    value: "\(ruleSummary.screenTimeMinutes) min/day"
                )
                SummaryRow(
                    icon: "moon.fill",
                    label: "Bedtime",
                    value: formattedBedtime
                )
                SummaryRow(
                    icon: "film",
                    label: "Content Rating",
                    value: ruleSummary.contentRating
                )
                SummaryRow(
                    icon: "checkmark.shield.fill",
                    label: "Rules Active",
                    value: "\(ruleSummary.totalRulesEnabled)"
                )
            }
        }
        .padding()
    }

    private var formattedBedtime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        var components = DateComponents()
        components.hour = ruleSummary.bedtimeHour
        components.minute = 0
        let date = Calendar.current.date(from: components) ?? Date()
        return formatter.string(from: date)
    }
}

// MARK: - Summary Row

private struct SummaryRow: View {

    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(width: 20, alignment: .center)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.caption)
                .fontWeight(.medium)
        }
    }
}
