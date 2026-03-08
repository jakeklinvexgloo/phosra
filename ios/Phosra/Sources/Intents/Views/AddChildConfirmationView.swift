import SwiftUI

/// Siri snippet view shown during the AddChildIntent confirmation step.
/// Displays the child's name, age, strictness badge, and a summary of
/// the rules that will be applied before the parent confirms.
struct AddChildConfirmationView: View {

    let name: String
    let age: Int
    let strictness: StrictnessLevel
    let preview: RulePreview

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            PhosraSnippetHeader("Add Child", icon: "person.crop.circle.badge.plus")

            // Child info + strictness badge
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Text("Age \(age)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text(strictness.rawValue.capitalized)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(strictnessBadgeColor.opacity(0.15))
                    .foregroundStyle(strictnessBadgeColor)
                    .clipShape(Capsule())
            }

            Divider()

            // Rule summary cards
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                RuleCard(
                    icon: "hourglass",
                    label: "Screen Time",
                    value: "\(preview.screenTimeMinutes) min/day"
                )
                RuleCard(
                    icon: "film",
                    label: "Max Rating",
                    value: preview.contentRating
                )
                RuleCard(
                    icon: "magnifyingglass",
                    label: "Safe Search",
                    value: preview.safeSearch ? "On" : "Off"
                )
                RuleCard(
                    icon: "moon.fill",
                    label: "Bedtime",
                    value: preview.formattedBedtime
                )
            }
        }
        .padding()
    }

    private var strictnessBadgeColor: Color {
        switch strictness {
        case .strict:   return .red
        case .recommended: return PhosraBrand.green
        case .relaxed:  return .green
        }
    }
}

// MARK: - Rule Card

/// A compact card showing a single rule with an icon, label, and value.
private struct RuleCard: View {

    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(width: 16)
            VStack(alignment: .leading, spacing: 1) {
                Text(label)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            Spacer(minLength: 0)
        }
        .padding(8)
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
