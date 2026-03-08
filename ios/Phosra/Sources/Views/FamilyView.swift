import SwiftUI
import AppIntents

struct FamilyView: View {
    @State private var families: [Family] = []
    @State private var childrenByFamily: [String: [Child]] = [:]
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        List {
            // Siri tips section
            Section {
                SiriTipView(intent: AddChildIntent())
                SiriTipView(intent: CheckScreenTimeIntent())
            } header: {
                Text("Siri Shortcuts")
            }

            // Families & children
            if isLoading {
                Section {
                    HStack {
                        Spacer()
                        ProgressView()
                            .padding(.vertical, 24)
                        Spacer()
                    }
                }
            } else if let errorMessage {
                Section {
                    ContentUnavailableView(
                        "Unable to Load",
                        systemImage: "exclamationmark.triangle",
                        description: Text(errorMessage)
                    )
                }
            } else if families.isEmpty {
                Section {
                    ContentUnavailableView(
                        "No Families",
                        systemImage: "person.3",
                        description: Text("Create a family to get started with Phosra.")
                    )
                }
            } else {
                ForEach(families) { family in
                    Section {
                        ForEach(childrenByFamily[family.id] ?? []) { child in
                            NavigationLink {
                                childDetailPlaceholder(child: child)
                            } label: {
                                ChildRow(child: child)
                            }
                        }
                    } header: {
                        Text(family.name)
                    }
                }
            }
        }
        .navigationTitle("Family")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    // Add child action — placeholder
                } label: {
                    Label("Add Child", systemImage: "plus")
                }
            }
        }
        .task {
            await loadFamilies()
        }
        .refreshable {
            await loadFamilies()
        }
    }

    // MARK: - Data Loading

    private func loadFamilies() async {
        isLoading = true
        errorMessage = nil

        do {
            let fetchedFamilies = try await PhosraAPIClient.shared.listFamilies()

            var loadedChildren: [String: [Child]] = [:]
            for family in fetchedFamilies {
                let children = try await PhosraAPIClient.shared.listChildren(familyId: family.id)
                loadedChildren[family.id] = children
            }

            families = fetchedFamilies
            childrenByFamily = loadedChildren
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Child Detail Placeholder

    @ViewBuilder
    private func childDetailPlaceholder(child: Child) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)

            Text(child.name)
                .font(.title2.bold())

            Text("Age \(child.calculatedAge)")
                .foregroundStyle(.secondary)

            Text("Child detail view coming soon")
                .font(.callout)
                .foregroundStyle(.tertiary)
                .padding(.top, 8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationTitle(child.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Child Row

private struct ChildRow: View {
    let child: Child

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: "person.circle.fill")
                .font(.title2)
                .foregroundStyle(PhosraBrand.green)

            VStack(alignment: .leading, spacing: 2) {
                Text(child.name)
                    .font(.body.weight(.medium))

                Text("Age \(child.calculatedAge)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NavigationStack {
        FamilyView()
    }
}
