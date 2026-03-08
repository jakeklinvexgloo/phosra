import SwiftUI

/// Siri snippet view listing active policies for a child.
/// Displayed by CheckPoliciesIntent after fetching policies from the API.
struct PolicyListView: View {

    let child: ChildEntity
    let policies: [ChildPolicy]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            PhosraSnippetHeader("\(child.name)'s Rules", icon: "shield.checkered")

            HStack {
                Spacer()
                Text("\(policies.count) active")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(PhosraBrand.green.opacity(0.12))
                    .foregroundStyle(PhosraBrand.green)
                    .clipShape(Capsule())
            }

            Divider()

            if policies.isEmpty {
                Text("No policies configured yet.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                // Policy rows (limit to 5 to fit snippet space)
                ForEach(policies.prefix(5), id: \.id) { policy in
                    PolicyRow(policy: policy)
                }

                if policies.count > 5 {
                    Text("+\(policies.count - 5) more")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
    }
}

// MARK: - Policy Row

private struct PolicyRow: View {

    let policy: ChildPolicy

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(policy.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text("v\(policy.version) \u{00B7} Priority \(policy.priority)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(policy.status.capitalized)
                .font(.caption2)
                .fontWeight(.semibold)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(statusColor.opacity(0.12))
                .foregroundStyle(statusColor)
                .clipShape(Capsule())
        }
    }

    private var statusColor: Color {
        switch policy.status.lowercased() {
        case "active":  return .green
        case "paused":  return .yellow
        case "draft":   return .gray
        default:        return .secondary
        }
    }
}
