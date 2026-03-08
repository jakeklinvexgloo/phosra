import SwiftUI

/// Siri snippet view showing a family overview with all children.
/// Displayed by CheckFamilyIntent after fetching families and children from the API.
struct FamilySummaryView: View {

    let families: [Family]
    let children: [Child]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            PhosraSnippetHeader("My Family", icon: "person.3.fill")

            Divider()

            if families.isEmpty {
                Text("No families set up yet.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(families) { family in
                    FamilySection(
                        family: family,
                        children: children.filter { $0.familyId == family.id }
                    )
                }
            }
        }
        .padding()
    }
}

// MARK: - Family Section

private struct FamilySection: View {

    let family: Family
    let children: [Child]

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(family.name)
                .font(.subheadline)
                .fontWeight(.semibold)

            if children.isEmpty {
                Text("No children added")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(children) { child in
                    ChildRow(child: child)
                }
            }
        }
    }
}

// MARK: - Child Row

private struct ChildRow: View {

    let child: Child

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "person.circle.fill")
                .font(.title3)
                .foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 1) {
                Text(child.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text("Age \(child.calculatedAge)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
    }
}
